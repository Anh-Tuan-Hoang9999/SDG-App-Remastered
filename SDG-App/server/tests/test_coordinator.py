"""Tests for /api/coordinator/* endpoints (coordinator-only)."""
from uuid import uuid4


def make_user(client, role="student"):
    uid = uuid4().hex[:8]
    email = f"{role}_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"{role.title()} {uid}", "email": email, "password": "Pass@1234", "role": role})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return me["id"], token


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# --- Access control ---

def test_students_endpoint_requires_coordinator(client):
    _, student_token = make_user(client, role="student")
    r = client.get("/api/coordinator/students", headers=auth(student_token))
    assert r.status_code == 403


def test_reflections_endpoint_requires_coordinator(client):
    _, student_token = make_user(client, role="student")
    r = client.get("/api/coordinator/reflections", headers=auth(student_token))
    assert r.status_code == 403


def test_endpoints_reject_unauthenticated(client):
    assert client.get("/api/coordinator/students").status_code    == 401
    assert client.get("/api/coordinator/reflections").status_code == 401


# --- Students list ---

def test_coordinator_sees_all_students(client):
    _, coord_token = make_user(client, role="coordinator")
    make_user(client, role="student")
    make_user(client, role="student")
    r = client.get("/api/coordinator/students", headers=auth(coord_token))
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_coordinator_not_in_student_list(client):
    _, coord_token = make_user(client, role="coordinator")
    make_user(client, role="student")
    r = client.get("/api/coordinator/students", headers=auth(coord_token))
    for s in r.json():
        assert s["role"] == "student"


def test_student_summary_includes_progress_fields(client):
    _, coord_token = make_user(client, role="coordinator")
    make_user(client, role="student")
    student = client.get("/api/coordinator/students", headers=auth(coord_token)).json()[0]
    assert "completed_card_sort" in student
    assert "completed_quiz"      in student
    assert "reflection_count"    in student


# --- Reflections list ---

def test_coordinator_sees_all_reflections(client):
    _, coord_token = make_user(client, role="coordinator")
    student_id, _ = make_user(client, role="student")
    client.post("/api/reflections", json={
        "user_id": student_id, "title": "R1", "reflection_text": "Text", "employer_discussion": False
    })
    client.post("/api/reflections", json={
        "user_id": student_id, "title": "R2", "reflection_text": "More text", "employer_discussion": True
    })
    r = client.get("/api/coordinator/reflections", headers=auth(coord_token))
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_coordinator_reflections_summary_fields(client):
    _, coord_token = make_user(client, role="coordinator")
    student_id, _ = make_user(client, role="student")
    client.post("/api/reflections", json={
        "user_id": student_id, "title": "Summary Test", "reflection_text": "...", "employer_discussion": True
    })
    item = client.get("/api/coordinator/reflections", headers=auth(coord_token)).json()[0]
    assert "id"                  in item
    assert "user_id"             in item
    assert "title"               in item
    assert "employer_discussion" in item
