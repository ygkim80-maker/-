import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import pages, api

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lms.db")

app = FastAPI(title="사내 AI 학습 플랫폼 (휴넷 벤치마킹 프로토타입)")


@app.on_event("startup")
def on_startup():
    if not os.path.exists(DB_PATH):
        from app.seed_data import seed

        Base.metadata.create_all(bind=engine)
        seed()
    else:
        Base.metadata.create_all(bind=engine)


app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")
app.include_router(pages.router)
app.include_router(api.router, prefix="/api")
