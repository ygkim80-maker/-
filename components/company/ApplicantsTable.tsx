"use client";

import { useState } from "react";
import { applicants as initialApplicants, type Applicant } from "@/lib/mock-data";

const statusOptions: Applicant["status"][] = [
  "검토중",
  "면접예정",
  "합격",
  "불합격",
];

const statusSelectClasses: Record<Applicant["status"], string> = {
  검토중: "bg-surface-2 text-muted border-border-strong",
  면접예정: "bg-accent-soft text-accent-text border-accent-soft-border",
  합격: "bg-success-soft text-success border-success/20",
  불합격: "bg-danger-soft text-danger border-danger/20",
};

export function ApplicantsTable() {
  const [applicants, setApplicants] = useState(initialApplicants);

  function updateStatus(id: string, status: Applicant["status"]) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="px-5 py-3.5 font-medium">지원자</th>
            <th className="px-5 py-3.5 font-medium">지원 공고</th>
            <th className="px-5 py-3.5 font-medium">경력</th>
            <th className="px-5 py-3.5 font-medium">지원일</th>
            <th className="px-5 py-3.5 font-medium">연락처</th>
            <th className="px-5 py-3.5 font-medium">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td className="px-5 py-4 font-semibold text-foreground">
                {applicant.name}
                <span className="ml-1 font-normal text-muted">
                  ({applicant.age})
                </span>
              </td>
              <td className="max-w-[220px] truncate px-5 py-4 text-foreground/80">
                {applicant.jobTitle}
              </td>
              <td className="px-5 py-4 text-muted">{applicant.experience}</td>
              <td className="px-5 py-4 text-muted">{applicant.appliedAt}</td>
              <td className="px-5 py-4 font-mono text-xs text-muted">
                {applicant.phone}
              </td>
              <td className="px-5 py-4">
                <select
                  aria-label={`${applicant.name} 상태 변경`}
                  value={applicant.status}
                  onChange={(e) =>
                    updateStatus(
                      applicant.id,
                      e.target.value as Applicant["status"]
                    )
                  }
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium focus:outline-none ${statusSelectClasses[applicant.status]}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
