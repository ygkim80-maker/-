import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { jobs } from "@/lib/mock-data";
import { JobCard } from "@/components/JobCard";
import { Reveal } from "./Reveal";

export function UrgentJobsCarousel() {
  const urgentJobs = jobs.filter((job) => job.urgent).slice(0, 5);

  return (
    <section className="bg-surface-2/50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              지금 급하게 뽑는 공고
            </h2>
            <p className="mt-2 text-sm text-muted">
              마감 임박, 인원이 부족한 공고부터 확인해보세요.
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent-text hover:text-accent-hover sm:flex"
          >
            전체 공고 보기
            <ArrowRight size={16} weight="bold" />
          </Link>
        </Reveal>

        <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {urgentJobs.map((job) => (
            <div
              key={job.id}
              className="w-[85%] shrink-0 snap-start sm:w-[380px]"
            >
              <JobCard job={job} />
            </div>
          ))}
        </div>

        <Link
          href="/jobs"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-accent-text hover:text-accent-hover sm:hidden"
        >
          전체 공고 보기
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
