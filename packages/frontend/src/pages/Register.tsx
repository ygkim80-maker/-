import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';

export default function Register() {
  const [role, setRole] = useState<'RIDER' | 'COMPANY'>('RIDER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('오토바이');
  const [experience, setExperience] = useState('');
  const [regions, setRegions] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = { name, email, password, phone, role };
      if (role === 'RIDER') {
        body.vehicleType = vehicleType;
        body.experience = experience ? Number(experience) : undefined;
        body.regions = regions;
      } else {
        body.companyName = companyName;
        body.businessNumber = businessNumber;
        body.companyAddress = companyAddress;
      }
      const { data } = await api.post('/auth/register', body);
      setAuth(data.user, data.token);
      navigate('/');
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-[430px]">
        <h1 className="text-xl font-bold text-center mb-6">회원가입</h1>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setRole('RIDER')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${role === 'RIDER' ? 'bg-white shadow text-blue-500' : 'text-gray-500'}`}
          >
            구직자
          </button>
          <button
            type="button"
            onClick={() => setRole('COMPANY')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${role === 'COMPANY' ? 'bg-white shadow text-blue-500' : 'text-gray-500'}`}
          >
            기업
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">전화번호</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>

          {role === 'RIDER' && (
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
                <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">활동 지역</label>
                <input type="text" value={regions} onChange={(e) => setRegions(e.target.value)} className={inputClass} placeholder="서울, 경기 등" />
              </div>
            </>
          )}

          {role === 'COMPANY' && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">회사명</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">사업자번호</label>
                <input type="text" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">회사 주소</label>
                <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputClass} required />
              </div>
            </>
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-500 font-medium">로그인</Link>
        </p>
      </div>
    </div>
  );
}
