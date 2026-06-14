import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Location } from '../../types';
import { PageHeader, SearchBar, Table, Card, Badge, Button, Modal, Column } from '../../components/ui';

const emptyForm = { zoneId: '', code: '', aisle: '', bay: '', level: '', position: '1', locationType: 'STANDARD', capacity: '100', isActive: true };

export default function Locations() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editLoc, setEditLoc] = useState<Location | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const { data = [], isLoading } = useQuery<Location[]>({
    queryKey: ['wms', 'locations'],
    queryFn: async () => {
      const res = await api.get('/wms/locations');
      return res.data.data ?? res.data;
    },
  });

  const { data: zones = [] } = useQuery<any[]>({
    queryKey: ['wms', 'zones'],
    queryFn: async () => {
      const res = await api.get('/wms/locations?limit=1');
      // get zones from first location or fetch separately
      const locs = res.data.data ?? res.data;
      const seen = new Map<string, any>();
      locs.forEach((l: any) => { if (l.zone) seen.set(l.zone.id, l.zone); });
      return Array.from(seen.values());
    },
  });

  const create = useMutation({
    mutationFn: async () => api.post('/wms/locations', { ...form, capacity: Number(form.capacity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'locations'] }); closeModal(); },
  });

  const update = useMutation({
    mutationFn: async () => api.put(`/wms/locations/${editLoc!.id}`, { ...form, capacity: Number(form.capacity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'locations'] }); closeModal(); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/wms/locations/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wms', 'locations'] }); setDeleteTarget(null); },
  });

  const openCreate = () => {
    setEditLoc(null);
    setForm({ ...emptyForm, zoneId: zones[0]?.id ?? '' });
    setOpen(true);
  };
  const openEdit = (loc: Location) => {
    setEditLoc(loc);
    setForm({
      zoneId: (loc as any).zoneId ?? loc.zone?.id ?? '',
      code: loc.code ?? '',
      aisle: loc.aisle ?? '',
      bay: loc.bay ?? '',
      level: loc.level ?? '',
      position: (loc as any).position ?? '1',
      locationType: (loc as any).locationType ?? 'STANDARD',
      capacity: String((loc as any).capacity ?? 100),
      isActive: loc.isActive ?? true,
    });
    setOpen(true);
  };
  const closeModal = () => { setOpen(false); setEditLoc(null); setForm(emptyForm); };

  const filtered = data.filter(
    (loc) =>
      loc.code?.toLowerCase().includes(search.toLowerCase()) ||
      loc.zone?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Location>[] = [
    { key: 'code', header: '로케이션코드', render: (r) => <span className="font-medium">{r.code}</span> },
    { key: 'zone', header: '존', render: (r) => r.zone?.name ?? '-' },
    { key: 'aisle', header: '통로' },
    { key: 'bay', header: '베이' },
    { key: 'level', header: '단' },
    { key: 'locationType', header: '유형' },
    { key: 'capacity', header: '용량' },
    {
      key: 'isActive',
      header: '사용여부',
      render: (r) => <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? '사용' : '미사용'}</Badge>,
    },
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

  const tf = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );

  const isPending = editLoc ? update.isPending : create.isPending;

  return (
    <div>
      <PageHeader
        title="로케이션"
        subtitle="창고 로케이션 관리"
        actions={<Button onClick={openCreate}>로케이션 등록</Button>}
      />
      <SearchBar value={search} onChange={setSearch} placeholder="코드/존 검색..." />
      <Card>
        <Table columns={columns} rows={isLoading ? [] : filtered} empty={isLoading ? '불러오는 중...' : '로케이션이 없습니다'} />
      </Card>

      <Modal
        open={open}
        onClose={closeModal}
        title={editLoc ? '로케이션 수정' : '로케이션 등록'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>취소</Button>
            <Button disabled={isPending || !form.code} onClick={() => editLoc ? update.mutate() : create.mutate()}>
              {isPending ? '저장중...' : (editLoc ? '수정' : '등록')}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">존 *</label>
            <select
              value={form.zoneId}
              onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">존 선택</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
            </select>
          </div>
          {tf('로케이션 코드 * (예: A-01-01)', 'code')}
          {tf('통로 (예: A)', 'aisle')}
          {tf('베이 (예: 01)', 'bay')}
          {tf('단 (예: 01)', 'level')}
          {tf('용량 (수량)', 'capacity', 'number')}
          <div>
            <label className="block text-sm text-gray-600 mb-1">유형</label>
            <select
              value={form.locationType}
              onChange={(e) => setForm({ ...form, locationType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="STANDARD">일반</option>
              <option value="BULK">벌크</option>
              <option value="RACK">랙</option>
              <option value="FLOOR">바닥</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">사용여부</label>
            <select
              value={form.isActive ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="true">사용</option>
              <option value="false">미사용</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="로케이션 삭제"
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
          <span className="font-semibold">{deleteTarget?.code}</span> 로케이션을 삭제하시겠습니까?
          <br /><span className="text-red-600 text-xs">⚠️ 재고가 있는 로케이션은 삭제할 수 없습니다.</span>
        </p>
      </Modal>
    </div>
  );
}
