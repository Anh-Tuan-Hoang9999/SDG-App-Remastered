import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env then .env.local (local overrides) from the server directory
_server_dir = os.path.join(os.path.dirname(__file__), "..")
load_dotenv(os.path.join(_server_dir, ".env"))
load_dotenv(os.path.join(_server_dir, ".env.local"), override=True)

# --- Database type ---
# DB_TYPE: "sqlite" (default) or "postgresql" / "mysql"
DB_TYPE = os.environ.get("DB_TYPE", "sqlite").lower()

if DB_TYPE == "sqlite":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_NAME = os.environ.get("DB_NAME", "sdg-test.db")
    DB_PATH = os.path.join(BASE_DIR, DB_NAME)
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    connect_args = {"check_same_thread": False}
else:
    # --- SQL database variables ---
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "3306")
    DB_NAME = os.environ.get("DB_NAME", "sdg_db")
    DB_USER = os.environ.get("DB_USER", "")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

    if not DB_USER or not DB_PASSWORD:
        raise EnvironmentError(
            f"DB_USER and DB_PASSWORD must be set when DB_TYPE='{DB_TYPE}'"
        )

    # Map DB_TYPE to the correct SQLAlchemy dialect+driver
    DIALECT_MAP = {
        "mysql": "mysql+pymysql",
        "postgresql": "postgresql+psycopg2",
        "postgres": "postgresql+psycopg2",
    }
    dialect = DIALECT_MAP.get(DB_TYPE, DB_TYPE)

    SQLALCHEMY_DATABASE_URL = (
        f"{dialect}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    connect_args = {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
