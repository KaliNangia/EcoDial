"""
Integration tests for the Ecodial FastAPI router endpoints.
Tests calculations, validation behaviors, leaderboard persistence, safety restrictions,
security headers, cache-control headers, isSelf merge logic, and capacity limits.
"""

import os
from typing import Dict, Any, Generator
import pytest
from fastapi.testclient import TestClient

# Mock the database file path during testing
os.environ["DB_FILE"] = "test_database.json"

from app.main import app, reset_cache

client = TestClient(app)


@pytest.fixture(autouse=True)
def run_around_tests() -> Generator[None, None, None]:
    """
    Setup and cleanup fixture for database mock files.
    Resets the in-memory cache and deletes the mock JSON database file
    before and after every test function to ensure test isolation.
    """
    reset_cache()
    if os.path.exists("test_database.json"):
        try:
            os.remove("test_database.json")
        except OSError:
            pass
    yield
    reset_cache()
    if os.path.exists("test_database.json"):
        try:
            os.remove("test_database.json")
        except OSError:
            pass


# ==========================================
# API Calculation Endpoint Tests
# ==========================================

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


def test_api_calculate_validation_negative_value() -> None:
    """
    Verify POST /api/calculate yields 422 for negative input values.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": -10,
        "car_fuel": "hybrid"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_api_calculate_validation_exceeds_max() -> None:
    """
    Verify POST /api/calculate yields 422 for values exceeding max boundaries.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": 99999,
        "car_fuel": "petrol"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_api_calculate_validation_invalid_fuel_type() -> None:
    """
    Verify POST /api/calculate yields 422 for an invalid fuel type Literal.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": 100,
        "car_fuel": "hydrogen"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


def test_api_calculate_validation_invalid_diet_type() -> None:
    """
    Verify POST /api/calculate yields 422 for an invalid diet type Literal.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": 100,
        "car_fuel": "petrol",
        "diet": "carnivore"
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422


# ==========================================
# Leaderboard Endpoint Tests
# ==========================================

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


def test_api_leaderboard_delete_nonexistent_returns_404() -> None:
    """
    Verify deleting a non-existent member returns 404 Not Found.
    """
    del_res = client.delete("/api/leaderboard/nonexistent-id-xyz")
    assert del_res.status_code == 404


def test_api_leaderboard_isSelf_merge() -> None:
    """
    Verify that posting a member with isSelf=True updates the existing self record
    instead of creating a duplicate, even when IDs differ.
    """
    # Post initial self
    self_1: Dict[str, Any] = {
        "id": "user-self-v1",
        "name": "User V1",
        "score": 3.0,
        "isSelf": True
    }
    res1 = client.post("/api/leaderboard", json=self_1)
    members_1 = res1.json()
    self_count_1 = sum(1 for m in members_1 if m.get("isSelf"))
    assert self_count_1 == 1

    # Post updated self (different id but isSelf=True should merge)
    self_2: Dict[str, Any] = {
        "id": "user-self-v2",
        "name": "User V2 Updated",
        "score": 1.5,
        "isSelf": True
    }
    res2 = client.post("/api/leaderboard", json=self_2)
    members_2 = res2.json()
    self_count_2 = sum(1 for m in members_2 if m.get("isSelf"))

    # Should still be exactly 1 self member (merged, not duplicated)
    assert self_count_2 == 1
    # Verify the score was updated
    self_member = next(m for m in members_2 if m.get("isSelf"))
    assert self_member["score"] == 1.5
    assert self_member["name"] == "User V2 Updated"


def test_api_leaderboard_name_validation() -> None:
    """
    Verify that empty names are rejected by Pydantic validation (min_length=1).
    """
    payload: Dict[str, Any] = {
        "id": "empty-name",
        "name": "",
        "score": 2.0,
        "isSelf": False
    }
    response = client.post("/api/leaderboard", json=payload)
    assert response.status_code == 422


def test_api_leaderboard_name_max_length() -> None:
    """
    Verify that names exceeding max_length=50 are rejected.
    """
    payload: Dict[str, Any] = {
        "id": "long-name",
        "name": "A" * 51,
        "score": 2.0,
        "isSelf": False
    }
    response = client.post("/api/leaderboard", json=payload)
    assert response.status_code == 422


# ==========================================
# Security Headers Tests
# ==========================================

def test_security_headers_present() -> None:
    """
    Verify all security headers are set on API responses.
    """
    response = client.get("/api/leaderboard")
    assert response.status_code == 200

    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "strict-origin" in response.headers.get("Referrer-Policy", "").lower()
    assert response.headers.get("Strict-Transport-Security") is not None
    assert "max-age" in response.headers.get("Strict-Transport-Security", "")
    assert response.headers.get("Permissions-Policy") is not None


def test_csp_header_content() -> None:
    """
    Verify Content-Security-Policy header is present and does NOT contain 'unsafe-eval'.
    """
    response = client.get("/api/leaderboard")
    csp = response.headers.get("Content-Security-Policy", "")
    assert "default-src 'self'" in csp
    assert "unsafe-eval" not in csp
    assert "connect-src 'self'" in csp


# ==========================================
# Cache-Control Headers Tests
# ==========================================

def test_cache_control_api_no_cache() -> None:
    """
    Verify API responses have no-cache directives to prevent stale data.
    """
    response = client.get("/api/leaderboard")
    cache_header: str = response.headers.get("Cache-Control", "")
    assert "no-store" in cache_header or "no-cache" in cache_header


