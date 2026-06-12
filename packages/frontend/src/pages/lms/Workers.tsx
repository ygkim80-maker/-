import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Worker } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Card, Badge, Column } from '../../components/ui';

interface Schedule {
  id: string;
  workerId?: string;
  worker?: Worker;
  date?: string;
  shift?: string;
  zone?: string;
  status: string;
}

const ROLE_LABEL: Record<string, string> = {
  PICKER: '피커',
  PACKER: '패커',
  RECEIVER: '입고담당',
  LOADER: '상하차',
  SUPERVISOR: '관리자',
  WORKER: '작업자',
};

export default function Workers() {
  const [search, setSearch] = useState('');

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ['lms', 'workers'],
    queryFn: async () => {
      try {
        const res = await api.get('/lms/labor/workers');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const { data: schedules = [] } = useQuery<Schedule[]>({
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

  const today = new Date().toISOString().slice(0, 10);
  const scheduleByWorker = new Map<string, Schedule>();
  schedules.forEach((s) => {
    const wid = s.workerId ?? s.worker?.id;
    if (!wid) return;
    if (s.date && !s.date.startsWith(today)) return;
    if (!scheduleByWorker.has(wid)) scheduleByWorker.set(wid, s);
  });
  const canJoin = scheduleByWorker.size > 0;

  const filtered = workers.filter(
    (w) =>
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Worker>[] = [
    { key: 'name', header: '이름', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'email', header: '이메일', render: (r) => r.email ?? '-' },
    { key: 'role', header: '역할', render: (r) => <Badge color="blue">{ROLE_LABEL[r.role] ?? r.role}</Badge> },
    ...(canJoin
      ? [
          { key: 'shift', header: '오늘 근무조', render: (r: Worker) => scheduleByWorker.get(r.id)?.shift ?? '-' },
          {
            key: 'sstatus',
            header: '근무상태',
            render: (r: Worker) => {
              const s = scheduleByWorker.get(r.id);
              return s ? <StatusBadge status={s.status} /> : <span className="text-gray-300">-</span>;
            },
          },
        ]
      : []),
  ];

  const scheduleColumns: Column<Schedule>[] = [
    { key: 'worker', header: '작업자', render: (r) => r.worker?.name ?? r.workerId ?? '-' },
    { key: 'date', header: '날짜', render: (r) => (r.date ? r.date.slice(0, 10) : '-') },
    { key: 'shift', header: '근무조', render: (r) => r.shift ?? '-' },
    { key: 'zone', header: '존', render: (r) => r.zone ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="작업자관리" subtitle="작업자(Worker) 목록 및 근무현황" />
      <SearchBar value={search} onChange={setSearch} placeholder="이름/이메일 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '작업자가 없습니다'} />
      </Card>

      {!canJoin && schedules.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">근무 스케줄</h2>
          <Card>
            <Table columns={scheduleColumns} rows={schedules} empty="스케줄이 없습니다" />
          </Card>
        </div>
      )}
    </div>
  );
}
