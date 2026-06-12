import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PageHeader, SearchBar, Table, Card, Badge, Column } from '../../components/ui';

interface Carrier {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  shipmentCount?: number;
}

export default function Carriers() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<Carrier[]>({
    queryKey: ['tms', 'carriers'],
    queryFn: async () => {
      try {
        const res = await api.get('/tms/shipments/carriers');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const hasCount = data.some((c) => typeof c.shipmentCount === 'number');

  const filtered = data.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Carrier>[] = [
    { key: 'name', header: '배송사명', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', header: '코드', render: (r) => r.code ?? '-' },
    {
      key: 'isActive',
      header: '운영상태',
      render: (r) => <Badge color={r.isActive ? 'green' : 'red'}>{r.isActive ? '운영중' : '중지'}</Badge>,
    },
    ...(hasCount
      ? [{ key: 'shipmentCount', header: '배송건수', render: (r: Carrier) => `${r.shipmentCount ?? 0}건` }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="배송사" subtitle="배송사(Carrier) 목록 및 운영상태" />
      <SearchBar value={search} onChange={setSearch} placeholder="배송사명/코드 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '배송사가 없습니다'} />
      </Card>
    </div>
  );
}
