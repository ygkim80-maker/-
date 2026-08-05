"use client";

import { useMemo, useState } from "react";
import {
  MagnifyingGlass,
  SlidersHorizontal,
  MapPin,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { jobs, districts, categories } from "@/lib/mock-data";
import type { EmploymentType } from "@/lib/types";
import { JobCard } from "@/components/JobCard";

const employmentTypes: Array<EmploymentType | "전체"> = [
  "전체",
  "당일알바",
  "단기",
  "계약직",
  "정규직",
];

type SortKey = "latest" | "wage-desc";

export function JobsExplorer({
  initialDistrict = "전체",
  initialCategory = "전체",
}: {
  initialDistrict?: string;
  initialCategory?: string;
}) {
  const [keyword, setKeyword] = useState("");
  const [district, setDistrict] = useState(
    districts.includes(initialDistrict) ? initialDistrict : "전체"
  );
  const [category, setCategory] = useState(
    categories.includes(initialCategory as (typeof categories)[number])
      ? initialCategory
      : "전체"
  );
  const [employmentType, setEmploymentType] = useState<
    EmploymentType | "전체"
  >("전체");
  const [sort, setSort] = useState<SortKey>("latest");

  const filtered = useMemo(() => {
    let list = jobs.filter((job) => {
      if (district !== "전체" && job.district !== district) return false;
      if (category !== "전체" && job.category !== category) return false;
      if (employmentType !== "전체" && job.employmentType !== employmentType)
        return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        if (
          !job.title.toLowerCase().includes(k) &&
          !job.company.toLowerCase().includes(k)
        )
          return false;
      }
      return true;
    });

    if (sort === "wage-desc") {
      list = [...list].sort((a, b) => {
        const normalize = (job: (typeof jobs)[number]) =>
          job.wageUnit === "월급" ? job.wage / 22 : job.wage;
        return normalize(b) - normalize(a);
      });
    }

    return list;
  }, [district, category, employmentType, keyword, sort]);

  const hasActiveFilters =
    district !== "전체" ||
    category !== "전체" ||
    employmentType !== "전체" ||
    keyword.trim() !== "";

  function resetFilters() {
    setKeyword("");
    setDistrict("전체");
    setCategory("전체");
    setEmploymentType("전체");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          구인공고
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          전국 물류센터의 실시간 채용 공고를 확인하세요.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3 py-2.5">
          <MagnifyingGlass size={18} className="shrink-0 text-muted" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="직무, 회사명으로 검색"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3 py-2 text-sm">
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

          <label className="flex items-center gap-2 rounded-lg border border-border-strong bg-background px-3 py-2 text-sm">
            <SlidersHorizontal size={16} className="text-muted" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-1 flex-wrap gap-1.5">
            {employmentTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEmploymentType(type)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  employmentType === type
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border-strong bg-background text-muted hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-muted hover:text-accent-text"
            >
              <ArrowCounterClockwise size={14} />
              필터 초기화
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          총 <span className="font-bold text-foreground">{filtered.length}</span>건
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none"
        >
          <option value="latest">최신순</option>
          <option value="wage-desc">급여 높은순</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-20 text-center">
          <p className="text-sm font-medium text-foreground">
            조건에 맞는 공고가 없어요
          </p>
          <p className="mt-1 text-sm text-muted">
            필터를 조정하거나 초기화해보세요.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
