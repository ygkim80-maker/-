import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/api';

export default function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    cardType: '신용카드',
    region: '서울',
    regionDetail: '',
    dailyCount: '',
    payType: '건당',
    payAmount: '',
    startDate: '',
    endDate: '',
    workDays: '',
    workStartTime: '',
    workEndTime: '',
    vehicleType: '무관',
    isUrgent: false,
  });

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...form,
        dailyCount: Number(form.dailyCount),
        payAmount: Number(form.payAmount),
      });
      navigate('/');
    } catch {
      alert('공고 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white sticky top-0 z-10 flex items-center px-4 h-12 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-3">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold">새 공고 등록</h1>
      </div>

      <form onSubmit={submit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">제목</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">상세 설명</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} h-28 resize-none`} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">카드 종류</label>
            <select value={form.cardType} onChange={(e) => set('cardType', e.target.value)} className={inputClass}>
              <option value="신용카드">신용카드</option>
              <option value="체크카드">체크카드</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">지역</label>
            <select value={form.region} onChange={(e) => set('region', e.target.value)} className={inputClass}>
              {['서울', '경기', '인천', '대전', '대구', '부산', '광주', '울산', '기타'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">상세 지역</label>
          <input type="text" value={form.regionDetail} onChange={(e) => set('regionDetail', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">일배송량</label>
            <input type="number" value={form.dailyCount} onChange={(e) => set('dailyCount', e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">차량 요건</label>
            <select value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value)} className={inputClass}>
              <option value="무관">무관</option>
              <option value="오토바이">오토바이</option>
              <option value="자동차">자동차</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">급여 유형</label>
            <select value={form.payType} onChange={(e) => set('payType', e.target.value)} className={inputClass}>
              <option value="건당">건당</option>
              <option value="일당">일당</option>
              <option value="월급">월급</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">급여 금액</label>
            <input type="number" value={form.payAmount} onChange={(e) => set('payAmount', e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">시작일</label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">종료일</label>
            <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">근무 요일</label>
          <input type="text" value={form.workDays} onChange={(e) => set('workDays', e.target.value)} className={inputClass} placeholder="월~금" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">근무 시작</label>
            <input type="time" value={form.workStartTime} onChange={(e) => set('workStartTime', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">근무 종료</label>
            <input type="time" value={form.workEndTime} onChange={(e) => set('workEndTime', e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Urgent toggle */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
          <span className="text-sm font-medium text-gray-700">긴급 공고</span>
          <button
            type="button"
            onClick={() => set('isUrgent', !form.isUrgent)}
            className={`w-12 h-7 rounded-full transition ${form.isUrgent ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${form.isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '등록 중...' : '공고 등록'}
        </button>
      </form>
    </div>
  );
}
