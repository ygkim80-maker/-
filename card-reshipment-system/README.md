# 카드 재배송 자동안내 시스템

수취인 부재로 반송된 카드에 대해, 지금까지 지점/본사 담당자가 실물을 들고 일일이 전화하던
프로세스를 자동화합니다. 반송이 등록되면 시스템이 자동으로 고객에게 문자(SMS) 안내를
발송하고, 응답이 없으면 일정 시간 후 자동으로 재시도하며, 반복 실패 시 ARS(음성 안내)로
전환합니다. 고객은 문자 속 링크로 접속해 재배송 방법을 직접 선택/신청할 수 있습니다.

## 자동화 흐름

1. **반송 접수 (기간계 자동 동기화)**: 담당자가 수기로 입력하지 않는다. `CORE_SYNC_CRON`
   주기(기본 10분)마다 스케줄러가 기간계 API를 폴링해서 반송 확정 건을 가져오고,
   이미 들어온 건(운송장번호 기준)은 자동으로 걸러낸 뒤 신규 건만 `returned` 상태로
   접수한다. 수기 등록 폼은 기간계 미연동 구간이나 예외 상황을 위한 보조 수단으로만
   남아 있다 (관리자 화면의 "수동 등록" 접기 패널).
2. **1차 안내 (SMS)**: 접수와 동시에 시스템이 자동으로 고객에게 재배송 신청 링크가
   담긴 문자를 발송 — 사람 개입 없음.
3. **고객 셀프 신청**: 고객이 링크에 접속해 "기존 주소 재배송 / 새 주소 재배송 /
   지점 방문 수령 / 취소" 중 선택.
4. **무응답 시 자동 재시도**: `RETRY_AFTER_MINUTES` 가 지나도 응답이 없으면 스케줄러가
   자동으로 재발송. `VOICE_FROM_ATTEMPT` 번째 시도부터는 문자 대신 ARS 음성 발신으로
   자동 전환 (기존에 담당자가 전화 걸던 행위를 대체).
5. **최종 무응답 건**: `MAX_NOTIFY_ATTEMPTS` 회 시도 후에도 응답이 없으면 "담당자 확인
   필요" 목록에 노출되어, 그 때만 사람이 개입.

## 기간계 연동 (자동 접수)

`.env`에 `CORE_API_BASE_URL`을 채우기 전까지는 `src/services/coreSystem/mockAdapter.js`가
대신 동작해서, 폴링될 때마다 반송 건이 무작위로 발생하는 것처럼 시뮬레이션한다 —
기간계 없이도 전체 자동화 흐름(접수→발송→재시도→ARS 전환)을 바로 확인할 수 있다.

실제 기간계로 전환하는 방법:

1. 기간계 쪽에 "특정 시각 이후 반송 확정된 건 목록"을 내려주는 REST 엔드포인트가
   있는지 확인한다 (없다면 뒷단 담당자와 협의해 하나 만들어야 자동화가 가능하다).
2. `.env`에 `CORE_API_BASE_URL`, `CORE_API_RETURNED_ENDPOINT`, 인증 정보
   (`CORE_API_AUTH_TYPE` + 토큰/키/계정)를 채운다.
3. 기간계 응답 필드명이 내부 필드명(`trackingNo`, `customerName`, `phone`, `cardType`,
   `branch`, `address`, `returnedAt` 등)과 다르면 `CORE_API_FIELD_MAP`에 JSON으로
   매핑을 지정한다 — 코드 수정 없이 필드명만 맞추면 된다.
4. 응답 형식이 REST/JSON이 아니거나(SOAP, 고정폭 배치파일, DB 직접 조회 등) 인증
   방식이 특수하면 `src/services/coreSystem/restAdapter.js`의 `fetchReturnedShipments`
   본문만 교체하면 된다. 인터페이스(반환 형식: `{trackingNo, customerName, phone,
   cardType, branch, address, returnReason, returnedAt, externalId}` 배열)만 유지하면
   나머지 파이프라인(중복 방지, 접수, 자동 발송, 재시도)은 그대로 재사용된다.
