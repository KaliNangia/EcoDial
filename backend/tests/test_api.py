"""
Integration tests for the Ecodial FastAPI router endpoints.
Tests calculations, validation behaviors, leaderboard persistence, and safety restrictions.
"""

import os
from typing import Dict, Any, Generator
import pytest
from fastapi.testclient import TestClient

# Mock the database file path during testing
os.environ["DB_FILE"] = "test_database.json"

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def run_around_tests() -> Generator[None, None, None]:
    """
    Setup and cleanup fixture for database mock files.
    Deletes the mock JSON database file before and after every test function execution.
    """
    if os.path.exists("test_database.json"):
        try:
            os.remove("test_database.json")
        except OSError:
            pass
    yield
    if os.path.exists("test_database.json"):
        try:
            os.remove("test_database.json")
        except OSError:
            pass


def test_api_calculate_success() -> None:
    """
    Verify POST /api/calculate returns 200 OK and correct calculations for a valid payload.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": 100,
        "car_fuel": "hybrid",
        "public_transit_km_per_week": 50,
        "short_haul_flights_per_year": 1,
        "long_haul_flights_per_year": 1,
        "electricity_kwh_per_month": 200,
        "natural_gas_kwh_per_month": 150,
        "household_size": 3,
        "diet": "vegetarian",
        "goods_spend_usd_per_month": 250,
        "waste_kg_per_week": 5
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data: Dict[str, Any] = response.json()
    assert "total" in data
    assert "breakdown" in data
    assert data["total"] > 0


def test_api_calculate_validation_failure() -> None:
    """
    Verify POST /api/calculate yields 422 validation failure if inputs exceed bounds (e.g. negative values).
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": -10,
        "car_fuel": "hybrid"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_api_leaderboard_get() -> None:
    """
    Verify GET /api/leaderboard loads default leaderboard members successfully.
    """
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    members = response.json()
    assert len(members) >= 3
    assert any(m["name"] == "Green Guru" for m in members)


def test_api_leaderboard_post_and_delete() -> None:
    """
    Verify leaderboard posting is successful and deletion cleans up database correctly.
    """
    # 1. Post a new friend member
    new_member: Dict[str, Any] = {
        "id": "test-friend-99",
        "name": "Test Runner",
        "score": 2.45,
        "isSelf": False
    }
    post_res = client.post("/api/leaderboard", json=new_member)
    assert post_res.status_code == 200
    members = post_res.json()
    assert any(m["id"] == "test-friend-99" for m in members)

    # 2. Delete the member
    del_res = client.delete("/api/leaderboard/test-friend-99")
    assert del_res.status_code == 200
    new_members = del_res.json()
    assert not any(m["id"] == "test-friend-99" for m in new_members)


def test_api_leaderboard_prevent_delete_self() -> None:
    """
    Verify delete operations on the user's host profile are blocked by returning 400 Bad Request.
    """
    self_member: Dict[str, Any] = {
        "id": "user-self",
        "name": "Self User",
        "score": 1.25,
        "isSelf": True
    }
    client.post("/api/leaderboard", json=self_member)
    
    del_res = client.delete("/api/leaderboard/user-self")
    assert del_res.status_code == 400
