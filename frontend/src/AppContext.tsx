import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, dayInZone, onUnauthorized, setToken, TOKEN_KEY } from './api';
import { storage } from './utils/storage';
import { setColorScheme } from './theme';

WebBrowser.maybeCompleteAuthSession();
export type ScreenName = 'home' | 'quran' | 'focus' | 'progress' | 'settings' | 'qibla' | 'achievements' | 'pro' | 'reader' | 'hajj';
export const INTRO_KEY = 'azam-intro-done';
export const INTRO_PREFS_KEY = 'azam-intro-prefs';
const Context = createContext<any>(null);
const exchanged = new Set<string>();
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [introDone, setIntroDone] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [authError, setAuthError] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const settingsRef = useRef<any>(null);
  const [screen, setScreen] = useState<ScreenName>('home');
  const [surah, setSurah] = useState(1);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [now, setNow] = useState(new Date());
  const queryClient = useQueryClient();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snoozeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBlocker = useRef('');
  const notify = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(text); toastTimer.current = setTimeout(() => setToast(''), 4200);
  }, []);
  const loadSettings = useCallback(async () => {
    const value = await api('/settings'); settingsRef.current = value; setSettings(value);
    setColorScheme(value.dark ? 'dark' : 'light');
  }, []);
  const accept = useCallback(async (result: any) => {
    setToken(result.session_token);
    await storage.secureSet(TOKEN_KEY, result.session_token);
    await loadSettings();
    // Apply preferences captured during the pre-login guide (gender, reminder, location).
    const prefs = await storage.getItem<any>(INTRO_PREFS_KEY, null);
    const seenIntro = !!(await storage.getItem(INTRO_KEY, false));
    if ((prefs || seenIntro) && !settingsRef.current?.onboarded) {
      try {
        const value = await api('/settings', { ...settingsRef.current, ...(prefs || {}), onboarded: true }, 'PUT');
        settingsRef.current = value; setSettings(value);
      } catch { /* Settings remain editable from the app. */ }
    }
    setUser(result.user); setScreen('home');
  }, [loadSettings]);
  const finishIntro = useCallback(async (prefs: any) => {
    await storage.setItem(INTRO_PREFS_KEY, prefs); await storage.setItem(INTRO_KEY, true);
    setIntroDone(true); setShowIntro(false);
    if (settingsRef.current) {
      try {
        const value = await api('/settings', { ...settingsRef.current, ...prefs, onboarded: true }, 'PUT');
        settingsRef.current = value; setSettings(value);
      } catch { /* Preferences stay local until next save. */ }
    }
  }, []);
  const handleUrl = useCallback(async (url: string) => {
    const match = url.match(/[?#&]session_id=([^&#]+)/);
    if (!match) return false;
    const id = decodeURIComponent(match[1]);
    if (exchanged.has(id)) return true;
    exchanged.add(id); setLoading(true); setAuthError('');
    try {
      await accept(await api('/auth/session', { session_id: id }));
      if (Platform.OS === 'web') {
        const cleaned = new URL(window.location.href);
        cleaned.searchParams.delete('session_id');
        const hash = new URLSearchParams(cleaned.hash.slice(1)); hash.delete('session_id'); cleaned.hash = hash.toString();
        window.history.replaceState(window.history.state, '', cleaned.toString());
      }
    } catch (e: any) { setAuthError(e.message); } finally { setLoading(false); }
    return true;
  }, [accept]);
  useEffect(() => {
    onUnauthorized(() => { setUser(null); setSettings(null); settingsRef.current = null; queryClient.clear(); });
    const listener = Linking.addEventListener('url', ({ url }) => { void handleUrl(url); });
    (async () => {
      setIntroDone(!!(await storage.getItem(INTRO_KEY, false)));
      const initial = Platform.OS === 'web' ? window.location.href : await Linking.getInitialURL();
      if (initial && await handleUrl(initial)) return;
      try {
        const stored = await storage.secureGet(TOKEN_KEY, '');
        if (stored) { setToken(stored); const me = await api('/auth/me'); await loadSettings(); setUser(me); }
      } catch (e: any) { setAuthError(e.message); } finally { setLoading(false); }
    })();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => { listener.remove(); clearInterval(timer); if (toastTimer.current) clearTimeout(toastTimer.current); if (snoozeTimer.current) clearTimeout(snoozeTimer.current); };
  }, [handleUrl, loadSettings, queryClient]);
  const guest = async () => {
    setLoading(true); setAuthError('');
    try { await accept(await api('/auth/guest', {})); } catch (e: any) { setAuthError(e.message); } finally { setLoading(false); }
  };
  const google = async () => {
    setAuthError('');
    const redirect = Platform.OS === 'web' ? window.location.origin + '/' : Linking.createURL('');
    const url = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
    if (Platform.OS === 'web') { window.location.href = url; return; }
    try {
      const result = await WebBrowser.openAuthSessionAsync(url, redirect);
      if (result.type === 'success') await handleUrl(result.url);
      else { const initial = await Linking.getInitialURL(); if (initial) await handleUrl(initial); }
    } catch { setAuthError('Login Google belum berhasil. Silakan coba lagi.'); }
  };
  const updateSettings = async (patch: any) => {
    try {
      const value = await api('/settings', { ...settingsRef.current, ...patch }, 'PUT');
      settingsRef.current = value; setSettings(value); setColorScheme(value.dark ? 'dark' : 'light');
      return true;
    } catch (e: any) { notify(e.message); return false; }
  };
  const logout = async () => {
    if (snoozeTimer.current) clearTimeout(snoozeTimer.current);
    try { await api('/auth/logout', {}); } catch { /* Local cleanup always runs. */ }
    await storage.secureRemove(TOKEN_KEY); setToken(''); setUser(null); setSettings(null); settingsRef.current = null;
    setModal(null); setScreen('home'); setColorScheme('light'); queryClient.clear();
  };
  const day = dayInZone(settings?.timezone, now);
  const [month, setMonth] = useState(day.slice(0, 7));
  const progress = useQuery({ queryKey: ['progress', user?.user_id, month, day], queryFn: () => api(`/progress?month=${month}`).then(r => r.data), enabled: !!user });
  const prayers = useQuery({ queryKey: ['prayers', settings?.latitude, settings?.longitude, day], queryFn: () => api(`/prayers?latitude=${settings.latitude}&longitude=${settings.longitude}&day=${day}`).then(r => r.data), enabled: !!settings });
  const localMinute = new Intl.DateTimeFormat('en-GB', { timeZone: settings?.timezone || 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const nextDate = new Date(`${day}T12:00:00Z`); nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const tomorrow = nextDate.toISOString().slice(0, 10);
  const afterLastPrayer = !!prayers.data?.prayers?.length && !prayers.data.prayers.some((p: any) => p.time > localMinute);
  const tomorrowPrayers = useQuery({ queryKey: ['prayers', settings?.latitude, settings?.longitude, tomorrow], queryFn: () => api(`/prayers?latitude=${settings.latitude}&longitude=${settings.longitude}&day=${tomorrow}`).then(r => r.data), enabled: !!settings && afterLastPrayer });
  useEffect(() => {
    if (!user || !settings?.onboarded || !settings?.blocker_enabled || !settings.blocked_apps.length) return;
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nowMin = toMin(localMinute); const lead = settings.reminder_minutes ?? 10;
    const prayer = prayers.data?.prayers.find((p: any) => { const diff = toMin(p.time) - nowMin; return diff >= 0 && diff <= lead && settings.blocked_prayers.includes(p.name); });
    const key = prayer ? `${user.user_id}:${day}:${prayer.name}` : '';
    if (key && lastBlocker.current !== key) {
      lastBlocker.current = key;
      (async () => {
        const shown = await storage.getItem('last-blocker-demo', '');
        if (shown !== key) { await storage.setItem('last-blocker-demo', key); setModal({ type: 'blocker', prayer: prayer.name, pro: settings.pro_preview }); }
      })();
    }
  }, [user, settings, prayers.data, day, localMinute]);
  const daily = useQuery({ queryKey: ['daily', day], queryFn: () => api(`/quran/daily?day=${day}`).then(r => r.data), enabled: !!user, staleTime: 3600000 });
  // Celebrate newly unlocked levels once, per account.
  useEffect(() => {
    const levels = progress.data?.levels; if (!user || !levels) return;
    const key = `levels-seen:${user.user_id}`; const unlocked = levels.filter((l: any) => l.unlocked).map((l: any) => l.name);
    (async () => {
      const seen = (await storage.getItem<any>(key, null)) as string[] | null;
      if (seen === null) { await storage.setItem(key, unlocked); return; }
      const fresh = unlocked.filter((name: string) => !seen.includes(name));
      if (fresh.length) { await storage.setItem(key, unlocked); setModal({ type: 'levelup', level: fresh[fresh.length - 1] }); }
    })();
  }, [user, progress.data]);
  const [checking, setChecking] = useState(false);
  const checkin = async (name: string, date = day) => {
    if (checking) return;
    setChecking(true);
    const completed = !(date === day ? progress.data?.today : progress.data?.calendar[date])?.includes(name);
    try {
      await api('/checkins', { date, prayer: name, completed }, 'PUT');
      await queryClient.invalidateQueries({ queryKey: ['progress'] });
      if (completed) setModal({ type: 'success', prayer: name });
      else notify('Catatan salat dibatalkan.');
    } catch (e: any) { notify(e.message); } finally { setChecking(false); }
  };
  const [lastTab, setLastTab] = useState<ScreenName>('home');
  const go = (next: ScreenName) => { if (['home', 'qibla', 'focus', 'quran', 'progress'].includes(screen)) setLastTab(screen); setScreen(next); };
  const read = (number: number) => { setSurah(number); go('reader'); };
  const snooze = () => {
    if (snoozeTimer.current) clearTimeout(snoozeTimer.current);
    setModal(null);
    notify('Pengingat demonstrasi muncul dalam 5 menit selama sesi Azam tetap terbuka.');
    snoozeTimer.current = setTimeout(() => setModal({ type: 'blocker' }), 5 * 60 * 1000);
  };
  return <Context.Provider value={{ user, loading, authError, guest, google, logout, settings, updateSettings, screen, go, lastTab, surah, read, introDone, showIntro, setShowIntro, finishIntro,
    toast, notify, modal, setModal, now, day, month, setMonth, progress, prayers, tomorrowPrayers, daily, checkin, checking, snooze }}>{children}</Context.Provider>;
}
export const useApp = () => useContext(Context);