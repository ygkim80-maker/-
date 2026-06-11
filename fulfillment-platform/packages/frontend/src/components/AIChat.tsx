import { useState, useRef, useEffect } from 'react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  '오늘 미출고 주문 현황',
  '재고 부족 상품 알려줘',
  '오늘 입고 예정 목록',
  '생산성 현황 요약',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: '안녕하세요! 수도권 풀필먼트 센터 AI 어시스턴트입니다. 무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.body) throw new Error('no stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              acc += parsed.text ?? '';
            } catch {
              acc += data;
            }
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: 'assistant', content: acc };
              return copy;
            });
          }
        }
      }
      if (!acc) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: '응답을 받지 못했습니다.' };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: '오류가 발생했습니다. 서버 연결을 확인해주세요.' };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand text-white text-2xl shadow-lg hover:scale-105 transition-transform z-40 flex items-center justify-center"
        title="AI 어시스턴트"
      >
        🤖
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-40 overflow-hidden">
          <div className="bg-sidebar text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <div className="font-semibold text-sm">AI 어시스턴트</div>
                <div className="text-[11px] text-gray-300">풀필먼트 운영 도우미</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-accent text-white' : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 ? '입력 중...' : '')}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-gray-50">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={() => send(input)}
              disabled={loading}
              className="px-3 py-2 bg-brand text-white rounded-md text-sm disabled:opacity-50"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
