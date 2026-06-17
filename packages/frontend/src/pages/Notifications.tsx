import { useState, useEffect } from 'react';
import { api } from '../hooks/api';
import { Notification } from '../types';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  function fetch() {
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
  }

  useEffect(() => { fetch(); }, []);

  async function markRead(id: string) {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">알림</h1>
          <button onClick={markAllRead} className="text-sm text-blue-500 font-medium">모두 읽음</button>
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition ${!n.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">알림이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
