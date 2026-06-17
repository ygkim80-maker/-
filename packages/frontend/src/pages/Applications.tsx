import { useState, useEffect } from 'react';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';
import { Application } from '../types';

const TABS = ['전체', '대기중', '수락됨', '거절됨'];
const TAB_STATUS: Record<string, string | undefined> = { '전체': undefined, '대기중': 'PENDING', '수락됨': 'ACCEPTED', '거절됨': 'REJECTED' };

export default function Applications() {
  const user = useAuth((s) => s.user);
  const [tab, setTab] = useState('전체');
  const [apps, setApps] = useState<Application[]>([]);

  function fetchApps() {
    const params = new URLSearchParams();
    if (user?.role === 'COMPANY') params.set('role', 'company');
    const status = TAB_STATUS[tab];
    if (status) params.set('status', status);
    api.get(`/applications?${params}`).then((r) => setApps(r.data)).catch(() => {});
  }

  useEffect(() => { fetchApps(); }, [tab, user]);

  async function respond(id: string, status: 'ACCEPTED' | 'REJECTED') {
    try {
      await api.post(`/applications/${id}/respond`, { status });
      fetchApps();
    } catch {
      alert('처리에 실패했습니다.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">지원 내역</h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${tab === t ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {user?.role === 'RIDER' ? app.job?.title : app.rider?.name ?? '지원자'}
                </span>
                <StatusBadge status={app.status} />
              </div>
              {user?.role === 'RIDER' && (
                <p className="text-xs text-gray-500">{app.job?.company?.companyName || app.job?.company?.name}</p>
              )}
              {user?.role === 'COMPANY' && (
                <p className="text-xs text-gray-500">{app.job?.title}</p>
              )}
              {app.message && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{app.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>

              {user?.role === 'COMPANY' && app.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => respond(app.id, 'ACCEPTED')} className="flex-1 h-9 bg-green-500 text-white text-sm rounded-lg font-medium">수락</button>
                  <button onClick={() => respond(app.id, 'REJECTED')} className="flex-1 h-9 bg-red-500 text-white text-sm rounded-lg font-medium">거절</button>
                </div>
              )}
            </div>
          ))}
          {apps.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">지원 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: '대기중', cls: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED: { label: '수락', cls: 'bg-green-100 text-green-700' },
    REJECTED: { label: '거절', cls: 'bg-red-100 text-red-700' },
  };
  const info = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${info.cls}`}>{info.label}</span>;
}
