import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            오늘, 물류센터 일자리를 놀듯이 찾아보세요.
          </h2>
          <p className="mt-4 text-[15px] text-muted">
            가입은 1분이면 충분해요. 지금 바로 조건에 맞는 공고를 확인하세요.
          </p>
          <Link
            href="/jobs"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
          >
            무료로 시작하기
            <ArrowRight size={18} weight="bold" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
