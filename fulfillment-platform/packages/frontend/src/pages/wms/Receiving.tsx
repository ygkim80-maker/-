import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PurchaseOrder, POLine } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Button, Modal, Card, Column } from '../../components/ui';

const ACTIVE = ['RECEIVING', 'ASN_RECEIVED'];

export default function Receiving() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const { data = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['wms', 'receiving'],
    queryFn: async () => {
      const res = await api.get('/wms/inbound');
      return res.data.data ?? res.data;
    },
  });

  const receive = useMutation({
    mutationFn: async (id: string) => api.post(`/wms/inbound/${id}/receive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'receiving'] });
      setSelected(null);
    },
  });

  const filtered = data
    .filter((po) => ACTIVE.includes(po.status))
    .filter(
      (po) =>
        po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
        po.supplier?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const progress = (po: PurchaseOrder) => {
    const lines = po.lines ?? [];
    const ordered = lines.reduce((s, l) => s + (l.orderedQty || 0), 0);
    const received = lines.reduce((s, l) => s + (l.receivedQty || 0), 0);
    return ordered === 0 ? 0 : Math.round((received / ordered) * 100);
  };

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: '발주번호', render: (r) => <span className="font-medium">{r.poNumber}</span> },
    { key: 'supplier', header: '공급사', render: (r) => r.supplier?.name ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'progress',
      header: '입고진행률',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${progress(r)}%` }} />
          </div>
          <span className="text-xs text-gray-500">{progress(r)}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setSelected(r)}>
          입고처리
        </Button>
      ),
    },
  ];

  const lineColumns: Column<POLine>[] = [
    { key: 'item', header: '상품명', render: (l) => l.item?.name ?? '-' },
    { key: 'orderedQty', header: '발주수량' },
    {
      key: 'receivedQty',
      header: '입고진행',
      render: (l) => (
        <span className={l.receivedQty >= l.orderedQty ? 'text-green-600' : 'text-yellow-600'}>
          {l.receivedQty} / {l.orderedQty}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="입고처리" subtitle="입고중 발주 검수 및 확정" />
      <SearchBar value={search} onChange={setSearch} placeholder="발주번호/공급사 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '입고대기 발주가 없습니다'} />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`입고검수 - ${selected?.poNumber ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              닫기
            </Button>
            <Button disabled={receive.isPending} onClick={() => selected && receive.mutate(selected.id)}>
              {receive.isPending ? '처리중...' : '입고확정'}
            </Button>
          </>
        }
      >
        <Table columns={lineColumns} rows={selected?.lines ?? []} />
      </Modal>
    </div>
  );
}
