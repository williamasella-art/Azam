"""New feature tests for iteration 6: alarm_phrase free-text, custom_apps validation,
latin toggle, and Quran daily verse teksLatin + day rotation."""

from __future__ import annotations

import os

import pytest
import requests


BASE_URL = (
    os.environ.get("EXPO_BACKEND_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or ""
).rstrip("/")


@pytest.fixture(scope="session")
def api_base_url() -> str:
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL not configured")
    return BASE_URL


@pytest.fixture
def auth_client(api_base_url: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    token = s.post(f"{api_base_url}/api/auth/guest").json()["session_token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


def _base_settings() -> dict:
    return {
        "city": "Jakarta",
        "latitude": -6.2088,
        "longitude": 106.8456,
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
    }


# Module: alarm_phrase free-text acceptance
def test_settings_alarm_phrase_free_text_saved(auth_client, api_base_url):
    body = _base_settings()
    body["alarm_phrase"] = "Ya Latif, Ya Karim"
    r = auth_client.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 200
    got = auth_client.get(f"{api_base_url}/api/settings").json()
    assert got["alarm_phrase"] == "Ya Latif, Ya Karim"


def test_settings_alarm_phrase_max_80_chars(auth_client, api_base_url):
    body = _base_settings()
    body["alarm_phrase"] = "A" * 81
    r = auth_client.put(f"{api_base_url}/api/settings", json=body)
    # Expect rejection (422) since spec says ≤80
    assert r.status_code in (422, 400), f"Expected 4xx got {r.status_code}"


# Module: custom_apps with category validation
def test_settings_custom_apps_accepted(auth_client, api_base_url):
    body = _base_settings()
    body["custom_apps"] = [
        {"name": "WhatsApp", "category": "Sosmed", "package": ""},
        {"name": "PUBG", "category": "Game", "package": ""},
    ]
    body["latin"] = False
    r = auth_client.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:200]}"
    got = auth_client.get(f"{api_base_url}/api/settings").json()
    assert isinstance(got.get("custom_apps"), list)
    names = [a["name"] for a in got["custom_apps"]]
    assert "WhatsApp" in names and "PUBG" in names
    assert got.get("latin") is False


def test_settings_custom_apps_invalid_category_rejected(auth_client, api_base_url):
    body = _base_settings()
    body["custom_apps"] = [
        {"name": "SomeApp", "category": "Musik", "package": ""},
    ]
    r = auth_client.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 422, f"Expected 422 rejection, got {r.status_code}: {r.text[:200]}"


def test_settings_custom_apps_all_allowed_categories(auth_client, api_base_url):
    body = _base_settings()
    body["custom_apps"] = [
        {"name": f"App{c}", "category": c, "package": ""}
        for c in ["Sosmed", "Game", "Video", "Belanja", "Lainnya"]
    ]
    r = auth_client.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 200, r.text[:200]


# Module: Quran daily verse with teksLatin and day rotation
def test_quran_daily_includes_teks_latin(auth_client, api_base_url):
    r = auth_client.get(f"{api_base_url}/api/quran/daily?day=2026-09-14")
    assert r.status_code == 200
    payload = r.json()
    # Different backends wrap under "data" or return directly
    data = payload.get("data", payload)
    assert "teksLatin" in data, f"Missing teksLatin key: {list(data.keys())}"
    assert isinstance(data["teksLatin"], str)
    assert len(data["teksLatin"]) > 0


def test_quran_daily_rotates_across_days(auth_client, api_base_url):
    days = [
        "2026-01-01", "2026-02-15", "2026-03-30", "2026-05-10",
        "2026-07-20", "2026-09-14", "2026-11-05", "2026-12-31",
    ]
    verses = set()
    for d in days:
        r = auth_client.get(f"{api_base_url}/api/quran/daily?day={d}")
        assert r.status_code == 200
        data = r.json().get("data", r.json())
        # Use (surah,verse) tuple if present else full arabic text
        key = (data.get("surah"), data.get("verse")) if data.get("surah") else data.get("teksArab")
        verses.add(str(key))
    # Should have multiple distinct verses across days (backing pool ~24)
    assert len(verses) >= 3, f"Expected rotation across days, only {len(verses)} distinct: {verses}"


def test_quran_daily_same_day_deterministic(auth_client, api_base_url):
    r1 = auth_client.get(f"{api_base_url}/api/quran/daily?day=2026-09-14").json()
    r2 = auth_client.get(f"{api_base_url}/api/quran/daily?day=2026-09-14").json()
    d1 = r1.get("data", r1)
    d2 = r2.get("data", r2)
    assert d1.get("teksArab") == d2.get("teksArab")
    assert d1.get("teksLatin") == d2.get("teksLatin")
