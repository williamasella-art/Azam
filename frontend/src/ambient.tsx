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
export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, user } = useApp();
  const rain = useAudioPlayer(require('../assets/audio/rain.wav'));
  const cat = useAudioPlayer(require('../assets/audio/cat.wav'));
  const players = useRef({ rain, cat }); players.current = { rain, cat };
  const [active, setActive] = useState<AmbientKind | 'none'>('none');
  const [volumes, setVolumes] = useState({ rain: 0.5, cat: 0.5 });
  const synced = useRef(false);
  useEffect(() => { rain.loop = true; cat.loop = true; }, [rain, cat]);
  // Restore the last saved ambience once per session; stop everything on logout.
  useEffect(() => {
    if (!settings || !user) { synced.current = false; setActive('none'); Object.values(players.current).forEach(p => { try { p.pause(); } catch { /* disposed */ } }); return; }
    if (synced.current) return; synced.current = true;
    setVolumes({ rain: settings.rain_volume, cat: settings.cat_volume });
    rain.volume = settings.rain_volume; cat.volume = settings.cat_volume;
  }, [settings, user, rain, cat]);
  const play = (kind: AmbientKind) => {
    Object.entries(players.current).forEach(([k, p]) => { if (k !== kind) p.pause(); });
    const p = players.current[kind]; p.volume = volumes[kind]; p.play(); setActive(kind);
    void updateSettings({ ambient: kind });
  };
  const stop = () => { Object.values(players.current).forEach(p => p.pause()); setActive('none'); void updateSettings({ ambient: 'none' }); };
  const toggle = (kind: AmbientKind) => (active === kind ? stop() : play(kind));
  const preview = (kind: AmbientKind, value: number) => { setVolumes(v => ({ ...v, [kind]: value })); players.current[kind].volume = value; };
  const commit = (kind: AmbientKind, value: number) => { preview(kind, value); void updateSettings({ [`${kind}_volume`]: Math.round(value * 100) / 100 }); };
  return <Context.Provider value={{ active, volumes, play, stop, toggle, preview, commit }}>{children}</Context.Provider>;
}
export const useAmbient = () => useContext(Context);
