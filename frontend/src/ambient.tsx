import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useApp } from '@/src/AppContext';

export type AmbientKind = 'rain' | 'cat';
export const AMBIENTS: { key: AmbientKind; label: string; icon: string; description: string }[] = [
  { key: 'rain', label: 'Hujan', icon: 'rainy-outline', description: 'Rintik lembut di jendela' },
  { key: 'cat', label: 'Kucing', icon: 'paw-outline', description: 'Dengkur hangat yang menenangkan' },
];
export const PRO_AMBIENTS = [
  { key: 'thunder', label: 'Petir', icon: 'thunderstorm-outline' }, { key: 'wave', label: 'Ombak', icon: 'water-outline' },
  { key: 'fire', label: 'Api unggun', icon: 'bonfire-outline' }, { key: 'bird', label: 'Burung pagi', icon: 'leaf-outline' },
];
const Context = createContext<any>(null);
/**
 * Ambient mixer: rain and cat can play together, each with its own volume.
 * Sounds stop when the reader is left or when the ambience sheet closes outside the reader.
 */
export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, user, screen, modal } = useApp();
  const rain = useAudioPlayer(require('../assets/audio/rain.wav'));
  const cat = useAudioPlayer(require('../assets/audio/cat.wav'));
  const players = useRef({ rain, cat }); players.current = { rain, cat };
  const [active, setActive] = useState<AmbientKind[]>([]);
  const [volumes, setVolumes] = useState({ rain: 0.5, cat: 0.5 });
  const synced = useRef(false); const activeRef = useRef(active); activeRef.current = active;
  useEffect(() => { rain.loop = true; cat.loop = true; }, [rain, cat]);
  const pauseAll = () => Object.values(players.current).forEach(p => { try { p.pause(); } catch { /* disposed */ } });
  useEffect(() => {
    if (!settings || !user) { synced.current = false; setActive([]); pauseAll(); return; }
    if (synced.current) return; synced.current = true;
    setVolumes({ rain: settings.rain_volume, cat: settings.cat_volume });
    rain.volume = settings.rain_volume; cat.volume = settings.cat_volume;
  }, [settings, user, rain, cat]);
  const persist = (next: AmbientKind[]) => { void updateSettings({ ambient: next.length ? next.join(',') : 'none' }); };
  const stop = () => { pauseAll(); if (activeRef.current.length) { setActive([]); persist([]); } };
  const play = (kind: AmbientKind) => {
    const p = players.current[kind]; p.volume = volumes[kind]; p.play();
    const next = activeRef.current.includes(kind) ? activeRef.current : [...activeRef.current, kind]; setActive(next); persist(next);
  };
  const pause = (kind: AmbientKind) => { try { players.current[kind].pause(); } catch { /* disposed */ } const next = activeRef.current.filter(k => k !== kind); setActive(next); persist(next); };
  const toggle = (kind: AmbientKind) => (activeRef.current.includes(kind) ? pause(kind) : play(kind));
  const preview = (kind: AmbientKind, value: number) => { setVolumes(v => ({ ...v, [kind]: value })); players.current[kind].volume = value; };
  const commit = (kind: AmbientKind, value: number) => { preview(kind, value); void updateSettings({ [`${kind}_volume`]: Math.round(value * 100) / 100 }); };
  // Back out of the reader → silence. Closing the ambience sheet anywhere else → silence too.
  const previousScreen = useRef(screen); const previousModal = useRef(modal?.type);
  useEffect(() => {
    if (previousScreen.current === 'reader' && screen !== 'reader') stop();
    if (previousModal.current === 'ambient' && modal?.type !== 'ambient' && screen !== 'reader') stop();
    previousScreen.current = screen; previousModal.current = modal?.type;
  }, [screen, modal?.type]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Context.Provider value={{ active, volumes, play, pause, stop, toggle, preview, commit }}>{children}</Context.Provider>;
}
export const useAmbient = () => useContext(Context);
