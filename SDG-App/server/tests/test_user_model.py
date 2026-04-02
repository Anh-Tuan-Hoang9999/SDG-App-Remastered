"""Direct model-layer tests for the User model."""
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from db.database import Base
from models.user import User

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)


def setup_function():
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def make_user(name="Alice", email="alice@trentu.ca"):
    return User(name=name, email=email, password_hash="hashed_pw", role="student")


def test_user_defaults_are_applied():
    db = Session()
    user = make_user()
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.role == "student"
    assert user.id is not None
    db.close()


def test_duplicate_email_raises_integrity_error():
    db = Session()
    db.add(make_user(name="Alice", email="same@trentu.ca"))
    db.commit()
    db.add(make_user(name="Bob", email="same@trentu.ca"))
    try:
        db.commit()
        assert False, "Expected IntegrityError"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()


def test_missing_email_raises_integrity_error():
    db = Session()
    user = make_user()
    user.email = None
    db.add(user)
    try:
        db.commit()
        assert False, "Expected IntegrityError"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()


def test_missing_name_raises_integrity_error():
    db = Session()
    user = make_user()
    user.name = None
    db.add(user)
    try:
        db.commit()
        assert False, "Expected IntegrityError"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()
