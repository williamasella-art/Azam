import math
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Literal

import httpx
from fastapi import Depends, HTTPException, Query
from pydantic import BaseModel

PRAYERS = {'Subuh': 'Fajr', 'Zuhur': 'Dhuhr', 'Asar': 'Asr', 'Magrib': 'Maghrib', 'Isya': 'Isha'}


class CheckIn(BaseModel):
    date: date
    prayer: Literal['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya']
    completed: bool


def register_routes(router, db, http, current_user, Data, get_settings):
    async def cached(key, url, params=None):
        hit = await db.cache.find_one({'key': key}, {'_id': 0})
        if hit and hit['expires_at'].replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
            return hit['data']
        try:
            response = await http.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
            if payload.get('code') != 200 or 'data' not in payload:
                raise ValueError('invalid payload')
        except (httpx.HTTPError, ValueError):
            raise HTTPException(503, 'Sumber data belum dapat dijangkau. Silakan coba lagi.')
        await db.cache.update_one({'key': key}, {'$set': {'data': payload['data'], 'expires_at': datetime.now(timezone.utc) + timedelta(days=7)}}, upsert=True)
        return payload['data']

    @router.get('/prayers', response_model=Data)
    async def prayers(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180), day: date = Query()):
        data = await cached(f'prayers:{day}:{latitude:.4f}:{longitude:.4f}',
                            f'https://api.aladhan.com/v1/timings/{day.strftime("%d-%m-%Y")}',
                            {'latitude': latitude, 'longitude': longitude, 'method': 20})
        times = [{'name': name, 'time': data['timings'][key][:5]} for name, key in PRAYERS.items()]
        return Data(data={'prayers': times, 'sunrise': data['timings']['Sunrise'][:5],
                          'hijri': data['date']['hijri'], 'timezone': data['meta']['timezone'],
                          'method': 'Kemenag RI · AlAdhan', 'date': day.isoformat()})

    @router.get('/quran', response_model=Data)
    async def quran():
        return Data(data=await cached('quran-list', 'https://equran.id/api/v2/surat'))

    @router.get('/quran/daily', response_model=Data)
    async def daily(day: date = Query()):
        choices = [(94, 5), (93, 5), (2, 152), (13, 28), (94, 6), (2, 153), (20, 14), (65, 3), (39, 53), (2, 186), (29, 69), (3, 139), (12, 87), (2, 286), (57, 4), (50, 16), (73, 8), (17, 78), (11, 114), (62, 10), (2, 45), (103, 3), (8, 2), (33, 41)]
        surah, verse = choices[day.toordinal() % len(choices)]
        data = await cached(f'quran-{surah}', f'https://equran.id/api/v2/surat/{surah}')
        item = next(item for item in data['ayat'] if item['nomorAyat'] == verse)
        return Data(data={**item, 'surah': data['namaLatin'], 'number': surah})

    @router.get('/quran/{number}', response_model=Data)
    async def surah(number: int):
        if not 1 <= number <= 114:
            raise HTTPException(422, 'Nomor surah harus 1–114.')
        return Data(data=await cached(f'quran-{number}', f'https://equran.id/api/v2/surat/{number}'))

    @router.get('/qibla', response_model=Data)
    async def qibla(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180)):
        lat, lon, kaaba_lat, kaaba_lon = map(math.radians, [latitude, longitude, 21.422487, 39.826206])
        delta = kaaba_lon - lon
        bearing = (math.degrees(math.atan2(math.sin(delta), math.cos(lat) * math.tan(kaaba_lat) - math.sin(lat) * math.cos(delta))) + 360) % 360
        a = math.sin((kaaba_lat-lat)/2)**2 + math.cos(lat)*math.cos(kaaba_lat)*math.sin(delta/2)**2
        distance = 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(max(0, 1-a)))
        return Data(data={'bearing': round(bearing, 1), 'distance_km': round(distance)})

    @router.put('/checkins', response_model=Data)
    async def checkin(body: CheckIn, user=Depends(current_user)):
        settings = await get_settings(user)
        today = datetime.now(ZoneInfo(settings.timezone)).date()
        if body.date > today:
            raise HTTPException(422, 'Salat di masa depan belum dapat dicatat.')
        key = {'user_id': user['user_id'], 'date': body.date.isoformat(), 'prayer': body.prayer}
        if body.completed:
            await db.logs.update_one(key, {'$set': {'completed_at': datetime.now(timezone.utc).isoformat()}}, upsert=True)
        else:
            await db.logs.delete_one(key)
        return Data(data={'ok': True, 'completed': body.completed})

    @router.get('/progress', response_model=Data)
    async def progress(month: str = Query(pattern=r'^\d{4}-\d{2}$'), user=Depends(current_user)):
        try:
            date.fromisoformat(f'{month}-01')
        except ValueError:
            raise HTTPException(422, 'Bulan tidak valid.')
        logs = await db.logs.find({'user_id': user['user_id']}, {'_id': 0}).to_list(50000)
        grouped = {}
        for log in logs:
            grouped.setdefault(log['date'], []).append(log['prayer'])
        settings = await get_settings(user)
        today = datetime.now(ZoneInfo(settings.timezone)).date()
        full = {day for day, names in grouped.items() if len(names) == 5}
        cursor = today if today.isoformat() in full else today - timedelta(days=1)
        streak = 0
        while cursor.isoformat() in full:
            streak += 1
            cursor -= timedelta(days=1)
        best = run = 0
        previous = None
        for day in sorted(full):
            d = date.fromisoformat(day)
            run = run + 1 if previous and d == previous + timedelta(days=1) else 1
            best = max(best, run)
            previous = d
        levels = [{'name': 'Awan', 'days': 1, 'icon': 'cloud'}, {'name': 'Bintang', 'days': 7, 'icon': 'star'},
                  {'name': 'Purnama', 'days': 30, 'icon': 'moon'}, {'name': 'Syams', 'days': 100, 'icon': 'sunny'}]
        return Data(data={'streak': streak, 'best': best, 'total': len(logs), 'complete_days': len(full),
                          'today': grouped.get(today.isoformat(), []), 'date': today.isoformat(),
                          'recent': {d: p for d, p in grouped.items() if (today - timedelta(days=6)).isoformat() <= d <= today.isoformat()},
                          'calendar': {d: p for d, p in grouped.items() if d.startswith(month)},
                          'levels': [{**level, 'unlocked': best >= level['days']} for level in levels]})