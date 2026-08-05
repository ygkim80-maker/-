# 물류야 놀쟈!

물류센터 인력을 위한 구인구직 전용 플랫폼 기획/디자인 목업입니다. 당일알바부터 정규직까지 물류센터 공고를 검색·지원하는 구직자 화면과, 공고 등록 및 지원자 관리를 위한 기업 대시보드를 포함합니다.

이 프로젝트는 실제 백엔드 없이 목업 데이터(`lib/mock-data.ts`)로 동작하는 프런트엔드 목업입니다.

## 화면 구성

- `/` — 랜딩 페이지
- `/jobs` — 구인공고 목록/검색 (지역·직종·근무형태 필터)
- `/jobs/[id]` — 공고 상세 및 지원하기
- `/daily` — 당일알바/단기 매칭
- `/profile` — 구직자 마이페이지 (프로필, 지원 현황, 저장한 공고)
- `/company` — 기업 회원 대시보드 (공고 관리, 지원자 관리)

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Motion (`motion/react`)
- Phosphor Icons
- Pretendard (self-hosted variable font)

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.
