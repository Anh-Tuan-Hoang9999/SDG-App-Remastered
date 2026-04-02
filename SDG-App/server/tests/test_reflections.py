"""Tests for /api/reflections endpoints."""
from uuid import uuid4


def make_user(client):
    uid = uuid4().hex[:8]
    email = f"ref_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"User {uid}", "email": email, "password": "Pass@1234"})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return me["id"]


def reflection_body(user_id):
    return {
        "user_id":             user_id,
        "title":               "My First Reflection",
        "type":                "personal",
        "sdg_numbers":         [1, 3],
        "reflection_text":     "I learned a lot about SDG 1 and 3.",
        "employer_discussion": False,
    }


def test_list_reflections_empty(client):
    user_id = make_user(client)
    r = client.get(f"/api/reflections/{user_id}")
    assert r.status_code == 200
    assert r.json() == []


def test_create_reflection(client):
    user_id = make_user(client)
    r = client.post("/api/reflections", json=reflection_body(user_id))
    assert r.status_code == 201
    data = r.json()
    assert data["title"]               == "My First Reflection"
    assert data["type"]                == "personal"
    assert data["sdg_numbers"]         == [1, 3]
    assert data["employer_discussion"] is False


def test_list_reflections_after_create(client):
    user_id = make_user(client)
    client.post("/api/reflections", json=reflection_body(user_id))
    client.post("/api/reflections", json={**reflection_body(user_id), "title": "Second"})
    r = client.get(f"/api/reflections/{user_id}")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_delete_reflection(client):
    user_id = make_user(client)
    created = client.post("/api/reflections", json=reflection_body(user_id)).json()
    r = client.delete(f"/api/reflections/{created['id']}")
    assert r.status_code == 204
    remaining = client.get(f"/api/reflections/{user_id}").json()
    assert remaining == []


def test_delete_nonexistent_reflection_returns_404(client):
    r = client.delete("/api/reflections/9999")
    assert r.status_code == 404


def test_reflections_are_isolated_by_user(client):
    user_a = make_user(client)
    user_b = make_user(client)
    client.post("/api/reflections", json=reflection_body(user_a))
    r = client.get(f"/api/reflections/{user_b}")
    assert r.json() == []
