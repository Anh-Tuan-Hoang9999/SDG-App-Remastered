"""Tests for /api/progress endpoints."""
from datetime import date, timedelta
from uuid import uuid4

from models.user_progress import UserProgress


def make_user(client):
    uid = uuid4().hex[:8]
    email = f"prog_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"User {uid}", "email": email, "password": "Pass@1234"})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return me["id"]


def test_get_progress_auto_creates_record(client):
    user_id = make_user(client)
    r = client.get(f"/api/progress/{user_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"]             == user_id
    assert data["completed_card_sort"] is False
    assert data["completed_quiz"]      is False
    assert data["reflection_count"]    == 0


def test_get_progress_idempotent(client):
    user_id = make_user(client)
    r1 = client.get(f"/api/progress/{user_id}")
    r2 = client.get(f"/api/progress/{user_id}")
    assert r1.json()["id"] == r2.json()["id"]


def test_patch_progress_completed_quiz(client):
    user_id = make_user(client)
    r = client.patch(f"/api/progress/{user_id}", json={"completed_quiz": True})
    assert r.status_code == 200
    assert r.json()["completed_quiz"] is True


def test_patch_progress_viewed_sdg_cards(client):
    user_id = make_user(client)
    r = client.patch(f"/api/progress/{user_id}", json={"viewed_sdg_cards": [1, 2, 3]})
    assert r.status_code == 200
    assert r.json()["viewed_sdg_cards"] == [1, 2, 3]


def test_patch_progress_reflection_count(client):
    user_id = make_user(client)
    client.patch(f"/api/progress/{user_id}", json={"reflection_count": 5})
    r = client.get(f"/api/progress/{user_id}")
    assert r.json()["reflection_count"] == 5


def test_patch_progress_partial_update_preserves_other_fields(client):
    user_id = make_user(client)
    client.patch(f"/api/progress/{user_id}", json={"completed_quiz": True, "reflection_count": 3})
    client.patch(f"/api/progress/{user_id}", json={"completed_card_sort": True})
    r = client.get(f"/api/progress/{user_id}").json()
    assert r["completed_quiz"]      is True   # preserved
    assert r["reflection_count"]    == 3       # preserved
    assert r["completed_card_sort"] is True   # newly set


def test_get_progress_resets_stale_daily_progress(client, db):
    user_id = make_user(client)
    client.patch(
        f"/api/progress/{user_id}",
        json={
            "completed_quiz": True,
            "completed_card_sort": True,
            "viewed_sdg_cards": [1],
            "viewed_resources": ["resources"],
            "reflection_count": 2,
        },
    )

    row = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    row.last_reset_date = (date.today() - timedelta(days=1)).isoformat()
    db.commit()

    r = client.get(f"/api/progress/{user_id}")
    assert r.status_code == 200
    data = r.json()
    assert data["completed_quiz"] is False
    assert data["completed_card_sort"] is False
    assert data["viewed_sdg_cards"] is None
    assert data["viewed_resources"] is None
    assert data["reflection_count"] == 0
    assert data["last_reset_date"] == date.today().isoformat()
