import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Inventory, SalesOrder } from '../../types';
import { PageHeader, Table, StatusBadge, Card, StatCard, Column } from '../../components/ui';

interface Summary {
  inventoryCount?: number;
  orderCount?: number;
  purchaseOrderCount?: number;
}

type Tab = 'inventory' | 'orders';

export default function ShipperPortal() {
  const [tab, setTab] = useState<Tab>('inventory');

  const { data: summary } = useQuery<Summary>({
    queryKey: ['shipper', 'summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/shipper/portal/summary');
        return res.data ?? {};
      } catch {
        return {};
      }
    },
  });

  const { data: inventory = [], isLoading: invLoading } = useQuery<Inventory[]>({
    queryKey: ['shipper', 'inventory'],
    queryFn: async () => {
      try {
        const res = await api.get('/shipper/portal/inventory');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const { data: orders = [], isLoading: ordLoading } = useQuery<SalesOrder[]>({
    queryKey: ['shipper', 'orders'],
    queryFn: async () => {
      try {
        const res = await api.get('/shipper/portal/orders');
        return res.data.data ?? res.data;
      } catch {
        return [];
      }
    },
  });

  const invCount = summary?.inventoryCount ?? inventory.length;
  const orderCount = summary?.orderCount ?? orders.length;
  const poCount = summary?.purchaseOrderCount ?? 0;

  const invColumns: Column<Inventory>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-medium">{r.item?.sku ?? '-'}</span> },
    { key: 'name', header: '상품명', render: (r) => r.item?.name ?? '-' },
    { key: 'location', header: '로케이션', render: (r) => r.location?.code ?? '-' },
    { key: 'lot', header: 'LOT', render: (r) => r.lot ?? '-' },
    { key: 'qty', header: '수량', render: (r) => `${(r.qty ?? 0).toLocaleString()}` },
  ];

  const orderColumns: Column<SalesOrder>[] = [
    { key: 'orderNumber', header: '주문번호', render: (r) => <span className="font-medium">{r.orderNumber}</span> },
    { key: 'customerName', header: '고객명', render: (r) => r.customerName ?? '-' },
    { key: 'channel', header: '채널', render: (r) => r.channel?.name ?? '-' },
    { key: 'status', header: '상태', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: '주문일시', render: (r) => (r.createdAt ? r.createdAt.slice(0, 16).replace('T', ' ') : '-') },
  ];

  return (
    <div>
      <PageHeader title="화주포털" subtitle="화주 전용 포털 — 재고/주문/발주 현황 조회" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="재고 품목" value={invCount.toLocaleString()} suffix="건" icon="📦" />
        <StatCard label="주문" value={orderCount.toLocaleString()} suffix="건" icon="🛒" />
        <StatCard label="발주" value={poCount.toLocaleString()} suffix="건" icon="📥" />
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab('inventory')}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
            tab === 'inventory' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          재고
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
            tab === 'orders' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          주문
        </button>
      </div>

      <Card>
        {tab === 'inventory' ? (
          <Table
            columns={invColumns}
            rows={invLoading ? [] : inventory}
            empty={invLoading ? '불러오는 중...' : '재고가 없습니다'}
          />
        ) : (
          <Table
            columns={orderColumns}
            rows={ordLoading ? [] : orders}
            empty={ordLoading ? '불러오는 중...' : '주문이 없습니다'}
          />
        )}
      </Card>
    </div>
  );
}
