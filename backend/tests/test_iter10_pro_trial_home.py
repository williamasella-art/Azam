"""Iter10 backend tests: Pro 3-day trial (server-owned start), home_photo, expiry, regressions.

Runs against the public EXPO backend URL. For the expiry case we access Mongo directly
using MONGO_URL and DB_NAME from backend/.env — collection: settings, keyed by user_id.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

# Load backend .env so MONGO_URL / DB_NAME are available in this test process.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = (os.environ.get("EXPO_BACKEND_URL") or os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "").rstrip("/")


# ---- shared fixtures ----------------------------------------------------------------

@pytest.fixture(scope="session")
def api_base_url() -> str:
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL/EXPO_PUBLIC_BACKEND_URL is not configured")
    return BASE_URL


def _new_guest_session(base: str) -> tuple[requests.Session, str]:
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{base}/api/auth/guest")
    assert r.status_code == 200, r.text
    body = r.json()
    token = body["session_token"]
    user_id = body["user"]["user_id"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s, user_id


@pytest.fixture
def guest(api_base_url: str):
    return _new_guest_session(api_base_url)


# ---- Module: guest auth issues a session token --------------------------------------

def test_guest_auth_returns_session_token(api_base_url: str):
    r = requests.post(f"{api_base_url}/api/auth/guest")
    assert r.status_code == 200
    body = r.json()
    assert body.get("session_token")
    assert body["user"]["guest"] is True


# ---- Module: default settings expose new fields -------------------------------------

def test_settings_defaults_include_new_fields(guest, api_base_url: str):
    session, _ = guest
    r = session.get(f"{api_base_url}/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert data.get("home_photo") is False, f"home_photo default should be False, got {data.get('home_photo')!r}"
    assert data.get("pro_trial_started") is None, f"pro_trial_started default should be null, got {data.get('pro_trial_started')!r}"
    assert data.get("pro_preview") is False


# ---- Module: activating pro_preview stamps pro_trial_started server-side ------------

def _iso_close_to_now(iso: str, tolerance_seconds: int = 120) -> bool:
    dt = datetime.fromisoformat(iso)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = abs((datetime.now(timezone.utc) - dt).total_seconds())
    return delta <= tolerance_seconds


def test_pro_preview_activation_stamps_trial_and_ignores_client_value(guest, api_base_url: str):
    session, _ = guest
    body = session.get(f"{api_base_url}/api/settings").json()
    body["pro_preview"] = True
    # Client tries to backdate — server must ignore this.
    body["pro_trial_started"] = "2020-01-01T00:00:00+00:00"
    r = session.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["pro_preview"] is True
    assert data["pro_trial_started"] is not None
    assert data["pro_trial_started"] != "2020-01-01T00:00:00+00:00", "server accepted stale client date"
    assert _iso_close_to_now(data["pro_trial_started"]), (
        f"pro_trial_started should be a recent UTC ISO, got {data['pro_trial_started']!r}"
    )


# ---- Module: toggling pro_preview off keeps the trial start ------------------------

def test_pro_preview_off_keeps_trial_started(guest, api_base_url: str):
    session, _ = guest

    # Activate first
    body = session.get(f"{api_base_url}/api/settings").json()
    body["pro_preview"] = True
    r1 = session.put(f"{api_base_url}/api/settings", json=body)
    assert r1.status_code == 200
    trial_started = r1.json()["pro_trial_started"]
    assert trial_started is not None

    # Now turn pro_preview back off — trial_started must persist
    body = session.get(f"{api_base_url}/api/settings").json()
    body["pro_preview"] = False
    r2 = session.put(f"{api_base_url}/api/settings", json=body)
    assert r2.status_code == 200
    data = r2.json()
    assert data["pro_preview"] is False
    assert data["pro_trial_started"] == trial_started, (
        f"trial_started changed after toggling off: {trial_started!r} -> {data['pro_trial_started']!r}"
    )

    # Extra: PUT with pro_trial_started explicitly null must STILL be ignored.
    body = session.get(f"{api_base_url}/api/settings").json()
    body["pro_trial_started"] = None
    body["pro_preview"] = False
    r3 = session.put(f"{api_base_url}/api/settings", json=body)
    assert r3.status_code == 200
    assert r3.json()["pro_trial_started"] == trial_started, "client-provided null overwrote server value"


# ---- Module: expired trial disables Pro and cannot be restarted --------------------

def test_expired_trial_disables_pro_and_cannot_restart(api_base_url: str):
    from motor.motor_asyncio import AsyncIOMotorClient  # noqa: F401 — checking import only
    from pymongo import MongoClient

    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not (mongo_url and db_name):
        pytest.skip("MONGO_URL/DB_NAME not configured — cannot backdate settings for expiry test")

    session, user_id = _new_guest_session(api_base_url)

    # First activate so a settings row exists.
    body = session.get(f"{api_base_url}/api/settings").json()
    body["pro_preview"] = True
    activate = session.put(f"{api_base_url}/api/settings", json=body)
    assert activate.status_code == 200

    # Backdate trial_started directly in Mongo to force expiry.
    mclient = MongoClient(mongo_url)
    try:
        result = mclient[db_name].settings.update_one(
            {"user_id": user_id},
            {"$set": {"pro_preview": True, "pro_trial_started": "2020-01-01T00:00:00+00:00"}},
        )
        assert result.matched_count == 1, "settings row not found for backdate"

        # GET should now return pro_preview=False (server auto-expires)
        g = session.get(f"{api_base_url}/api/settings")
        assert g.status_code == 200
        gd = g.json()
        assert gd["pro_preview"] is False, f"expected auto-expiry, got pro_preview={gd['pro_preview']}"
        assert gd["pro_trial_started"] == "2020-01-01T00:00:00+00:00"

        # Trying to reactivate must still yield pro_preview=False (trial exhausted).
        body = session.get(f"{api_base_url}/api/settings").json()
        body["pro_preview"] = True
        r = session.put(f"{api_base_url}/api/settings", json=body)
        assert r.status_code == 200
        rd = r.json()
        assert rd["pro_preview"] is False, "trial was restartable — should be locked out"
        assert rd["pro_trial_started"] == "2020-01-01T00:00:00+00:00"
    finally:
        mclient.close()


# ---- Module: home_photo flag persists ----------------------------------------------

def test_home_photo_persists(guest, api_base_url: str):
    session, _ = guest
    body = session.get(f"{api_base_url}/api/settings").json()
    assert body["home_photo"] is False
    body["home_photo"] = True
    r = session.put(f"{api_base_url}/api/settings", json=body)
    assert r.status_code == 200
    assert r.json()["home_photo"] is True

    # GET should reflect it
    g = session.get(f"{api_base_url}/api/settings").json()
    assert g["home_photo"] is True


# ---- Module: regressions - sunnah + alarms + prayers -------------------------------

def test_regression_sunnah_status(guest, api_base_url: str):
    session, _ = guest
    r = session.get(f"{api_base_url}/api/sunnah/status")
    assert r.status_code == 200
    data = r.json()["data"]
    assert set(data.keys()) >= {"today", "recent", "date"}


def test_regression_sunnah_checkin_toggle(guest, api_base_url: str):
    from datetime import date

    session, _ = guest
    today = date.today().isoformat()
    r = session.put(f"{api_base_url}/api/sunnah/checkin", json={"key": "dhuha", "day": today})
    assert r.status_code == 200
    assert r.json()["data"]["done"] is True
    # toggle off to clean up
    r2 = session.put(f"{api_base_url}/api/sunnah/checkin", json={"key": "dhuha", "day": today})
    assert r2.status_code == 200
    assert r2.json()["data"]["done"] is False


def test_regression_alarms_crud(guest, api_base_url: str):
    session, _ = guest
    listing = session.get(f"{api_base_url}/api/alarms")
    assert listing.status_code == 200
    assert isinstance(listing.json()["data"], list)

    payload = {
        "label": "TEST_iter10_alarm",
        "time": "04:45",
        "repeat": "daily",
        "enabled": True,
        "phrase": "Alhamdulillah",
        "snooze_minutes": 5,
    }
    created = session.post(f"{api_base_url}/api/alarms", json=payload)
    assert created.status_code == 200, created.text
    alarm_id = created.json()["id"]
    assert created.json()["label"] == "TEST_iter10_alarm"

    after = session.get(f"{api_base_url}/api/alarms").json()["data"]
    assert any(a["id"] == alarm_id for a in after)

    d = session.delete(f"{api_base_url}/api/alarms/{alarm_id}")
    assert d.status_code == 200

    final = session.get(f"{api_base_url}/api/alarms").json()["data"]
    assert not any(a["id"] == alarm_id for a in final), "alarm still present after delete"
