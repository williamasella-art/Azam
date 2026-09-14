import Constants from 'expo-constants';
import { storage } from '@/src/utils/storage';
export const TOKEN_KEY = 'azam-session';
let token = '';
let unauthorized: (() => void) | null = null;
export const setToken = (value: string) => { token = value; };
export const onUnauthorized = (fn: () => void) => { unauthorized = fn; };
export async function api<T = any>(path: string, body?: unknown, method?: string): Promise<T> {
  // Expo web can retain a static manifest between config updates. Prefer the
  // runtime manifest; use the same build-time public variable as a fallback.
  const baseUrl = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) throw new Error('Alamat layanan belum tersedia. Silakan coba kembali.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api${path}`, {
      method: method || (body ? 'POST' : 'GET'), signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Layanan belum dapat dijangkau. Silakan coba lagi.');
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('/auth/session')) {
        token = ''; await storage.secureRemove(TOKEN_KEY); unauthorized?.();
      }
      throw new Error(typeof data.detail === 'string' ? data.detail : 'Data belum dapat disimpan. Periksa isian Anda.');
    }
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'Failed to fetch') throw new Error('Koneksi terputus. Silakan coba lagi.');
    throw error;
  } finally { clearTimeout(timeout); }
}
export function dayInZone(zone = 'Asia/Jakarta', value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}
const base = () => String(Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
/** Stored photos are private; web <img> cannot send headers so the session rides in the query string. */
export function fileUrl(path?: string | null) {
  return path && token ? `${base()}/api/files/${path}?token=${encodeURIComponent(token)}` : null;
}
export async function uploadPhoto(uri: string, mimeType?: string | null, fileName?: string | null) {
  const form = new FormData();
  const type = mimeType || 'image/jpeg'; const name = fileName || `photo.${type.split('/')[1] || 'jpg'}`;
  if (uri.startsWith('data:') || uri.startsWith('blob:')) form.append('file', await (await fetch(uri)).blob(), name);
  else form.append('file', { uri, type, name } as any);
  const response = await fetch(`${base()}/api/profile/photo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Foto belum dapat diunggah.');
  return data;
}