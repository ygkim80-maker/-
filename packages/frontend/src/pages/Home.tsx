import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';
import { JobPosting, Application } from '../types';

const REGIONS = ['전체', '서울', '경기', '인천', '대전', '대구', '부산', '광주', '울산', '기타'];
const CARD_TYPES = ['전체', '신용카드', '체크카드', '기타'];

function formatPay(payType: string, amount: number) {
  const label = payType === '건당' ? '건당' : payType === '일당' ? '일당' : '월급';
  return `${label} ${amount.toLocaleString()}원`;
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  if (!user) return null;

  return user.role === 'RIDER' ? <RiderHome /> : <CompanyHome />;
}

function RiderHome() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('전체');
  const [cardType, setCardType] = useState('전체');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (region !== '전체') params.set('region', region);
    if (cardType !== '전체') params.set('cardType', cardType);
    api.get(`/jobs?${params}`).then((r) => setJobs(r.data)).catch(() => {});
  }, [search, region, cardType]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="공고 검색..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Region chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${region === r ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Card type chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CARD_TYPES.map((c) => (
            <button
              key={c}
              onClick={() => setCardType(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${cardType === c ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Job cards */}
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white rounded-xl shadow-sm p-4 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">{job.title}</h3>
                {job.isUrgent && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">긴급</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{job.company?.companyName || job.company?.name}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{job.region}</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{job.cardType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-500">{formatPay(job.payType, job.payAmount)}</span>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <span>지원 {job._count?.applications ?? 0}명</span>
                  <span>{new Date(job.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">공고가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyHome() {
  const [stats, setStats] = useState({ activeJobs: 0, pendingApps: 0, acceptedApps: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs/my-stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/applications?role=company').then((r) => setApplications(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '진행중 공고', value: stats.activeJobs },
            { label: '대기 지원', value: stats.pendingApps },
            { label: '수락 지원', value: stats.acceptedApps },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-3 text-center">
              <p className="text-2xl font-bold text-blue-500">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/jobs/new')}
          className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
        >
          새 공고 등록
        </button>

        {/* Recent applications */}
        <h2 className="font-semibold text-gray-900">최근 지원</h2>
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{app.rider?.name ?? '지원자'}</span>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-xs text-gray-500">{app.job?.title}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
          ))}
          {applications.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">지원 내역이 없습니다.</p>
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
