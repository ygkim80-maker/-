"use client";

import { useMemo, useState } from "react";
import { MapPin } from "@phosphor-icons/react";
import { dailyJobs, districts } from "@/lib/mock-data";
import type { Shift } from "@/lib/types";
import { JobCard } from "@/components/JobCard";

const shifts: Array<Shift | "전체"> = ["전체", "새벽", "오후", "야간", "주간"];

export function DailyExplorer() {
  const [shift, setShift] = useState<Shift | "전체">("전체");
  const [district, setDistrict] = useState("전체");

  const filtered = useMemo(() => {
    return dailyJobs.filter((job) => {
      if (shift !== "전체" && job.shift !== shift) return false;
      if (district !== "전체" && job.district !== district) return false;
      return true;
    });
  }, [shift, district]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {shifts.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setShift(s)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              shift === s
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border-strong bg-surface text-muted hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}

        <label className="ml-auto flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm">
          <MapPin size={16} className="text-muted" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-transparent text-foreground focus:outline-none"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-sm text-muted">
        총 <span className="font-bold text-foreground">{filtered.length}</span>건의 당일알바
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-20 text-center">
          <p className="text-sm font-medium text-foreground">
            조건에 맞는 당일알바가 없어요
          </p>
          <p className="mt-1 text-sm text-muted">
            다른 시간대나 지역을 선택해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
