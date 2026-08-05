import { stats } from "@/lib/mock-data";
import { Reveal } from "./Reveal";

const items = [
  { label: "현재 진행중인 공고", value: stats.activeJobs.toLocaleString("ko-KR"), unit: "건" },
  { label: "오늘 새로 올라온 공고", value: stats.todayNewJobs.toLocaleString("ko-KR"), unit: "건" },
  { label: "가입한 구직자", value: stats.registeredWorkers.toLocaleString("ko-KR"), unit: "명" },
  { label: "제휴 물류센터", value: stats.partnerCenters.toLocaleString("ko-KR"), unit: "곳" },
];

export function StatsBento() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            숫자로 보는 물류야 놀쟈!
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6">
                <p className="text-3xl font-extrabold text-foreground sm:text-4xl">
                  {item.value}
                  <span className="ml-1 text-base font-semibold text-muted">
                    {item.unit}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
