"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, CheckCircle } from "@phosphor-icons/react";
import type { EmploymentType, Job, JobCategory } from "@/lib/types";
import { categories, districts } from "@/lib/mock-data";

const categoryOptions = categories.filter(
  (c): c is JobCategory => c !== "전체"
);
const districtOptions = districts.filter((d) => d !== "전체");
const employmentTypeOptions: EmploymentType[] = [
  "당일알바",
  "단기",
  "계약직",
  "정규직",
];

export function CreateJobModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (job: Job) => void;
}) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<JobCategory>(categoryOptions[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    employmentTypeOptions[0]
  );
  const [district, setDistrict] = useState(districtOptions[0]);
  const [wage, setWage] = useState("");
  const [headcount, setHeadcount] = useState("");
  const reduce = useReducedMotion();

  function reset() {
    setStep("form");
    setTitle("");
    setCategory(categoryOptions[0]);
    setEmploymentType(employmentTypeOptions[0]);
    setDistrict(districtOptions[0]);
    setWage("");
    setHeadcount("");
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newJob: Job = {
      id: `j-new-${Date.now()}`,
      title,
      company: "그린박스물류",
      companySeed: "greenbox-new",
      verified: true,
      district,
      address: `${district} (상세주소 등록 예정)`,
      category,
      employmentType,
      shift: "주간",
      wage: Number(wage) || 0,
      wageUnit: employmentType === "정규직" ? "월급" : "일급",
      workDate: "상시채용",
      workHours: "협의",
      headcount: Number(headcount) || 1,
      applicants: 0,
      urgent: false,
      tags: ["신규등록"],
      description: "등록된 공고 상세 설명이 여기에 표시됩니다.",
      requirements: ["상세 요건을 입력해주세요"],
      benefits: ["4대보험"],
      postedAt: "방금 전",
    };
    onCreate(newJob);
    setStep("done");
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="새 공고 등록"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 sm:rounded-3xl"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="닫기"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground"
            >
              <X size={18} />
            </button>

            {step === "form" ? (
              <>
                <h2 className="pr-8 text-lg font-extrabold text-foreground">
                  새 공고 등록
                </h2>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="job-title"
                      className="block text-sm font-medium text-foreground"
                    >
                      공고 제목
                    </label>
                    <input
                      id="job-title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예) 주간 피킹 사원 모집"
                      className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="job-category"
                        className="block text-sm font-medium text-foreground"
                      >
                        직종
                      </label>
                      <select
                        id="job-category"
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as JobCategory)
                        }
                        className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                      >
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="job-type"
                        className="block text-sm font-medium text-foreground"
                      >
                        근무 형태
                      </label>
                      <select
                        id="job-type"
                        value={employmentType}
                        onChange={(e) =>
                          setEmploymentType(e.target.value as EmploymentType)
                        }
                        className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                      >
                        {employmentTypeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="job-district"
                        className="block text-sm font-medium text-foreground"
                      >
                        지역
                      </label>
                      <select
                        id="job-district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                      >
                        {districtOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="job-headcount"
                        className="block text-sm font-medium text-foreground"
                      >
                        모집 인원
                      </label>
                      <input
                        id="job-headcount"
                        required
                        type="number"
                        min={1}
                        value={headcount}
                        onChange={(e) => setHeadcount(e.target.value)}
                        placeholder="5"
                        className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="job-wage"
                      className="block text-sm font-medium text-foreground"
                    >
                      급여 (원)
                    </label>
                    <input
                      id="job-wage"
                      required
                      type="number"
                      min={0}
                      value={wage}
                      onChange={(e) => setWage(e.target.value)}
                      placeholder="120000"
                      className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98]"
                  >
                    공고 등록하기
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                  <CheckCircle size={30} weight="fill" />
                </span>
                <h2 className="mt-4 text-lg font-extrabold text-foreground">
                  공고가 등록됐어요
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  구직자들에게 바로 노출되며, 공고 관리 목록에서 확인할 수
                  있어요.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 w-full rounded-lg border border-border-strong bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-2"
                >
                  확인
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
