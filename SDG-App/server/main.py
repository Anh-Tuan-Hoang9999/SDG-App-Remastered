import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

load_dotenv()

from api import auth, sdgs, quiz, card_sort, reflections, progress, discussion, coordinator
from db.database import engine, Base
import models  # noqa: F401 — registers all models on Base.metadata


def _ensure_sqlite_user_profile_columns() -> None:
    if engine.url.get_backend_name() != "sqlite":
        return

    with engine.begin() as conn:
        existing_cols = {
            row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()
        }
        if "description" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN description TEXT"))
        if "course_code" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN course_code VARCHAR(50)"))
        if "avatar_url" not in existing_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url TEXT"))


# Auto-create all tables on startup
Base.metadata.create_all(bind=engine)
_ensure_sqlite_user_profile_columns()

app = FastAPI(title="SDG App API", version="2.0.0")

# CORS — allow local dev origins; extend via EXTRA_ORIGINS env var
_extra_origins = [o.strip() for o in os.getenv("EXTRA_ORIGINS", "").split(",") if o.strip()]
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
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
