import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface Question {
  id: string;
  text: string;
  author: string;
  likes: number;
  createdAt: string;
  pinned: boolean;
  answered: boolean;
}

interface Session {
  id: string;
  title: string;
  active: boolean;
  questions: Question[];
}

export default function AudiencePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [clientId] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    fetch(`/api/qa/${sessionId}`)
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setError('세션을 찾을 수 없습니다'));

    const socket: Socket = io({ transports: ['websocket', 'polling'] });
    socket.emit('qa:join', sessionId);

    socket.on('qa:new-question', (q: Question) => {
      setSession((s) => (s ? { ...s, questions: [...s.questions, q] } : s));
    });
    socket.on('qa:question-updated', (update: Partial<Question> & { id: string }) => {
      setSession((s) =>
        s
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === update.id ? { ...q, ...update } : q)),
            }
          : s
      );
    });
    socket.on('qa:session-updated', (update: Partial<Session>) => {
      setSession((s) => (s ? { ...s, ...update } : s));
    });

    return () => { socket.disconnect(); };
  }, [sessionId]);

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/qa/${sessionId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: author || '익명' }),
      });
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    } catch {
      setError('전송 실패');
    } finally {
      setSending(false);
    }
  };

  const like = async (qid: string) => {
    await fetch(`/api/qa/${sessionId}/questions/${qid}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  const sorted = [...session.questions]
    .filter((q) => !q.answered)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.likes - a.likes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-lg mx-auto p-4">
        <div className="text-center mb-6 pt-4">
          <h1 className="text-xl font-bold text-gray-800">{session.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {session.active ? '질문을 남겨주세요' : '질문 접수가 종료되었습니다'}
          </p>
        </div>

        {session.active && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="이름 (선택사항)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="질문을 입력하세요..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <button
              onClick={submit}
              disabled={sending || !text.trim()}
              className="mt-2 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition"
            >
              {sent ? '전송 완료!' : sending ? '전송 중...' : '질문 보내기'}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium">
            질문 {session.questions.length}개 {sorted.length < session.questions.length && `(답변완료 ${session.questions.length - sorted.length}개)`}
          </p>
          {sorted.map((q) => (
            <div
              key={q.id}
              className={`bg-white rounded-xl p-4 shadow-sm ${q.pinned ? 'ring-2 ring-blue-400' : ''}`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{q.author}</span>
                <button
                  onClick={() => like(q.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition"
                >
                  <span>👍</span>
                  <span>{q.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
