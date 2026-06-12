import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../hooks/api';
import { PageHeader, Table, Card, StatCard, Column } from '../../components/ui';

interface RawProductivity {
  id?: string;
  name?: string;
  workerId?: string;
  worker?: { id: string; name: string };
  taskType?: string;
  quantity?: number;
  qty?: number;
  count?: number;
}

interface ProdRow {
  id: string;
  name: string;
  quantity: number;
}

// normalize a heterogeneous productivity payload into {name, quantity}
function normalize(raw: RawProductivity[]): ProdRow[] {
  return raw.map((r, i) => ({
    id: r.id ?? r.workerId ?? String(i),
    name: r.name ?? r.worker?.name ?? r.taskType ?? r.workerId ?? `항목 ${i + 1}`,
    quantity: r.quantity ?? r.qty ?? r.count ?? 0,
  }));
}

export default function Productivity() {
  const { data: raw = [], isLoading } = useQuery<RawProductivity[]>({
    queryKey: ['lms', 'productivity'],
    queryFn: async () => {
      try {
        const res = await api.get('/lms/labor/productivity');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const rows = normalize(Array.isArray(raw) ? raw : []);
  const total = rows.reduce((s, r) => s + r.quantity, 0);
  const avg = rows.length ? Math.round(total / rows.length) : 0;

  const columns: Column<ProdRow>[] = [
    { key: 'name', header: '작업자/유형', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'quantity', header: '처리건수', render: (r) => `${r.quantity.toLocaleString()}건` },
  ];

  return (
    <div>
      <PageHeader title="생산성" subtitle="작업자/작업유형별 생산성 분석" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="총 처리건수" value={total.toLocaleString()} suffix="건" icon="📊" />
        <StatCard label="평균 처리건수" value={avg.toLocaleString()} suffix="건" icon="📈" />
      </div>
      <Card className="p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">생산성 차트</h2>
        {rows.length === 0 ? (
          <div className="text-center text-gray-400 py-16">{isLoading ? '불러오는 중...' : '데이터가 없습니다'}</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantity" name="처리건수" fill="#0f3460" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card>
        <Table columns={columns} rows={isLoading ? [] : rows} empty={isLoading ? '불러오는 중...' : '데이터가 없습니다'} />
      </Card>
    </div>
  );
}
