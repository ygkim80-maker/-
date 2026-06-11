import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Worker } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Card, Column } from '../../components/ui';

interface Schedule {
  id: string;
  workerId?: string;
  worker?: Worker;
  date?: string;
  shift?: string;
  zone?: string;
  taskType?: string;
  status: string;
}

export default function Tasks() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['lms', 'schedules'],
    queryFn: async () => {
      try {
        const res = await api.get('/lms/labor/schedules');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const statuses = Array.from(new Set(data.map((s) => s.status).filter(Boolean)));

  const filtered = data.filter((s) => {
    const matchSearch =
      (s.worker?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.zone ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: Column<Schedule>[] = [
    { key: 'worker', header: '작업자', render: (r) => <span className="font-medium">{r.worker?.name ?? r.workerId ?? '-'}</span> },
    { key: 'date', header: '날짜', render: (r) => (r.date ? r.date.slice(0, 10) : '-') },
    { key: 'shift', header: '근무조', render: (r) => r.shift ?? '-' },
    { key: 'taskType', header: '작업유형', render: (r) => r.taskType ?? '-' },
    { key: 'zone', header: '작업존', render: (r) => r.zone ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="작업배정" subtitle="작업자 배정 및 근무 스케줄 조회" />
      <SearchBar value={search} onChange={setSearch} placeholder="작업자/존 검색...">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">전체 상태</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </SearchBar>
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '배정된 작업이 없습니다'} />
      </Card>
    </div>
  );
}
