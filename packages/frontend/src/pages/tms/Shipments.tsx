import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Shipment } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Button, Card, StatCard, Column } from '../../components/ui';

const STATUS_OPTIONS = ['LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

// next status in the delivery lifecycle
const NEXT_STATUS: Record<string, string> = {
  LABEL_CREATED: 'PICKED_UP',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

export default function Shipments() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data = [], isLoading } = useQuery<Shipment[]>({
    queryKey: ['tms', 'shipments'],
    queryFn: async () => {
      try {
        const res = await api.get('/tms/shipments');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const advance = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/tms/shipments/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tms', 'shipments'] }),
  });

  const filtered = data.filter((s) => {
    const matchSearch =
      s.so?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.carrier?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return (matchSearch ?? false) && matchStatus;
  });

  const inTransit = data.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length;
  const delivered = data.filter((s) => s.status === 'DELIVERED').length;

  const columns: Column<Shipment>[] = [
    { key: 'orderNumber', header: '주문번호', render: (r) => <span className="font-medium">{r.so?.orderNumber ?? '-'}</span> },
    { key: 'carrier', header: '배송사', render: (r) => r.carrier?.name ?? '-' },
    { key: 'trackingNumber', header: '송장번호', render: (r) => r.trackingNumber ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'shippedAt', header: '출하일시', render: (r) => (r.shippedAt ? r.shippedAt.slice(0, 16).replace('T', ' ') : '-') },
    { key: 'weight', header: '중량', render: (r) => (r.so?.lines?.length ? `${r.so.lines.length}건` : '-') },
    {
      key: 'actions',
      header: '상태진행',
      render: (r) => {
        const next = NEXT_STATUS[r.status];
        if (!next) return <span className="text-gray-300 text-xs">-</span>;
        return (
          <Button size="sm" variant="secondary" disabled={advance.isPending} onClick={() => advance.mutate({ id: r.id, status: next })}>
            <StatusBadge status={next} /> 으로
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="배송현황" subtitle="배송(Shipment) 조회 및 상태 진행" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="배송중" value={inTransit} suffix="건" color="text-yellow-600" icon="🚚" />
        <StatCard label="배송완료" value={delivered} suffix="건" color="text-green-600" icon="✅" />
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="주문번호/송장/배송사 검색...">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">전체 상태</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </SearchBar>
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '배송 내역이 없습니다'} />
      </Card>
    </div>
  );
}
