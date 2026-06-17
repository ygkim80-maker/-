import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../hooks/api';
import { useAuth } from '../store/auth';
import { JobPosting, Application } from '../types';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => setJob(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user?.role === 'COMPANY' && job && job.companyId === user.id) {
      api.get(`/applications?jobId=${id}`).then((r) => setApplications(r.data)).catch(() => {});
    }
  }, [job, user, id]);

  async function apply() {
    setSubmitting(true);
    try {
      await api.post('/applications', { jobId: id, message });
      setShowModal(false);
      setMessage('');
      // refresh job
      const r = await api.get(`/jobs/${id}`);
      setJob(r.data);
    } catch {
      alert('지원에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function respond(appId: string, status: 'ACCEPTED' | 'REJECTED') {
    try {
      await api.post(`/applications/${appId}/respond`, { status });
      const r = await api.get(`/applications?jobId=${id}`);
      setApplications(r.data);
    } catch {
      alert('처리에 실패했습니다.');
    }
  }

  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">로딩 중...</div>;

  const isOwner = user?.role === 'COMPANY' && job.companyId === user.id;

  const infoItems = [
    { label: '카드종류', value: job.cardType },
    { label: '지역', value: `${job.region}${job.regionDetail ? ' ' + job.regionDetail : ''}` },
    { label: '일배송량', value: `${job.dailyCount}건` },
    { label: '급여', value: `${job.payType} ${job.payAmount.toLocaleString()}원` },
    { label: '근무기간', value: `${job.startDate}${job.endDate ? ' ~ ' + job.endDate : ''}` },
    { label: '근무시간', value: job.workStartTime && job.workEndTime ? `${job.workStartTime} ~ ${job.workEndTime}` : '-' },
    { label: '차량요건', value: job.vehicleType || '무관' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <div className="bg-white sticky top-0 z-10 flex items-center px-4 h-12 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-3">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold">공고 상세</h1>
      </div>

      <div className="p-4 space-y-4">
        {job.isUrgent && (
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">긴급</span>
        )}

        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>

        {/* Company info */}
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm">
            {(job.company?.companyName || job.company?.name || '?')[0]}
          </div>
          <span className="font-medium text-gray-900">{job.company?.companyName || job.company?.name}</span>
        </div>

        {/* Info grid */}
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-2 gap-3">
          {infoItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">상세 설명</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
        </div>

        <p className="text-sm text-gray-500">지원자 {job._count?.applications ?? 0}명</p>

        {/* Company: own job controls & applications */}
        {isOwner && (
          <>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/jobs/${id}/edit`)}
                className="flex-1 h-12 bg-blue-500 text-white rounded-xl font-medium"
              >
                수정
              </button>
              <button
                onClick={async () => {
                  await api.patch(`/jobs/${id}`, { status: 'CLOSED' });
                  navigate('/');
                }}
                className="flex-1 h-12 bg-gray-200 text-gray-700 rounded-xl font-medium"
              >
                마감
              </button>
            </div>

            <h3 className="font-semibold text-gray-900">지원 목록</h3>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{app.rider?.name ?? '지원자'}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.message && <p className="text-xs text-gray-500 mb-2">{app.message}</p>}
                  <p className="text-xs text-gray-400 mb-2">{new Date(app.appliedAt).toLocaleDateString()}</p>
                  {app.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => respond(app.id, 'ACCEPTED')} className="flex-1 h-9 bg-green-500 text-white text-sm rounded-lg font-medium">수락</button>
                      <button onClick={() => respond(app.id, 'REJECTED')} className="flex-1 h-9 bg-red-500 text-white text-sm rounded-lg font-medium">거절</button>
                    </div>
                  )}
                </div>
              ))}
              {applications.length === 0 && <p className="text-center text-gray-400 text-sm py-4">지원자가 없습니다.</p>}
            </div>
          </>
        )}
      </div>

      {/* Rider: apply button */}
      {user?.role === 'RIDER' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-[430px] mx-auto">
          <button
            onClick={() => setShowModal(true)}
            className="w-full h-12 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
          >
            지원하기
          </button>
        </div>
      )}

      {/* Apply modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="bg-white rounded-t-2xl w-full max-w-[430px] p-6 space-y-4">
            <h3 className="font-semibold text-lg">지원하기</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="지원 메시지를 작성해주세요..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-xl font-medium">취소</button>
              <button onClick={apply} disabled={submitting} className="flex-1 h-12 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50">
                {submitting ? '지원 중...' : '지원'}
              </button>
            </div>
          </div>
        </div>
      )}
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
