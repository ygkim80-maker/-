import { Reveal } from "./Reveal";

const quotes = [
  {
    initial: "오",
    name: "오정만",
    role: "상하차 · 당일알바 이용자",
    quote:
      "새벽에 갑자기 일이 필요할 때 지도 보고 가까운 센터 바로 지원해요. 정산도 그날 끝나서 편해요.",
  },
  {
    initial: "서",
    name: "서지은",
    role: "그린박스물류 채용 담당자",
    quote:
      "예전엔 전화로 일일이 인원을 구했는데, 지금은 대시보드에서 지원자 확인하고 바로 연락해요.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-surface-2/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            먼저 써본 분들의 이야기
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {quotes.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-surface p-7">
                <blockquote className="text-[15px] leading-relaxed text-foreground">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-text">
                    {q.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {q.name}
                    </p>
                    <p className="text-xs text-muted">{q.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
