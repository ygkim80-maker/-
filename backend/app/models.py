import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Float,
    Boolean,
    Table,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


course_tags = Table(
    "course_tags",
    Base.metadata,
    Column("course_id", Integer, ForeignKey("courses.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class EnrollmentStatus(str, enum.Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Learner(Base):
    __tablename__ = "learners"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    department = Column(String(50), nullable=False)
    position = Column(String(50), nullable=False)
    level = Column(Integer, nullable=False, default=1)  # 1=초급 2=중급 3=고급
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="learner", cascade="all, delete-orphan")

    @property
    def level_label(self):
        return {1: "초급", 2: "중급", 3: "고급"}.get(self.level, "초급")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    courses = relationship("Course", secondary=course_tags, back_populates="tags")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    difficulty = Column(Integer, nullable=False, default=1)  # 1=초급 2=중급 3=고급
    duration_minutes = Column(Integer, nullable=False, default=30)
    description = Column(Text, nullable=False, default="")

    tags = relationship("Tag", secondary=course_tags, back_populates="courses")
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.order_index")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")

    @property
    def tag_names(self):
        return [t.name for t in self.tags]


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False, default="")
    order_index = Column(Integer, nullable=False, default=0)

    course = relationship("Course", back_populates="lessons")
    progress_entries = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("learner_id", "course_id", name="uq_learner_course"),)

    id = Column(Integer, primary_key=True)
    learner_id = Column(Integer, ForeignKey("learners.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    status = Column(Enum(EnrollmentStatus), nullable=False, default=EnrollmentStatus.IN_PROGRESS)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    quiz_score = Column(Float, nullable=True)  # 0-100, set on completion

    learner = relationship("Learner", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")

    @property
    def progress_percent(self):
        total = len(self.course.lessons)
        if total == 0:
            return 0
        done = sum(1 for p in self.lesson_progress if p.completed)
        return round(done / total * 100)


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson"),)

    id = Column(Integer, primary_key=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    enrollment = relationship("Enrollment", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_entries")
