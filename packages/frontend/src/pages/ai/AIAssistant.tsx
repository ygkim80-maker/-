import React, { useState, useRef, useEffect } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';

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

export default function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: '안녕하세요! 수도권 풀필먼트 센터 AI 분석 어시스턴트입니다. 운영 데이터에 대해 무엇이든 물어보세요.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const history = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    setMessages((m) => [...m, { role: 'user', content: text }]);
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
    } catch {
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
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <PageHeader title="AI 분석" subtitle="운영 데이터 기반 AI 어시스턴트" />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                }`}
              >
                {m.content || (loading && i === messages.length - 1 ? '입력 중...' : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-6 py-3 flex flex-wrap gap-2 bg-gray-50 border-t border-gray-100">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-gray-200 flex gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-50"
          />
          <Button onClick={() => send(input)} disabled={loading} variant="primary">
            전송
          </Button>
        </div>
      </Card>
    </div>
  );
}
