import Link from "next/link";
import type { ReactNode } from "react";
import {
  SquaresFour,
  Briefcase,
  Users,
  Wallet,
  Gear,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "#overview", label: "대시보드 개요", icon: SquaresFour },
  { href: "#jobs", label: "공고 관리", icon: Briefcase },
  { href: "#applicants", label: "지원자 관리", icon: Users },
];

const disabledItems = [
  { label: "정산 관리", icon: Wallet },
  { label: "설정", icon: Gear },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-2"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-border" />
          {disabledItems.map((item) => (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted/60"
            >
              <item.icon size={18} />
              {item.label}
              <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold">
                준비중
              </span>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-text">
              그
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-foreground">
                그린박스물류
              </span>
              <span className="block truncate text-xs text-muted">
                서지은 채용 담당자
              </span>
            </span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6 lg:hidden">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            나가기
          </Link>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
