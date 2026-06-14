import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Item } from '../../types';
import { PageHeader, SearchBar, Table, Card, Button, Modal, Column } from '../../components/ui';

const emptyForm = { sku: '', name: '', category: '', uom: '', barcode: '', reorderPoint: '0', weight: '' };

export default function Items() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const { data = [], isLoading } = useQuery<Item[]>({
    queryKey: ['wms', 'items'],
    queryFn: async () => {
      const res = await api.get('/wms/items');
      return res.data.data ?? res.data;
    },
  });

  const create = useMutation({
    mutationFn: async () => api.post('/wms/items', {
      ...form,
      reorderPoint: Number(form.reorderPoint),
      weight: form.weight ? Number(form.weight) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'items'] }); closeModal(); },
  });

  const update = useMutation({
    mutationFn: async () => api.put(`/wms/items/${editItem!.id}`, {
      ...form,
      reorderPoint: Number(form.reorderPoint),
      weight: form.weight ? Number(form.weight) : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'items'] }); closeModal(); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/wms/items/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'items'] }); setDeleteTarget(null); },
  });

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (item: Item) => {
    setEditItem(item);
    setForm({
      sku: item.sku ?? '',
      name: item.name ?? '',
      category: item.category ?? '',
      uom: item.uom ?? '',
      barcode: (item as any).barcode ?? '',
      reorderPoint: String(item.reorderPoint ?? 0),
      weight: String(item.weight ?? ''),
    });
    setOpen(true);
  };
  const closeModal = () => { setOpen(false); setEditItem(null); setForm(emptyForm); };

  const filtered = data.filter(
    (it) =>
      it.sku?.toLowerCase().includes(search.toLowerCase()) ||
      it.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Item>[] = [
    { key: 'sku', header: 'SKU', render: (r) => <span className="font-medium">{r.sku}</span> },
    { key: 'name', header: '상품명' },
    { key: 'category', header: '카테고리' },
    { key: 'uom', header: '단위' },
    { key: 'reorderPoint', header: '재주문점', render: (r) => <span className="text-orange-600 font-medium">{r.reorderPoint ?? 0}</span> },
    { key: 'weight', header: '중량(kg)', render: (r) => r.weight ?? '-' },
    {
      key: 'actions' as any,
      header: '관리',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">수정</button>
          <button onClick={() => setDeleteTarget(r)} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">삭제</button>
        </div>
      ),
    },
  ];

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );

  const isPending = editItem ? update.isPending : create.isPending;

  return (
    <div>
      <PageHeader
        title="상품마스터"
        subtitle="상품 정보 관리"
        actions={<Button onClick={openCreate}>상품등록</Button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="SKU/상품명 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '상품이 없습니다'} />
      </Card>

      <Modal
        open={open}
        onClose={closeModal}
        title={editItem ? '상품수정' : '상품등록'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>취소</Button>
            <Button
              disabled={isPending || !form.sku || !form.name}
              onClick={() => editItem ? update.mutate() : create.mutate()}
            >
              {isPending ? '저장중...' : (editItem ? '수정' : '등록')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {field('SKU *', 'sku')}
          {field('상품명 *', 'name')}
          {field('카테고리', 'category')}
          {field('단위 (EA/BOX 등)', 'uom')}
          {field('바코드', 'barcode')}
          {field('재주문점 (수량)', 'reorderPoint', 'number')}
          {field('중량 (kg)', 'weight', 'number')}
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="상품 삭제"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>취소</Button>
            <Button onClick={() => remove.mutate(deleteTarget!.id)} disabled={remove.isPending}>
              {remove.isPending ? '삭제중...' : '삭제'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{deleteTarget?.name}</span> ({deleteTarget?.sku}) 상품을 삭제하시겠습니까?
        </p>
      </Modal>
    </div>
  );
}
