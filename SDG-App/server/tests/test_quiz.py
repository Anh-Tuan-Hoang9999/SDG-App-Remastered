"""Tests for /api/quiz/* endpoints."""
from uuid import uuid4
from models.sdg import SDG
from models.quiz_question import QuizQuestion


def seed_question(db):
    sdg = SDG(number=3, title="Good Health", description="Health for all.", color="#4C9F38")
    db.add(sdg)
    db.flush()
    q = QuizQuestion(
        sdg_number=3,
        question_text="What does SDG 3 promote?",
        option_a="War", option_b="Good health", option_c="Poverty", option_d="Hunger",
        correct_option="b",
        explanation="SDG 3 is about good health.",
        fun_facts="Fun fact here.",
    )
    db.add(q)
    db.commit()
    return q


def make_user(client):
    uid = uuid4().hex[:8]
    email = f"quiz_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"User {uid}", "email": email, "password": "Pass@1234"})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    return client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()["id"]


def test_get_questions_empty(client):
    r = client.get("/api/quiz/questions")
    assert r.status_code == 200
    assert r.json() == []


def test_get_questions_returns_seeded(client, db):
    seed_question(db)
    r = client.get("/api/quiz/questions")
    assert r.status_code == 200
    assert len(r.json()) == 1
    q = r.json()[0]
    assert q["question_text"] == "What does SDG 3 promote?"
    assert q["correct_option"] == "b"


def test_submit_quiz_creates_result(client):
    user_id = make_user(client)
    r = client.post("/api/quiz/submit", json={
        "user_id": user_id, "score": 8, "total": 10,
        "answers_json": [{"question_id": 1, "chosen": "b", "correct": "b"}],
    })
    assert r.status_code == 201
    data = r.json()
    assert data["score"]   == 8
    assert data["total"]   == 10
    assert data["user_id"] == user_id


def test_get_quiz_result_returns_latest(client, db):
    # Need an SDG so the FK on quiz_questions is satisfied, but for results we only need a user
    user_id = make_user(client)
    client.post("/api/quiz/submit", json={"user_id": user_id, "score": 5, "total": 10})
    client.post("/api/quiz/submit", json={"user_id": user_id, "score": 9, "total": 10})
    r = client.get(f"/api/quiz/result/{user_id}")
    assert r.status_code == 200
    assert r.json()["score"] == 9   # most recent


def test_get_quiz_result_not_found(client):
    r = client.get("/api/quiz/result/9999")
    assert r.status_code == 404
