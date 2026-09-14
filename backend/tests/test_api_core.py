"""Core API regression tests for auth, settings, worship, quran, qibla, and progress."""

from __future__ import annotations

import os
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
import requests


BASE_URL = (os.environ.get("EXPO_BACKEND_URL") or os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "").rstrip("/")


@pytest.fixture(scope="session")
def api_base_url() -> str:
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL/EXPO_PUBLIC_BACKEND_URL is not configured")
    return BASE_URL


@pytest.fixture
def api_client() -> requests.Session:
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


# Module: basic health and auth/session validation
def test_health_ok(api_client: requests.Session, api_base_url: str):
    response = api_client.get(f"{api_base_url}/api/")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"


def test_auth_required_for_settings(api_client: requests.Session, api_base_url: str):
    response = api_client.get(f"{api_base_url}/api/settings")
    assert response.status_code == 401
    assert "Silakan masuk kembali" in response.json()["detail"]


def test_guest_login_and_me(api_client: requests.Session, api_base_url: str):
    auth = api_client.post(f"{api_base_url}/api/auth/guest")
    assert auth.status_code == 200
    token = auth.json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})

    me = api_client.get(f"{api_base_url}/api/auth/me")
    assert me.status_code == 200
    user = me.json()
    assert user["guest"] is True
    assert user["user_id"].startswith("user_")


def test_invalid_session_returns_401(api_client: requests.Session, api_base_url: str):
    api_client.headers.update({"Authorization": "Bearer invalid_token_for_test"})
    response = api_client.get(f"{api_base_url}/api/auth/me")
    assert response.status_code == 401
    assert "Sesi berakhir" in response.json()["detail"]


# Module: settings persistence and user data isolation
def test_settings_save_and_get_persisted(api_client: requests.Session, api_base_url: str):
    auth = api_client.post(f"{api_base_url}/api/auth/guest")
    token = auth.json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})

    body = {
        "city": "Bandung",
        "latitude": -6.9175,
        "longitude": 107.6191,
        "timezone": "Asia/Jakarta",
        "location_set": True,
        "onboarded": True,
        "dark": True,
        "pro_preview": True,
        "notifications": False,
        "blocker_enabled": True,
        "blocked_apps": ["Instagram", "YouTube"],
        "blocked_prayers": ["Subuh", "Isya"],
        "alarm_enabled": False,
        "alarm_time": "04:45",
        "alarm_phrase": "Masya Allah",
        "translation": True,
        "last_surah": 1,
        "last_verse": 3,
    }
    put = api_client.put(f"{api_base_url}/api/settings", json=body)
    assert put.status_code == 200
    assert put.json()["city"] == "Bandung"

    get_settings = api_client.get(f"{api_base_url}/api/settings")
    assert get_settings.status_code == 200
    saved = get_settings.json()
    assert saved["blocked_apps"] == ["Instagram", "YouTube"]
    assert saved["last_verse"] == 3


def test_settings_are_isolated_per_user(api_client: requests.Session, api_base_url: str):
    s1 = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    s2 = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]

    api_client.headers.update({"Authorization": f"Bearer {s1}"})
    put = api_client.put(
        f"{api_base_url}/api/settings",
        json={
            "city": "Surabaya",
            "latitude": -7.2575,
            "longitude": 112.7521,
            "timezone": "Asia/Jakarta",
            "location_set": True,
            "onboarded": True,
            "dark": False,
            "pro_preview": False,
            "notifications": False,
            "blocker_enabled": False,
            "blocked_apps": [],
            "blocked_prayers": ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"],
            "alarm_enabled": False,
            "alarm_time": "04:30",
            "alarm_phrase": "Alhamdulillah",
            "translation": True,
            "last_surah": 1,
            "last_verse": 1,
        },
    )
    assert put.status_code == 200

    api_client.headers.update({"Authorization": f"Bearer {s2}"})
    other = api_client.get(f"{api_base_url}/api/settings")
    assert other.status_code == 200
    assert other.json()["city"] != "Surabaya"


