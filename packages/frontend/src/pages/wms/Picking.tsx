import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Item, Location, SalesOrder, Worker } from '../../types';
import { PageHeader, SearchBar, Table, Card, Button, StatusBadge, Column } from '../../components/ui';

interface PickTask {
  id: string;
  qty: number;
  pickedQty: number;
  status: string;
  so?: SalesOrder;
  item?: Item;
  location?: Location;
  worker?: Worker;
}

export default function Picking() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<PickTask[]>({
    queryKey: ['wms', 'outbound', 'pick-tasks'],
    queryFn: async () => {
      const res = await api.get('/wms/outbound/pick-tasks');
      return res.data.data ?? res.data;
    },
  });

  const complete = useMutation({
    mutationFn: async (id: string) => api.post(`/wms/outbound/pick-tasks/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wms', 'outbound', 'pick-tasks'] }),
  });

  const filtered = data.filter(
    (t) =>
      t.so?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.item?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<PickTask>[] = [
    { key: 'orderNumber', header: '주문번호', render: (r) => <span className="font-medium">{r.so?.orderNumber ?? '-'}</span> },
    { key: 'item', header: '상품명', render: (r) => r.item?.name ?? '-' },
    { key: 'location', header: '로케이션', render: (r) => r.location?.code ?? '-' },
    { key: 'qty', header: '지시수량' },
    { key: 'pickedQty', header: '피킹수량' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'worker', header: '작업자', render: (r) => r.worker?.name ?? '-' },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'COMPLETED' ? null : (
          <Button size="sm" variant="secondary" disabled={complete.isPending} onClick={() => complete.mutate(r.id)}>
            피킹완료
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="피킹" subtitle="피킹 작업 지시 및 완료" />
      <SearchBar value={search} onChange={setSearch} placeholder="주문번호/상품명 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '피킹 작업이 없습니다'} />
      </Card>
    </div>
  );
}
