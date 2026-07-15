"""콘텐츠 기반 태그 유사도 + 동료 인기도 + 난이도 적합도를 결합한 학습 추천 엔진.

휴넷 등 상용 AI 학습 솔루션의 '개인 맞춤 추천'을 단순화하여 재현한 버전입니다.
외부 임베딩/모델 호출 없이도 즉시 동작하도록 규칙 기반으로 구현했습니다.
"""
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.models import Learner, Course, Enrollment, EnrollmentStatus

WEIGHT_TAG = 0.5
WEIGHT_POPULARITY = 0.3
WEIGHT_DIFFICULTY = 0.2


@dataclass
class Recommendation:
    course: Course
    score: float
    reasons: list = field(default_factory=list)


def _build_tag_profile(learner: Learner) -> dict:
    profile: dict[str, float] = {}
    for enrollment in learner.enrollments:
        if enrollment.status == EnrollmentStatus.COMPLETED:
            weight = 1.0
        else:
            weight = 0.4 * (enrollment.progress_percent / 100)
        for tag in enrollment.course.tag_names:
            profile[tag] = profile.get(tag, 0.0) + weight
    return profile


def _normalize(values: dict) -> dict:
    if not values:
        return values
    lo, hi = min(values.values()), max(values.values())
    if hi == lo:
        return {k: 0.5 for k in values}
    return {k: (v - lo) / (hi - lo) for k, v in values.items()}


def recommend_courses(db: Session, learner_id: int, top_n: int = 5) -> list[Recommendation]:
    learner = db.get(Learner, learner_id)
    if learner is None:
        return []

    enrolled_ids = {e.course_id for e in learner.enrollments}
    profile = _build_tag_profile(learner)

    all_courses = db.query(Course).all()
    candidates = [c for c in all_courses if c.id not in enrolled_ids]
    if not candidates:
        return []

    # 동료(같은 레벨) 학습자 수 및 강좌별 수강 인원
    peers = db.query(Learner).filter(Learner.level == learner.level).all()
    peer_ids = {p.id for p in peers} or {learner.id}
    peer_enroll_count: dict[int, int] = {}
    for enrollment in db.query(Enrollment).filter(Enrollment.learner_id.in_(peer_ids)).all():
        peer_enroll_count[enrollment.course_id] = peer_enroll_count.get(enrollment.course_id, 0) + 1

    raw_tag_scores = {}
    raw_popularity = {}
    difficulty_fit = {}
    for course in candidates:
        tags = course.tag_names
        raw_tag_scores[course.id] = (
            sum(profile.get(t, 0.0) for t in tags) / len(tags) if tags else 0.0
        )
        raw_popularity[course.id] = peer_enroll_count.get(course.id, 0) / len(peer_ids)
        difficulty_fit[course.id] = 1 - abs(course.difficulty - learner.level) / 2

    tag_norm = _normalize(raw_tag_scores)
    pop_norm = _normalize(raw_popularity)

    results = []
    for course in candidates:
        tag_score = tag_norm.get(course.id, 0.0)
        pop_score = pop_norm.get(course.id, 0.0)
        diff_score = difficulty_fit[course.id]
        final = (
            WEIGHT_TAG * tag_score
            + WEIGHT_POPULARITY * pop_score
            + WEIGHT_DIFFICULTY * diff_score
        )

        reasons = []
        matched_tags = [t for t in course.tag_names if profile.get(t, 0) > 0]
        if matched_tags:
            reasons.append(f"관심 분야와 일치: {', '.join(matched_tags)}")
        if raw_popularity[course.id] >= 0.3:
            pct = round(raw_popularity[course.id] * 100)
            reasons.append(f"동료 학습자의 {pct}%가 수강 중인 인기 강좌")
        if course.difficulty == learner.level:
            reasons.append(f"현재 '{learner.level_label}' 레벨에 적합한 난이도")
        if not reasons:
            reasons.append("새로운 분야를 탐색해보세요")

        results.append(Recommendation(course=course, score=round(final, 3), reasons=reasons))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_n]