5. 운송장번호(`tracking_no`)는 DB에서 유니크 제약이 걸려 있어, 같은 건을 여러 번
   폴링해도 중복 접수되지 않는다. 마지막 동기화 시점은 `sync_state` 테이블에
   저장되어, 다음 폴링부터는 그 이후 데이터만 요청한다(`since` 쿼리 파라미터).
6. 관리자 화면 상단의 "기간계 연동 상태" 패널에서 마지막 동기화 시각과 최근 실행
   이력을 확인할 수 있고, "지금 동기화" 버튼으로 스케줄과 별개로 즉시 실행할 수 있다.

## 실행 방법

```bash
npm install
cp .env.example .env
npm run seed     # 데모용 샘플 반송 건 3건 생성 (선택)
npm start
```

- 관리자 화면: http://localhost:3000/admin
- 고객 재배송 신청 화면은 문자에 포함된 링크(`/r/:token`)로 접속하며, 관리자 화면에서
  "반송등록+안내발송" 또는 "재발송"을 누르면 서버 콘솔에 발송 내용(Mock)이 출력됩니다.
  콘솔에 출력된 `/r/...` 링크를 브라우저로 열어 고객 입장에서 신청 흐름을 확인할 수 있습니다.

## 실제 문자/ARS 연동으로 전환하기

기본값은 실제 통신 없이 콘솔에 로그만 남기는 Mock 발송입니다. `.env`에 아래 값을
채우면 코드 수정 없이 자동으로 실제 발송으로 전환됩니다 (`src/services/notify/index.js`
의 팩토리가 환경변수 존재 여부로 provider를 선택).

- **문자(SMS)**: 알리고(Aligo) API 키를 채우면 `aligoProvider.js` 사용.
- **문자+ARS 음성**: Twilio 계정 정보를 채우면 `twilioProvider.js` 사용 (Voice는
  실제 운영 전환 시 TwiML을 서빙하는 공개 URL이 필요 — 코드 내 주석 참고).

다른 업체(NHN Toast, 카카오 알림톡 등)를 쓰려면 `src/services/notify/` 아래에 동일한
인터페이스(`sendSms`, `makeVoiceCall`)로 새 provider 파일을 추가하고 `index.js`의
팩토리 조건만 추가하면 됩니다.

## 데이터 모델

- `shipments`: 반송 건 (고객정보, 상태, 재배송 신청 결과, 발송 시도 횟수 등). `tracking_no`는
  유니크 제약이 걸려 있어 기간계에서 같은 건이 중복으로 내려와도 한 번만 접수된다.
- `notification_logs`: 발송 이력 (채널, provider, 성공/실패, 원문 메시지)
- `sync_runs`: 기간계 동기화 실행 이력 (트리거, 조회/신규/중복 건수, 성공/실패)
- `sync_state`: 마지막 동기화 커서 등 스케줄러 상태값

상태 흐름: `in_transit → returned → notified ⇄(자동 재시도) → customer_responded
→ rescheduled → redelivered / closed`

## 디렉터리 구조

```
server.js                     Express 서버 진입점 + 스케줄러 기동
src/db.js                     SQLite 스키마/연결
src/services/reshipmentService.js  핵심 업무 로직 (반송 접수, 발송, 응답 처리)
src/services/scheduler.js     무응답 건 자동 재시도 cron
src/services/templates.js     SMS/ARS 문구 템플릿
src/services/notify/          발송 provider (mock / aligo / twilio, 교체 가능한 인터페이스)
src/services/coreSystem/      기간계 연동 어댑터 (mock / rest, 교체 가능한 인터페이스)
src/services/coreSyncService.js    기간계 동기화 실행 로직 (중복 방지, 자동 접수+발송, 이력 기록)
src/services/coreSyncScheduler.js  기간계 폴링 cron
src/routes/admin.js           관리자 API
src/routes/customer.js        고객 응답 API
public/admin/                 관리자 대시보드 (정적 HTML/JS)
public/customer/              고객 재배송 신청 페이지 (정적 HTML/JS)
scripts/seed.js                데모 데이터 생성
```
