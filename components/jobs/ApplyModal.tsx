"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import type { Job } from "@/lib/types";

export function ApplyModal({
  job,
  open,
  onClose,
}: {
  job: Job;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "submitting" | "done">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const reduce = useReducedMotion();

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("form");
      setName("");
      setPhone("");
    }, 200);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setTimeout(() => setStep("done"), 900);
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
            aria-label="지원하기"
            className="relative z-10 w-full max-w-md rounded-t-3xl border border-border bg-surface p-6 sm:rounded-3xl"
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

            {step !== "done" ? (
              <>
                <h2 className="pr-8 text-lg font-extrabold text-foreground">
                  지원하기
                </h2>
                <p className="mt-1 text-sm text-muted">{job.title}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="apply-name"
                      className="block text-sm font-medium text-foreground"
                    >
                      이름
                    </label>
                    <input
                      id="apply-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="apply-phone"
                      className="block text-sm font-medium text-foreground"
                    >
                      연락처
                    </label>
                    <input
                      id="apply-phone"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full rounded-lg border border-border-strong bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={step === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98] disabled:opacity-70"
                  >
                    {step === "submitting" ? (
                      "제출 중..."
                    ) : (
                      <>
                        지원서 제출하기
                        <PaperPlaneTilt size={16} weight="bold" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-muted">
                    제출 시 프로필 정보가 {job.company}에 전달돼요.
                  </p>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                  <CheckCircle size={30} weight="fill" />
                </span>
                <h2 className="mt-4 text-lg font-extrabold text-foreground">
                  지원이 완료됐어요
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  {job.company}에서 곧 연락드릴 예정이에요.
                  <br />
                  지원 현황은 마이페이지에서 확인할 수 있어요.
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
