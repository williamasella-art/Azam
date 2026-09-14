import os
import secrets
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from hijridate import Gregorian, Hijri
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, model_validator

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
    await db.alarms.create_index([('user_id', 1), ('id', 1)], unique=True)
    await db.photos.create_index([('user_id', 1), ('path', 1)], unique=True)
    try:
        await run_in_threadpool(init_storage)
    except Exception as e:  # storage stays lazy-initialised on first upload
        print('object storage init deferred:', e)
    yield
    await http.aclose()
    client.close()


app = FastAPI(title='Azam API', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


@app.exception_handler(RequestValidationError)
async def validation_error(_request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    message = str(first.get('msg', 'Periksa isian Anda.')).replace('Value error, ', '')
    return JSONResponse(status_code=422, content={'detail': message})

router = APIRouter(prefix='/api')


class Data(BaseModel):
    data: Any


class User(BaseModel):
    user_id: str
    name: str
    guest: bool = True
    email: str | None = None
    photo_path: str | None = None


class Profile(BaseModel):
    name: str = Field(min_length=1, max_length=60)


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
    ambient: str = Field(default='none', max_length=40)
    rain_volume: float = Field(default=0.5, ge=0, le=1)
    cat_volume: float = Field(default=0.5, ge=0, le=1)
    adhan_sound: bool = True
    hajj_done: list[str] = Field(default_factory=list, max_length=120)
    last_surah: int = Field(default=1, ge=1, le=114)
    last_verse: int = Field(default=1, ge=1, le=286)
    language: Literal['id', 'en', 'ms', 'ar'] = 'id'
    sunnah_reminders: list[Literal['tahajud', 'dhuha', 'witir', 'rawatib']] = Field(default_factory=list, max_length=4)


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


# ---- Profile: display name + photo stored in Emergent object storage (served only to its owner). ----
from storage import get_object, init_storage, put_object  # noqa: E402

IMAGE_TYPES = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic'}


@router.put('/profile', response_model=User)
async def update_profile(body: Profile, user=Depends(current_user)):
    await db.users.update_one({'user_id': user['user_id']}, {'$set': {'name': body.name.strip()}})
    return User(**{**user, 'name': body.name.strip()})


@router.post('/profile/photo', response_model=User)
async def upload_photo(file: UploadFile = File(...), user=Depends(current_user)):
    content_type = (file.content_type or '').split(';')[0].strip().lower()
    if content_type not in IMAGE_TYPES:
        raise HTTPException(422, 'Gunakan foto JPG, PNG, atau WEBP.')
    data = await file.read()
    if len(data) > 6 * 1024 * 1024:
        raise HTTPException(422, 'Ukuran foto maksimal 6 MB.')
    path = f'azam-app-blocker/uploads/{user["user_id"]}/{uuid4().hex}.{IMAGE_TYPES[content_type]}'
    try:
        result = await run_in_threadpool(put_object, path, data, content_type)
    except Exception as e:  # requests.HTTPError or connection error
        status = getattr(getattr(e, 'response', None), 'status_code', None)
        raise HTTPException(402 if status == 402 else 503, 'Kuota penyimpanan habis.' if status == 402 else 'Foto belum dapat diunggah. Coba lagi sebentar.')
    await db.users.update_one({'user_id': user['user_id']}, {'$set': {'photo_path': result['path']}})
    await db.photos.insert_one({'user_id': user['user_id'], 'path': result['path'], 'content_type': content_type, 'size': len(data), 'created_at': datetime.now(timezone.utc).isoformat(), 'deleted_at': None})
    return User(**{**user, 'photo_path': result['path']})


@router.delete('/profile/photo', response_model=User)
async def remove_photo(user=Depends(current_user)):
    await db.users.update_one({'user_id': user['user_id']}, {'$set': {'photo_path': None}})
    await db.photos.update_many({'user_id': user['user_id'], 'deleted_at': None}, {'$set': {'deleted_at': datetime.now(timezone.utc).isoformat()}})
    return User(**{**user, 'photo_path': None})


@router.get('/files/{path:path}')
async def get_file(path: str, token: str | None = None, authorization: str | None = Header(default=None)):
    """Serves a stored object. Web <img> cannot send headers, so a session token may come as ?token=."""
    user = await current_user(f'Bearer {token}' if token else authorization)
    owned = await db.photos.find_one({'user_id': user['user_id'], 'path': path, 'deleted_at': None}, {'_id': 0})
    if not owned:
        raise HTTPException(404, 'Berkas tidak ditemukan.')
    try:
        content, content_type = await run_in_threadpool(get_object, path)
    except Exception:
        raise HTTPException(503, 'Berkas belum dapat dimuat.')
    return Response(content=content, media_type=content_type, headers={'Cache-Control': 'private, max-age=86400'})


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


# ---- Alarms: date + time + label, once/daily/weekly, on/off, snooze. Soft-deleted, never destroyed. ----
class AlarmInput(BaseModel):
    label: str = Field(default='Bangun dzikir', min_length=1, max_length=60)
    time: str = Field(default='04:30', pattern=r'^([01]\d|2[0-3]):[0-5]\d$')
    repeat: Literal['once', 'daily', 'weekly'] = 'once'
    date: str | None = Field(default=None, pattern=r'^\d{4}-\d{2}-\d{2}$')
    weekdays: list[int] = Field(default_factory=list, max_length=7)
    enabled: bool = True
    phrase: str = Field(default='Alhamdulillah', min_length=1, max_length=80)
    snooze_minutes: Literal[5, 10, 15] = 5

    @model_validator(mode='after')
    def check_schedule(self):
        if self.repeat == 'once':
            if not self.date:
                raise ValueError('Pilih tanggal untuk alarm sekali.')
            try:
                datetime.strptime(self.date, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Tanggal tidak valid.')
        if self.repeat == 'weekly':
            self.weekdays = sorted({d for d in self.weekdays if 0 <= d <= 6})
            if not self.weekdays:
                raise ValueError('Pilih minimal satu hari untuk alarm mingguan.')
        return self


class Alarm(AlarmInput):
    id: str
    created_at: str
    updated_at: str


# ---- Islamic calendar: upcoming observances computed with the Umm al-Qura calendar (hijridate). ----
ISLAMIC_EVENTS = [
    (1, 1, 'Tahun Baru Hijriah', 'Awal tahun baru Islam. Waktu bermuhasabah dan memperbarui niat.', 'moon-outline'),
    (1, 10, 'Hari Asyura', 'Puasa sunnah 9–10 Muharram menghapus dosa setahun yang lalu.', 'water-outline'),
    (3, 12, 'Maulid Nabi Muhammad ﷺ', 'Mengenang kelahiran Rasulullah ﷺ dengan salawat dan meneladani akhlaknya.', 'heart-outline'),
    (7, 27, 'Isra Mi’raj', 'Perjalanan malam Rasulullah ﷺ dan turunnya perintah salat lima waktu.', 'rocket-outline'),
    (8, 15, 'Nisfu Sya’ban', 'Malam pertengahan Sya’ban, perbanyak doa dan istighfar.', 'sparkles-outline'),
    (9, 1, 'Awal Ramadan', 'Bulan puasa dimulai. Marhaban ya Ramadan!', 'sunny-outline'),
    (9, 17, 'Nuzulul Qur’an', 'Peringatan turunnya Al-Qur’an. Perbanyak tilawah.', 'book-outline'),
    (9, 21, 'Sepuluh Malam Terakhir', 'Berburu Lailatul Qadar: iktikaf, qiyam, dan doa.', 'star-outline'),
    (10, 1, 'Idul Fitri', 'Hari raya kemenangan setelah sebulan berpuasa. Taqabbalallahu minna wa minkum.', 'gift-outline'),
    (12, 8, 'Hari Tarwiyah', 'Jemaah haji bergerak menuju Mina. Sunnah puasa bagi yang tidak berhaji.', 'walk-outline'),
    (12, 9, 'Hari Arafah', 'Puncak haji. Puasa Arafah menghapus dosa dua tahun.', 'flag-outline'),
    (12, 10, 'Idul Adha', 'Hari raya kurban, meneladani keikhlasan Nabi Ibrahim.', 'ribbon-outline'),
    (12, 11, 'Hari Tasyrik', 'Tiga hari (11–13 Dzulhijjah) penyembelihan kurban dan takbir.', 'flame-outline'),
]
HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Sya’ban', 'Ramadan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah']


@router.get('/islamic-events', response_model=Data)
async def islamic_events(start: str | None = None, days: int = 400):
    """Upcoming observances from `start` (YYYY-MM-DD, default today) across the next `days` days."""
    try:
        origin = datetime.strptime(start, '%Y-%m-%d').date() if start else datetime.now(timezone.utc).date()
    except ValueError:
        raise HTTPException(422, 'Tanggal tidak valid.')
    days = max(1, min(days, 800))
    hijri_year = Gregorian(origin.year, origin.month, origin.day).to_hijri().year
    events = []
    for year in (hijri_year - 1, hijri_year, hijri_year + 1):
        for month, day, name, description, icon in ISLAMIC_EVENTS:
            try:
                g = Hijri(year, month, day).to_gregorian()
            except (ValueError, OverflowError):
                continue
            g_date = date(g.year, g.month, g.day)
            offset = (g_date - origin).days
            if -1 <= offset <= days:
                events.append({'key': f'{year}-{month}-{day}', 'name': name, 'description': description, 'icon': icon, 'date': g_date.isoformat(),
                               'hijri': f'{day} {HIJRI_MONTHS[month - 1]} {year} H', 'days_until': offset})
    events.sort(key=lambda e: e['date'])
    return Data(data=events)


def alarm_query(user, alarm_id=None):
    query = {'user_id': user['user_id'], 'deleted_at': None}
    if alarm_id:
        query['id'] = alarm_id
    return query


@router.get('/alarms', response_model=Data)
async def list_alarms(user=Depends(current_user)):
    docs = await db.alarms.find(alarm_query(user), {'_id': 0, 'user_id': 0, 'deleted_at': 0}).sort('time', 1).to_list(50)
    return Data(data=[Alarm(**doc).model_dump() for doc in docs])


@router.post('/alarms', response_model=Alarm)
async def create_alarm(body: AlarmInput, user=Depends(current_user)):
    if await db.alarms.count_documents(alarm_query(user)) >= 20:
        raise HTTPException(422, 'Maksimal 20 alarm. Hapus alarm lama terlebih dahulu.')
    now = datetime.now(timezone.utc).isoformat()
    alarm = Alarm(id=f'alarm_{uuid4().hex}', created_at=now, updated_at=now, **body.model_dump())
    await db.alarms.insert_one({**alarm.model_dump(), 'user_id': user['user_id'], 'deleted_at': None})
    return alarm


@router.put('/alarms/{alarm_id}', response_model=Alarm)
async def update_alarm(alarm_id: str, body: AlarmInput, user=Depends(current_user)):
    existing = await db.alarms.find_one(alarm_query(user, alarm_id), {'_id': 0})
    if not existing:
        raise HTTPException(404, 'Alarm tidak ditemukan.')
    alarm = Alarm(id=alarm_id, created_at=existing['created_at'], updated_at=datetime.now(timezone.utc).isoformat(), **body.model_dump())
    await db.alarms.update_one(alarm_query(user, alarm_id), {'$set': alarm.model_dump()})
    return alarm


@router.delete('/alarms/{alarm_id}', response_model=Data)
async def delete_alarm(alarm_id: str, user=Depends(current_user)):
    result = await db.alarms.update_one(alarm_query(user, alarm_id), {'$set': {'deleted_at': datetime.now(timezone.utc).isoformat()}})
    if not result.matched_count:
        raise HTTPException(404, 'Alarm tidak ditemukan.')
    return Data(data={'ok': True})


# Import route registration after shared database and auth definitions.
from worship import register_routes  # noqa: E402
register_routes(router, db, http, current_user, Data, get_settings)
app.include_router(router)