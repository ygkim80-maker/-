import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';

export default function ProfileEdit() {
  const user = useAuth((s) => s.user);
  const loadUser = useAuth((s) => s.loadUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || '오토바이');
  const [experience, setExperience] = useState(String(user?.experience ?? ''));
  const [regions, setRegions] = useState(user?.regions || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [businessNumber, setBusinessNumber] = useState(user?.businessNumber || '');
  const [companyAddress, setCompanyAddress] = useState(user?.companyAddress || '');

  if (!user) return null;

  const isRider = user.role === 'RIDER';
  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name, phone, bio };
      if (isRider) {
        body.vehicleType = vehicleType;
        body.experience = experience ? Number(experience) : undefined;
        body.regions = regions;
      } else {
        body.companyName = companyName;
        body.businessNumber = businessNumber;
        body.companyAddress = companyAddress;
      }
      const { data } = await api.put('/auth/profile', body);
      loadUser(data);
      navigate('/profile');
    } catch {
      alert('프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white sticky top-0 z-10 flex items-center px-4 h-12 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-3">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold">프로필 수정</h1>
      </div>

      <form onSubmit={submit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">이름</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">전화번호</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">자기소개</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputClass} h-24 resize-none`} />
        </div>

        {isRider && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">차량 유형</label>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={inputClass}>
                <option value="오토바이">오토바이</option>
                <option value="자동차">자동차</option>
                <option value="자전거">자전거</option>
                <option value="도보">도보</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">경력 (년)</label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">활동 지역</label>
              <input type="text" value={regions} onChange={(e) => setRegions(e.target.value)} className={inputClass} />
            </div>
          </>
        )}

        {!isRider && (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">회사명</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">사업자번호</label>
              <input type="text" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">회사 주소</label>
              <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputClass} />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
}
