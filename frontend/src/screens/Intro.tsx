import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { api, dayInZone } from '@/src/api';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { openSettings, requestLocation, requestNotifications } from '@/src/permissions';
import { Badge, Bg, Button, Card, Icon, Logo, T, Tap } from '@/src/components/ui';
import { PrayerLock, SocialFeedMock } from '@/src/components/SocialDemo';
import { CITIES } from '@/src/components/FormSheets';

const STEPS = ['Halo', 'Notifikasi', 'Lokasi', 'Tentang kamu', 'Salam', 'Demo', 'Pengingat'];
export function Intro() {
  const { finishIntro } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<any>({ reminder_minutes: 10, gender: '' });
  const [notifState, setNotifState] = useState<any>(null); const [locState, setLocState] = useState<any>(null); const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState<'idle' | 'feed' | 'locked' | 'done'>('idle');
  useEffect(() => { if (demo === 'feed') { const t = setTimeout(() => setDemo('locked'), 1800); return () => clearTimeout(t); } }, [demo]);
  const next = () => setStep(v => Math.min(v + 1, STEPS.length - 1));
  const notif = async () => {
    setBusy(true);
    try { const r: any = await requestNotifications(); setNotifState(r.unsupported ? { text: 'Notifikasi perangkat tersedia setelah aplikasi dipasang di ponsel. Di pratinjau web, langkah ini dilewati.', ok: false } : r.granted ? { text: 'Notifikasi aktif. Kamu akan diingatkan sebelum azan.', ok: true } : { text: 'Belum diizinkan. Kamu tetap bisa lanjut dan mengaturnya nanti.', ok: false, blocked: !r.canAskAgain }); }
    catch { setNotifState({ text: 'Notifikasi belum tersedia di perangkat ini.', ok: false }); } finally { setBusy(false); }
  };
  const applyLocation = async (lat: number, lon: number, name: string) => {
    try { const r = await api(`/prayers?latitude=${lat}&longitude=${lon}&day=${dayInZone()}`); setPrefs((p: any) => ({ ...p, city: name, latitude: lat, longitude: lon, timezone: r.data.timezone, location_set: true })); }
    catch { setPrefs((p: any) => ({ ...p, city: name, latitude: lat, longitude: lon, location_set: true })); }
    setLocState({ text: `Lokasi dipilih: ${name}`, ok: true });
  };
  const gps = async () => {
    setBusy(true);
    try {
      const permission = await requestLocation();
      if (!permission.granted) { setLocState({ text: 'Izin lokasi belum diberikan. Pilih kota di bawah, atau atur nanti.', ok: false, blocked: !permission.canAskAgain }); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let name = 'Lokasi saya';
      if (Platform.OS !== 'web') { try { const places = await Location.reverseGeocodeAsync(position.coords); name = places[0]?.city || places[0]?.subregion || name; } catch { /* keep coordinates */ } }
      await applyLocation(position.coords.latitude, position.coords.longitude, name);
    } catch { setLocState({ text: 'Lokasi belum terbaca. Pilih kota secara manual.', ok: false }); } finally { setBusy(false); }
  };
  const hero = [IMG.welcome, IMG.notif, IMG.location, IMG.gender, IMG.creator, IMG.instagram, IMG.timer][step];
  const feedback = (state: any, testID: string) => state && <View style={s.feedback}><Icon name={state.ok ? 'checkmark-circle' : 'information-circle-outline'} size={18} color={state.ok ? colors.success : colors.gold} /><T testID={testID} size={12} style={{ flex: 1 }}>{state.text}</T>{state.blocked && Platform.OS !== 'web' && <Button size="sm" variant="secondary" testID={`${testID}-settings`} title="Buka Pengaturan" onPress={openSettings} />}</View>;
  if (demo === 'feed' || demo === 'locked') return <View style={{ flex: 1, backgroundColor: colors.paper }}>
    <View style={{ flex: 1, paddingTop: insets.top }}><SocialFeedMock /></View>
    {demo === 'locked' && <PrayerLock prayer="Magrib" minutes={prefs.reminder_minutes} onDone={() => setDemo('done')} onSnooze={() => setDemo('done')} holdLabel="Tahan 3 detik · Saya sudah salat Magrib" footer={<T size={10} color={colors.muted} style={s.center}>Begini tampilan Azam saat waktu salat tiba di aplikasi yang kamu pilih.</T>} />}
    <View style={{ height: insets.bottom, backgroundColor: demo === 'locked' ? colors.pageTop : colors.paper }} />
  </View>;
  return <Bg>
    <ScrollView contentContainerStyle={[s.page, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
      <View style={s.topRow}><Logo size={34} wordmark /><Tap testID="intro-skip-button" onPress={() => finishIntro(prefs)} style={s.skip}><T size={12} weight="700" color={colors.onBrandSecondary}>Lewati</T></Tap></View>
      <View style={s.dots}>{STEPS.map((_, i) => <View key={i} style={[s.dot, i === step && s.dotActive, i < step && s.dotDone]} />)}</View>
      <Animated.View key={step} entering={FadeInRight.duration(380)} exiting={FadeOutLeft.duration(200)} style={s.body}>
        <Image source={hero} style={s.hero} testID={`intro-image-${step}`} />
        <Badge text={`${step + 1} / ${STEPS.length} · ${STEPS[step].toUpperCase()}`} />
        {step === 0 && <><T testID="intro-title" size={30} weight="800" style={s.title}>Assalamu’alaikum 👋</T><T muted size={14} style={s.text}>Azam bantu kamu jeda dari layar saat azan, bangun dengan dzikir, dan menjaga streak salat. Yuk kenalan sebentar.</T>
          <Button testID="intro-next-button" title="Mulai tur singkat" icon="arrow-forward" onPress={next} /></>}
        {step === 1 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Aktifkan notifikasi</T><T muted size={14} style={s.text}>Kami ingatkan beberapa menit sebelum azan, supaya kamu bisa bersiap tanpa terlambat.</T>
          {feedback(notifState, 'intro-notif-status')}
          <Button testID="intro-notif-button" title={notifState?.ok ? 'Notifikasi aktif ✓' : 'Aktifkan notifikasi'} icon="notifications-outline" loading={busy} onPress={notif} disabled={notifState?.ok} />
          <Button testID="intro-next-button" title={notifState ? 'Lanjut' : 'Nanti saja'} variant="secondary" onPress={next} /></>}
        {step === 2 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Aktifkan lokasi</T><T muted size={14} style={s.text}>Lokasi dipakai untuk jadwal salat & arah kiblat. Tidak dilacak di latar belakang.</T>
          {feedback(locState, 'intro-location-status')}
          <Button testID="intro-location-button" title="Gunakan lokasi saya" icon="locate-outline" loading={busy} onPress={gps} />
          <View style={s.chips}>{CITIES.map(c => <Tap key={c.name} testID={`intro-city-${c.name.toLowerCase().replaceAll(' ', '-')}`} onPress={() => applyLocation(c.lat, c.lon, c.name)} style={[s.chip, prefs.city === c.name && s.chipOn]}><T size={11} weight="600" color={prefs.city === c.name ? colors.onBrandPrimary : colors.onSurface}>{c.name}</T></Tap>)}</View>
          <Button testID="intro-next-button" title={prefs.location_set ? 'Lanjut' : 'Pilih nanti'} variant="secondary" onPress={next} /></>}
        {step === 3 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Tentang kamu</T><T muted size={14} style={s.text}>Supaya sapaan & panduan ibadah terasa lebih personal.</T>
          <View style={s.genderRow}>{[['pria', 'Laki-laki', 'man-outline'], ['wanita', 'Perempuan', 'woman-outline']].map(([key, label, icon]) => <Tap key={key} testID={`intro-gender-${key}`} onPress={() => setPrefs((p: any) => ({ ...p, gender: key }))} style={[s.genderCard, prefs.gender === key && s.genderOn]} accessibilityState={{ selected: prefs.gender === key }}><Icon name={icon} size={34} color={prefs.gender === key ? colors.onBrandPrimary : colors.onBrandSecondary} /><T weight="700" color={prefs.gender === key ? colors.onBrandPrimary : colors.onSurface}>{label}</T></Tap>)}</View>
          <Button testID="intro-next-button" title={prefs.gender ? 'Lanjut' : 'Lewati dulu'} icon="arrow-forward" onPress={next} /></>}
        {step === 4 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Salam hangat 💙</T>
          <Card style={s.letter}><T paper size={14} style={{ lineHeight: 24 }}>“Halo, {prefs.gender === 'wanita' ? 'Ukhti' : prefs.gender === 'pria' ? 'Akhi' : 'Sahabat'}. Azam lahir dari pengalaman sederhana: notifikasi terus datang, sementara azan sering terlewat. Aplikasi ini bukan untuk menghakimi, tapi menemani. Satu jeda kecil setiap hari, insyaAllah jadi kebiasaan baik.”</T><View style={s.sign}><View style={s.avatar}><T weight="800" color={colors.onBrandPrimary}>A</T></View><View><T paper size={12} weight="700">Tim Azam</T><T paper size={10} muted>Dibuat dengan niat baik, untukmu.</T></View></View></Card>
          <Button testID="intro-next-button" title="Lihat cara kerjanya" icon="play-outline" onPress={next} /></>}
        {step === 5 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Begini cara Azam bekerja</T><T muted size={14} style={s.text}>Buka aplikasi pilihanmu seperti biasa. Saat waktu salat mendekat, layar dijeda sampai kamu selesai salat.</T>
          {demo === 'done' && <View style={s.feedback}><Icon name="checkmark-circle" size={18} color={colors.success} /><T testID="intro-demo-done" size={12} style={{ flex: 1 }}>Kamu sudah mencoba jeda salat. Di ponsel, ini yang akan muncul di atas aplikasi terpilih.</T></View>}
          <Button testID="intro-demo-button" title={demo === 'done' ? 'Coba lagi' : 'Buka Instagram (demo)'} icon="logo-instagram" onPress={() => setDemo('feed')} variant={demo === 'done' ? 'secondary' : 'primary'} />
          <Button testID="intro-next-button" title="Lanjut" variant={demo === 'done' ? 'primary' : 'secondary'} onPress={next} /></>}
        {step === 6 && <><T testID="intro-title" size={28} weight="800" style={s.title}>Diingatkan berapa menit sebelum azan?</T><T muted size={14} style={s.text}>Aplikasi terpilih akan dijeda sejak waktu ini hingga kamu mencatat salat.</T>
          <View style={s.chips}>{[5, 10, 15, 30].map(m => <Tap key={m} testID={`intro-reminder-${m}`} onPress={() => setPrefs((p: any) => ({ ...p, reminder_minutes: m }))} style={[s.minuteChip, prefs.reminder_minutes === m && s.chipOn]}><T size={22} weight="800" color={prefs.reminder_minutes === m ? colors.onBrandPrimary : colors.onSurface}>{m}</T><T size={10} color={prefs.reminder_minutes === m ? colors.onBrandPrimary : colors.muted}>menit</T></Tap>)}</View>
          <Button testID="intro-finish-button" title="Selesai, masuk ke Azam" icon="checkmark" onPress={() => finishIntro(prefs)} /></>}
        {step > 0 && <Tap testID="intro-back-button" onPress={() => setStep(v => v - 1)} style={s.back}><Icon name="arrow-back" size={16} color={colors.muted} /><T size={12} color={colors.muted}>Kembali</T></Tap>}
      </Animated.View>
    </ScrollView>
  </Bg>;
}
const useStyles = makeStyles(c => ({
  page: { flexGrow: 1, paddingHorizontal: 22, gap: 14 }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, skip: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6 }, dot: { flex: 1, height: 5, borderRadius: 3, backgroundColor: c.glass }, dotActive: { backgroundColor: c.brandTertiary }, dotDone: { backgroundColor: c.brandSecondary },
  body: { gap: 14, flexGrow: 1 }, hero: { width: '100%', height: 168, borderRadius: 24, resizeMode: 'cover' }, title: { letterSpacing: -0.8 }, text: { lineHeight: 22 }, center: { textAlign: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, chipOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  minuteChip: { flex: 1, minHeight: 74, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  genderRow: { flexDirection: 'row', gap: 12 }, genderCard: { flex: 1, minHeight: 110, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, genderOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  letter: { gap: 14, backgroundColor: c.paper, borderColor: c.paper }, sign: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: c.brandDeep, alignItems: 'center', justifyContent: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', minHeight: 44 },
}));
