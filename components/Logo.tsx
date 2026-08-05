import Link from "next/link";
import { Package } from "@phosphor-icons/react/dist/ssr";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 shrink-0 ${className}`}
      aria-label="물류야 놀쟈! 홈으로 이동"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Package size={18} weight="bold" />
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-foreground">
        물류야 놀쟈<span className="text-accent-text">!</span>
      </span>
    </Link>
  );
}
