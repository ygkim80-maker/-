import { MagnifyingGlass, PaperPlaneTilt, Wallet, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

const steps = [
  {
    icon: MagnifyingGlass,
    title: "공고 확인하기",
    body: "지역, 직종, 근무일을 골라 조건에 맞는 물류센터 공고를 찾아요.",
  },
  {
    icon: PaperPlaneTilt,
    title: "간편 지원하기",
    body: "프로필을 미리 등록해두면 클릭 한 번으로 지원이 끝나요.",
  },
  {
    icon: Wallet,
    title: "당일 정산받기",
    body: "당일알바는 근무 종료 후 바로 계좌로 급여를 받을 수 있어요.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-surface-2/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            일하는 방식은 간단해요
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-1 items-center gap-4">
              <Reveal delay={i * 0.08} className="flex-1">
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    <step.icon size={22} weight="bold" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
              {i < steps.length - 1 && (
                <ArrowRight
                  size={20}
                  className="hidden shrink-0 text-border-strong lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
