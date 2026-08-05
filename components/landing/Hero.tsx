import Link from "next/link";
import { ArrowRight, MapPin, Package } from "@phosphor-icons/react/dist/ssr";
import { districts } from "@/lib/mock-data";
import { Reveal } from "./Reveal";
import { IconPanel } from "./IconPanel";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-20 sm:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8">
        <Reveal>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            오늘 뽑는 물류센터,
            <br />
            지금 바로 지원하세요.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
            상하차부터 피킹, 지게차까지. 검증된 물류센터 공고를 한곳에서
            비교하고 당일에도 바로 일할 수 있어요.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-[15px] font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
            >
              공고 둘러보기
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-6 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-surface-2 active:scale-[0.98]"
            >
              당일알바 보기
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2 max-w-md">
            <span className="flex items-center gap-1.5 pl-2 text-sm text-muted">
              <MapPin size={16} />
              지역
            </span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {districts.slice(1, 5).map((d) => (
                <Link
                  key={d}
                  href={`/jobs?district=${encodeURIComponent(d)}`}
                  className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent-soft hover:text-accent-text"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <IconPanel
            icon={Package}
            iconSize={320}
            iconClassName="-right-16 -bottom-16 rotate-[-12deg]"
            className="aspect-[4/5] w-full rounded-3xl border border-border sm:aspect-[5/4] lg:aspect-[4/5]"
          />
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:block">
            <p className="text-xs text-muted">이번 주 신규 공고</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              163<span className="text-sm font-medium text-muted"> 건</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
