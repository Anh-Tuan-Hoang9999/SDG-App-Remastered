from uuid import uuid4
from fastapi.testclient import TestClient
from jose import jwt
import auth
from main import app

client = TestClient(app)

PASSWORD = "MyPassword@123"

# unique user each run to avoid conflicts, prefixed with "sec" since these are security tests
def fresh_user():
    uid = uuid4().hex[:8]
    return {
        "email": f"sec_{uid}@trentu.ca",
        "username": f"sec_{uid}",
        "password": PASSWORD,
        "course_code": "COIS-4000Y",
    }

# helper to register and log in a user, returns the user and their token
def register_and_login():
    user = fresh_user()
    register_r = client.post("/users/register", json=user)
    assert register_r.status_code == 201
    login_r = client.post(
        "/users/login",
        data={"username": user["email"], "password": user["password"]},
    )
    assert login_r.status_code == 200
    return user, login_r.json()["access_token"]

# a valid token for an email that doesn't exist in the db should still fail
def test_me_rejects_token_for_nonexistent_user():
    nonexistent_email = f"nonexistent_{uuid4().hex}@trentu.ca"
    token = auth.create_access_token({"sub": nonexistent_email})
    r = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401
    assert r.json()["detail"] == "Could not validate credentials"

# checks that the token we get back actually has the fields we need
def test_access_token_contains_expected_claims():
    _, token = register_and_login()
    payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
    assert "sub" in payload
    assert "exp" in payload