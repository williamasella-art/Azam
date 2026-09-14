import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Icon, T, Tap } from './ui';
import { MosqueArt } from './illustrations';

function HoldButton({ done }: { done: () => void }) {
  const s = useStyles(); const { colors } = useTheme(); const progress = useSharedValue(0); const [holding, setHolding] = useState(false);
  const doneRef = useRef(done);
  doneRef.current = done;
  // Keep the native handler stable while holding and while the clock updates.
  const gesture = useMemo(() => Gesture.LongPress().minDuration(3000).maxDistance(70).runOnJS(true)
    .onBegin(() => { setHolding(true); progress.value = withTiming(1, { duration: 3000 }); })
    .onStart(() => { doneRef.current(); })
    .onFinalize(() => { setHolding(false); cancelAnimation(progress); progress.value = withTiming(0, { duration: 180 }); }), [progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return <GestureDetector gesture={gesture}><Animated.View testID="demo-hold-button" accessible accessibilityLabel="Tahan selama 3 detik untuk menutup" accessibilityRole="button" style={s.holdButton}>
    <Animated.View style={[s.holdProgress, fill]} /><View style={s.holdContent}><Icon name="finger-print-outline" size={25} color={colors.onBrandPrimary} /><T size={14} weight="700" color={colors.onBrandPrimary}>{holding ? 'Tahan… sebentar lagi' : 'Tahan 3 detik untuk menutup'}</T></View>
  </Animated.View></GestureDetector>;
}
export function DemoOverlay() {
  const { modal, setModal, notify, settings, daily, snooze } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  const alarm = modal.type === 'alarm';
  const player = useAudioPlayer(alarm ? require('../../assets/audio/chime.wav') : null);
  useEffect(() => { if (alarm) { player.loop = true; player.volume = 0.5; player.play(); } return () => { try { player.pause(); } catch { /* Player may already be disposed. */ } }; }, [alarm, player]);
  const done = () => { if (alarm) player.pause(); setModal(null); notify(alarm ? 'Alhamdulillah. Awali hari dengan niat baik.' : 'Jeda selesai. Catat salatmu di Beranda setelah menunaikannya.'); };
  return <View style={[s.demo, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
    <ScrollView contentContainerStyle={s.demoContent} showsVerticalScrollIndicator={false}>
      <View style={s.demoTop}><Badge text={alarm ? 'DEMONSTRASI ALARM' : 'DEMONSTRASI JEDA'} icon="sparkles-outline" /><Tap testID="demo-close-button" style={s.close} onPress={() => { if (alarm) player.pause(); setModal(null); }}><Icon name="close" size={22} color={colors.heroInk} /></Tap></View>
      <View style={s.demoArt}><MosqueArt /></View>
      <View style={s.demoCopy}><T size={12} weight="700" color={colors.onBrandSecondary}>{alarm ? 'AWALI HARI DENGAN SYUKUR' : 'PANGGILAN TERBAIK TELAH TIBA'}</T>
        <T testID="demo-title" size={34} weight="800" style={s.center}>{alarm ? 'Selamat pagi,\nhati yang baik.' : 'Saatnya kembali\nkepada-Nya.'}</T>
        {alarm ? <><T size={49} weight="800" color={colors.onBrandSecondary}>{settings.alarm_time.replace(':', '.')}</T><T size={22} weight="700">{settings.alarm_phrase}</T></> : <T size={13} muted style={s.center}>Tinggalkan layar sejenak.{"\n"}Ada ketenangan yang menantimu dalam salat.</T>}
        {modal.pro && daily.data && <View style={s.verse}><T arabic size={25} style={s.center}>{daily.data.teksArab}</T><T muted size={11} style={s.center}>{daily.data.teksIndonesia}</T><T color={colors.onBrandSecondary} size={10}>QS. {daily.data.surah} : {daily.data.nomorAyat}</T></View>}
      </View>
      <View style={s.bottom}><HoldButton done={done} />
        {!alarm && <Button testID="demo-snooze-button" title="Ingatkan nanti · 5 menit" variant="secondary" onPress={snooze} />}
        <T size={10} muted style={s.center}>{alarm ? 'Demo di dalam Azam. Pengenalan ucapan belum aktif.\nAlarm belum berjalan di latar belakang.' : 'Ini demonstrasi. Aplikasi lain tidak diblokir.\nMenutup jeda tidak menandai salat selesai.'}</T>
      </View>
    </ScrollView>
  </View>;
}
const useStyles = makeStyles(c => ({
  demo: { flex: 1, backgroundColor: c.surfaceSecondary }, demoContent: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 24, gap: 18 }, demoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }, close: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.brandSecondary }, demoArt: { height: 200, borderRadius: 28, overflow: 'hidden' }, demoCopy: { alignItems: 'center', gap: 15 }, center: { textAlign: 'center' }, bottom: { gap: 13, marginTop: 'auto', paddingTop: 20 },
  holdButton: { height: 66, borderRadius: 21, backgroundColor: c.brandPrimary, overflow: 'hidden', justifyContent: 'center' }, holdProgress: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: c.onBrandTertiary }, holdContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, verse: { backgroundColor: c.brandSecondary, padding: 16, borderRadius: 20, alignItems: 'center', gap: 7 },
}));