# 카드 재배송 자동안내 시스템

수취인 부재로 반송된 카드에 대해, 지금까지 지점/본사 담당자가 실물을 들고 일일이 전화하던
프로세스를 자동화합니다. 반송이 등록되면 시스템이 자동으로 고객에게 문자(SMS) 안내를
발송하고, 응답이 없으면 일정 시간 후 자동으로 재시도하며, 반복 실패 시 ARS(음성 안내)로
전환합니다. 고객은 문자 속 링크로 접속해 재배송 방법을 직접 선택/신청할 수 있습니다.

## 자동화 흐름

1. **반송 접수**: 지점/본사 담당자가 반송된 카드 실물을 확인하고 관리자 화면에서
   "반송등록+안내발송"을 클릭 (또는 향후 창고 스캔 시스템과 연동해 자동 접수 가능).
2. **1차 안내 (SMS)**: 시스템이 자동으로 고객에게 재배송 신청 링크가 담긴 문자를 발송.
3. **고객 셀프 신청**: 고객이 링크에 접속해 "기존 주소 재배송 / 새 주소 재배송 /
   지점 방문 수령 / 취소" 중 선택.
4. **무응답 시 자동 재시도**: `RETRY_AFTER_MINUTES` 가 지나도 응답이 없으면 스케줄러가
   자동으로 재발송. `VOICE_FROM_ATTEMPT` 번째 시도부터는 문자 대신 ARS 음성 발신으로
   자동 전환 (기존에 담당자가 전화 걸던 행위를 대체).
5. **최종 무응답 건**: `MAX_NOTIFY_ATTEMPTS` 회 시도 후에도 응답이 없으면 "담당자 확인
   필요" 목록에 노출되어, 그 때만 사람이 개입.

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

- `shipments`: 반송 건 (고객정보, 상태, 재배송 신청 결과, 발송 시도 횟수 등)
- `notification_logs`: 발송 이력 (채널, provider, 성공/실패, 원문 메시지)

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
src/routes/admin.js           관리자 API
src/routes/customer.js        고객 응답 API
public/admin/                 관리자 대시보드 (정적 HTML/JS)
public/customer/              고객 재배송 신청 페이지 (정적 HTML/JS)
scripts/seed.js                데모 데이터 생성
```