# Module: prayers, quran, qibla and checkin/progress endpoint behavior
def test_prayers_real_data_structure(api_client: requests.Session, api_base_url: str):
    day = date.today().isoformat()
    response = api_client.get(
        f"{api_base_url}/api/prayers?latitude=-6.2088&longitude=106.8456&day={day}"
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["prayers"]) == 5
    assert data["method"] == "Kemenag RI · AlAdhan"


def test_quran_list_114_surahs(api_client: requests.Session, api_base_url: str):
    response = api_client.get(f"{api_base_url}/api/quran")
    assert response.status_code == 200
    items = response.json()["data"]
    assert len(items) == 114


def test_quran_invalid_surah_422(api_client: requests.Session, api_base_url: str):
    response = api_client.get(f"{api_base_url}/api/quran/115")
    assert response.status_code == 422
    assert "1–114" in response.json()["detail"]


def test_invalid_coordinates_422(api_client: requests.Session, api_base_url: str):
    response = api_client.get(
        f"{api_base_url}/api/qibla?latitude=999&longitude=106.8"
    )
    assert response.status_code == 422


def test_qibla_jakarta_expected_range(api_client: requests.Session, api_base_url: str):
    response = api_client.get(
        f"{api_base_url}/api/qibla?latitude=-6.2088&longitude=106.8456"
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert 290 <= data["bearing"] <= 300
    assert 7800 <= data["distance_km"] <= 8000


def _today_in_timezone(settings_payload: dict) -> date:
    return datetime.now(ZoneInfo(settings_payload["timezone"])).date()


def test_checkin_future_date_rejected(api_client: requests.Session, api_base_url: str):
    token = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    settings = api_client.get(f"{api_base_url}/api/settings").json()
    future = (_today_in_timezone(settings) + timedelta(days=1)).isoformat()

    response = api_client.put(
        f"{api_base_url}/api/checkins",
        json={"date": future, "prayer": "Subuh", "completed": True},
    )
    assert response.status_code == 422
    assert "masa depan" in response.json()["detail"]


def test_checkin_duplicate_idempotent_and_undo(api_client: requests.Session, api_base_url: str):
    token = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    day = date.today().isoformat()

    create_1 = api_client.put(
        f"{api_base_url}/api/checkins",
        json={"date": day, "prayer": "Subuh", "completed": True},
    )
    create_2 = api_client.put(
        f"{api_base_url}/api/checkins",
        json={"date": day, "prayer": "Subuh", "completed": True},
    )
    assert create_1.status_code == 200
    assert create_2.status_code == 200

    month = day[:7]
    progress = api_client.get(f"{api_base_url}/api/progress?month={month}")
    assert progress.status_code == 200
    today = progress.json()["data"]["today"]
    assert today.count("Subuh") == 1

    undo = api_client.put(
        f"{api_base_url}/api/checkins",
        json={"date": day, "prayer": "Subuh", "completed": False},
    )
    assert undo.status_code == 200

    after = api_client.get(f"{api_base_url}/api/progress?month={month}").json()["data"]
    assert "Subuh" not in after["today"]


def test_progress_awan_unlocked_after_full_day(api_client: requests.Session, api_base_url: str):
    token = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    day = date.today().isoformat()

    for prayer in ["Subuh", "Zuhur", "Asar", "Magrib", "Isya"]:
        response = api_client.put(
            f"{api_base_url}/api/checkins",
            json={"date": day, "prayer": prayer, "completed": True},
        )
        assert response.status_code == 200

    payload = api_client.get(f"{api_base_url}/api/progress?month={day[:7]}").json()["data"]
    awan = next(level for level in payload["levels"] if level["name"] == "Awan")
    assert payload["streak"] >= 1
    assert awan["unlocked"] is True


def test_mongodb_object_id_not_serialized_in_response(api_client: requests.Session, api_base_url: str):
    token = api_client.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    response = api_client.get(f"{api_base_url}/api/settings")
    assert response.status_code == 200
    assert "_id" not in response.text