import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../hooks/api';
import { DashboardData } from '../types';
import { Card, PageHeader, StatCard, Badge } from '../components/ui';

const COLORS = ['#0f3460', '#e94560', '#16c79a', '#f6c90e', '#9b59b6'];

const severityColor: Record<string, string> = {
  CRITICAL: 'red',
  WARNING: 'yellow',
  INFO: 'blue',
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardData>('/dashboard')).data,
    refetchInterval: 30000,
  });

  if (isLoading || !data) {
    return <div className="text-gray-400 py-20 text-center">대시보드 로딩 중...</div>;
  }

  return (
    <div>
      <PageHeader title="대시보드" subtitle="수도권 풀필먼트 센터 실시간 운영 현황" />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="오늘 주문 접수" value={data.kpis.todayOrders} suffix="건" icon="📋" color="text-accent" />
        <StatCard label="처리 완료" value={data.kpis.processedOrders} suffix="건" icon="⚙️" color="text-yellow-600" />
        <StatCard label="출하 완료" value={data.kpis.shippedOrders} suffix="건" icon="🚚" color="text-green-600" />
        <StatCard label="재고 정확도" value={data.kpis.inventoryAccuracy} suffix="%" icon="🎯" />
        <StatCard label="평균 처리시간" value={data.kpis.avgProcessTime} suffix="분" icon="⏱️" />
        <StatCard label="도크 가동률" value={data.kpis.dockUtilization} suffix="%" icon="🏭" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">일별 처리량 (최근 7일)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.dailyThroughput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="received" name="입고" stroke="#0f3460" strokeWidth={2} />
              <Line type="monotone" dataKey="shipped" name="출고" stroke="#e94560" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">채널별 주문 비중</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.channelOrders} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {data.channelOrders.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">존별 재고 수량</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.zoneInventory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="zone" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="qty" name="재고수량" fill="#16c79a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">작업자 생산성 (오늘)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.workerProductivity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" fontSize={12} width={60} />
              <Tooltip />
              <Bar dataKey="qty" name="처리건수" fill="#0f3460" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-gray-700 mb-4">알림 / 이벤트</h3>
        <div className="space-y-2">
          {data.alerts?.length ? (
            data.alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <Badge color={severityColor[a.severity] || 'gray'}>{a.severity}</Badge>
                <span className="font-medium text-gray-700 text-sm">{a.title}</span>
                <span className="text-sm text-gray-500">{a.message}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm">알림이 없습니다.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
