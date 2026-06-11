import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../hooks/api';
import { SalesOrder } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Button, Card, Column } from '../../components/ui';

const STATUS_OPTIONS = ['RECEIVED', 'ALLOCATED', 'PICKING', 'PACKING', 'SHIPPED', 'CANCELLED'];

export default function Orders() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data = [], isLoading } = useQuery<SalesOrder[]>({
    queryKey: ['oms', 'orders'],
    queryFn: async () => {
      const res = await api.get('/oms/orders');
      return res.data.data ?? res.data;
    },
  });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/oms/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oms', 'orders'] }),
  });

  const filtered = data.filter((o) => {
    const matchSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<SalesOrder>[] = [
    { key: 'orderNumber', header: '주문번호', render: (r) => <span className="font-medium">{r.orderNumber}</span> },
    { key: 'customerName', header: '고객명', render: (r) => r.customerName ?? '-' },
    { key: 'channel', header: '채널', render: (r) => r.channel?.name ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'slaType', header: 'SLA', render: (r) => r.slaType ?? '-' },
    { key: 'createdAt', header: '주문일시', render: (r) => (r.createdAt ? r.createdAt.slice(0, 10) : '-') },
    { key: 'lines', header: '품목수', render: (r) => `${r.lines?.length ?? 0}건` },
    {
      key: 'changeStatus',
      header: '상태변경',
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => changeStatus.mutate({ id: r.id, status: e.target.value })}
          className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => navigate(`/oms/orders/${r.id}`)}>
          상세
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="주문관리" subtitle="판매주문(SO) 조회 및 상태관리" />
      <SearchBar value={search} onChange={setSearch} placeholder="주문번호/고객명 검색...">
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
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '주문이 없습니다'} />
      </Card>
    </div>
  );
}
