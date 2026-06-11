import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PageHeader, SearchBar, Table, Card, Button, StatusBadge, Column } from '../../components/ui';

interface Wave {
  id: string;
  waveNumber: string;
  waveType: string;
  status: string;
  plannedAt?: string;
  orders?: unknown[];
  orderCount?: number;
}

export default function Outbound() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<Wave[]>({
    queryKey: ['wms', 'outbound', 'waves'],
    queryFn: async () => {
      const res = await api.get('/wms/outbound/waves');
      return res.data.data ?? res.data;
    },
  });

  const createWave = useMutation({
    mutationFn: async () => api.post('/wms/outbound/waves', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wms', 'outbound', 'waves'] }),
  });

  const filtered = data.filter((w) => w.waveNumber?.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<Wave>[] = [
    { key: 'waveNumber', header: '웨이브번호', render: (r) => <span className="font-medium">{r.waveNumber}</span> },
    { key: 'waveType', header: '유형' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'orderCount', header: '주문수', render: (r) => `${r.orderCount ?? r.orders?.length ?? 0}건` },
    { key: 'plannedAt', header: '계획일시', render: (r) => (r.plannedAt ? r.plannedAt.slice(0, 16).replace('T', ' ') : '-') },
  ];

  return (
    <div>
      <PageHeader
        title="출고관리"
        subtitle="피킹 웨이브 관리"
        actions={
          <Button disabled={createWave.isPending} onClick={() => createWave.mutate()}>
            {createWave.isPending ? '생성중...' : '웨이브생성'}
          </Button>
        }
      />
      <SearchBar value={search} onChange={setSearch} placeholder="웨이브번호 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '웨이브가 없습니다'} />
      </Card>
    </div>
  );
}
