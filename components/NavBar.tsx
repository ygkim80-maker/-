"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { Logo } from "./Logo";

const links = [
  { href: "/jobs", label: "공고찾기" },
  { href: "/daily", label: "당일알바" },
  { href: "/profile", label: "마이페이지" },
  { href: "/company", label: "기업 회원" },
];

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/company"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:block"
          >
            기업 회원
          </Link>
          <Link
            href="/jobs"
            className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:bg-accent-hover active:scale-[0.98] sm:inline-flex"
          >
            무료로 시작하기
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-2 md:hidden"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-[15px] font-medium text-foreground hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/jobs"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-accent px-4 py-3 text-center text-[15px] font-semibold text-accent-foreground hover:bg-accent-hover"
              >
                무료로 시작하기
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
