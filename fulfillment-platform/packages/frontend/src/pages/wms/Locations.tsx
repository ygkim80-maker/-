import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Location } from '../../types';
import { PageHeader, SearchBar, Table, Card, Badge, Column } from '../../components/ui';

export default function Locations() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<Location[]>({
    queryKey: ['wms', 'locations'],
    queryFn: async () => {
      const res = await api.get('/wms/locations');
      return res.data.data ?? res.data;
    },
  });

  const filtered = data.filter(
    (loc) =>
      loc.code?.toLowerCase().includes(search.toLowerCase()) ||
      loc.zone?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Location>[] = [
    { key: 'code', header: '로케이션코드', render: (r) => <span className="font-medium">{r.code}</span> },
    { key: 'zone', header: '존', render: (r) => r.zone?.name ?? '-' },
    { key: 'aisle', header: '통로' },
    { key: 'bay', header: '베이' },
    { key: 'level', header: '단' },
    { key: 'locationType', header: '유형' },
    { key: 'capacity', header: '용량' },
    {
      key: 'isActive',
      header: '사용여부',
      render: (r) => <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? '사용' : '미사용'}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader title="로케이션" subtitle="창고 로케이션 관리" />
      <SearchBar value={search} onChange={setSearch} placeholder="코드/존 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '로케이션이 없습니다'} />
      </Card>
    </div>
  );
}
