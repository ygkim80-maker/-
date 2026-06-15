import React, { useState } from 'react';
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
        <span>{min}{unit}</span>
        <span className={`font-bold text-base ${color}`}>{value}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color === 'text-red-600' ? 'bg-red-500' : color === 'text-blue-600' ? 'bg-blue-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// 창고 SVG 맵 컴포넌트
function WarehouseMap({ devices }: { devices: SensorDevice[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 존별 센서 데이터 집계
  const zoneMap = new Map<string, { temps: number[]; hums: number[]; isAlert: boolean; deviceNames: string[] }>();
  devices.forEach(d => {
    const last = d.logs[0];
    if (!zoneMap.has(d.zoneCode)) zoneMap.set(d.zoneCode, { temps: [], hums: [], isAlert: false, deviceNames: [] });
    const z = zoneMap.get(d.zoneCode)!;
    z.deviceNames.push(d.name);
    if (last) {
      z.temps.push(last.temperature);
      z.hums.push(last.humidity);
      if (last.temperature > d.maxTemp || last.temperature < d.minTemp || last.humidity > d.maxHumidity || last.humidity < d.minHumidity) {
        z.isAlert = true;
      }
    }
  });

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;

  // 창고 구역 레이아웃 정의 (120평 상온창고 기준)
  const zones = [
    { code: 'A', label: 'A존 (입고)', x: 10, y: 10, w: 180, h: 120, color: '#e0f2fe' },
    { code: 'B', label: 'B존 (보관1)', x: 200, y: 10, w: 180, h: 120, color: '#f0fdf4' },
    { code: 'C', label: 'C존 (보관2)', x: 390, y: 10, w: 180, h: 120, color: '#f0fdf4' },
    { code: 'D', label: 'D존 (출고)', x: 10, y: 140, w: 180, h: 120, color: '#fef9c3' },
    { code: 'E', label: 'E존 (반품)', x: 200, y: 140, w: 180, h: 120, color: '#fce7f3' },
    { code: 'DOCK', label: '도크', x: 390, y: 140, w: 180, h: 120, color: '#f3f4f6' },
  ];

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">창고 온습도 맵</h3>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> 정상</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300 inline-block" /> 경보</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> 센서없음</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 580 280" className="w-full max-w-2xl mx-auto" style={{ minWidth: 400 }}>
          {/* 창고 외벽 */}
          <rect x="5" y="5" width="570" height="270" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />

          {/* 각 존 */}
          {zones.map(zone => {
            const zd = zoneMap.get(zone.code);
            const t = zd ? avg(zd.temps) : null;
            const h = zd ? avg(zd.hums) : null;
            const isAlert = zd?.isAlert ?? false;
            const hasSensor = !!zd && zd.temps.length > 0;
            const fill = isAlert ? '#fca5a5' : hasSensor ? (zone.color) : '#f3f4f6';
            const stroke = isAlert ? '#ef4444' : hasSensor ? '#6b7280' : '#d1d5db';
            const isHov = hovered === zone.code;

            return (
              <g key={zone.code} onMouseEnter={() => setHovered(zone.code)} onMouseLeave={() => setHovered(null)}
                style={{ cursor: hasSensor ? 'pointer' : 'default' }}>
                <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="6"
                  fill={fill} stroke={stroke} strokeWidth={isAlert ? 2 : 1}
                  opacity={isHov ? 0.85 : 1} />

                {/* 경보 깜박임 효과 */}
                {isAlert && (
                  <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="6"
                    fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}

                {/* 존 이름 */}
                <text x={zone.x + zone.w / 2} y={zone.y + 20} textAnchor="middle"
                  fontSize="11" fontWeight="600" fill="#374151">{zone.label}</text>

                {/* 센서 데이터 */}
                {hasSensor && t !== null ? (
                  <>
                    <text x={zone.x + zone.w / 2} y={zone.y + 50} textAnchor="middle"
                      fontSize="22" fontWeight="bold" fill={isAlert ? '#dc2626' : '#111827'}>
                      {t}°C
                    </text>
                    <text x={zone.x + zone.w / 2} y={zone.y + 70} textAnchor="middle"
                      fontSize="13" fill={isAlert ? '#dc2626' : '#6b7280'}>
                      💧 {h}%
                    </text>
                    {isAlert && (
                      <text x={zone.x + zone.w / 2} y={zone.y + 92} textAnchor="middle"
                        fontSize="11" fill="#dc2626" fontWeight="600">⚠️ 범위 초과</text>
                    )}
                    <text x={zone.x + zone.w / 2} y={zone.y + 110} textAnchor="middle"
                      fontSize="9" fill="#9ca3af">
                      센서 {zd?.deviceNames.length}개
                    </text>
                  </>
                ) : (
                  <text x={zone.x + zone.w / 2} y={zone.y + 65} textAnchor="middle"
                    fontSize="11" fill="#9ca3af">센서 미설치</text>
                )}
              </g>
            );
          })}

          {/* 호버 툴팁 */}
          {hovered && (() => {
            const zone = zones.find(z => z.code === hovered);
            const zd = zoneMap.get(hovered);
            if (!zone || !zd || zd.temps.length === 0) return null;
            const tx = zone.x + zone.w / 2;
            const ty = zone.y - 10;
            return (
              <g>
                <rect x={tx - 70} y={ty - 40} width="140" height="36" rx="4" fill="#1e293b" opacity="0.9" />
                <text x={tx} y={ty - 24} textAnchor="middle" fontSize="10" fill="white">
                  {zd.deviceNames.join(', ')}
                </text>
                <text x={tx} y={ty - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  온도 {avg(zd.temps)}°C · 습도 {avg(zd.hums)}%
                </text>
              </g>
            );
          })()}

          {/* 범례 */}
          <text x="290" y="273" textAnchor="middle" fontSize="9" fill="#9ca3af">
            * 구역에 마우스를 올리면 상세 정보가 표시됩니다
          </text>
        </svg>
      </div>
    </Card>
  );
}

export default function SensorMonitoring() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'map' | 'list'>('map');
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
        <StatCard label="이상" value={alertDevices.length} suffix="건" color="text-red-600" icon="⚠️" />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {(['map', 'list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'map' ? '🗺️ 창고 맵' : '📋 센서 목록'}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        isLoading ? <p className="text-gray-400 text-sm">불러오는 중...</p> : <WarehouseMap devices={devices} />
      )}

      {tab === 'list' && (
        isLoading ? (
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
        )
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
          {tf('존 코드 (A~E, DOCK)', 'zoneCode')}
          {tf('위치 설명', 'location')}
          <div />
          {tf('최저 온도 (°C)', 'minTemp', 'number')}
          {tf('최고 온도 (°C)', 'maxTemp', 'number')}
          {tf('최저 습도 (%)', 'minHumidity', 'number')}
          {tf('최고 습도 (%)', 'maxHumidity', 'number')}
        </div>
        <p className="text-xs text-gray-400 mt-3">설정 범위를 벗어나면 자동으로 경보 알림이 생성됩니다.<br/>존 코드: A(입고), B(보관1), C(보관2), D(출고), E(반품), DOCK</p>
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
