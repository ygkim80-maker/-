from typing import Optional
from pydantic import BaseModel


class TutorQuestion(BaseModel):
    question: str
    course_id: Optional[int] = None
    learner_id: Optional[int] = None


class TutorAnswer(BaseModel):
    answer: str
    source: str  # "llm" | "retrieval"
    citations: list[str] = []


class RecommendationItem(BaseModel):
    course_id: int
    title: str
    category: str
    difficulty: int
    score: float
    reasons: list[str]
