import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  SealCheck,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";
import type { Job } from "@/lib/types";
import { formatWage } from "@/lib/format";
import { Badge } from "./Badge";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent-soft-border hover:bg-accent-soft/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        {job.urgent && (
          <Badge tone="danger">
            <Lightning size={12} weight="fill" />
            급구
          </Badge>
        )}
        <Badge tone="accent">{job.employmentType}</Badge>
        <Badge tone="neutral">{job.category}</Badge>
        <span className="ml-auto text-xs text-muted">{job.postedAt}</span>
      </div>

      <h3 className="mt-3 text-[15px] font-bold leading-snug text-foreground group-hover:text-accent-text">
        {job.title}
      </h3>

      <div className="mt-1.5 flex items-center gap-1 text-sm text-muted">
        <span className="font-medium text-foreground/80">{job.company}</span>
        {job.verified && (
          <SealCheck size={15} weight="fill" className="text-accent-text" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {job.district}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {job.shift} · {job.workHours}
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} />
          지원 {job.applicants}명 · 모집 {job.headcount}명
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-lg font-extrabold text-foreground">
          {formatWage(job.wage, job.wageUnit)}
        </span>
      </div>
    </Link>
  );
}
