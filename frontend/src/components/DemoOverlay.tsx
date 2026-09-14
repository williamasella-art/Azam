import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Alarm, describeRepeat, dismissAlarmNotifications, scheduleSnooze } from '@/src/alarms';
import { Badge, Bg, Button, Icon, T, Tap } from './ui';
import { HoldButton, PrayerLock, SocialFeedMock } from './SocialDemo';
import { AnimatedCat } from './AnimatedCat';

export function DemoOverlay() {
  const { modal, setModal, notify, settings, daily, snooze, saveAlarm } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  const alarm = modal.type === 'alarm'; const real: Alarm | undefined = modal.alarm; const preview = !!modal.preview;
  const player = useAudioPlayer(alarm ? require('../../assets/audio/chime.wav') : null);
  useEffect(() => { if (alarm) { player.loop = true; player.volume = 0.5; player.play(); } return () => { try { player.pause(); } catch { /* Player may already be disposed. */ } }; }, [alarm, player]);
  const close = () => { if (alarm) player.pause(); setModal(null); };
  const finishAlarm = () => { if (real && !preview) { void dismissAlarmNotifications(); if (real.repeat === 'once' && real.enabled) void saveAlarm({ ...real, enabled: false }, real.id).catch(() => {}); } };
  const done = () => { close(); finishAlarm(); notify(alarm ? 'Alhamdulillah. Awali hari dengan niat baik.' : 'Jeda selesai. Catat salatmu di Beranda setelah menunaikannya.'); };
  const snoozeAlarm = async () => { if (!real) return; const ok = preview ? true : await scheduleSnooze(real).catch(() => false); if (!preview) void dismissAlarmNotifications(); close(); notify(ok ? `Alarm ditunda ${real.snooze_minutes} menit.` : 'Tunda memerlukan izin notifikasi. Alarm ditutup.'); };
  if (alarm) return <Bg style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
    <View style={s.top}><Badge text={real && !preview ? 'ALARM BERBUNYI' : real ? 'PRATINJAU ALARM' : 'DEMONSTRASI ALARM'} icon={real && !preview ? 'alarm' : 'sparkles-outline'} /><Tap testID="demo-close-button" style={s.close} onPress={close}><Icon name="close" size={22} /></Tap></View>
    <Animated.View entering={FadeInDown.duration(500)} style={s.alarmBody}>
      <View style={s.alarmArt}><AnimatedCat size={200} /></View>
      <T size={12} weight="700" color={colors.onBrandSecondary}>{real ? real.label.toUpperCase() : 'AWALI HARI DENGAN SYUKUR'}</T>
      <T testID="demo-title" size={32} weight="800" style={s.center}>Selamat pagi,{"\n"}hati yang baik.</T>
      <T testID="alarm-ring-time" size={56} weight="800" color={colors.brandTertiary} style={{ letterSpacing: -2 }}>{(real?.time || settings.alarm_time).replace(':', '.')}</T>
      {real && <T size={12} muted>{describeRepeat(real)}</T>}
      <View style={s.phrase}><Icon name="mic-outline" size={18} color={colors.gold} /><T size={20} weight="700">{real?.phrase || settings.alarm_phrase}</T></View>
      <T size={12} muted style={s.center}>Ucapkan kalimat di atas, lalu tahan tombol untuk mematikan alarm.</T>
    </Animated.View>
    <View style={s.bottom}>{real && <Button testID="alarm-snooze-button" title={`Tunda ${real.snooze_minutes} menit`} icon="moon-outline" variant="secondary" onPress={snoozeAlarm} />}<HoldButton done={done} label="Tahan 3 detik · Matikan alarm" /><T size={10} muted style={s.center}>{real ? 'Alarm dijadwalkan lewat notifikasi HP · pengenalan ucapan menyusul pada versi native.' : 'Demo di dalam Azam. Pengenalan ucapan menyusul pada versi native.'}</T></View>
  </Bg>;
  return <View style={{ flex: 1, backgroundColor: colors.paper }}>
    <View style={{ flex: 1, paddingTop: insets.top }}><SocialFeedMock /></View>
    <PrayerLock prayer={modal.prayer || 'Magrib'} minutes={settings.reminder_minutes ?? 10} onDone={done} onSnooze={snooze} pro={modal.pro} verse={daily.data}
      footer={<View style={{ gap: 6, alignItems: 'center' }}><Tap testID="demo-close-button" onPress={close} style={{ minHeight: 40, justifyContent: 'center' }}><T size={12} weight="700" color={colors.heroMuted}>Lewati darurat</T></Tap><T size={10} color={colors.muted} style={s.center}>Demonstrasi di dalam Azam · aplikasi lain belum diblokir.</T></View>} />
    <View style={{ height: insets.bottom, backgroundColor: colors.heroShade }} />
  </View>;
}
const useStyles = makeStyles(c => ({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 }, close: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.glass },
  alarmBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 26 }, alarmArt: { width: 220, height: 220, borderRadius: 72, marginBottom: 8, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, center: { textAlign: 'center' },
  phrase: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 18, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  bottom: { gap: 12, padding: 22 },
}));
