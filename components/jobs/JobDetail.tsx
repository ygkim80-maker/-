"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  CalendarBlank,
  Wallet,
  SealCheck,
  Lightning,
  BookmarkSimple,
  ShareNetwork,
  CheckCircle,
  ArrowLeft,
} from "@phosphor-icons/react";
import type { Job } from "@/lib/types";
import { formatWage } from "@/lib/format";
import { Badge } from "@/components/Badge";
import { JobCard } from "@/components/JobCard";
import { ApplyModal } from "./ApplyModal";

export function JobDetail({
  job,
  relatedJobs,
}: {
  job: Job;
  relatedJobs: Job[];
}) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const workInfo = [
    { icon: CalendarBlank, label: "근무일", value: job.workDate },
    { icon: Clock, label: "근무시간", value: job.workHours },
    { icon: MapPin, label: "근무지", value: job.address },
    { icon: Users, label: "모집인원", value: `${job.headcount}명` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
      >
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {job.urgent && (
              <Badge tone="danger">
                <Lightning size={12} weight="fill" />
                급구
              </Badge>
            )}
            <Badge tone="accent">{job.employmentType}</Badge>
            <Badge tone="neutral">{job.category}</Badge>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
            {job.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
            <span className="flex items-center gap-1 font-semibold text-foreground/80">
              {job.company}
              {job.verified && (
                <SealCheck size={16} weight="fill" className="text-accent-text" />
              )}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {job.district}
            </span>
            <span>{job.postedAt}</span>
          </div>

          {/* Mobile wage + apply */}
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-surface p-4 lg:hidden">
            <span className="text-xl font-extrabold text-foreground">
              {formatWage(job.wage, job.wageUnit)}
            </span>
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover"
            >
              지원하기
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workInfo.map((info) => (
              <div
                key={info.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <info.icon size={18} className="mt-0.5 shrink-0 text-accent-text" />
                <div>
                  <p className="text-xs text-muted">{info.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-foreground">상세 설명</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              {job.description}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-foreground">지원 자격</h2>
            <ul className="mt-3 space-y-2.5">
              {job.requirements.map((req) => (
                <li key={req} className="flex items-start gap-2.5 text-[15px] text-foreground/85">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-accent-text"
                  />
                  {req}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-foreground">복리후생 및 혜택</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-text"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2 text-muted">
              <Wallet size={18} />
              <span className="text-sm">예상 급여</span>
            </div>
            <p className="mt-1.5 text-2xl font-extrabold text-foreground">
              {formatWage(job.wage, job.wageUnit)}
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
              <Users size={15} />
              지원 {job.applicants}명 · 모집 {job.headcount}명
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((job.applicants / job.headcount) * 100)
                  )}%`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="mt-5 w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
            >
              지원하기
            </button>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSaved((v) => !v)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  saved
                    ? "border-accent-soft-border bg-accent-soft text-accent-text"
                    : "border-border-strong text-muted hover:text-foreground"
                }`}
              >
                <BookmarkSimple size={16} weight={saved ? "fill" : "regular"} />
                {saved ? "저장됨" : "저장"}
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-strong px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground"
              >
                <ShareNetwork size={16} />
                공유
              </button>
            </div>
          </div>
        </aside>
      </div>

      {relatedJobs.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold text-foreground">비슷한 공고</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedJobs.map((related) => (
              <JobCard key={related.id} job={related} />
            ))}
          </div>
        </section>
      )}

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
