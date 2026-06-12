import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { DockAppointment } from '../../types';
import { PageHeader, SearchBar, Table, StatusBadge, Button, Card, Badge, Column } from '../../components/ui';

interface DockDoor {
  id: string;
  doorNumber: string;
  type: string;
  status?: string;
  isOccupied?: boolean;
}

const STATUS_OPTIONS = ['SCHEDULED', 'ARRIVED', 'LOADING', 'COMPLETED', 'NO_SHOW'];

// next status + Korean action label
const NEXT: Record<string, { status: string; label: string }> = {
  SCHEDULED: { status: 'ARRIVED', label: '도착' },
  ARRIVED: { status: 'LOADING', label: '상하차' },
  LOADING: { status: 'COMPLETED', label: '완료' },
};

export default function DockSchedule() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data = [], isLoading } = useQuery<DockAppointment[]>({
    queryKey: ['yms', 'dock'],
    queryFn: async () => {
      try {
        const res = await api.get('/yms/dock');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const { data: doors = [] } = useQuery<DockDoor[]>({
    queryKey: ['yms', 'dock', 'doors'],
    queryFn: async () => {
      try {
        const res = await api.get('/yms/dock/doors');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const advance = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/yms/dock/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yms', 'dock'] }),
  });

  const filtered = data.filter((a) => {
    const matchSearch =
      a.vehiclePlate?.toLowerCase().includes(search.toLowerCase()) ||
      a.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      a.dockDoor?.doorNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return (matchSearch ?? false) && matchStatus;
  });

  const columns: Column<DockAppointment>[] = [
    { key: 'doorNumber', header: '도크도어', render: (r) => <span className="font-medium">{r.dockDoor?.doorNumber ?? '-'}</span> },
    {
      key: 'type',
      header: '구분',
      render: (r) => <Badge color={r.type === 'INBOUND' ? 'blue' : 'green'}>{r.type === 'INBOUND' ? '입고' : '출고'}</Badge>,
    },
    { key: 'vehiclePlate', header: '차량번호', render: (r) => r.vehiclePlate ?? '-' },
    { key: 'driverName', header: '기사명', render: (r) => r.driverName ?? '-' },
    { key: 'scheduledAt', header: '예약시간', render: (r) => (r.scheduledAt ? r.scheduledAt.slice(0, 16).replace('T', ' ') : '-') },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '진행',
      render: (r) => {
        const next = NEXT[r.status];
        if (!next) return <span className="text-gray-300 text-xs">-</span>;
        return (
          <Button size="sm" variant="secondary" disabled={advance.isPending} onClick={() => advance.mutate({ id: r.id, status: next.status })}>
            {next.label}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="도크스케줄" subtitle="도크 예약(Dock Appointment) 관리" />
      {doors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {doors.map((d) => (
            <Card key={d.id} className="p-3 text-center">
              <div className="text-sm font-semibold text-gray-700">도어 {d.doorNumber}</div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <Badge color={d.type === 'INBOUND' ? 'blue' : 'green'}>{d.type === 'INBOUND' ? '입고' : '출고'}</Badge>
                <Badge color={d.isOccupied ? 'yellow' : 'gray'}>{d.isOccupied ? '사용중' : '비어있음'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      <SearchBar value={search} onChange={setSearch} placeholder="차량번호/기사명/도어 검색...">
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
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '도크 예약이 없습니다'} />
      </Card>
    </div>
  );
}
