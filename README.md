# 풀필먼트 센터 통합 IT 플랫폼

신규 풀필먼트 센터(수도권 FC, 경기도 이천)의 모든 IT 시스템을 하나의 모노레포로 구축한 통합 플랫폼입니다.

## 포함 시스템

| 시스템 | 설명 |
|--------|------|
| **WMS** | 창고관리시스템 — 입고/재고/로케이션/상품/사이클카운트/출고/피킹 |
| **OMS** | 주문관리시스템 — 주문/채널 관리 |
| **TMS** | 배송관리(경량) — 배송 현황/배송사 |
| **YMS** | 야드/도크 관리 — 도크 스케줄 |
| **LMS** | 인력/작업 관리 — 작업자/작업배정/생산성 |
| **화주 포털** | 화주(Shipper) 전용 재고·주문 조회 포털 |
| **AI 어시스턴트** | Claude 기반 챗봇 + 운영 분석 |

## 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite + Tailwind CSS + React Query + Recharts (포트 3000)
- **백엔드**: Node.js + Express + TypeScript + Prisma (SQLite) (포트 4000)
- **실시간**: Socket.io
- **AI**: @anthropic-ai/sdk (`claude-haiku-4-5-20251001`)
- **인증**: JWT + bcrypt

## 1. 사전 요구사항

- Node.js 18 이상
- npm 9 이상

## 2. 설치 방법

```bash
cd fulfillment-platform
npm install
```

## 3. 환경변수 설정

백엔드 환경변수 파일을 생성합니다.

```bash
cp packages/backend/.env.example packages/backend/.env
```

`packages/backend/.env`:

```
PORT=4000
JWT_SECRET=fulfillment-center-secret-key-change-me
ANTHROPIC_API_KEY=        # AI 챗봇 사용 시 입력 (없어도 DB 기반 폴백 응답 동작)
DATABASE_URL="file:./dev.db"
```

> `ANTHROPIC_API_KEY`가 비어 있어도 AI 어시스턴트는 실제 DB 데이터를 요약한 폴백 응답으로 동작합니다. 키를 입력하면 Claude 실시간 응답이 활성화됩니다.

## 4. 데이터베이스 초기화 & 시드

```bash
npm run db:setup
```

위 명령은 Prisma 클라이언트 생성 → 마이그레이션 → 시드 데이터 적재를 수행합니다.

## 5. 실행 방법

```bash
npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:4000/api

`npm run setup` 한 번으로 설치 + DB 초기화를 동시에 수행할 수도 있습니다.

## 6. 기본 계정 정보

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자(ADMIN) | `admin@fc.com` | `admin1234` |
| 작업자 | (시드 참고) | `worker1234` |
| 화주(SHIPPER) | `shipper1@fc.com` / `shipper2@fc.com` | `worker1234` |

## 7. 주요 기능

- **대시보드**: 오늘 주문/처리/출하, 재고 정확도, 평균 처리시간, 도크 가동률 KPI + 일별 처리량·채널별 주문·존별 재고·작업자 생산성 차트
- **WMS**: 발주(PO) 입고처리, 재고 현황, 로케이션/상품 마스터, 사이클 카운트, 웨이브/피킹
- **OMS**: 주문 목록·상세, 상태 변경, 채널 관리
- **TMS**: 배송 현황, 송장 상태 진행, 배송사 관리
- **YMS**: 도크 도어/예약 스케줄, 차량 도착·상하차·완료 처리
- **LMS**: 작업자, 근무 스케줄, 생산성 분석
- **화주 포털**: 화주별 재고/주문 조회
- **AI 어시스턴트**: 우측 하단 플로팅 챗봇 + 전용 분석 페이지 (실시간 운영 데이터 기반 응답, 스트리밍)

## 시드 데이터 요약

- 1개 창고 · 3개 존(A 상온 / B 냉장 / C 반품) · 5개 도크 · 60개 로케이션
- 화주 2곳 · 공급사 5곳 · 상품 30종(패션/식품/생활)
- 배송사 5곳 · 채널 3곳 · 작업자 10여 명
- 오늘자 주문 150건(다양한 상태) · 기존 재고 · 발주 3건 · 도크 예약 2건 · 알림 등

## 프로젝트 구조

```
fulfillment-platform/
├── package.json            (npm workspaces)
└── packages/
    ├── frontend/           (React, Vite, port 3000)
    └── backend/            (Express, Prisma, port 4000)
```
