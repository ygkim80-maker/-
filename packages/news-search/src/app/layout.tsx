import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "키워드 기사 검색",
  description: "카테고리별 키워드 기반 뉴스 기사 검색",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
