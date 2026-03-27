import os
from dotenv import load_dotenv
from fastapi import FastAPI

_server_dir = os.path.dirname(__file__)
load_dotenv(os.path.join(_server_dir, ".env"))
from fastapi.middleware.cors import CORSMiddleware
from api import users, activities, user_activity
from db.database import engine, Base
import models  # noqa: F401 - registers all models on Base.metadata

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS origins — always allow localhost for desktop dev.
# Set EXTRA_ORIGINS in .env as a comma-separated list to add more origins
# (e.g. your LAN IP when testing on a phone).
_extra = os.environ.get("EXTRA_ORIGINS", "")
_extra_origins = [o.strip() for o in _extra.split(",") if o.strip()]
allowed_origins = ["http://localhost:5173"] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(activities.router)
app.include_router(user_activity.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}
