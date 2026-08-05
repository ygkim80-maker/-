import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              전국 물류센터의 오늘 일자리를 가장 빠르게 잇는 구인구직 플랫폼입니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">구직자</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><Link href="/jobs" className="hover:text-foreground">전체 공고</Link></li>
              <li><Link href="/daily" className="hover:text-foreground">당일알바</Link></li>
              <li><Link href="/profile" className="hover:text-foreground">마이페이지</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">기업 회원</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li><Link href="/company" className="hover:text-foreground">채용 대시보드</Link></li>
              <li><Link href="/company" className="hover:text-foreground">공고 등록</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">고객센터</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>평일 09:00 - 18:00</li>
              <li>1522-0428</li>
              <li>help@nolja-logistics.kr</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>(주)놀쟈물류 · 대표 정하윤 · 경기 성남시 분당구 판교로 235</p>
          <p>사업자등록번호 214-88-01927</p>
        </div>
      </div>
    </footer>
  );
}
