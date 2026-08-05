import { Lightning, Wallet } from "@phosphor-icons/react/dist/ssr";
import { dailyJobs } from "@/lib/mock-data";

export function DailyHero() {
  const urgentCount = dailyJobs.filter((job) => job.urgent).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-foreground to-[#3a2a1f] p-7 text-background sm:p-9">
      <div className="flex items-center gap-1.5 text-sm font-medium text-background/70">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-hover opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-hover" />
        </span>
        지금 지원 가능
      </div>
      <h1 className="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl">
        오늘 새로 올라온 당일알바
        <br />
        {dailyJobs.length}건, 급구 {urgentCount}건
      </h1>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium">
          <Wallet size={15} />
          근무 종료 후 당일 정산
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium">
          <Lightning size={15} weight="fill" />
          지원 즉시 확인 가능
        </span>
      </div>
    </div>
  );
}
