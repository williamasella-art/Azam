"""Iteration 7 backend tests — new multi-alarm CRUD endpoints (/api/alarms).

Covers:
- Guest auth token issuance.
- GET /api/alarms list wrapper {"data": [...]}.
- POST /api/alarms once (with date), daily, weekly (with weekdays).
- PUT /api/alarms/{id} update label/time/enabled.
- DELETE /api/alarms/{id} soft delete (404 for unknown; deleted rows disappear).
- Validation errors:
    * once without date -> 422 with string detail "Pilih tanggal untuk alarm sekali."
    * weekly with empty weekdays -> 422 string detail
    * bad time '25:00' -> 422
- Per-user isolation (another guest token cannot see/update).
- Max 20 alarms -> 422 on 21st create.
"""

from __future__ import annotations

import os
from datetime import date, timedelta

import pytest
import requests


BASE_URL = (
    os.environ.get("EXPO_BACKEND_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or "https://alarm-scheduler-pro-1.preview.emergentagent.com"
).rstrip("/")


# ---- Fixtures ---------------------------------------------------------------

@pytest.fixture(scope="session")
def api_base_url() -> str:
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL not configured")
    return BASE_URL


def _guest_session(api_base_url: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{api_base_url}/api/auth/guest", timeout=15)
    assert r.status_code == 200, f"guest auth failed {r.status_code}: {r.text[:200]}"
    payload = r.json()
    token = payload["session_token"]
    s.headers["Authorization"] = f"Bearer {token}"
    return s


@pytest.fixture
def client(api_base_url: str) -> requests.Session:
    return _guest_session(api_base_url)


@pytest.fixture
def other_client(api_base_url: str) -> requests.Session:
    return _guest_session(api_base_url)


# ---- Auth -------------------------------------------------------------------

def test_guest_auth_returns_bearer_token(api_base_url):
    r = requests.post(f"{api_base_url}/api/auth/guest", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("session_token")
    assert body.get("user", {}).get("guest") is True


# ---- List / empty state -----------------------------------------------------

def test_list_alarms_empty_wrapper(client, api_base_url):
    r = client.get(f"{api_base_url}/api/alarms")
    assert r.status_code == 200
    body = r.json()
    assert "data" in body
    assert isinstance(body["data"], list)
    # New guest -> should be empty
    assert body["data"] == []


# ---- Create ----------------------------------------------------------------

def test_create_once_alarm_with_date(client, api_base_url):
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    payload = {
        "label": "TEST_once",
        "time": "05:30",
        "repeat": "once",
        "date": tomorrow,
        "phrase": "Alhamdulillah",
        "snooze_minutes": 5,
        "enabled": True,
    }
    r = client.post(f"{api_base_url}/api/alarms", json=payload)
    assert r.status_code == 200, r.text[:200]
    data = r.json()
    assert data["id"].startswith("alarm_")
    assert data["label"] == "TEST_once"
    assert data["time"] == "05:30"
    assert data["repeat"] == "once"
    assert data["date"] == tomorrow

    # GET verifies persistence
    listed = client.get(f"{api_base_url}/api/alarms").json()["data"]
    assert any(a["id"] == data["id"] for a in listed)


def test_create_daily_alarm(client, api_base_url):
    r = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "TEST_daily", "time": "06:00", "repeat": "daily"},
    )
    assert r.status_code == 200, r.text[:200]
    a = r.json()
    assert a["repeat"] == "daily"


def test_create_weekly_alarm(client, api_base_url):
    r = client.post(
        f"{api_base_url}/api/alarms",
        json={
            "label": "TEST_weekly",
            "time": "07:15",
            "repeat": "weekly",
            "weekdays": [1, 3, 5],
        },
    )
    assert r.status_code == 200, r.text[:200]
    a = r.json()
    assert a["repeat"] == "weekly"
    assert a["weekdays"] == [1, 3, 5]


# ---- Update ---------------------------------------------------------------

def test_update_alarm_fields(client, api_base_url):
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    a = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "TEST_up", "time": "04:30", "repeat": "once", "date": tomorrow},
    ).json()

    upd = {
        "label": "TEST_up_renamed",
        "time": "08:45",
        "repeat": "once",
        "date": tomorrow,
        "enabled": False,
        "phrase": "SubhanAllah",
        "snooze_minutes": 10,
    }
    r = client.put(f"{api_base_url}/api/alarms/{a['id']}", json=upd)
    assert r.status_code == 200, r.text[:200]
    got = r.json()
    assert got["label"] == "TEST_up_renamed"
    assert got["time"] == "08:45"
    assert got["enabled"] is False
    assert got["snooze_minutes"] == 10

    # GET verifies persistence
    listed = client.get(f"{api_base_url}/api/alarms").json()["data"]
    match = next(x for x in listed if x["id"] == a["id"])
    assert match["label"] == "TEST_up_renamed"
    assert match["enabled"] is False


