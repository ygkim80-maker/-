import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "물류야 놀쟈! | 물류센터 구인구직 플랫폼",
  description:
    "물류센터 인력을 위한 구인구직 전용 플랫폼. 당일 알바부터 정규직까지, 검증된 물류센터 일자리를 지금 확인하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
