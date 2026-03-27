from uuid import uuid4
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

PASSWORD = "MyPassword@123"

# need unique emails each run so we don't get duplicate errors
def fresh_user():
    uid = uuid4().hex[:8]
    return {
        "email": f"student_{uid}@trentu.ca",
        "username": f"student_{uid}",
        "password": PASSWORD,
        "course_code": "COIS-4000Y",
    }

def register(payload=None):
    if payload is None:
        payload = fresh_user()
    r = client.post("/users/register", json=payload)
    return payload, r

def login(email, password=PASSWORD):
    return client.post("/users/login", data={"username": email, "password": password})


def test_register_user_success():
    user, r = register()
    assert r.status_code == 201
    assert r.json()["email"] == user["email"]
    assert r.json()["username"] == user["username"]
    assert "id" in r.json()

# registering the same email twice should fail
def test_register_duplicate_email_returns_400():
    user = fresh_user()
    _, first = register(user)
    second = client.post("/users/register", json=user)
    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()["detail"] == "Email already registered"

def test_login_success_returns_bearer_token():
    user, r = register()
    token_r = login(user["email"])
    assert r.status_code == 201
    assert token_r.status_code == 200
    assert "access_token" in token_r.json()
    assert token_r.json()["token_type"] == "bearer"

def test_login_wrong_password_returns_401():
    user, r = register()
    bad_login = login(user["email"], "WrongPass123!")
    assert r.status_code == 201
    assert bad_login.status_code == 401
    assert bad_login.json()["detail"] == "Incorrect username or password"

def test_me_with_valid_token_returns_current_user():
    user, r = register()
    token_r = login(user["email"])
    token = token_r.json()["access_token"]

    me = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert r.status_code == 201
    assert token_r.status_code == 200
    assert me.status_code == 200
    assert me.json()["email"] == user["email"]
    assert me.json()["username"] == user["username"]

# no token at all should just get rejected
def test_me_without_token_returns_401():
    r = client.get("/users/me")
    assert r.status_code == 401
