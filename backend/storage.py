"""Emergent managed object storage: the app never talks to storage directly, only through these helpers."""
import os

import requests

STORAGE_BASE = (os.environ.get('INTEGRATION_PROXY_URL') or '').strip() or 'https://integrations.emergentagent.com'
STORAGE_URL = STORAGE_BASE.rstrip('/') + '/objstore/api/v1/storage'
APP_NAME = 'azam-app-blocker'
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f'{STORAGE_URL}/init', json={'emergent_key': os.environ.get('EMERGENT_LLM_KEY')}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()['storage_key']
    return storage_key


def _retry_stale(fn):
    """A stale storage_key surfaces as 503: reset and re-init once."""
    global storage_key
    try:
        return fn()
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 503:
            storage_key = None
            return fn()
        raise


def put_object(path: str, data: bytes, content_type: str) -> dict:
    def go():
        resp = requests.put(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': init_storage(), 'Content-Type': content_type}, data=data, timeout=120)
        resp.raise_for_status()
        return resp.json()
    return _retry_stale(go)


def get_object(path: str) -> tuple[bytes, str]:
    def go():
        resp = requests.get(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': init_storage()}, timeout=60)
        resp.raise_for_status()
        return resp.content, resp.headers.get('Content-Type', 'application/octet-stream')
    return _retry_stale(go)
