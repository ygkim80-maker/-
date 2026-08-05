import Link from "next/link";
import { myApplications } from "@/lib/mock-data";
import { getJobById } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export function ApplicationsList() {
  return (
    <div className="rounded-2xl border border-border bg-surface">
      {myApplications.map((application, i) => {
        const job = getJobById(application.jobId);
        if (!job) return null;
        return (
          <Link
            key={application.jobId}
            href={`/jobs/${job.id}`}
            className={`flex flex-col gap-2 p-5 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {job.title}
              </p>
              <p className="mt-1 text-xs text-muted">
                {job.company} · {application.appliedAt} 지원
              </p>
            </div>
            <div className="shrink-0">
              <StatusBadge status={application.status} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
