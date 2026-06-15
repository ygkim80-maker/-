import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PageHeader, Card, Button, Modal, StatCard, Badge } from '../../components/ui';

interface CctvAlert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  isResolved: boolean;
  detectedAt: string;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  zoneCode: string;
  streamUrl: string | null;
  isActive: boolean;
  alerts: CctvAlert[];
}

const ALERT_TYPES = ['침입감지', '낙상감지', '화재감지', '방치물체', '밀집감지', '기타'];
const emptyForm = { name: '', location: '', zoneCode: '', streamUrl: '' };
const emptyAlertForm = { alertType: '침입감지', severity: 'WARNING', message: '' };

const severityColor: Record<string, string> = { CRITICAL: 'red', WARNING: 'yellow', INFO: 'blue' };
const severityLabel: Record<string, string> = { CRITICAL: '긴급', WARNING: '경고', INFO: '정보' };

export default function CctvMonitoring() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editCam, setEditCam] = useState<Camera | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [alertCamId, setAlertCamId] = useState<string | null>(null);
  const [alertForm, setAlertForm] = useState(emptyAlertForm);
  const [selected, setSelected] = useState<string | null>(null);

  const { data: cameras = [], isLoading } = useQuery<Camera[]>({
    queryKey: ['monitoring', 'cameras'],
    queryFn: async () => { const r = await api.get('/monitoring/cameras'); return r.data; },
    refetchInterval: 15000,
  });

  const { data: allAlerts = [] } = useQuery<(CctvAlert & { camera: Camera })[]>({
    queryKey: ['monitoring', 'camera-alerts'],
    queryFn: async () => { const r = await api.get('/monitoring/cameras/alerts'); return r.data; },
    refetchInterval: 15000,
  });

  const create = useMutation({
    mutationFn: () => api.post('/monitoring/cameras', { ...form, streamUrl: form.streamUrl || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'cameras'] }); closeModal(); },
  });

  const update = useMutation({
    mutationFn: () => api.put(`/monitoring/cameras/${editCam!.id}`, { ...form, streamUrl: form.streamUrl || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'cameras'] }); closeModal(); },
  });

  const addAlert = useMutation({
    mutationFn: () => api.post(`/monitoring/cameras/${alertCamId}/alerts`, alertForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'cameras'] }); qc.invalidateQueries({ queryKey: ['monitoring', 'camera-alerts'] }); setAlertCamId(null); setAlertForm(emptyAlertForm); },
  });

  const resolveAlert = useMutation({
    mutationFn: (id: string) => api.put(`/monitoring/cameras/alerts/${id}/resolve`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'cameras'] }); qc.invalidateQueries({ queryKey: ['monitoring', 'camera-alerts'] }); },
  });

  const openCreate = () => { setEditCam(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: Camera) => { setEditCam(c); setForm({ name: c.name, location: c.location, zoneCode: c.zoneCode, streamUrl: c.streamUrl ?? '' }); setOpen(true); };
  const closeModal = () => { setOpen(false); setEditCam(null); setForm(emptyForm); };

  const activeAlerts = allAlerts.filter(a => !a.isResolved);
  const selectedCam = cameras.find(c => c.id === selected);

  const tf = (label: string, key: keyof typeof form) => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
  );

  return (
    <div>
      <PageHeader title="CCTV 모니터링" subtitle="구역별 카메라 및 이상감지 알림"
        actions={<Button onClick={openCreate}>카메라 등록</Button>} />

      {activeAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          🚨 <strong>{activeAlerts.length}건</strong>의 미처리 이상감지 알림이 있습니다.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="등록 카메라" value={cameras.length} suffix="대" icon="📹" />
        <StatCard label="활성" value={cameras.filter(c => c.isActive).length} suffix="대" icon="🟢" />
        <StatCard label="미처리 알림" value={activeAlerts.length} suffix="건" color="text-red-600" icon="🚨" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 카메라 그리드 */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">카메라 현황</h3>
          {isLoading ? (
            <p className="text-gray-400 text-sm">불러오는 중...</p>
          ) : cameras.length === 0 ? (
            <Card><p className="text-gray-400 text-sm text-center py-8">등록된 카메라가 없습니다.</p></Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {cameras.map(cam => (
                <div key={cam.id}
                  onClick={() => setSelected(selected === cam.id ? null : cam.id)}
                  className={`rounded-lg border-2 cursor-pointer transition-all ${selected === cam.id ? 'border-blue-500' : cam.alerts.length > 0 ? 'border-red-400' : 'border-gray-200'}`}>
                  {/* 영상 영역 */}
                  <div className="bg-gray-900 rounded-t-lg aspect-video flex flex-col items-center justify-center relative">
                    {cam.streamUrl ? (
                      <iframe src={cam.streamUrl} className="w-full h-full rounded-t-lg" />
                    ) : (
                      <>
                        <div className="text-gray-600 text-3xl mb-1">📹</div>
                        <div className="text-gray-500 text-xs">스트림 미연결</div>
                      </>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cam.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {cam.isActive ? '● LIVE' : '○ OFF'}
                      </span>
                    </div>
                    {cam.alerts.length > 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded animate-pulse">⚠ {cam.alerts.length}</span>
                      </div>
                    )}
                  </div>
                  {/* 카메라 정보 */}
                  <div className="p-2 bg-white rounded-b-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{cam.name}</div>
                        <div className="text-xs text-gray-400">{cam.location}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); openEdit(cam); }} className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">설정</button>
                        <button onClick={e => { e.stopPropagation(); setAlertCamId(cam.id); }} className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100">알림추가</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 알림 패널 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {selectedCam ? `${selectedCam.name} 알림` : '전체 알림 내역'}
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {(selectedCam ? allAlerts.filter(a => (a.camera as any)?.id === selectedCam.id) : allAlerts).length === 0 ? (
              <Card><p className="text-gray-400 text-sm text-center py-4">알림 없음</p></Card>
            ) : (
              (selectedCam ? allAlerts.filter(a => (a.camera as any)?.id === selectedCam.id) : allAlerts).map(alert => (
                <div key={alert.id} className={`p-3 rounded-lg border text-sm ${alert.isResolved ? 'bg-gray-50 border-gray-200 opacity-60' : alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex gap-1 items-center">
                      <Badge color={severityColor[alert.severity] as any}>{severityLabel[alert.severity]}</Badge>
                      <span className="font-medium text-gray-800">{alert.alertType}</span>
                    </div>
                    {!alert.isResolved && (
                      <button onClick={() => resolveAlert.mutate(alert.id)} className="text-xs text-gray-500 hover:text-green-700">해제</button>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs">{alert.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(alert.detectedAt).toLocaleString('ko-KR')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 카메라 등록/수정 */}
      <Modal open={open} onClose={closeModal} title={editCam ? '카메라 설정' : '카메라 등록'}
        footer={<><Button variant="ghost" onClick={closeModal}>취소</Button><Button disabled={!form.name} onClick={() => editCam ? update.mutate() : create.mutate()}>{editCam ? '수정' : '등록'}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          {tf('카메라 이름 *', 'name')}
          {tf('위치 설명', 'location')}
          {tf('존 코드 (예: A)', 'zoneCode')}
          {tf('스트림 URL (선택)', 'streamUrl')}
        </div>
        <p className="text-xs text-gray-400 mt-3">스트림 URL은 IP 카메라의 RTSP/HTTP 주소입니다. 없으면 빈칸으로 두세요.</p>
      </Modal>

      {/* 알림 수동 등록 */}
      <Modal open={!!alertCamId} onClose={() => setAlertCamId(null)} title="이상감지 알림 등록"
        footer={<><Button variant="ghost" onClick={() => setAlertCamId(null)}>취소</Button><Button disabled={!alertForm.message} onClick={() => addAlert.mutate()}>등록</Button></>}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">감지 유형</label>
            <select value={alertForm.alertType} onChange={e => setAlertForm({ ...alertForm, alertType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              {ALERT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">심각도</label>
            <select value={alertForm.severity} onChange={e => setAlertForm({ ...alertForm, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="CRITICAL">긴급</option>
              <option value="WARNING">경고</option>
              <option value="INFO">정보</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">내용 *</label>
            <input value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })}
              placeholder="예: A구역 입구 침입자 감지"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
