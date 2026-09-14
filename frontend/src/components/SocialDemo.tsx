import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Button, Icon, Logo, T } from './ui';

export const PRAYER_ICONS: Record<string, string> = { Subuh: 'cloudy-night-outline', Zuhur: 'sunny-outline', Asar: 'partly-sunny-outline', Magrib: 'moon-outline', Isya: 'star-outline' };

/** Long-press (3s) confirmation used by the blocker and alarm demos. */
export function HoldButton({ done, label = 'Tahan 3 detik · Saya sudah salat', testID = 'demo-hold-button' }: { done: () => void; label?: string; testID?: string }) {
  const s = useStyles(); const { colors } = useTheme(); const progress = useSharedValue(0); const [holding, setHolding] = useState(false);
  const doneRef = useRef(done); doneRef.current = done;
  const gesture = useMemo(() => Gesture.LongPress().minDuration(3000).maxDistance(70).runOnJS(true)
    .onBegin(() => { setHolding(true); progress.value = withTiming(1, { duration: 3000, easing: Easing.linear }); })
    .onStart(() => { doneRef.current(); })
    .onFinalize(() => { setHolding(false); cancelAnimation(progress); progress.value = withTiming(0, { duration: 180 }); }), [progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return <GestureDetector gesture={gesture}><Animated.View testID={testID} accessible accessibilityLabel="Tahan selama 3 detik untuk menutup" accessibilityRole="button" style={s.holdButton}>
    <LinearGradient colors={[colors.brandTertiary, colors.brandDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.holdBg} />
    <Animated.View style={[s.holdProgress, fill]} /><View style={s.holdContent}><Icon name="finger-print-outline" size={24} color={colors.onBrandPrimary} /><T size={14} weight="700" color={colors.onBrandPrimary}>{holding ? 'Tahan… sebentar lagi' : label}</T></View>
  </Animated.View></GestureDetector>;
}

/** A generic social feed mock, used purely for demonstration. */
export function SocialFeedMock() {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.feed} pointerEvents="none">
    <View style={s.feedHeader}><T size={24} weight="800" color={colors.onPaper} style={{ fontStyle: 'italic' }}>Instagram</T><View style={{ flexDirection: 'row', gap: 16 }}><Icon name="heart-outline" color={colors.onPaper} /><Icon name="chatbubble-outline" color={colors.onPaper} /><Icon name="add-circle-outline" color={colors.onPaper} /></View></View>
    <View style={s.stories}>{['Kamu', 'Design Hub', 'Wander', 'Calm', 'Art'].map((n, i) => <View key={n} style={{ alignItems: 'center', gap: 4 }}><LinearGradient colors={[colors.gold, colors.instagram, colors.game]} style={s.storyRing}><View style={[s.storyInner, { backgroundColor: [colors.brandTertiary, colors.gold, colors.success, colors.instagram, colors.game][i] }]} /></LinearGradient><T size={9} color={colors.paperMuted}>{n}</T></View>)}</View>
    <View style={s.postHead}><View style={[s.avatar, { backgroundColor: colors.brandTertiary }]} /><View><T size={12} weight="700" color={colors.onPaper}>maya.studio</T><T size={9} color={colors.paperMuted}>Bandung, Indonesia</T></View></View>
    <Image source={IMG.heroBirds} style={s.postImage} />
    <View style={s.postActions}><Icon name="heart" color={colors.instagram} /><Icon name="chatbubble-outline" color={colors.onPaper} /><Icon name="paper-plane-outline" color={colors.onPaper} /><View style={{ flex: 1 }} /><Icon name="bookmark-outline" color={colors.onPaper} /></View>
    <T size={12} weight="700" color={colors.onPaper} style={{ paddingHorizontal: 14 }}>1.204 suka</T>
    <T size={11} color={colors.onPaper} style={{ paddingHorizontal: 14 }}><T size={11} weight="700" color={colors.onPaper}>maya.studio </T>Awal yang segar dan pikiran yang jernih. 🌿</T>
    <View style={s.feedTabs}>{['home', 'search', 'add-circle-outline', 'heart-outline', 'person-circle-outline'].map(n => <Icon key={n} name={n} color={colors.onPaper} size={24} />)}</View>
  </View>;
}

/** Prayer-time lock overlay (in-app demonstration, styled like a real lock screen). */
export function PrayerLock({ prayer = 'Magrib', minutes = 10, onDone, onSnooze, verse, pro, footer, holdLabel }: any) {
  const s = useStyles(); const { colors } = useTheme(); const bar = useSharedValue(0);
  useEffect(() => { bar.value = withTiming(1, { duration: 12000, easing: Easing.linear }); }, [bar]);
  const fill = useAnimatedStyle(() => ({ width: `${8 + bar.value * 80}%` }));
  return <Animated.View entering={FadeIn.duration(450)} style={s.lock}>
    <LinearGradient colors={[colors.overlay, colors.heroShade]} style={s.lockBg} />
    <View style={s.lockContent}>
      <Logo size={30} wordmark />
      <View style={{ alignItems: 'center', gap: 8, marginTop: 28 }}>
        <T size={15} color={colors.heroMuted}>Waktunya salat:</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Icon name={PRAYER_ICONS[prayer] || 'moon-outline'} size={40} color={colors.gold} /><T testID="demo-title" size={44} weight="800" color={colors.heroInk}>{prayer}</T></View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 }}><T size={16} color={colors.heroMuted} style={{ marginBottom: 6 }}>Sisa waktu:</T><T size={32} weight="800" color={colors.heroInk}>0j {minutes}m</T></View>
        <View style={s.track}><Animated.View style={[s.trackFill, fill]} /></View>
        <T size={11} color={colors.heroMuted}>Aplikasi dijeda {minutes} menit sebelum azan hingga kamu selesai salat.</T>
        {pro && verse && <View style={s.verse}><T arabic size={22} color={colors.heroInk} style={{ textAlign: 'center' }}>{verse.teksArab}</T><T size={11} color={colors.heroMuted} style={{ textAlign: 'center' }}>{verse.teksIndonesia}</T><T size={10} color={colors.onBrandSecondary}>QS. {verse.surah} : {verse.nomorAyat}</T></View>}
      </View>
      <View style={{ gap: 12, marginTop: 'auto' }}>
        <HoldButton done={onDone} label={holdLabel || `Tahan 3 detik · Saya sudah salat ${prayer}`} />
        {onSnooze && <Button testID="demo-snooze-button" title="Ingatkan nanti · 5 menit" variant="secondary" onPress={onSnooze} />}
        {footer}
      </View>
    </View>
  </Animated.View>;
}
const useStyles = makeStyles(c => ({
  holdButton: { height: 64, borderRadius: 20, overflow: 'hidden', justifyContent: 'center' }, holdBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, holdProgress: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: c.white, opacity: 0.35 }, holdContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  feed: { flex: 1, backgroundColor: c.paper, paddingTop: 8 }, feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, height: 48 },
  stories: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 8 }, storyRing: { width: 58, height: 58, borderRadius: 29, padding: 3 }, storyInner: { flex: 1, borderRadius: 26, borderWidth: 2, borderColor: c.paper },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 }, avatar: { width: 32, height: 32, borderRadius: 16 }, postImage: { width: '100%', aspectRatio: 1.15 }, postActions: { flexDirection: 'row', gap: 14, paddingHorizontal: 14, paddingVertical: 10 },
  feedTabs: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.paperBorder },
  lock: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, lockBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.94 }, lockContent: { flex: 1, padding: 24, alignItems: 'center' },
  track: { width: '100%', height: 10, borderRadius: 5, backgroundColor: c.glassStrong, overflow: 'hidden', marginTop: 10 }, trackFill: { height: '100%', borderRadius: 5, backgroundColor: c.gold },
  verse: { marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: c.glass, alignItems: 'center', gap: 6 },
}));
