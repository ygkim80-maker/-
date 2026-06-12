import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Location } from '../../types';
import { PageHeader, SearchBar, Table, Card, Button, Modal, StatusBadge, Column } from '../../components/ui';

interface CycleCountRecord {
  id: string;
  systemQty: number;
  countedQty: number | null;
  status: string;
  location?: Location;
}

export default function CycleCount() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CycleCountRecord | null>(null);
  const [counted, setCounted] = useState('');

  const { data = [], isLoading } = useQuery<CycleCountRecord[]>({
    queryKey: ['wms', 'cycle-count'],
    queryFn: async () => {
      const res = await api.get('/wms/cycle-count');
      return res.data.data ?? res.data;
    },
  });

  const submit = useMutation({
    mutationFn: async (id: string) => api.post(`/wms/cycle-count/${id}/submit`, { countedQty: Number(counted) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'cycle-count'] });
      setSelected(null);
      setCounted('');
    },
  });

  const filtered = data.filter((c) => c.location?.code?.toLowerCase().includes(search.toLowerCase()));

  const variance = (c: CycleCountRecord) => (c.countedQty == null ? null : c.countedQty - c.systemQty);

  const columns: Column<CycleCountRecord>[] = [
    { key: 'code', header: '로케이션', render: (r) => <span className="font-medium">{r.location?.code ?? '-'}</span> },
    { key: 'systemQty', header: '전산수량' },
    { key: 'countedQty', header: '실사수량', render: (r) => (r.countedQty == null ? '-' : r.countedQty) },
    {
      key: 'variance',
      header: '오차',
      render: (r) => {
        const v = variance(r);
        if (v == null) return '-';
        const color = v === 0 ? 'text-gray-500' : v > 0 ? 'text-blue-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{v > 0 ? `+${v}` : v}</span>;
      },
    },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelected(r);
            setCounted(r.countedQty != null ? String(r.countedQty) : '');
          }}
        >
          실사입력
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="사이클카운트" subtitle="순환 재고실사" />
      <SearchBar value={search} onChange={setSearch} placeholder="로케이션 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '실사 대상이 없습니다'} />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`실사입력 - ${selected?.location?.code ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              취소
            </Button>
            <Button disabled={submit.isPending || counted === ''} onClick={() => selected && submit.mutate(selected.id)}>
              {submit.isPending ? '저장중...' : '실사확정'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            전산수량: <span className="font-semibold text-gray-800">{selected?.systemQty}</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">실사수량</label>
            <input
              type="number"
              value={counted}
              onChange={(e) => setCounted(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {counted !== '' && selected && (
            <div className="text-sm text-gray-600">
              오차:{' '}
              <span className={Number(counted) - selected.systemQty === 0 ? 'text-gray-500' : 'text-red-600'}>
                {Number(counted) - selected.systemQty}
              </span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
