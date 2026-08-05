import Link from "next/link";
import { ArrowRight, User, Buildings } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

export function AudienceSplit() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-8">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                  <User size={22} weight="bold" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold text-foreground">
                  일자리를 찾고 있어요
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  당일알바부터 정규직까지, 내 조건에 맞는 물류센터 공고를
                  찾아 바로 지원해보세요.
                </p>
              </div>
              <Link
                href="/jobs"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
              >
                구직자로 시작하기
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-foreground p-8 text-background">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-accent-hover">
                  <Buildings size={22} weight="bold" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">
                  인력을 채용하고 있어요
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-background/70">
                  공고 등록부터 지원자 관리까지, 물류센터 채용을 위한
                  대시보드를 무료로 사용해보세요.
                </p>
              </div>
              <Link
                href="/company"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-background px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:bg-background/90 active:scale-[0.98]"
              >
                기업회원으로 시작하기
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
