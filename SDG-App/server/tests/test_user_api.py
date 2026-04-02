"""API-level tests for /api/auth/* endpoints."""
from uuid import uuid4


def fresh_user(role="student"):
    uid = uuid4().hex[:8]
    return {"name": f"User {uid}", "email": f"user_{uid}@trentu.ca", "password": "Pass@1234", "role": role}


def register(client, user=None):
    if user is None:
        user = fresh_user()
    return user, client.post("/api/auth/register", json=user)


def login(client, email, password="Pass@1234"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# --- Register ---

def test_register_success(client):
    user, r = register(client)
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == user["email"]
    assert data["name"]  == user["name"]
    assert data["role"]  == "student"
    assert "id" in data
    assert "password_hash" not in data


def test_register_duplicate_email_returns_400(client):
    user = fresh_user()
    _, first  = register(client, user)
    _, second = register(client, user)
    assert first.status_code  == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "Email already registered"


def test_register_invalid_role_returns_400(client):
    user = fresh_user()
    user["role"] = "admin"
    _, r = register(client, user)
    assert r.status_code == 400


def test_register_coordinator_role(client):
    user = fresh_user(role="coordinator")
    _, r = register(client, user)
    assert r.status_code == 201
    assert r.json()["role"] == "coordinator"


# --- Login ---

def test_login_success_returns_bearer_token(client):
    user, _ = register(client)
    r = login(client, user["email"])
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert r.json()["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client):
    user, _ = register(client)
    r = login(client, user["email"], "WrongPass!")
    assert r.status_code == 401


def test_login_unknown_email_returns_401(client):
    r = login(client, "nobody@trentu.ca")
    assert r.status_code == 401


# --- Logout ---

def test_logout_returns_200(client):
    r = client.post("/api/auth/logout")
    assert r.status_code == 200


# --- GET /me ---

def test_me_returns_current_user(client):
    user, _ = register(client)
    token = login(client, user["email"]).json()["access_token"]
    r = client.get("/api/auth/me", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["email"] == user["email"]


def test_me_without_token_returns_401(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 401


# --- PATCH /me ---

def test_patch_me_updates_name(client):
    user, _ = register(client)
    token = login(client, user["email"]).json()["access_token"]
    r = client.patch("/api/auth/me", json={"name": "New Name"}, headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["name"] == "New Name"


def test_patch_me_without_token_returns_401(client):
    r = client.patch("/api/auth/me", json={"name": "X"})
    assert r.status_code == 401
