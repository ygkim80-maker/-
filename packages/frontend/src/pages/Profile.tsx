import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Profile() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name?.slice(0, 2) || '?';
  const isRider = user.role === 'RIDER';

  const menuItems = [
    { label: '프로필 수정', onClick: () => navigate('/profile/edit') },
    { label: '리뷰 보기', onClick: () => {} },
    { label: '로그아웃', onClick: logout, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold mb-3">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
          <span className={`mt-1 px-3 py-1 text-xs font-medium rounded-full ${isRider ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
            {isRider ? '구직자' : '기업'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">{isRider ? '총 배달' : '총 공고'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-900">-</p>
            <p className="text-xs text-gray-500 mt-1">평균 평점</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{isRider ? (user.experience ?? '-') : '-'}</p>
            <p className="text-xs text-gray-500 mt-1">경력</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-4 py-4 text-left text-sm ${item.danger ? 'text-red-500' : 'text-gray-900'} ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span>{item.label}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
