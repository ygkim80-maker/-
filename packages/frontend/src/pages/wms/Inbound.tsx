import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PurchaseOrder } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Button, Modal, Card, Column } from '../../components/ui';

export default function Inbound() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  const { data = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['wms', 'inbound'],
    queryFn: async () => {
      const res = await api.get('/wms/inbound');
      return res.data.data ?? res.data;
    },
  });

  const receive = useMutation({
    mutationFn: async (id: string) => api.post(`/wms/inbound/${id}/receive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'inbound'] });
      setSelected(null);
    },
  });

  const filtered = data.filter(
    (po) =>
      po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', header: '발주번호', render: (r) => <span className="font-medium">{r.poNumber}</span> },
    { key: 'supplier', header: '공급사', render: (r) => r.supplier?.name ?? '-' },
    { key: 'shipper', header: '화주', render: (r) => r.shipper?.name ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'expectedDate', header: '입고예정일', render: (r) => (r.expectedDate ? r.expectedDate.slice(0, 10) : '-') },
    { key: 'lines', header: '품목수', render: (r) => `${r.lines?.length ?? 0}건` },
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

  return (
    <div>
      <PageHeader title="입고관리" subtitle="발주(PO) 입고 처리" />
      <SearchBar value={search} onChange={setSearch} placeholder="발주번호/공급사 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '발주가 없습니다'} />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`입고처리 - ${selected?.poNumber ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              닫기
            </Button>
            <Button
              disabled={receive.isPending}
              onClick={() => selected && receive.mutate(selected.id)}
            >
              {receive.isPending ? '처리중...' : '전체 입고확정'}
            </Button>
          </>
        }
      >
        <Table
          columns={[
            { key: 'item', header: '상품명', render: (l) => l.item?.name ?? '-' },
            { key: 'orderedQty', header: '발주수량' },
            { key: 'receivedQty', header: '입고수량' },
          ]}
          rows={selected?.lines ?? []}
        />
      </Modal>
    </div>
  );
}
