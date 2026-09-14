import os
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).parent / '.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
http = httpx.AsyncClient(timeout=20, follow_redirects=True)


@asynccontextmanager
async def lifespan(_app):
    await db.users.create_index('user_id', unique=True)
    await db.users.create_index('email', unique=True, sparse=True)
    await db.sessions.create_index('session_token', unique=True)
    await db.sessions.create_index('expires_at', expireAfterSeconds=0)
    await db.logs.create_index([('user_id', 1), ('date', 1), ('prayer', 1)], unique=True)
    await db.cache.create_index('key', unique=True)
    yield
    await http.aclose()
    client.close()


app = FastAPI(title='Azam API', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
router = APIRouter(prefix='/api')


class Data(BaseModel):
    data: Any


class User(BaseModel):
    user_id: str
    name: str
    guest: bool = True
    email: str | None = None


class Session(BaseModel):
    session_token: str
    user: User


class Exchange(BaseModel):
    session_id: str = Field(min_length=1, max_length=2048)


class CustomApp(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    category: Literal['Sosmed', 'Game', 'Video', 'Belanja', 'Lainnya'] = 'Lainnya'
    package: str = Field(default='', max_length=120)


class Settings(BaseModel):
    city: str = Field(default='Jakarta', min_length=1, max_length=80)
    latitude: float = Field(default=-6.2088, ge=-90, le=90)
    longitude: float = Field(default=106.8456, ge=-180, le=180)
    timezone: str = 'Asia/Jakarta'
    location_set: bool = False
    onboarded: bool = False
    dark: bool = False
    pro_preview: bool = False
    notifications: bool = False
    blocker_enabled: bool = False
    blocked_apps: list[str] = Field(default_factory=list, max_length=30)
    blocked_prayers: list[Literal['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya']] = Field(default_factory=lambda: ['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'])
    alarm_enabled: bool = False
    alarm_time: str = Field(default='04:30', pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    alarm_phrase: str = Field(default='Alhamdulillah', min_length=1, max_length=80)
    translation: bool = True
    latin: bool = True
    custom_apps: list[CustomApp] = Field(default_factory=list, max_length=60)
    gender: Literal['', 'pria', 'wanita'] = ''
    reminder_minutes: Literal[5, 10, 15, 30] = 10
    ambient: Literal['none', 'rain', 'cat'] = 'none'
    rain_volume: float = Field(default=0.5, ge=0, le=1)
    cat_volume: float = Field(default=0.5, ge=0, le=1)
    last_surah: int = Field(default=1, ge=1, le=114)
    last_verse: int = Field(default=1, ge=1, le=286)


async def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(401, 'Silakan masuk kembali.')
    session = await db.sessions.find_one({'session_token': authorization[7:]}, {'_id': 0})
    if not session or session['expires_at'].replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(401, 'Sesi berakhir. Silakan masuk kembali.')
    user = await db.users.find_one({'user_id': session['user_id']}, {'_id': 0})
    if not user:
        raise HTTPException(401, 'Akun tidak ditemukan.')
    return user


async def issue_session(user, token=None):
    token = token or secrets.token_urlsafe(40)
    await db.sessions.update_one({'session_token': token}, {'$set': {
        'user_id': user['user_id'], 'created_at': datetime.now(timezone.utc),
        'expires_at': datetime.now(timezone.utc) + timedelta(days=30 if user.get('guest') else 7)
    }}, upsert=True)
    return Session(session_token=token, user=User(**user))


@router.get('/')
async def health():
    return {'status': 'ok', 'app': 'Azam'}


@router.post('/auth/guest', response_model=Session)
async def guest():
    user = {'user_id': f'user_{uuid4().hex}', 'name': 'Sahabat Azam', 'guest': True}
    await db.users.insert_one(user.copy())
    return await issue_session(user)


@router.post('/auth/session', response_model=Session)
async def exchange(body: Exchange):
    try:
        response = await http.get('https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data', headers={'X-Session-ID': body.session_id})
        if response.status_code != 200:
            raise HTTPException(401, 'Login Google kedaluwarsa. Silakan coba lagi.')
        payload = response.json()
        if not payload.get('email') or not payload.get('session_token'):
            raise HTTPException(401, 'Data login tidak lengkap.')
    except httpx.HTTPError:
        raise HTTPException(503, 'Layanan login sedang tidak tersedia.')
    existing = await db.users.find_one({'email': payload['email']}, {'_id': 0})
    user = {'user_id': existing['user_id'] if existing else f'user_{uuid4().hex}',
            'email': payload['email'], 'name': payload.get('name', 'Sahabat Azam'), 'guest': False}
    await db.users.update_one({'user_id': user['user_id']}, {'$set': user}, upsert=True)
    return await issue_session(user, payload['session_token'])


@router.get('/auth/me', response_model=User)
async def me(user=Depends(current_user)):
    return User(**user)


@router.post('/auth/logout', response_model=Data)
async def logout(user=Depends(current_user), authorization: str = Header()):
    await db.sessions.delete_one({'session_token': authorization[7:]})
    return Data(data={'ok': True})


@router.get('/settings', response_model=Settings)
async def get_settings(user=Depends(current_user)):
    doc = await db.settings.find_one({'user_id': user['user_id']}, {'_id': 0})
    return Settings(**(doc or {}))


@router.put('/settings', response_model=Settings)
async def save_settings(body: Settings, user=Depends(current_user)):
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
    try:
        ZoneInfo(body.timezone)
    except ZoneInfoNotFoundError:
        raise HTTPException(422, 'Zona waktu tidak valid.')
    await db.settings.update_one({'user_id': user['user_id']}, {'$set': body.model_dump()}, upsert=True)
    return body


# Import route registration after shared database and auth definitions.
from worship import register_routes  # noqa: E402
register_routes(router, db, http, current_user, Data, get_settings)
app.include_router(router)