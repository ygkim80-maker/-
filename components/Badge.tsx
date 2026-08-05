import type { ReactNode } from "react";

type Tone = "accent" | "neutral" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent-text border-accent-soft-border",
  neutral: "bg-surface-2 text-muted border-border-strong",
  success: "bg-success-soft text-success border-success/20",
  danger: "bg-danger-soft text-danger border-danger/20",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
