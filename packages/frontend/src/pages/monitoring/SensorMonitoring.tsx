import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { PageHeader, Card, Button, Modal, StatCard } from '../../components/ui';

interface SensorDevice {
  id: string;
  name: string;
  zoneCode: string;
  location: string;
  isActive: boolean;
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
  logs: { temperature: number; humidity: number; recordedAt: string }[];
}

const emptyForm = { name: '', zoneCode: '', location: '', minTemp: '0', maxTemp: '40', minHumidity: '20', maxHumidity: '80' };

function GaugeBar({ value, min, max, unit, color }: { value: number; min: number; max: number; unit: string; color: string }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{min}{unit}</span><span className={`font-bold text-base ${color}`}>{value}{unit}</span><span>{max}{unit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color === 'text-red-600' ? 'bg-red-500' : color === 'text-blue-600' ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SensorMonitoring() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<SensorDevice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [simDevice, setSimDevice] = useState<string | null>(null);

  const { data: devices = [], isLoading } = useQuery<SensorDevice[]>({
    queryKey: ['monitoring', 'devices'],
    queryFn: async () => { const r = await api.get('/monitoring/devices'); return r.data; },
    refetchInterval: 30000,
  });

  const create = useMutation({
    mutationFn: () => api.post('/monitoring/devices', { ...form, minTemp: Number(form.minTemp), maxTemp: Number(form.maxTemp), minHumidity: Number(form.minHumidity), maxHumidity: Number(form.maxHumidity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'devices'] }); closeModal(); },
  });

  const update = useMutation({
    mutationFn: () => api.put(`/monitoring/devices/${editDevice!.id}`, { ...form, minTemp: Number(form.minTemp), maxTemp: Number(form.maxTemp), minHumidity: Number(form.minHumidity), maxHumidity: Number(form.maxHumidity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'devices'] }); closeModal(); },
  });

  const sendData = useMutation({
    mutationFn: ({ id, temp, hum }: { id: string; temp: number; hum: number }) =>
      api.post(`/monitoring/devices/${id}/data`, { temperature: temp, humidity: hum }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['monitoring', 'devices'] }); setSimDevice(null); },
  });

  const openCreate = () => { setEditDevice(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (d: SensorDevice) => {
    setEditDevice(d);
    setForm({ name: d.name, zoneCode: d.zoneCode, location: d.location, minTemp: String(d.minTemp), maxTemp: String(d.maxTemp), minHumidity: String(d.minHumidity), maxHumidity: String(d.maxHumidity) });
    setOpen(true);
  };
  const closeModal = () => { setOpen(false); setEditDevice(null); setForm(emptyForm); };

  const alertDevices = devices.filter(d => {
    const last = d.logs[0];
    if (!last) return false;
    return last.temperature > d.maxTemp || last.temperature < d.minTemp || last.humidity > d.maxHumidity || last.humidity < d.minHumidity;
  });

  const tf = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
  );

  return (
    <div>
      <PageHeader title="온습도 모니터링" subtitle="구역별 온습도 실시간 현황"
        actions={<Button onClick={openCreate}>센서 등록</Button>} />

      {alertDevices.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          🚨 <strong>{alertDevices.length}개</strong> 구역에서 온습도 이상이 감지됐습니다: {alertDevices.map(d => d.name).join(', ')}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="등록 센서" value={devices.length} suffix="개" icon="🌡️" />
        <StatCard label="정상" value={devices.length - alertDevices.length} suffix="개" icon="✅" />
        <StatCard label="이상" value={alertDevices.length} suffix="개" color="text-red-600" icon="⚠️" />
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      ) : devices.length === 0 ? (
        <Card><p className="text-gray-400 text-sm text-center py-8">등록된 센서가 없습니다. 센서 등록 버튼을 눌러 추가하세요.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(d => {
            const last = d.logs[0];
            const temp = last?.temperature ?? null;
            const hum = last?.humidity ?? null;
            const isAlert = temp !== null && (temp > d.maxTemp || temp < d.minTemp || (hum ?? 0) > d.maxHumidity || (hum ?? 0) < d.minHumidity);
            return (
              <Card key={d.id}>
                <div className={`rounded-lg p-4 ${isAlert ? 'border-2 border-red-400 bg-red-50' : 'border border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-800">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.location} · 존 {d.zoneCode}</div>
                    </div>
                    <div className="flex gap-1">
                      {isAlert && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">이상</span>}
                      <span className={`text-xs px-2 py-0.5 rounded ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {d.isActive ? '정상' : '꺼짐'}
                      </span>
                    </div>
                  </div>

                  {temp !== null ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 font-medium">온도</div>
                        <GaugeBar value={temp} min={d.minTemp - 5} max={d.maxTemp + 5} unit="°C"
                          color={temp > d.maxTemp || temp < d.minTemp ? 'text-red-600' : 'text-green-600'} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">습도</div>
                        <GaugeBar value={hum!} min={d.minHumidity - 10} max={d.maxHumidity + 10} unit="%"
                          color={(hum ?? 0) > d.maxHumidity || (hum ?? 0) < d.minHumidity ? 'text-red-600' : 'text-blue-600'} />
                      </div>
                      <div className="text-xs text-gray-400">
                        최근 측정: {new Date(last.recordedAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-2">측정 데이터 없음</p>
                  )}

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openEdit(d)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">설정</button>
                    <button onClick={() => setSimDevice(d.id)} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">수동입력</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 센서 등록/수정 모달 */}
      <Modal open={open} onClose={closeModal} title={editDevice ? '센서 설정' : '센서 등록'}
        footer={<>
          <Button variant="ghost" onClick={closeModal}>취소</Button>
          <Button disabled={!form.name} onClick={() => editDevice ? update.mutate() : create.mutate()}>
            {editDevice ? '수정' : '등록'}
          </Button>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          {tf('센서 이름 *', 'name')}
          {tf('존 코드 (예: A)', 'zoneCode')}
          {tf('위치 설명', 'location')}
          <div />
          {tf('최저 온도 (°C)', 'minTemp', 'number')}
          {tf('최고 온도 (°C)', 'maxTemp', 'number')}
          {tf('최저 습도 (%)', 'minHumidity', 'number')}
          {tf('최고 습도 (%)', 'maxHumidity', 'number')}
        </div>
        <p className="text-xs text-gray-400 mt-3">설정 범위를 벗어나면 자동으로 경보 알림이 생성됩니다.</p>
      </Modal>

      {/* 수동 데이터 입력 모달 */}
      <ManualInputModal
        deviceId={simDevice}
        onClose={() => setSimDevice(null)}
        onSubmit={(id, temp, hum) => sendData.mutate({ id, temp, hum })}
      />
    </div>
  );
}

function ManualInputModal({ deviceId, onClose, onSubmit }: { deviceId: string | null; onClose: () => void; onSubmit: (id: string, temp: number, hum: number) => void }) {
  const [temp, setTemp] = useState('');
  const [hum, setHum] = useState('');
  return (
    <Modal open={!!deviceId} onClose={onClose} title="온습도 수동 입력"
      footer={<>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button disabled={!temp || !hum} onClick={() => { onSubmit(deviceId!, Number(temp), Number(hum)); setTemp(''); setHum(''); }}>저장</Button>
      </>}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">온도 (°C)</label>
          <input type="number" value={temp} onChange={e => setTemp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">습도 (%)</label>
          <input type="number" value={hum} onChange={e => setHum(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">실제 IoT 센서 연동 전 테스트용으로 사용하세요.</p>
    </Modal>
  );
}
