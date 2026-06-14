import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Inventory as InventoryItem } from '../../types';
import { PageHeader, SearchBar, Table, Card, StatCard, Button, Modal, Column } from '../../components/ui';

export default function Inventory() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const { data = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['wms', 'inventory'],
    queryFn: async () => {
      const res = await api.get('/wms/inventory');
      return res.data.data ?? res.data;
    },
  });

  const adjust = useMutation({
    mutationFn: async () => api.put(`/wms/inventory/${adjustTarget!.id}`, { qty: Number(adjustQty) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'inventory'] });
      setAdjustTarget(null);
      setAdjustQty('');
      setAdjustNote('');
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
      header: '현재수량',
      render: (r) => (
        <span className={r.item && r.qty < r.item.reorderPoint ? 'text-red-600 font-semibold' : 'font-medium'}>
          {r.qty}
          {r.item && r.qty < r.item.reorderPoint && <span className="ml-1 text-xs">⚠️</span>}
        </span>
      ),
    },
    {
      key: 'reorderPoint',
      header: '재주문점',
      render: (r) => <span className="text-orange-600">{r.item?.reorderPoint ?? '-'}</span>,
    },
    { key: 'lot', header: 'LOT', render: (r) => r.lot ?? '-' },
    { key: 'expiryDate', header: '유효기간', render: (r) => (r.expiryDate ? r.expiryDate.slice(0, 10) : '-') },
    {
      key: 'actions' as any,
      header: '수량조정',
      render: (r) => (
        <button
          onClick={() => { setAdjustTarget(r); setAdjustQty(String(r.qty)); }}
          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
        >
          조정
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="재고현황" subtitle="로케이션별 재고 조회" />

      {lowStock > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ⚠️ <strong>{lowStock}개</strong> 상품이 재주문점 이하입니다. 발주를 검토하세요.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="총 SKU" value={totalSku} suffix="종" icon="📦" />
        <StatCard label="총 수량" value={totalQty.toLocaleString()} suffix="개" icon="🔢" />
        <StatCard label="재고부족" value={lowStock} suffix="건" color="text-red-600" icon="⚠️" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="SKU/상품명 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '재고가 없습니다'} />
      </Card>

      <Modal
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        title="재고 수량 조정"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdjustTarget(null)}>취소</Button>
            <Button disabled={adjust.isPending || adjustQty === ''} onClick={() => adjust.mutate()}>
              {adjust.isPending ? '저장중...' : '저장'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{adjustTarget?.item?.name}</span> ({adjustTarget?.item?.sku})<br />
            로케이션: {adjustTarget?.location?.code} | 현재수량: <span className="font-semibold">{adjustTarget?.qty}</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">조정 후 수량 *</label>
            <input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">조정 사유</label>
            <input
              type="text"
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="예: 실사 조정, 파손 제거 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
