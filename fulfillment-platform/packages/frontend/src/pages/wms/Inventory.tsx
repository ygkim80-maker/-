import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Inventory as InventoryItem } from '../../types';
import { PageHeader, SearchBar, Table, Card, StatCard, Column } from '../../components/ui';

export default function Inventory() {
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['wms', 'inventory'],
    queryFn: async () => {
      const res = await api.get('/wms/inventory');
      return res.data.data ?? res.data;
    },
  });

  const filtered = data.filter(
    (inv) =>
      inv.item?.sku?.toLowerCase().includes(search.toLowerCase()) ||
      inv.item?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSku = new Set(data.map((inv) => inv.item?.sku).filter(Boolean)).size;
  const totalQty = data.reduce((s, inv) => s + (inv.qty || 0), 0);
  const lowStock = data.filter((inv) => inv.item && inv.qty < inv.item.reorderPoint).length;

  const columns: Column<InventoryItem>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-medium">{r.item?.sku ?? '-'}</span> },
    { key: 'name', header: '상품명', render: (r) => r.item?.name ?? '-' },
    { key: 'code', header: '로케이션', render: (r) => r.location?.code ?? '-' },
    { key: 'zone', header: '존', render: (r) => r.location?.zone?.name ?? '-' },
    {
      key: 'qty',
      header: '수량',
      render: (r) => (
        <span className={r.item && r.qty < r.item.reorderPoint ? 'text-red-600 font-semibold' : ''}>{r.qty}</span>
      ),
    },
    { key: 'lot', header: 'LOT', render: (r) => r.lot ?? '-' },
    { key: 'expiryDate', header: '유효기간', render: (r) => (r.expiryDate ? r.expiryDate.slice(0, 10) : '-') },
  ];

  return (
    <div>
      <PageHeader title="재고현황" subtitle="로케이션별 재고 조회" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="총 SKU" value={totalSku} suffix="종" icon="📦" />
        <StatCard label="총 수량" value={totalQty.toLocaleString()} suffix="개" icon="🔢" />
        <StatCard label="재고부족" value={lowStock} suffix="건" color="text-red-600" icon="⚠️" />
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="SKU/상품명 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '재고가 없습니다'} />
      </Card>
    </div>
  );
}
