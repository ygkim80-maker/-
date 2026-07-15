"""샘플 데이터 시딩: 사내 AI 학습 플랫폼 프로토타입용 강의/학습자/수강 데이터."""
import datetime
import random

from app.database import Base, engine, SessionLocal
from app.models import (
    Learner,
    Tag,
    Course,
    Lesson,
    Enrollment,
    LessonProgress,
    EnrollmentStatus,
)

random.seed(42)

COURSES = [
    {
        "title": "신임 팀장을 위한 리더십 기초",
        "category": "리더십",
        "difficulty": 1,
        "duration_minutes": 60,
        "tags": ["리더십", "조직관리", "커뮤니케이션"],
        "description": "처음 팀장이 된 구성원을 위한 리더십 기본기와 팀 운영 원칙을 다룹니다.",
        "lessons": [
            ("리더의 역할 전환", "실무자에서 리더로 전환될 때 가장 먼저 바뀌어야 하는 것은 '내가 얼마나 잘하는가'에서 '팀이 얼마나 잘하는가'로 성과 기준이 옮겨간다는 점입니다. 리더는 실무를 직접 처리하는 사람이 아니라 팀의 성과를 설계하고 장애물을 제거하는 사람입니다."),
            ("위임의 기술", "위임은 일을 떠넘기는 것이 아니라 책임과 권한을 함께 넘기는 것입니다. 효과적인 위임을 위해서는 목표와 마감, 판단 기준을 명확히 전달하고, 중간 점검 시점을 미리 합의해야 합니다."),
            ("피드백 대화법", "피드백은 행동에 대해 구체적으로, 감정이 아닌 사실에 기반해 전달해야 합니다. SBI(Situation-Behavior-Impact) 모델을 활용하면 상황-행동-영향을 순서대로 설명하여 방어적 반응을 줄일 수 있습니다."),
        ],
    },
    {
        "title": "성과관리와 코칭 대화",
        "category": "리더십",
        "difficulty": 2,
        "duration_minutes": 50,
        "tags": ["리더십", "성과관리", "코칭"],
        "description": "정기 성과 리뷰와 1:1 코칭 대화를 통해 구성원의 성장을 이끄는 방법을 학습합니다.",
        "lessons": [
            ("목표 설정과 OKR", "OKR은 목표(Objective)와 핵심결과(Key Result)로 구성되며, 도전적이지만 달성 가능한 수준으로 설정할 때 동기부여 효과가 가장 큽니다."),
            ("GROW 코칭 모델", "GROW 모델은 Goal-Reality-Options-Will의 4단계로 구성된 코칭 대화 프레임워크로, 리더가 답을 주기보다 질문을 통해 구성원 스스로 답을 찾도록 돕습니다."),
        ],
    },
    {
        "title": "생성형 AI 업무 활용 입문",
        "category": "IT/디지털",
        "difficulty": 1,
        "duration_minutes": 45,
        "tags": ["AI", "생성형AI", "디지털역량"],
        "description": "생성형 AI의 기본 개념과 사내 업무에 바로 적용할 수 있는 프롬프트 작성법을 다룹니다.",
        "lessons": [
            ("생성형 AI란 무엇인가", "생성형 AI는 대규모 언어모델(LLM)을 기반으로 텍스트, 이미지, 코드 등을 새롭게 생성하는 기술입니다. 기존 검색이 정보를 찾아주는 것이라면, 생성형 AI는 맥락을 이해해 새로운 결과물을 만들어냅니다."),
            ("좋은 프롬프트 작성법", "좋은 프롬프트는 역할, 맥락, 목표, 출력 형식을 명확히 담습니다. 예를 들어 '보고서 요약해줘' 보다 '다음 보고서를 임원 대상 3줄 요약으로, 숫자 중심으로 정리해줘'가 훨씬 정확한 결과를 만듭니다."),
            ("사내 문서 초안 작성 실습", "회의록, 이메일, 보고서 초안 작성 시 생성형 AI를 활용하면 초안 작성 시간을 크게 줄일 수 있습니다. 다만 사실 확인과 최종 검수는 반드시 사람이 수행해야 합니다."),
        ],
    },
    {
        "title": "데이터 리터러시 기초",
        "category": "IT/디지털",
        "difficulty": 2,
        "duration_minutes": 55,
        "tags": ["데이터", "디지털역량", "AI"],
        "description": "데이터를 읽고 해석하여 업무 의사결정에 활용하는 기초 역량을 기릅니다.",
        "lessons": [
            ("데이터와 정보의 차이", "데이터는 가공되지 않은 사실의 나열이고, 정보는 데이터를 맥락 속에서 해석하여 의미를 부여한 것입니다. 좋은 의사결정은 데이터가 아니라 정보에 기반합니다."),
            ("평균의 함정", "평균만 보면 데이터의 분포를 놓칠 수 있습니다. 극단값이 있는 경우 중앙값이나 분산을 함께 확인해야 실제 상황을 왜곡 없이 파악할 수 있습니다."),
        ],
    },
    {
        "title": "사내 정보보호와 개인정보보호법",
        "category": "컴플라이언스",
        "difficulty": 1,
        "duration_minutes": 40,
        "tags": ["컴플라이언스", "정보보호", "법규"],
        "description": "임직원이 반드시 알아야 할 정보보호 원칙과 개인정보보호법 핵심 조항을 학습합니다.",
        "lessons": [
            ("개인정보 처리 3원칙", "개인정보는 수집 목적 범위 내에서만 이용해야 하며, 최소한의 정보만 수집하고, 이용 목적이 달성되면 지체 없이 파기해야 합니다."),
            ("사내 정보 유출 사고 사례", "이메일 오발송, USB 분실, 클라우드 공유 설정 오류가 대표적인 정보 유출 경로입니다. 외부 공유 전에는 반드시 수신자와 권한 범위를 재확인해야 합니다."),
        ],
    },
    {
        "title": "직장 내 괴롭힘 예방과 대응",
        "category": "컴플라이언스",
        "difficulty": 1,
        "duration_minutes": 30,
        "tags": ["컴플라이언스", "조직문화", "법규"],
        "description": "직장 내 괴롭힘의 정의와 판단 기준, 발생 시 대응 절차를 안내합니다.",
        "lessons": [
            ("괴롭힘의 법적 정의", "직장 내 괴롭힘은 지위 또는 관계상의 우위를 이용해 업무상 적정 범위를 넘어 신체적·정신적 고통을 주거나 근무 환경을 악화시키는 행위로 정의됩니다."),
            ("신고 및 처리 절차", "피해 사실을 인지하면 사내 신고 채널을 통해 접수하고, 회사는 사실관계 조사 기간 동안 피해자와 가해자를 분리하는 조치를 취해야 합니다."),
        ],
    },
    {
        "title": "논리적 글쓰기와 보고서 작성",
        "category": "커뮤니케이션",
        "difficulty": 1,
        "duration_minutes": 45,
        "tags": ["커뮤니케이션", "글쓰기", "보고스킬"],
        "description": "결론부터 말하는 두괄식 보고서 작성법과 논리 구조화 방법을 학습합니다.",
        "lessons": [
            ("두괄식 글쓰기", "보고서는 결론-근거-상세 순으로 작성해야 바쁜 의사결정권자가 빠르게 핵심을 파악할 수 있습니다. 배경 설명을 먼저 나열하는 습관은 가장 흔한 실수입니다."),
            ("피라미드 구조화", "피라미드 원칙은 하나의 핵심 메시지 아래 이를 뒷받침하는 근거를 3개 내외로 그룹화하는 논리 구조화 기법입니다."),
        ],
    },
    {
        "title": "설득력 있는 프레젠테이션",
        "category": "커뮤니케이션",
        "difficulty": 2,
        "duration_minutes": 50,
        "tags": ["커뮤니케이션", "프레젠테이션", "보고스킬"],
        "description": "청중의 관심을 끌고 설득하는 발표 구성과 전달 기법을 다룹니다.",
        "lessons": [
            ("청중 분석", "발표 전 청중이 무엇을 궁금해하고 어떤 결정을 내려야 하는지 파악하면 메시지의 우선순위를 정할 수 있습니다."),
            ("스토리텔링 구조", "문제-해결-효과의 3단 구조는 청중이 메시지를 기억하기 쉽게 만드는 가장 기본적인 스토리텔링 틀입니다."),
        ],
    },
    {
        "title": "재무제표 읽는 법",
        "category": "직무역량",
        "difficulty": 2,
        "duration_minutes": 60,
        "tags": ["재무", "직무역량", "데이터"],
        "description": "비재무 직군을 위한 재무제표 기본 구조와 핵심 지표 해석법을 다룹니다.",
        "lessons": [
            ("재무상태표의 구조", "재무상태표는 자산, 부채, 자본으로 구성되며 특정 시점의 재무 상태를 보여줍니다. 자산은 부채와 자본의 합과 항상 일치합니다."),
            ("손익계산서 핵심 지표", "매출총이익, 영업이익, 당기순이익은 각각 다른 단계의 수익성을 보여줍니다. 영업이익이 감소하는데 매출총이익이 늘었다면 판관비 증가를 의심해야 합니다."),
        ],
    },
    {
        "title": "프로젝트 관리 실무",
        "category": "직무역량",
        "difficulty": 2,
        "duration_minutes": 55,
        "tags": ["직무역량", "프로젝트관리", "조직관리"],
        "description": "일정, 범위, 리스크를 관리하는 프로젝트 관리의 기본 도구와 방법을 학습합니다.",
        "lessons": [
            ("WBS 작성법", "작업분류체계(WBS)는 프로젝트 범위를 관리 가능한 작은 단위로 쪼개는 도구로, 일정과 담당자를 명확히 배정하는 기반이 됩니다."),
            ("리스크 관리 프로세스", "리스크는 발생 가능성과 영향도로 우선순위를 매기고, 사전에 대응 계획을 수립해두어야 실제 발생 시 신속하게 대응할 수 있습니다."),
        ],
    },
    {
        "title": "신입사원 온보딩: 회사 이해하기",
        "category": "온보딩",
        "difficulty": 1,
        "duration_minutes": 35,
        "tags": ["온보딩", "조직문화"],
        "description": "신입사원이 회사의 비전, 조직 구조, 핵심 제도를 빠르게 이해하도록 돕습니다.",
        "lessons": [
            ("회사 비전과 핵심가치", "회사의 비전은 우리가 나아가야 할 방향을, 핵심가치는 그 과정에서 지켜야 할 판단 기준을 제시합니다."),
            ("사내 주요 제도 안내", "휴가, 복지, 교육 지원 제도를 이해하면 회사 생활에 필요한 자원을 적시에 활용할 수 있습니다."),
        ],
    },
    {
        "title": "고급 리더를 위한 조직문화 설계",
        "category": "리더십",
        "difficulty": 3,
        "duration_minutes": 70,
        "tags": ["리더십", "조직문화", "조직관리"],
        "description": "임원/상위 리더를 위한 조직문화 진단과 변화관리 전략을 다룹니다.",
        "lessons": [
            ("조직문화 진단 프레임워크", "조직문화는 눈에 보이는 제도뿐 아니라 암묵적 규범과 가정으로 구성됩니다. 진단 시에는 구성원 인터뷰와 서베이를 병행해야 실제 문화를 파악할 수 있습니다."),
            ("변화관리 8단계", "코터의 변화관리 8단계 모델은 위기감 조성부터 시작해 변화를 조직문화에 정착시키는 것으로 마무리됩니다."),
        ],
    },
]

