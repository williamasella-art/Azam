import React from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Bg, Button, Icon, Logo, T, Tap } from '@/src/components/ui';

export function Welcome() {
  const { guest, google, loading, authError, setShowIntro } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  return <Bg><ScrollView contentContainerStyle={[s.welcome, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 22 }]} showsVerticalScrollIndicator={false}>
    <View style={s.brandRow}><Logo size={44} wordmark /><Badge text="APP BLOCKER" icon="shield-checkmark-outline" /></View>
    <Animated.View entering={FadeInDown.duration(650)} style={s.art}><Image source={IMG.welcome} style={s.artImage} /><View style={s.artLabel}><Icon name="sparkles-outline" size={14} color={colors.heroInk} /><T size={11} weight="600" color={colors.heroInk}>Jeda sejenak. Dekat kembali.</T></View></Animated.View>
    <Animated.View entering={FadeInDown.delay(150).duration(600)} style={s.copy}>
      <T size={32} weight="800" style={s.title}>Kurangi distraksi.{"\n"}Dekatkan hati.</T>
      <T muted size={14} style={s.description}>Blokir aplikasi saat azan, alarm dzikir, Al-Qur’an, kiblat, dan streak salat dalam satu tempat.</T>
      <View style={s.features}>{[['shield-checkmark-outline', 'Blokir saat azan'], ['flame-outline', 'Streak salat'], ['book-outline', 'Al-Qur’an']].map(([icon, text]) => <View key={text} style={s.feature}><Icon name={icon} size={16} color={colors.brandTertiary} /><T size={11} weight="600">{text}</T></View>)}</View>
    </Animated.View>
    <View style={s.actions}>{authError ? <T testID="auth-error" color={colors.error} style={s.center}>{authError}</T> : null}
      <Button testID="google-login-button" title="Lanjutkan dengan Google" icon="logo-google" onPress={google} loading={loading} variant="paper" />
      <Button testID="guest-login-button" title="Masuk tanpa akun" icon="arrow-forward" onPress={guest} loading={loading} />
      <Tap testID="welcome-intro-button" onPress={() => setShowIntro(true)} style={s.link}><Icon name="play-circle-outline" size={16} color={colors.onBrandSecondary} /><T size={12} weight="600" color={colors.onBrandSecondary}>Lihat lagi cara penggunaan</T></Tap>
      <T size={10} muted style={s.center}>Privasi terjaga. Mulai dengan niat baik.</T>
    </View>
  </ScrollView></Bg>;
}
export function Loading() {
  const s = useStyles(); const { colors } = useTheme(); return <Bg style={s.loading}><Logo size={72} /><T size={26} weight="800">Azam</T><ActivityIndicator color={colors.brandPrimary} /></Bg>;
}
const useStyles = makeStyles(c => ({
  welcome: { flexGrow: 1, paddingHorizontal: 24, gap: 22 }, brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  art: { height: 190, borderRadius: 28, overflow: 'hidden' }, artImage: { width: '100%', height: '100%' }, artLabel: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: c.overlay, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  copy: { gap: 12 }, title: { textAlign: 'center', lineHeight: 42, letterSpacing: -1.2 }, description: { textAlign: 'center', lineHeight: 22 },
  features: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 }, feature: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actions: { gap: 12, marginTop: 'auto' }, center: { textAlign: 'center' }, link: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  loading: { justifyContent: 'center', alignItems: 'center', gap: 16 },
}));