def test_cache_control_api_post() -> None:
    """
    Verify POST API responses also have no-cache directives.
    """
    payload: Dict[str, Any] = {
        "car_km_per_week": 100,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 50,
        "short_haul_flights_per_year": 1,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 200,
        "natural_gas_kwh_per_month": 100,
        "household_size": 2,
        "diet": "medium_meat",
        "goods_spend_usd_per_month": 200,
        "waste_kg_per_week": 5
    }
    response = client.post("/api/calculate", json=payload)
    cache_header: str = response.headers.get("Cache-Control", "")
    assert "no-store" in cache_header or "no-cache" in cache_header


def test_api_leaderboard_id_validation_invalid() -> None:
    """
    Verify that invalid characters in ID are rejected.
    """
    payload: Dict[str, Any] = {
        "id": "invalid/id$here",
        "name": "Valid Name",
        "score": 2.0,
        "isSelf": False
    }
    response = client.post("/api/leaderboard", json=payload)
    assert response.status_code == 422


def test_api_leaderboard_id_validation_valid() -> None:
    """
    Verify that valid characters in ID are accepted.
    """
    payload: Dict[str, Any] = {
        "id": "valid-id_123",
        "name": "Valid Name",
        "score": 2.0,
        "isSelf": False
    }
    response = client.post("/api/leaderboard", json=payload)
    assert response.status_code == 200


def test_api_leaderboard_name_sanitization() -> None:
    """
    Verify that name fields are sanitized (HTML tags stripped).
    """
    payload: Dict[str, Any] = {
        "id": "sanitization-test",
        "name": "   <b>John Doe</b>   ",
        "score": 2.0,
        "isSelf": False
    }
    response = client.post("/api/leaderboard", json=payload)
    assert response.status_code == 200
    members = response.json()
    added_member = next(m for m in members if m["id"] == "sanitization-test")
    assert added_member["name"] == "John Doe"


def test_api_leaderboard_concurrency() -> None:
    """
    Verify that concurrent write requests do not cause database corruption.
    Uses threading to fire multiple concurrent post requests and checks the end state.
    """
    import concurrent.futures

    # We will submit 15 concurrent requests adding different members.
    def post_member(idx: int) -> int:
        member_id = f"concurrent-user-{idx}"
        member_payload = {
            "id": member_id,
            "name": f"User {idx}",
            "score": float(idx),
            "isSelf": False
        }
        res = client.post("/api/leaderboard", json=member_payload)
        return res.status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(post_member, range(15)))

    # They should all return 200 OK
    for status_code in results:
        assert status_code == 200

    # Retrieve leaderboard and check that all 15 concurrent users exist
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    members = response.json()
    for idx in range(15):
        assert any(m["id"] == f"concurrent-user-{idx}" for m in members)


# ==========================================
# Leaderboard Capacity Limit Tests
# ==========================================

def test_api_leaderboard_capacity_limit() -> None:
    """
    Verify that posting more than 50 unique members returns 400 (DoS capacity guard).
    The leaderboard starts with 3 default seed members, so adding 47 fills it to 50.
    The 48th unique addition should be rejected.
    """
    # The auto-seeded database starts with 3 default members (seed-1, seed-2, seed-3)
    # Fill up to the 50 cap
    for i in range(47):
        payload: Dict[str, Any] = {
            "id": f"cap-user-{i}",
            "name": f"CapUser{i}",
            "score": float(i),
            "isSelf": False,
        }
        res = client.post("/api/leaderboard", json=payload)
        assert res.status_code == 200, f"Member cap-user-{i} should be accepted (total: {i + 4})"

    # The 51st member should be rejected
    overflow_payload: Dict[str, Any] = {
        "id": "cap-overflow",
        "name": "Overflow",
        "score": 99.0,
        "isSelf": False,
    }
    res = client.post("/api/leaderboard", json=overflow_payload)
    assert res.status_code == 400
    assert "maximum capacity" in res.json()["detail"].lower()


# ==========================================
# Rate Limiting Tests
# ==========================================

def test_api_rate_limiter_returns_429() -> None:
    """
    Verify that the rate limiting middleware returns HTTP 429 after exceeding
    100 requests within the configured time window on API endpoints.
    """
    # Clear accumulated request records from earlier tests to get a fresh window
    from app.main import app as _app
    for middleware in _app.user_middleware:
        pass  # middleware stack is wrapped; access via app.middleware_stack
    # Access the rate limiter's state through the ASGI middleware stack
    # The middleware wraps the app, so we walk the chain to find our RateLimitingMiddleware
    middleware_app = _app.middleware_stack
    while middleware_app is not None:
        if hasattr(middleware_app, 'request_records'):
            with middleware_app.lock:
                middleware_app.request_records.clear()
            break
        middleware_app = getattr(middleware_app, 'app', None)

    # Rapidly send 100 GET requests to an API endpoint (all should succeed)
    for i in range(100):
        res = client.get("/api/leaderboard")
        assert res.status_code == 200, f"Request {i + 1} should succeed"

    # The 101st request should be rate-limited
    res = client.get("/api/leaderboard")
    assert res.status_code == 429
    assert "too many requests" in res.json()["detail"].lower()