LEARNERS = [
    ("김민준", "영업기획팀", "팀장", 3),
    ("이서연", "인사팀", "사원", 1),
    ("박지훈", "IT개발팀", "대리", 2),
    ("최수아", "마케팅팀", "과장", 2),
    ("정우진", "재무팀", "사원", 1),
    ("한지민", "영업기획팀", "사원", 1),
    ("오세훈", "IT개발팀", "팀장", 3),
    ("강예린", "고객지원팀", "대리", 2),
    ("윤도현", "마케팅팀", "사원", 1),
    ("임하은", "인사팀", "과장", 2),
]


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    tag_cache = {}

    def get_tag(name):
        if name not in tag_cache:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
            tag_cache[name] = tag
        return tag_cache[name]

    courses = []
    for c in COURSES:
        course = Course(
            title=c["title"],
            category=c["category"],
            difficulty=c["difficulty"],
            duration_minutes=c["duration_minutes"],
            description=c["description"],
        )
        course.tags = [get_tag(t) for t in c["tags"]]
        db.add(course)
        db.flush()
        for idx, (ltitle, content) in enumerate(c["lessons"]):
            db.add(Lesson(course_id=course.id, title=ltitle, content=content, order_index=idx))
        courses.append(course)
    db.flush()

    learners = []
    for name, dept, position, level in LEARNERS:
        learner = Learner(name=name, department=dept, position=position, level=level)
        db.add(learner)
        learners.append(learner)
    db.flush()

    now = datetime.datetime.utcnow()
    for learner in learners:
        # 레벨에 맞는 난이도 위주로 3~5개 강의 수강 이력 생성
        candidates = [c for c in courses if abs(c.difficulty - learner.level) <= 1]
        n = random.randint(3, 5)
        chosen = random.sample(candidates, min(n, len(candidates)))
        for course in chosen:
            enrolled_at = now - datetime.timedelta(days=random.randint(5, 90))
            enrollment = Enrollment(learner_id=learner.id, course_id=course.id, enrolled_at=enrolled_at)
            db.add(enrollment)
            db.flush()
            lessons = course.lessons
            n_done = random.randint(0, len(lessons))
            for i, lesson in enumerate(lessons):
                completed = i < n_done
                db.add(
                    LessonProgress(
                        enrollment_id=enrollment.id,
                        lesson_id=lesson.id,
                        completed=completed,
                        completed_at=enrolled_at + datetime.timedelta(days=i + 1) if completed else None,
                    )
                )
            if n_done == len(lessons) and len(lessons) > 0:
                enrollment.status = EnrollmentStatus.COMPLETED
                enrollment.completed_at = enrolled_at + datetime.timedelta(days=len(lessons) + 1)
                enrollment.quiz_score = round(random.uniform(65, 100), 1)
            else:
                enrollment.status = EnrollmentStatus.IN_PROGRESS

    db.commit()
    db.close()
    print(f"시드 완료: 강의 {len(courses)}개, 학습자 {len(learners)}명")


if __name__ == "__main__":
    seed()
