import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/theme';
import { BADGES } from '@/src/assets';
import { Icon } from './ui';

/**
 * Achievement badge with a signature motion per level:
 * Awan floats and sways · Bintang twinkles · Purnama glows and bobs · Syams rotates with a pulsing halo.
 */
export function LevelBadge({ name, size = 96, locked = false, style, animate = true }: { name: string; size?: number; locked?: boolean; style?: any; animate?: boolean }) {
  const { colors } = useTheme();
  const t = useSharedValue(0); const spin = useSharedValue(0);
  useEffect(() => {
    if (!animate || locked) return;
    const period = name === 'Awan' ? 3600 : name === 'Bintang' ? 1400 : name === 'Purnama' ? 3000 : 2400;
    t.value = withRepeat(withSequence(withTiming(1, { duration: period, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: period, easing: Easing.inOut(Easing.sin) })), -1, false);
    if (name === 'Syams') spin.value = withRepeat(withTiming(360, { duration: 26000, easing: Easing.linear }), -1, false);
  }, [animate, locked, name, t, spin]);
  const imageStyle = useAnimatedStyle(() => {
    if (!animate || locked) return {};
    if (name === 'Awan') return { transform: [{ translateY: (t.value - 0.5) * size * 0.08 }, { translateX: (t.value - 0.5) * size * 0.04 }, { rotate: `${(t.value - 0.5) * 3}deg` }] };
    if (name === 'Bintang') return { transform: [{ scale: 0.96 + t.value * 0.08 }, { rotate: `${(t.value - 0.5) * 6}deg` }] };
    if (name === 'Purnama') return { transform: [{ translateY: (t.value - 0.5) * size * 0.05 }, { scale: 0.99 + t.value * 0.02 }] };
    return { transform: [{ rotate: `${spin.value}deg` }, { scale: 0.98 + t.value * 0.05 }] };
  });
  const haloStyle = useAnimatedStyle(() => ({ opacity: !animate || locked ? 0 : 0.18 + t.value * 0.35, transform: [{ scale: 1 + t.value * 0.12 }] }));
  const sparkleStyle = useAnimatedStyle(() => ({ opacity: !animate || locked ? 0 : t.value, transform: [{ scale: 0.6 + t.value * 0.6 }, { rotate: `${t.value * 90}deg` }] }));
  const halo = name === 'Awan' ? colors.brandTertiary : name === 'Bintang' ? colors.white : colors.gold;
  return <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]} testID={`level-badge-${name.toLowerCase()}`}>
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: size * 0.92, height: size * 0.92, borderRadius: size * 0.46, backgroundColor: halo }, haloStyle]} />
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.surfaceTertiary }, imageStyle]}>
      <Image source={BADGES[name]} style={{ width: size, height: size, opacity: locked ? 0.35 : 1 }} accessibilityLabel={`Lencana ${name}`} />
    </Animated.View>
    {(name === 'Bintang' || name === 'Syams') && <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: size * 0.06, right: size * 0.08 }, sparkleStyle]}><Icon name="sparkles" size={Math.max(12, size * 0.16)} color={name === 'Syams' ? colors.gold : colors.white} /></Animated.View>}
    {locked && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock-closed" size={size * 0.3} color={colors.onSurfaceTertiary} /></View>}
  </View>;
}
