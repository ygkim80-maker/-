from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import TutorQuestion, TutorAnswer
from app.tutor import answer_question

router = APIRouter()


@router.post("/tutor/ask", response_model=TutorAnswer)
def tutor_ask(payload: TutorQuestion, db: Session = Depends(get_db)):
    return answer_question(db, payload.question, payload.course_id)
