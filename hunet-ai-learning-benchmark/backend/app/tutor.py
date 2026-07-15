"""AI 학습 튜터: 강의 콘텐츠 검색(retrieval) + (가능하면) LLM 답변 생성.

ANTHROPIC_API_KEY 환경변수가 설정되어 있으면 검색된 강의 발췌를 근거로
Claude가 답변을 생성합니다(RAG-lite). 키가 없거나 호출이 실패하면 검색된
발췌를 그대로 보여주는 추출식(extractive) 답변으로 자동 폴백합니다.
네트워크/키 없이도 항상 응답 가능해야 하는 사내 프로토타입 요구사항 때문입니다.
"""
import os
import re
from sqlalchemy.orm import Session

from app.models import Lesson
from app.schemas import TutorAnswer

STOPWORDS = {"무엇", "어떻게", "왜", "그리고", "그러나", "있나요", "인가요", "설명", "알려주세요", "대해"}


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[가-힣A-Za-z0-9]+", text)
    return [t for t in tokens if len(t) >= 2 and t not in STOPWORDS]


def _retrieve(db: Session, question: str, course_id: int | None, top_k: int = 3):
    query = db.query(Lesson)
    if course_id:
        query = query.filter(Lesson.course_id == course_id)
    lessons = query.all()

    q_tokens = _tokenize(question)
    scored = []
    for lesson in lessons:
        haystack = f"{lesson.title} {lesson.content}"
        score = sum(haystack.count(tok) for tok in q_tokens)
        if score > 0:
            scored.append((lesson, score))
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:top_k]


def _call_llm(question: str, context_text: str) -> str | None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-5",
            max_tokens=600,
            system=(
                "당신은 사내 교육 플랫폼의 AI 학습 튜터입니다. "
                "주어진 강의 발췌 내용에 근거해서만 한국어로 답변하세요. "
                "발췌에 없는 내용은 추측하지 말고 모른다고 답하세요."
            ),
            messages=[
                {
                    "role": "user",
                    "content": f"[강의 발췌]\n{context_text}\n\n[학습자 질문]\n{question}",
                }
            ],
        )
        return "".join(block.text for block in response.content if block.type == "text").strip()
    except Exception:
        return None


def answer_question(db: Session, question: str, course_id: int | None = None) -> TutorAnswer:
    hits = _retrieve(db, question, course_id)
    if not hits:
        return TutorAnswer(
            answer="관련된 강의 내용을 찾지 못했습니다. 질문을 조금 더 구체적으로 입력하거나 강의를 선택한 뒤 다시 물어봐 주세요.",
            source="retrieval",
            citations=[],
        )

    context_text = "\n\n".join(
        f"[{lesson.course.title} > {lesson.title}]\n{lesson.content}" for lesson, _ in hits
    )
    citations = [f"{lesson.course.title} - {lesson.title}" for lesson, _ in hits]

    llm_answer = _call_llm(question, context_text)
    if llm_answer:
        return TutorAnswer(answer=llm_answer, source="llm", citations=citations)

    top_lesson, _ = hits[0]
    extractive = (
        f"'{top_lesson.title}' 강의 내용을 바탕으로 안내드립니다.\n\n{top_lesson.content}"
    )
    return TutorAnswer(answer=extractive, source="retrieval", citations=citations)
