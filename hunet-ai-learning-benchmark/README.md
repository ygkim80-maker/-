# 사내 AI 학습 플랫폼 (휴넷 벤치마킹 프로토타입)

휴넷의 AI 기반 기업교육(HRD) 솔루션 — 개인화 학습 추천, AI 러닝 코치/챗봇, 학습
데이터 분석 대시보드 — 를 벤치마킹하여, 외부 SaaS 계약 없이 사내에서 바로 띄워볼
수 있는 최소 기능 LMS 프로토타입입니다.

## 휴넷 기능 대비 매핑

| 휴넷 AI 학습 솔루션 | 이 프로토타입 |
|---|---|
| AI 개인화 학습 추천 | 태그 유사도 + 동료 학습자 인기도 + 난이도 적합도 기반 추천 엔진 (`app/recommender.py`) |
| AI 러닝 코치 / 챗봇 | 강의 콘텐츠 검색 기반 답변, API 키가 있으면 Claude로 답변 생성 (RAG-lite, `app/tutor.py`) |
| 학습 이력·수료 관리 | 강의/차시/수강신청/진도 데이터 모델과 체크리스트 UI |
| 학습 데이터 분석 대시보드 | 카테고리별 수료율, 레벨 분포, 수료 추이 등 SVG 차트 대시보드 |

## 아키텍처

- **백엔드**: FastAPI + SQLAlchemy + SQLite (별도 인프라 없이 단일 프로세스로 실행)
- **프런트엔드**: Jinja2 서버 렌더링 + 바닐라 JS (AI 튜터 채팅만 fetch 사용, 빌드 도구 불필요)
- **AI 튜터**: 키워드 기반 검색으로 관련 강의 발췌를 찾고, `ANTHROPIC_API_KEY`가
  설정되어 있으면 Claude(`claude-sonnet-5`)가 그 발췌에 근거해 답변을 생성합니다.
  키가 없거나 호출에 실패해도 검색된 발췌를 그대로 보여주는 방식으로 항상 응답합니다.
- **추천 엔진**: 외부 임베딩/모델 호출 없이, 학습자의 수강 이력에서 얻은 관심 태그
  가중치, 같은 레벨 동료의 수강 비율(인기도), 난이도 적합도를 가중합하여 점수화합니다.

## 실행 방법

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

브라우저에서 http://localhost:8000 접속 (최초 실행 시 샘플 강의 12개, 학습자 10명
데이터가 자동 시딩됩니다). `/learners`에서 체험할 학습자를 선택한 뒤 강의 수강,
진도 체크, AI 추천, AI 튜터, 학습 분석 대시보드를 둘러볼 수 있습니다.

AI 튜터가 Claude로 답변을 생성하도록 하려면 실행 전 환경변수를 설정하세요:

```bash
export ANTHROPIC_API_KEY=sk-...
```

키가 없어도 튜터는 검색된 강의 발췌를 답변으로 보여주므로 정상 동작합니다.

## 디렉터리 구조

```
backend/
  app/
    main.py            # FastAPI 앱 진입점, 최초 실행 시 DB 시딩
    models.py           # Learner/Course/Tag/Lesson/Enrollment/LessonProgress
    seed_data.py        # 샘플 강의·학습자·수강 이력 시드
    recommender.py       # 태그 유사도 + 동료 인기도 + 난이도 기반 추천 엔진
    tutor.py            # 검색 기반 답변 + (있으면) Claude RAG-lite
    charts.py           # 대시보드용 인라인 SVG 막대/선 차트
    routers/
      pages.py           # 서버 렌더링 페이지 (강의, 추천, 튜터, 대시보드)
      api.py             # AI 튜터 질의응답 JSON API
    templates/           # Jinja2 템플릿
    static/style.css     # 라이트/다크 모드 대응 스타일
```

## 다음 단계로 고려할 것

- 간이 학습자 선택(쿠키) → 사내 SSO/사번 연동으로 교체
- 규칙 기반 추천 → 임베딩 기반 콘텐츠 유사도로 고도화
- 키워드 검색 → 벡터 검색(사내 문서까지 포함하는 RAG)으로 확장
- SQLite → 사내 표준 RDB, 배포 파이프라인/인증 연동
