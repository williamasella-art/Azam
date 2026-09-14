import React, { useEffect, useMemo } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { Easing, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { LEVEL_COPY } from '@/src/assets';
import { Badge, Bg, Button, Icon, T, Tap } from './ui';
import { LevelBadge } from '@/src/screens/Progress';
import { SkyLife } from './SkyLife';

const PALETTE_KEYS = ['gold', 'brandTertiary', 'white', 'goldText', 'brandPrimary', 'success'] as const;

/** One falling, spinning confetti piece. */
function Piece({ index, width, height }: { index: number; width: number; height: number }) {
  const { colors } = useTheme();
  const seed = useMemo(() => ({ x: ((index * 977) % 1000) / 1000, delay: (index * 173) % 1400, duration: 3200 + ((index * 389) % 2200), drift: (((index * 61) % 100) - 50) / 100, size: 6 + (index % 4) * 3, round: index % 3 === 0 }), [index]);
  const fall = useSharedValue(0);
  useEffect(() => { fall.value = withDelay(seed.delay, withRepeat(withTiming(1, { duration: seed.duration, easing: Easing.in(Easing.quad) }), -1, false)); }, [fall, seed]);
  const style = useAnimatedStyle(() => ({
    opacity: fall.value < 0.05 ? 0 : 1 - Math.max(0, fall.value - 0.8) * 5,
    transform: [{ translateX: seed.x * width + Math.sin(fall.value * Math.PI * 3) * 40 * seed.drift }, { translateY: -40 + fall.value * (height + 80) }, { rotate: `${fall.value * 720 * (seed.drift >= 0 ? 1 : -1)}deg` }, { scaleX: Math.cos(fall.value * Math.PI * 6) }],
  }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, width: seed.size, height: seed.round ? seed.size : seed.size * 1.8, borderRadius: seed.round ? seed.size / 2 : 2, backgroundColor: colors[PALETTE_KEYS[index % PALETTE_KEYS.length]] }, style]} />;
}
export function Confetti({ count = 44 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>{Array.from({ length: count }, (_, i) => <Piece key={i} index={i} width={width} height={height} />)}</View>;
}

/** Full-screen celebration when the streak unlocks a new level (Awan → Bintang → Purnama → Syams). */
export function LevelUpOverlay() {
  const { modal, setModal, progress } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets(); const { width, height } = useWindowDimensions();
  const level = modal.level; const glow = useSharedValue(0.9); const ring = useSharedValue(0.6);
  useEffect(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    glow.value = withRepeat(withSequence(withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.sin) }), withTiming(0.94, { duration: 1100, easing: Easing.inOut(Easing.sin) })), -1, true);
    ring.value = withDelay(200, withSpring(1, { damping: 9, stiffness: 90 }));
  }, [glow, ring]);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glow.value }], opacity: 0.55 + (glow.value - 0.94) * 2 }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ring.value }], opacity: ring.value }));
  const nextLevel = progress.data?.levels?.find((l: any) => !l.unlocked);
  return <Bg style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
    <SkyLife width={width} height={height} birds={2} stars={14} />
    <Confetti />
    <View style={s.top}><Badge text="NAIK LEVEL" gold icon="sparkles" /><Tap testID="levelup-close-button" style={s.close} onPress={() => setModal(null)}><Icon name="close" size={22} /></Tap></View>
    <View style={s.body}>
      <View style={s.badgeWrap}>
        <Animated.View style={[s.glow, glowStyle]} />
        <Animated.View style={[s.ring, ringStyle]} />
        <Animated.View entering={ZoomIn.springify().damping(10).delay(150)}><LevelBadge name={level} size={196} /></Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(350).duration(500)} style={{ alignItems: 'center', gap: 8 }}>
        <T size={13} weight="700" color={colors.goldText} style={{ letterSpacing: 1.2 }}>MASYA ALLAH</T>
        <T testID="levelup-title" size={38} weight="800" color={colors.heroInk} style={{ letterSpacing: -1.2, textAlign: 'center' }}>Level {level}</T>
        <T size={14} color={colors.heroMuted} style={{ textAlign: 'center', lineHeight: 22, paddingHorizontal: 12 }}>{LEVEL_COPY[level]}</T>
        {nextLevel && <View style={s.nextPill}><Icon name="arrow-up-circle-outline" size={14} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>Berikutnya: {nextLevel.name} · {nextLevel.days} hari berturut</T></View>}
      </Animated.View>
    </View>
    <Animated.View entering={FadeInUp.delay(500).duration(500)} style={s.actions}>
      <Button testID="levelup-share-button" title="Bagikan ke Story" icon="share-social" variant="gold" onPress={() => setModal({ type: 'share-progress' })} />
      <Button testID="levelup-continue-button" title="Lanjutkan" variant="secondary" onPress={() => setModal(null)} />
    </Animated.View>
  </Bg>;
}
const useStyles = makeStyles(c => ({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 }, close: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.glass },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 24 },
  badgeWrap: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }, glow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: c.gold, opacity: 0.5 }, ring: { position: 'absolute', width: 232, height: 232, borderRadius: 116, borderWidth: 3, borderColor: c.goldText },
  nextPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: c.brandSecondary, marginTop: 6 },
  actions: { gap: 12, paddingHorizontal: 22 },
}));
