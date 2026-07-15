import datetime
import os
from collections import Counter

from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Learner, Course, Lesson, Enrollment, LessonProgress, EnrollmentStatus
from app.recommender import recommend_courses
from app.charts import bar_chart, line_chart

router = APIRouter()
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"))


def get_current_learner(request: Request, db: Session) -> Learner | None:
    learner_id = request.cookies.get("learner_id")
    if not learner_id:
        return None
    return db.get(Learner, int(learner_id))


def render(request, name, db, **ctx):
    ctx["request"] = request
    ctx["current_learner"] = get_current_learner(request, db)
    return templates.TemplateResponse(name, ctx)


@router.get("/")
def index():
    return RedirectResponse("/courses")


@router.get("/learners")
def learners_page(request: Request, db: Session = Depends(get_db)):
    learners = db.query(Learner).order_by(Learner.department, Learner.name).all()
    return render(request, "learners.html", db, learners=learners, active="learners")


@router.post("/learners/select")
def select_learner(learner_id: int = Form(...)):
    resp = RedirectResponse("/courses", status_code=303)
    resp.set_cookie("learner_id", str(learner_id), max_age=60 * 60 * 24 * 30)
    return resp


@router.get("/courses")
def courses_page(request: Request, db: Session = Depends(get_db), category: str | None = None):
    query = db.query(Course)
    if category:
        query = query.filter(Course.category == category)
    courses = query.order_by(Course.category, Course.title).all()
    categories = [c[0] for c in db.query(Course.category).distinct().order_by(Course.category).all()]

    learner = get_current_learner(request, db)
    enrollment_map = {}
    if learner:
        for e in learner.enrollments:
            enrollment_map[e.course_id] = e

    return render(
        request, "courses.html", db,
        courses=courses, categories=categories, active_category=category,
        enrollment_map=enrollment_map, active="courses",
    )


@router.get("/courses/{course_id}")
def course_detail(course_id: int, request: Request, db: Session = Depends(get_db)):
    course = db.get(Course, course_id)
    learner = get_current_learner(request, db)
    enrollment = None
    progress_by_lesson = {}
    if learner:
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.learner_id == learner.id, Enrollment.course_id == course_id)
            .first()
        )
        if enrollment:
            progress_by_lesson = {p.lesson_id: p for p in enrollment.lesson_progress}

    return render(
        request, "course_detail.html", db,
        course=course, enrollment=enrollment, progress_by_lesson=progress_by_lesson,
        active="courses",
    )


@router.post("/courses/{course_id}/enroll")
def enroll_course(course_id: int, request: Request, db: Session = Depends(get_db)):
    learner = get_current_learner(request, db)
    if not learner:
        return RedirectResponse("/learners", status_code=303)

    existing = (
        db.query(Enrollment)
        .filter(Enrollment.learner_id == learner.id, Enrollment.course_id == course_id)
        .first()
    )
    if not existing:
        course = db.get(Course, course_id)
        enrollment = Enrollment(learner_id=learner.id, course_id=course_id)
        db.add(enrollment)
        db.flush()
        for lesson in course.lessons:
            db.add(LessonProgress(enrollment_id=enrollment.id, lesson_id=lesson.id, completed=False))
        db.commit()
    return RedirectResponse(f"/courses/{course_id}", status_code=303)


@router.post("/lessons/{lesson_id}/toggle")
def toggle_lesson(lesson_id: int, request: Request, db: Session = Depends(get_db)):
    learner = get_current_learner(request, db)
    lesson = db.get(Lesson, lesson_id)
    if not learner or not lesson:
        return RedirectResponse("/learners", status_code=303)

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.learner_id == learner.id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    if enrollment:
        progress = (
            db.query(LessonProgress)
            .filter(LessonProgress.enrollment_id == enrollment.id, LessonProgress.lesson_id == lesson_id)
            .first()
        )
        if progress:
            progress.completed = not progress.completed
            progress.completed_at = datetime.datetime.utcnow() if progress.completed else None
            db.flush()

        total = len(enrollment.course.lessons)
        done = sum(1 for p in enrollment.lesson_progress if p.completed)
        if total > 0 and done == total:
            enrollment.status = EnrollmentStatus.COMPLETED
            enrollment.completed_at = enrollment.completed_at or datetime.datetime.utcnow()
        else:
            enrollment.status = EnrollmentStatus.IN_PROGRESS
            enrollment.completed_at = None
        db.commit()

    return RedirectResponse(f"/courses/{lesson.course_id}", status_code=303)


@router.get("/recommendations")
def recommendations_page(request: Request, db: Session = Depends(get_db)):
    learner = get_current_learner(request, db)
    if not learner:
        return RedirectResponse("/learners", status_code=303)
    recs = recommend_courses(db, learner.id, top_n=5)
    return render(request, "recommendations.html", db, recs=recs, active="recommend")


@router.get("/tutor")
def tutor_page(request: Request, db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.title).all()
    return render(request, "tutor.html", db, courses=courses, active="tutor")


@router.get("/dashboard")
def dashboard_page(request: Request, db: Session = Depends(get_db)):
    learners = db.query(Learner).all()
    courses = db.query(Course).all()
    enrollments = db.query(Enrollment).all()

    total_learners = len(learners)
    total_courses = len(courses)
    total_enrollments = len(enrollments)
    completed = [e for e in enrollments if e.status == EnrollmentStatus.COMPLETED]
    completion_rate = round(len(completed) / total_enrollments * 100) if total_enrollments else 0
    quiz_scores = [e.quiz_score for e in completed if e.quiz_score is not None]
    avg_quiz = round(sum(quiz_scores) / len(quiz_scores), 1) if quiz_scores else 0

    # 카테고리별 강좌 수
    cat_counts = Counter(c.category for c in courses)
    cat_labels = sorted(cat_counts)
    cat_course_chart = bar_chart(cat_labels, [cat_counts[c] for c in cat_labels], unit="개")

    # 카테고리별 수료율
    cat_total = Counter(e.course.category for e in enrollments)
    cat_done = Counter(e.course.category for e in completed)
    rate_labels = sorted(cat_total)
    rate_values = [
        round(cat_done.get(c, 0) / cat_total[c] * 100) if cat_total[c] else 0 for c in rate_labels
    ]
    completion_chart = bar_chart(rate_labels, rate_values, unit="%")

    # 학습자 레벨 분포
    level_counts = Counter(l.level_label for l in learners)
    level_labels = ["초급", "중급", "고급"]
    level_chart = bar_chart(level_labels, [level_counts.get(l, 0) for l in level_labels], unit="명")

    # 최근 8주 수료 추이
    now = datetime.datetime.utcnow()
    week_labels = []
    week_values = []
    for i in range(7, -1, -1):
        start = now - datetime.timedelta(weeks=i + 1)
        end = now - datetime.timedelta(weeks=i)
        count = sum(1 for e in completed if e.completed_at and start <= e.completed_at < end)
        week_labels.append(f"-{i}주")
        week_values.append(count)
    trend_chart = line_chart(week_labels, week_values, unit="건")

    return render(
        request, "dashboard.html", db,
        total_learners=total_learners, total_courses=total_courses,
        total_enrollments=total_enrollments, completion_rate=completion_rate, avg_quiz=avg_quiz,
        cat_course_chart=cat_course_chart, completion_chart=completion_chart,
        level_chart=level_chart, trend_chart=trend_chart,
        cat_labels=cat_labels, cat_counts=cat_counts,
        rate_labels=rate_labels, rate_values=rate_values,
        level_labels=level_labels, level_counts=level_counts,
        week_labels=week_labels, week_values=week_values,
        active="dashboard",
    )
