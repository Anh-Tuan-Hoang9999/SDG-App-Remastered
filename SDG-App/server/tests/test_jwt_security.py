"""Security-focused tests: token validity, tampered tokens, nonexistent users."""
from uuid import uuid4

import auth
from jose import jwt


PASSWORD = "MyPassword@123"


def fresh_user():
    uid = uuid4().hex[:8]
    return {"name": f"Sec {uid}", "email": f"sec_{uid}@trentu.ca", "password": PASSWORD}


def register_and_login(client):
    user = fresh_user()
    client.post("/api/auth/register", json=user)
    r = client.post("/api/auth/login", json={"email": user["email"], "password": PASSWORD})
    return user, r.json()["access_token"]


def test_access_token_contains_expected_claims(client):
    _, token = register_and_login(client)
    payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
    assert "sub" in payload
    assert "exp" in payload


def test_me_rejects_token_for_nonexistent_user(client):
    fake_email = f"ghost_{uuid4().hex}@trentu.ca"
    token = auth.create_access_token({"sub": fake_email})
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


def test_me_rejects_malformed_token(client):
    r = client.get("/api/auth/me", headers={"Authorization": "Bearer not.a.token"})
    assert r.status_code == 401


def test_me_rejects_empty_bearer(client):
    r = client.get("/api/auth/me", headers={"Authorization": "Bearer "})
    assert r.status_code == 401


def test_coordinator_endpoint_rejects_student_token(client):
    _, token = register_and_login(client)
    r = client.get("/api/coordinator/students", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
