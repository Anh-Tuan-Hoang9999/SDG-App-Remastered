"""Tests for GET /api/sdgs."""
from models.sdg import SDG


def test_get_sdgs_empty(client):
    r = client.get("/api/sdgs")
    assert r.status_code == 200
    assert r.json() == []


def test_get_sdgs_returns_all_sorted(client, db):
    db.add(SDG(number=2, title="Zero Hunger", description="End hunger.", color="#DDA63A"))
    db.add(SDG(number=1, title="No Poverty",  description="End poverty.", color="#E5243B"))
    db.commit()

    r = client.get("/api/sdgs")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 2
    assert data[0]["number"] == 1   # sorted ascending
    assert data[1]["number"] == 2


def test_get_sdgs_fields(client, db):
    db.add(SDG(number=1, title="No Poverty", description="End poverty.", color="#E5243B"))
    db.commit()

    sdg = client.get("/api/sdgs").json()[0]
    assert "id"          in sdg
    assert "number"      in sdg
    assert "title"       in sdg
    assert "description" in sdg
    assert "color"       in sdg
