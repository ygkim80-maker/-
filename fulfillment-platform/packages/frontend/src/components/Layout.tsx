import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIChat from './AIChat';
import { useAuth } from '../store/auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">수도권 풀필먼트 센터</span>
            <span className="text-gray-400">· 경기도 이천</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700 text-lg" title="알림">
              🔔
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu((s) => !s)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                <span className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs">
                  {user?.name?.[0] || 'U'}
                </span>
                <span>{user?.name || '사용자'}</span>
                <span className="text-xs text-gray-400">({user?.role})</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">{user?.email}</div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
      <AIChat />
    </div>
  );
}
