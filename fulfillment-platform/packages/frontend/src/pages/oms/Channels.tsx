import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PageHeader, SearchBar, Table, Badge, Card, Column } from '../../components/ui';

interface Channel {
  id: string;
  name: string;
  code: string;
  type: string;
  isActive: boolean;
}

export default function Channels() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['oms', 'channels'],
    queryFn: async () => {
      try {
        const res = await api.get('/oms/channels');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const filtered = data.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Channel>[] = [
    { key: 'name', header: '채널명', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', header: '코드', render: (r) => r.code ?? '-' },
    { key: 'type', header: '유형', render: (r) => r.type ?? '-' },
    {
      key: 'isActive',
      header: '사용여부',
      render: (r) => <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? '사용' : '미사용'}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader title="채널관리" subtitle="판매채널 조회" />
      <SearchBar value={search} onChange={setSearch} placeholder="채널명/코드 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '채널이 없습니다'} />
      </Card>
    </div>
  );
}
