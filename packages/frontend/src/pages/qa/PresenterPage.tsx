import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io, Socket } from 'socket.io-client';
import { api } from '../../hooks/api';

interface Question {
  id: string;
  text: string;
  author: string;
  likes: number;
  createdAt: string;
  pinned: boolean;
  answered: boolean;
}

export default function PresenterPage() {
  const [sessionId, setSessionId] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [active, setActive] = useState(true);
  const [creating, setCreating] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  }, []);

  const createSession = async () => {
    const res = await api.post('/qa', { title: newTitle || '실시간 Q&A' });
    const s = res.data;
    setSessionId(s.id);
    setTitle(s.title);
    setQuestions(s.questions);
    setActive(true);
    setCreating(false);

    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('qa:join', s.id);

    socket.on('qa:new-question', (q: Question) => {
      setQuestions((prev) => [...prev, q]);
      setHighlight(q.id);
      setTimeout(() => setHighlight(null), 3000);
      audioRef.current?.play().catch(() => {});
    });

    socket.on('qa:question-updated', (update: Partial<Question> & { id: string }) => {
      setQuestions((prev) => prev.map((q) => (q.id === update.id ? { ...q, ...update } : q)));
    });
  };

  useEffect(() => () => { socketRef.current?.disconnect(); }, []);

  const toggleSession = async () => {
    await api.patch(`/qa/${sessionId}`, { active: !active });
    setActive(!active);
  };

  const togglePin = async (q: Question) => {
    await api.patch(`/qa/${sessionId}/questions/${q.id}`, { pinned: !q.pinned });
  };

  const toggleAnswered = async (q: Question) => {
    await api.patch(`/qa/${sessionId}/questions/${q.id}`, { answered: !q.answered });
  };

  const audienceUrl = `${window.location.origin}/qa/${sessionId}`;
  const sorted = [...questions].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.likes - a.likes
  );
  const live = sorted.filter((q) => !q.answered);
  const answered = sorted.filter((q) => q.answered);

  if (creating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">새 Q&A 세션 만들기</h2>
          <input
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            placeholder="세션 제목 (예: 6월 전체 회의)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createSession()}
          />
          <button
            onClick={createSession}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            세션 시작
          </button>
        </div>
      </div>
    );
  }

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-50 p-8 overflow-auto cursor-pointer"
        onClick={() => setFullscreen(false)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-gray-400 mt-1">
                질문 {live.length}개 {!active && '· 접수 종료'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={audienceUrl} size={120} />
            </div>
          </div>
          <div className="grid gap-4">
            {live.map((q) => (
              <div
                key={q.id}
                className={`rounded-xl p-6 transition-all duration-500 ${
                  highlight === q.id
                    ? 'bg-blue-600 text-white scale-[1.02]'
                    : q.pinned
                    ? 'bg-yellow-400/20 text-white border border-yellow-400/40'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-xl leading-relaxed">{q.text}</p>
                <div className="flex items-center gap-4 mt-3 text-sm opacity-70">
                  <span>{q.author}</span>
                  <span>👍 {q.likes}</span>
                  {q.pinned && <span>📌 고정됨</span>}
                </div>
              </div>
            ))}
            {live.length === 0 && (
              <p className="text-center text-gray-500 text-xl py-16">아직 질문이 없습니다</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              세션 코드: <span className="font-mono font-bold text-blue-600">{sessionId}</span>
              {' · '}질문 {questions.length}개
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFullscreen(true)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition"
            >
              PT 전체화면
            </button>
            <button
              onClick={toggleSession}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {active ? '접수 종료' : '접수 재개'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              질문 목록 ({live.length})
            </h3>
            {live.map((q) => (
              <div
                key={q.id}
                className={`bg-white rounded-xl p-4 shadow-sm transition-all duration-500 ${
                  highlight === q.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${q.pinned ? 'border-l-4 border-yellow-400' : ''}`}
              >
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.text}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{q.author}</span>
                    <span>👍 {q.likes}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePin(q)}
                      className={`text-xs px-2 py-1 rounded ${
                        q.pinned
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {q.pinned ? '📌 고정됨' : '고정'}
                    </button>
                    <button
                      onClick={() => toggleAnswered(q)}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200"
                    >
                      답변완료
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {live.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                아직 질문이 없습니다. QR코드를 공유하세요!
              </div>
            )}
            {answered.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">
                  답변 완료 ({answered.length})
                </h3>
                {answered.map((q) => (
                  <div key={q.id} className="bg-gray-50 rounded-xl p-4 opacity-60">
                    <p className="text-sm text-gray-600 line-through">{q.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{q.author}</span>
                      <button
                        onClick={() => toggleAnswered(q)}
                        className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500"
                      >
                        되돌리기
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">QR코드로 참여하기</h3>
              <div className="flex justify-center">
                <QRCodeSVG value={audienceUrl} size={200} level="M" />
              </div>
              <p className="text-xs text-gray-400 mt-4 break-all">{audienceUrl}</p>
              <button
                onClick={() => navigator.clipboard.writeText(audienceUrl)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800"
              >
                링크 복사
              </button>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">사용법</p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>1. QR코드를 PT 화면에 보여주세요</li>
                <li>2. 참석자가 스캔하여 질문을 남깁니다</li>
                <li>3. 질문이 실시간으로 여기에 표시됩니다</li>
                <li>4. "PT 전체화면" 버튼으로 발표용 뷰 전환</li>
                <li>5. 좋아요 순으로 자동 정렬됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
