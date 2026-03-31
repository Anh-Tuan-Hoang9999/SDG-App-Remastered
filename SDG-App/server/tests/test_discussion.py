"""Tests for /api/discussion/posts and /api/discussion/posts/:id/comments."""
from uuid import uuid4


def make_user(client):
    uid = uuid4().hex[:8]
    email = f"disc_{uid}@trentu.ca"
    client.post("/api/auth/register", json={"name": f"User {uid}", "email": email, "password": "Pass@1234"})
    r = client.post("/api/auth/login", json={"email": email, "password": "Pass@1234"})
    token = r.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    return me["id"], me["name"]


def post_body(user_id, author_name):
    return {"user_id": user_id, "author_name": author_name, "title": "Test Post", "body": "Hello world."}


def comment_body(user_id, author_name):
    return {"user_id": user_id, "author_name": author_name, "body": "Nice post!"}


# --- Posts ---

def test_list_posts_empty(client):
    r = client.get("/api/discussion/posts")
    assert r.status_code == 200
    assert r.json() == []


def test_create_post(client):
    user_id, name = make_user(client)
    r = client.post("/api/discussion/posts", json=post_body(user_id, name))
    assert r.status_code == 201
    data = r.json()
    assert data["title"]       == "Test Post"
    assert data["author_name"] == name
    assert data["user_id"]     == user_id


def test_list_posts_returns_created(client):
    user_id, name = make_user(client)
    client.post("/api/discussion/posts", json=post_body(user_id, name))
    r = client.get("/api/discussion/posts")
    assert len(r.json()) == 1


def test_delete_post(client):
    user_id, name = make_user(client)
    post = client.post("/api/discussion/posts", json=post_body(user_id, name)).json()
    r = client.delete(f"/api/discussion/posts/{post['id']}")
    assert r.status_code == 204
    assert client.get("/api/discussion/posts").json() == []


def test_delete_nonexistent_post_returns_404(client):
    r = client.delete("/api/discussion/posts/9999")
    assert r.status_code == 404


def test_delete_post_cascades_comments(client):
    user_id, name = make_user(client)
    post = client.post("/api/discussion/posts", json=post_body(user_id, name)).json()
    client.post(f"/api/discussion/posts/{post['id']}/comments", json=comment_body(user_id, name))
    client.delete(f"/api/discussion/posts/{post['id']}")
    # post is gone — listing comments on deleted post should 404
    r = client.get(f"/api/discussion/posts/{post['id']}/comments")
    assert r.status_code == 404


# --- Comments ---

def test_list_comments_empty(client):
    user_id, name = make_user(client)
    post = client.post("/api/discussion/posts", json=post_body(user_id, name)).json()
    r = client.get(f"/api/discussion/posts/{post['id']}/comments")
    assert r.status_code == 200
    assert r.json() == []


def test_create_comment(client):
    user_id, name = make_user(client)
    post = client.post("/api/discussion/posts", json=post_body(user_id, name)).json()
    r = client.post(f"/api/discussion/posts/{post['id']}/comments", json=comment_body(user_id, name))
    assert r.status_code == 201
    data = r.json()
    assert data["body"]        == "Nice post!"
    assert data["post_id"]     == post["id"]
    assert data["author_name"] == name


def test_list_comments_returns_created(client):
    user_id, name = make_user(client)
    post = client.post("/api/discussion/posts", json=post_body(user_id, name)).json()
    client.post(f"/api/discussion/posts/{post['id']}/comments", json=comment_body(user_id, name))
    client.post(f"/api/discussion/posts/{post['id']}/comments", json={"user_id": user_id, "author_name": name, "body": "Another!"})
    r = client.get(f"/api/discussion/posts/{post['id']}/comments")
    assert len(r.json()) == 2


def test_comment_on_nonexistent_post_returns_404(client):
    user_id, name = make_user(client)
    r = client.post("/api/discussion/posts/9999/comments", json=comment_body(user_id, name))
    assert r.status_code == 404
