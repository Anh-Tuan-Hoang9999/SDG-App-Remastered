from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from models.user import User, UserRole

# use an in-memory sqlite db so we don't touch the real database
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create the users table before each test and drop it after
def setup_function(function):
    User.__table__.create(bind=engine, checkfirst=True)

def teardown_function(function):
    User.__table__.drop(bind=engine, checkfirst=True)

# default user for testing, email and username can be overridden
def make_user(email="student@trentu.ca", username="student1"):
    return User(
        email=email,
        username=username,
        hashed_password="hashed_pw",
        course_code="COIS-4000Y",
    )

# checks that a new user gets the right defaults applied automatically
def test_user_defaults_are_applied():
    db = SessionLocal()
    user = make_user()
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.user_type == UserRole.STUDENT
    assert user.is_active is True
    db.close()

# two users with the same email should not be allowed
def test_duplicate_email_raises_integrity_error():
    db = SessionLocal()
    db.add(make_user(email="same@trentu.ca", username="u1"))
    db.commit()
    db.add(make_user(email="same@trentu.ca", username="u2"))
    try:
        db.commit()
        assert False, "Expected IntegrityError for duplicate email"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()

# two users with the same username should not be allowed
def test_duplicate_username_raises_integrity_error():
    db = SessionLocal()
    db.add(make_user(email="a@trentu.ca", username="sameuser"))
    db.commit()
    db.add(make_user(email="b@trentu.ca", username="sameuser"))
    try:
        db.commit()
        assert False, "Expected IntegrityError for duplicate username"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()

# email is required, saving a user without one should fail
def test_missing_required_email_raises_integrity_error():
    db = SessionLocal()
    user = make_user()
    user.email = None
    db.add(user)
    try:
        db.commit()
        assert False, "Expected IntegrityError for null email"
    except IntegrityError:
        db.rollback()
    finally:
        db.close()