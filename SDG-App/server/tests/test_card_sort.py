"""Tests for /api/card-sort endpoints."""
from uuid import uuid4


def make_user(client):
    uid = uuid4().hex[:8]
    email = f"cs_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"User {uid}", "email": email, "password": "Pass@1234"})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return me["id"]


SORT_BODY = {
    "most_relevant":     [1, 2, 3],
    "somewhat_relevant": [4, 5, 6],
    "least_relevant":    [7, 8, 9],
}


def test_get_card_sort_not_found(client):
    r = client.get("/api/card-sort/9999")
    assert r.status_code == 404


def test_save_card_sort(client):
    user_id = make_user(client)
    r = client.post("/api/card-sort", json={"user_id": user_id, **SORT_BODY})
    assert r.status_code == 201
    data = r.json()
    assert data["user_id"]           == user_id
    assert data["most_relevant"]     == [1, 2, 3]
    assert data["somewhat_relevant"] == [4, 5, 6]
    assert data["least_relevant"]    == [7, 8, 9]


def test_get_card_sort_after_save(client):
    user_id = make_user(client)
    client.post("/api/card-sort", json={"user_id": user_id, **SORT_BODY})
    r = client.get(f"/api/card-sort/{user_id}")
    assert r.status_code == 200
    assert r.json()["most_relevant"] == [1, 2, 3]


def test_save_card_sort_upserts(client):
    user_id = make_user(client)
    client.post("/api/card-sort", json={"user_id": user_id, **SORT_BODY})
    updated = {**SORT_BODY, "most_relevant": [17, 16, 15]}
    client.post("/api/card-sort", json={"user_id": user_id, **updated})
    r = client.get(f"/api/card-sort/{user_id}")
    assert r.json()["most_relevant"] == [17, 16, 15]


def test_save_card_sort_partial_fields(client):
    user_id = make_user(client)
    r = client.post("/api/card-sort", json={"user_id": user_id, "most_relevant": [1, 2]})
    assert r.status_code == 201
    assert r.json()["somewhat_relevant"] is None
