import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../hooks/api';
import { DashboardData } from '../../types';
import { PageHeader, Card, StatCard } from '../../components/ui';

const COLORS = ['#0f3460', '#e94560', '#16c79a', '#f6c90e', '#9b59b6'];

const EMPTY: DashboardData = {
  kpis: {
    todayOrders: 0,
    processedOrders: 0,
    shippedOrders: 0,
    inventoryAccuracy: 0,
    avgProcessTime: 0,
    dockUtilization: 0,
  },
  dailyThroughput: [],
  channelOrders: [],
  zoneInventory: [],
  workerProductivity: [],
  alerts: [],
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </Card>
  );
}

export default function Reports() {
  const { data = EMPTY, isLoading } = useQuery<DashboardData>({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      try {
        const res = await api.get('/dashboard');
        return { ...EMPTY, ...res.data };
      } catch {
        return EMPTY;
      }
    },
  });

  return (
    <div>
      <PageHeader title="리포트" subtitle="풀필먼트 운영 통계 및 분석" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="금일 주문" value={data.kpis.todayOrders.toLocaleString()} suffix="건" icon="🛒" />
        <StatCard label="처리 주문" value={data.kpis.processedOrders.toLocaleString()} suffix="건" icon="✅" />
        <StatCard label="출하 주문" value={data.kpis.shippedOrders.toLocaleString()} suffix="건" icon="🚚" />
        <StatCard label="재고 정확도" value={data.kpis.inventoryAccuracy} suffix="%" icon="🎯" />
        <StatCard label="평균 처리시간" value={data.kpis.avgProcessTime} suffix="분" icon="⏱️" />
        <StatCard label="도크 가동률" value={data.kpis.dockUtilization} suffix="%" icon="🚪" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="일별 처리량">
          {data.dailyThroughput.length === 0 ? (
            <div className="text-center text-gray-400 py-16">{isLoading ? '불러오는 중...' : '데이터가 없습니다'}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyThroughput}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="received" name="입고" stroke={COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="shipped" name="출고" stroke={COLORS[1]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="채널별 주문">
          {data.channelOrders.length === 0 ? (
            <div className="text-center text-gray-400 py-16">{isLoading ? '불러오는 중...' : '데이터가 없습니다'}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.channelOrders} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {data.channelOrders.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="존별 재고">
          {data.zoneInventory.length === 0 ? (
            <div className="text-center text-gray-400 py-16">{isLoading ? '불러오는 중...' : '데이터가 없습니다'}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.zoneInventory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="qty" name="재고수량" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="작업자 생산성">
          {data.workerProductivity.length === 0 ? (
            <div className="text-center text-gray-400 py-16">{isLoading ? '불러오는 중...' : '데이터가 없습니다'}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.workerProductivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="qty" name="처리건수" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
