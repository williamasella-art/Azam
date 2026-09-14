import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Card, Icon, T, Tap } from '@/src/components/ui';
import { MosqueArt } from '@/src/components/illustrations';

export function Welcome() {
  const { guest, google, loading, authError } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  return <ScrollView style={s.page} contentContainerStyle={[s.welcome, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 22 }]}>
    <View style={s.brandRow}><View style={s.logo}><Icon name="moon" color={colors.onBrandPrimary} size={24} /></View><T size={27} weight="800">azam<T color={colors.brandPrimary} size={28}>.</T></T><View style={s.brandSpacer} /><Badge text="RUANG UNTUK IMAN" /></View>
    <Animated.View entering={FadeInDown.duration(650)} style={s.art}><MosqueArt /><View style={s.artLabel}><Icon name="shield-checkmark-outline" size={15} color={colors.heroInk} /><T size={11} weight="600" color={colors.heroInk}>Jeda sejenak. Dekat kembali.</T></View></Animated.View>
    <Animated.View entering={FadeInDown.delay(150).duration(600)} style={s.copy}>
      <T size={33} weight="800" style={s.title}>Kurangi distraksi.{"\n"}Dekatkan hati.</T>
      <T muted size={14} style={s.description}>Temani langkah kecilmu menjaga salat,{"\n"}membaca ayat, dan menemukan ketenangan.</T>
      <View style={s.features}>{[['shield-checkmark-outline', 'Jaga fokus'], ['book-outline', 'Baca ayat'], ['sparkles-outline', 'Istiqamah']].map(([icon, text]) => <View key={text} style={s.feature}><Icon name={icon} size={18} color={colors.onBrandSecondary} /><T size={11} weight="600">{text}</T></View>)}</View>
    </Animated.View>
    <View style={s.actions}>{authError ? <T testID="auth-error" color={colors.error} style={s.center}>{authError}</T> : null}
      <Button testID="google-login-button" title="Lanjutkan dengan Google" icon="logo-google" onPress={google} loading={loading} />
      <Button testID="guest-login-button" title="Masuk tanpa akun" onPress={guest} variant="secondary" loading={loading} />
      <T size={10} muted style={s.center}>Privasi terjaga. Mulai dengan niat baik.</T>
    </View>
  </ScrollView>;
}

export function Setup() {
  const { settings, updateSettings, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  return <ScrollView contentContainerStyle={s.setup} showsVerticalScrollIndicator={false}>
    <Badge text="SELAMAT DATANG DI AZAM" icon="sparkles-outline" />
    <T size={30} weight="800">Awali dengan{"\n"}niat yang baik.</T><T muted>Atur kenyamananmu. Semua izin dapat diubah kapan saja di pengaturan.</T>
    <Card style={s.setupCard}><View style={s.circle}><Icon name="location-outline" color={colors.brandPrimary} /></View><T size={18} weight="700">Salat tepat pada waktunya</T><T muted size={13}>Lokasi digunakan untuk menghitung jadwal salat dan arah kiblat, bukan melacak perjalanan.</T><Button testID="setup-location-button" title={settings.location_set ? `Lokasi: ${settings.city}` : 'Atur lokasi'} onPress={() => setModal({ type: 'location' })} variant="secondary" icon={settings.location_set ? 'checkmark-circle-outline' : 'locate-outline'} /></Card>
    <Card style={s.setupCard}><View style={s.circle}><Icon name="notifications-outline" color={colors.brandPrimary} /></View><T size={18} weight="700">Pengingat yang menenangkan</T><T muted size={13}>Izinkan notifikasi untuk pengingat salat di perangkat. Anda tetap bisa melanjutkan tanpa izin.</T><Button testID="setup-notifications-button" title={settings.notifications ? 'Notifikasi diizinkan' : 'Atur notifikasi'} onPress={() => setModal({ type: 'notifications' })} variant="secondary" /></Card>
    <Tap testID="setup-demo-button" onPress={() => setModal({ type: 'blocker' })} style={s.demoRow}><Icon name="play-circle-outline" color={colors.brandPrimary} /><T weight="700" color={colors.onBrandSecondary}>Lihat demonstrasi jeda salat</T><Icon name="arrow-forward" size={18} color={colors.brandPrimary} /></Tap>
    <Button testID="setup-finish-button" title="Mulai perjalanan saya" icon="arrow-forward" onPress={() => updateSettings({ onboarded: true })} />
    {!settings.location_set && <T size={11} muted style={s.center}>Jadwal awal memakai Jakarta. Ubah lokasi kapan saja.</T>}
  </ScrollView>;
}

export function Loading() {
  const s = useStyles(); const { colors } = useTheme(); return <View style={s.loading}><View style={s.logo}><Icon name="moon" color={colors.onBrandPrimary} /></View><T size={27} weight="800">azam.</T><ActivityIndicator color={colors.brandPrimary} /></View>;
}
const useStyles = makeStyles(c => ({
  page: { flex: 1, backgroundColor: c.surfaceSecondary }, welcome: { flexGrow: 1, paddingHorizontal: 26, gap: 24 },
  brandRow: { flexDirection: 'row', gap: 10, alignItems: 'center' }, brandSpacer: { flex: 1 },
  logo: { width: 43, height: 43, borderRadius: 15, backgroundColor: c.brandPrimary, justifyContent: 'center', alignItems: 'center' },
  art: { height: 286, borderRadius: 30, overflow: 'hidden' }, artLabel: { position: 'absolute', bottom: 19, alignSelf: 'center', backgroundColor: c.glass, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  copy: { gap: 15 }, title: { textAlign: 'center', lineHeight: 45, letterSpacing: -1.3 }, description: { textAlign: 'center', lineHeight: 23 },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }, feature: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actions: { gap: 12, marginTop: 'auto' }, center: { textAlign: 'center' },
  setup: { padding: 24, gap: 24, paddingBottom: 40 }, setupCard: { gap: 13 }, circle: { width: 48, height: 48, borderRadius: 17, backgroundColor: c.brandSecondary, justifyContent: 'center', alignItems: 'center' },
  demoRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  loading: { flex: 1, backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center', gap: 20 },
}));