import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Item } from '../../types';
import { PageHeader, SearchBar, Table, Card, Button, Modal, Column } from '../../components/ui';

const emptyForm = { sku: '', name: '', category: '', uom: '' };

export default function Items() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data = [], isLoading } = useQuery<Item[]>({
    queryKey: ['wms', 'items'],
    queryFn: async () => {
      const res = await api.get('/wms/items');
      return res.data.data ?? res.data;
    },
  });

  const create = useMutation({
    mutationFn: async () => api.post('/wms/items', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wms', 'items'] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

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
    { key: 'shipper', header: '화주', render: (r) => r.shipper?.name ?? '-' },
    { key: 'reorderPoint', header: '재주문점' },
    { key: 'weight', header: '중량(kg)', render: (r) => r.weight ?? '-' },
  ];

  const field = (label: string, key: keyof typeof form) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="상품마스터"
        subtitle="상품 정보 관리"
        actions={<Button onClick={() => setOpen(true)}>상품등록</Button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="SKU/상품명 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '상품이 없습니다'} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="상품등록"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button disabled={create.isPending || !form.sku || !form.name} onClick={() => create.mutate()}>
              {create.isPending ? '등록중...' : '등록'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {field('SKU', 'sku')}
          {field('상품명', 'name')}
          {field('카테고리', 'category')}
          {field('단위', 'uom')}
        </div>
      </Modal>
    </div>
  );
}