# ---- Delete ---------------------------------------------------------------

def test_delete_alarm_soft_removes_from_list(client, api_base_url):
    a = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "TEST_del", "time": "05:00", "repeat": "daily"},
    ).json()

    r = client.delete(f"{api_base_url}/api/alarms/{a['id']}")
    assert r.status_code == 200, r.text[:200]
    assert r.json()["data"]["ok"] is True

    listed = client.get(f"{api_base_url}/api/alarms").json()["data"]
    assert not any(x["id"] == a["id"] for x in listed)


def test_delete_unknown_returns_404(client, api_base_url):
    r = client.delete(f"{api_base_url}/api/alarms/alarm_doesnotexist_xxx")
    assert r.status_code == 404
    body = r.json()
    assert isinstance(body.get("detail"), str)


# ---- Validation -----------------------------------------------------------

def test_once_without_date_422_string_detail(client, api_base_url):
    r = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "no-date", "time": "05:00", "repeat": "once"},
    )
    assert r.status_code == 422
    body = r.json()
    assert isinstance(body.get("detail"), str)
    assert body["detail"] == "Pilih tanggal untuk alarm sekali."


def test_weekly_empty_weekdays_422_string_detail(client, api_base_url):
    r = client.post(
        f"{api_base_url}/api/alarms",
        json={
            "label": "no-weekdays",
            "time": "05:00",
            "repeat": "weekly",
            "weekdays": [],
        },
    )
    assert r.status_code == 422
    body = r.json()
    assert isinstance(body.get("detail"), str)
    assert "hari" in body["detail"].lower()


def test_bad_time_format_422(client, api_base_url):
    r = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "bad-time", "time": "25:00", "repeat": "daily"},
    )
    assert r.status_code == 422
    assert isinstance(r.json().get("detail"), str)


# ---- Isolation ------------------------------------------------------------

def test_alarms_are_per_user(client, other_client, api_base_url):
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    a = client.post(
        f"{api_base_url}/api/alarms",
        json={"label": "TEST_isolated", "time": "03:33", "repeat": "once", "date": tomorrow},
    ).json()

    # Other guest sees empty list
    other_list = other_client.get(f"{api_base_url}/api/alarms").json()["data"]
    assert not any(x["id"] == a["id"] for x in other_list)

    # Other guest cannot update owner's alarm
    r = other_client.put(
        f"{api_base_url}/api/alarms/{a['id']}",
        json={"label": "hijack", "time": "04:00", "repeat": "once", "date": tomorrow},
    )
    assert r.status_code == 404

    # Other guest cannot delete owner's alarm
    r = other_client.delete(f"{api_base_url}/api/alarms/{a['id']}")
    assert r.status_code == 404


# ---- Max 20 -------------------------------------------------------------

def test_max_20_alarms_enforced(api_base_url):
    """Isolated guest so it doesn't interfere with other tests' counts."""
    s = _guest_session(api_base_url)
    # Create 20 daily alarms
    for i in range(20):
        r = s.post(
            f"{api_base_url}/api/alarms",
            json={"label": f"TEST_max_{i}", "time": "04:30", "repeat": "daily"},
        )
        assert r.status_code == 200, f"create #{i} failed: {r.status_code} {r.text[:120]}"
    # 21st -> 422
    r = s.post(
        f"{api_base_url}/api/alarms",
        json={"label": "TEST_max_21", "time": "04:30", "repeat": "daily"},
    )
    assert r.status_code == 422
    assert isinstance(r.json().get("detail"), str)
    assert "20" in r.json()["detail"]
