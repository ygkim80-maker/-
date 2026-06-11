import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';

export default function Login() {
  const [email, setEmail] = useState('admin@fc.com');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      navigate('/');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📦</div>
          <h1 className="text-xl font-bold text-gray-800">풀필먼트 센터 플랫폼</h1>
          <p className="text-sm text-gray-500 mt-1">통합 IT 시스템 로그인</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {error && <div className="text-sm text-brand">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">기본 계정: admin@fc.com / admin1234</p>
      </div>
    </div>
  );
}
