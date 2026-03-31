import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from api import auth, sdgs, quiz, card_sort, reflections, progress, discussion, coordinator
from db.database import engine, Base
import models  # noqa: F401 — registers all models on Base.metadata

# Auto-create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SDG App API", version="2.0.0")

# CORS — allow local dev origins; extend via EXTRA_ORIGINS env var
_extra_origins = [o.strip() for o in os.getenv("EXTRA_ORIGINS", "").split(",") if o.strip()]
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sdgs.router)
app.include_router(quiz.router)
app.include_router(card_sort.router)
app.include_router(reflections.router)
app.include_router(progress.router)
app.include_router(discussion.router)
app.include_router(coordinator.router)


@app.get("/")
def root():
    return {"message": "SDG App API v2"}
