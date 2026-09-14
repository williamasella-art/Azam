import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { storage } from '@/src/utils/storage';
import { Badge, Button, Card, Icon, T } from './ui';
import { PRAYER_ICONS } from './SocialDemo';

const control: { stop: () => void; play: () => void; playing: boolean; listeners: Set<(p: boolean) => void> } = { stop: () => {}, play: () => {}, playing: false, listeners: new Set() };
export const stopAdhan = () => control.stop();
export const playAdhanPreview = () => control.play();
function useAdhanPlaying() { const [p, setP] = useState(control.playing); useEffect(() => { control.listeners.add(setP); return () => { control.listeners.delete(setP); }; }, []); return p; }

/** Mounted once: plays the adhan (CC BY-SA, Wikimedia Commons) the minute a prayer time arrives while Azam is open. */
export function AdhanPlayer() {
  const { user, settings, prayers, day, localMinute, modal, setModal, notify } = useApp();
  const player = useAudioPlayer(require('../../assets/audio/adhan.mp3'));
  const status = useAudioPlayerStatus(player);
  const fired = useRef('');
  useEffect(() => { if (Platform.OS !== 'web') setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {}); }, []);
  useEffect(() => { control.playing = status.playing; control.listeners.forEach(fn => fn(status.playing)); }, [status.playing]);
  control.stop = () => { try { player.pause(); player.seekTo(0); } catch { /* disposed */ } };
  control.play = () => { try { player.seekTo(0); player.volume = 0.9; player.play(); } catch { /* disposed */ } };
  useEffect(() => {
    if (!user || !settings?.adhan_sound || !prayers.data) return;
    const prayer = prayers.data.prayers.find((p: any) => p.time === localMinute);
    if (!prayer) return;
    const key = `${user.user_id}:${day}:${prayer.name}`;
    if (fired.current === key) return; fired.current = key;
    (async () => {
      const played = await storage.getItem('adhan-played', '');
      if (played === key) return;
      await storage.setItem('adhan-played', key);
      control.play();
      if (!modal) setModal({ type: 'adhan', prayer: prayer.name, time: prayer.time }); else notify(`Azan ${prayer.name} berkumandang.`);
    })();
  }, [user, settings?.adhan_sound, prayers.data, localMinute, day]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Bottom sheet shown while the adhan plays: prayer name, time, stop button, quick check-in. */
export function AdhanSheet() {
  const { modal, setModal, checkin, checking, settings } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const playing = useAdhanPlaying();
  const wave = useSharedValue(0);
  useEffect(() => { wave.value = withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })), -1, false); }, [wave]);
  const ring = useAnimatedStyle(() => ({ opacity: playing ? 0.15 + wave.value * 0.35 : 0, transform: [{ scale: 1 + wave.value * 0.25 }] }));
  useEffect(() => () => stopAdhan(), []);
  return <View style={s.body}>
    <View style={s.artWrap}><Animated.View style={[s.ring, ring]} /><View style={s.art}><Icon name={PRAYER_ICONS[modal.prayer] || 'moon-outline'} size={40} color={colors.onBrandPrimary} /></View></View>
    <View style={{ alignItems: 'center', gap: 6 }}><Badge text={playing ? 'AZAN BERKUMANDANG' : 'WAKTU SALAT TIBA'} icon="volume-high-outline" gold={playing} /><T testID="adhan-title" size={30} weight="800" style={{ letterSpacing: -1 }}>Salat {modal.prayer}</T><T size={16} weight="700" color={colors.brandTertiary}>{String(modal.time || '').replace(':', '.')} · {settings.city}</T><T size={12} muted style={{ textAlign: 'center' }}>Jeda sejenak dari layar. Sempurnakan wudhu, hadapkan hati.</T></View>
    <Card style={s.dua}><T size={10} weight="800" color={colors.onBrandSecondary}>DOA SETELAH AZAN</T><T arabic size={20} style={{ textAlign: 'right', lineHeight: 38 }}>اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ</T><T size={11} muted>“Ya Allah, Tuhan pemilik panggilan yang sempurna ini dan salat yang ditegakkan, berilah Muhammad wasilah dan keutamaan, dan bangkitkan beliau pada kedudukan terpuji yang Engkau janjikan.”</T></Card>
    {playing ? <Button testID="adhan-stop-button" title="Hentikan azan" icon="stop-circle-outline" variant="secondary" onPress={stopAdhan} /> : <Button testID="adhan-replay-button" title="Putar azan" icon="play-outline" variant="secondary" onPress={playAdhanPreview} />}
    <Button testID="adhan-checkin-button" title={`Sudah salat ${modal.prayer}? Catat`} icon="checkmark-done-outline" loading={checking} onPress={async () => { stopAdhan(); await checkin(modal.prayer); }} />
    <Button testID="adhan-later-button" title="Nanti" variant="secondary" onPress={() => { stopAdhan(); setModal(null); }} />
  </View>;
}
const useStyles = makeStyles(c => ({
  body: { gap: 18, alignItems: 'stretch' }, artWrap: { width: 140, height: 140, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }, ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: c.brandTertiary },
  art: { width: 92, height: 92, borderRadius: 32, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center' }, dua: { gap: 8, backgroundColor: c.brandSecondary, borderColor: c.transparent },
}));
