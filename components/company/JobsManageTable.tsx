"use client";

import { useState } from "react";
import { Plus, SealCheck } from "@phosphor-icons/react";
import { jobs as initialJobs } from "@/lib/mock-data";
import type { Job } from "@/lib/types";
import { formatWage } from "@/lib/format";
import { Badge } from "@/components/Badge";
import { CreateJobModal } from "./CreateJobModal";

type PostingStatus = "진행중" | "마감";

export function JobsManageTable() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [statusById, setStatusById] = useState<Record<string, PostingStatus>>(
    {}
  );
  const [createOpen, setCreateOpen] = useState(false);

  function statusOf(id: string): PostingStatus {
    return statusById[id] ?? "진행중";
  }

  function toggleStatus(id: string) {
    setStatusById((prev) => ({
      ...prev,
      [id]: statusOf(id) === "진행중" ? "마감" : "진행중",
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          총 <span className="font-bold text-foreground">{jobs.length}</span>건의 공고
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          새 공고 등록
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-5 py-3.5 font-medium">공고명</th>
              <th className="px-5 py-3.5 font-medium">지역</th>
              <th className="px-5 py-3.5 font-medium">지원 현황</th>
              <th className="px-5 py-3.5 font-medium">급여</th>
              <th className="px-5 py-3.5 font-medium">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => {
              const status = statusOf(job.id);
              return (
                <tr key={job.id}>
                  <td className="max-w-[260px] px-5 py-4">
                    <p className="truncate font-semibold text-foreground">
                      {job.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      {job.company}
                      {job.verified && (
                        <SealCheck
                          size={12}
                          weight="fill"
                          className="text-accent-text"
                        />
                      )}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted">{job.district}</td>
                  <td className="px-5 py-4 text-muted">
                    지원 {job.applicants} / 모집 {job.headcount}
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {formatWage(job.wage, job.wageUnit)}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(job.id)}
                      className="inline-flex"
                    >
                      <Badge tone={status === "진행중" ? "success" : "neutral"}>
                        {status}
                      </Badge>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateJobModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(job) => setJobs((prev) => [job, ...prev])}
      />
    </div>
  );
}
