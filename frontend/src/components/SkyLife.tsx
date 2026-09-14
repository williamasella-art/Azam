import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/theme';
import { Icon } from './ui';

/** A single bird gliding across the sky with a wing flap. */
function Bird({ width, delay, top, duration, size, dark }: { width: number; delay: number; top: number; duration: number; size: number; dark?: boolean }) {
  const { colors } = useTheme();
  const x = useSharedValue(-size * 2); const y = useSharedValue(0); const flap = useSharedValue(1);
  useEffect(() => {
    x.value = withDelay(delay, withRepeat(withTiming(width + size * 2, { duration, easing: Easing.linear }), -1, false));
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-10, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(8, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1, true));
    flap.value = withDelay(delay, withRepeat(withSequence(withTiming(0.35, { duration: 260, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) })), -1, true));
  }, [x, y, flap, delay, duration, width, size]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scaleY: flap.value }] }));
  return <Animated.View style={[{ position: 'absolute', top }, style]} pointerEvents="none">
    <Svg width={size} height={size * 0.5} viewBox="0 0 40 20"><Path d="M2 12 Q11 2 20 11 Q29 2 38 12" stroke={dark ? colors.pageTop : colors.white} strokeWidth={3} strokeLinecap="round" fill="none" /></Svg>
  </Animated.View>;
}
/** A softly twinkling star. */
function Star({ left, top, delay, size = 4 }: { left: number; top: number; delay: number; size?: number }) {
  const { colors } = useTheme(); const glow = useSharedValue(0.2);
  useEffect(() => { glow.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.2, { duration: 1300 })), -1, true)); }, [glow, delay]);
  const style = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.6 + glow.value * 0.6 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left, top, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.goldText }, style]} />;
}
/** Living sky layer: birds + stars, laid over hero illustrations. */
export function SkyLife({ width, height, birds = 3, stars = 6 }: { width: number; height: number; birds?: number; stars?: number }) {
  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width, height, overflow: 'hidden' }}>
    {Array.from({ length: stars }, (_, i) => <Star key={`s${i}`} left={((i * 137) % Math.max(1, width - 20)) + 10} top={((i * 71) % Math.max(1, height * 0.45)) + 8} delay={i * 350} size={i % 3 === 0 ? 5 : 3} />)}
    {Array.from({ length: birds }, (_, i) => <Bird key={`b${i}`} width={width} delay={i * 2600} top={height * (0.14 + i * 0.13)} duration={11000 + i * 2400} size={i === 1 ? 30 : 22} />)}
  </View>;
}
/** Flame with a warm breathing glow, used for streak counters. */
export function PulseFlame({ size = 18, color }: { size?: number; color: string }) {
  const beat = useSharedValue(1);
  useEffect(() => { beat.value = withRepeat(withSequence(withTiming(1.18, { duration: 520, easing: Easing.out(Easing.quad) }), withTiming(0.94, { duration: 620, easing: Easing.inOut(Easing.quad) })), -1, true); }, [beat]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: beat.value }, { rotate: `${(beat.value - 1) * 30}deg` }] }));
  return <Animated.View style={style}><Icon name="flame" size={size} color={color} /></Animated.View>;
}
