import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/theme';

/**
 * A living cat: breathes, swishes its tail, blinks, and yawns every few seconds.
 * Pure vector + Reanimated so it stays light and on-brand (sky blue / navy / gold).
 */
export function AnimatedCat({ size = 120, sleepy = false }: { size?: number; sleepy?: boolean }) {
  const { colors } = useTheme();
  const breathe = useSharedValue(1); const tail = useSharedValue(0); const blink = useSharedValue(1); const yawn = useSharedValue(0); const ear = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(withSequence(withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })), -1, true);
    tail.value = withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(-1, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1, true);
    // Blink twice, pause, repeat.
    blink.value = withRepeat(withSequence(withDelay(2600, withTiming(0.1, { duration: 90 })), withTiming(1, { duration: 120 }), withDelay(180, withTiming(0.1, { duration: 90 })), withTiming(1, { duration: 120 })), -1, false);
    // Long yawn every ~7 seconds: mouth opens wide while eyes squint.
    yawn.value = withRepeat(withSequence(withDelay(5200, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })), withDelay(700, withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }))), -1, false);
    ear.value = withRepeat(withSequence(withDelay(3900, withTiming(1, { duration: 120 })), withTiming(0, { duration: 160 }), withDelay(120, withTiming(1, { duration: 120 })), withTiming(0, { duration: 160 })), -1, false);
  }, [breathe, tail, blink, yawn, ear]);
  const u = size / 100;
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const tailStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tail.value * 22}deg` }] }));
  const eyesStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.min(blink.value, 1 - yawn.value * 0.75) }] }));
  const mouthStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.25 + yawn.value * 1.6 }, { scaleX: 0.7 + yawn.value * 0.5 }] }));
  const earStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${ear.value * -14}deg` }] }));
  const headStyle = useAnimatedStyle(() => ({ transform: [{ translateY: yawn.value * -2 * u }, { rotate: `${tail.value * 2}deg` }] }));
  return <View style={{ width: size, height: size }} accessibilityLabel="Kucing yang menguap" accessible>
    {/* Tail: rotates around its base near the body's right hip. */}
    <Animated.View style={[{ position: 'absolute', left: 62 * u, top: 60 * u, width: 34 * u, height: 30 * u, transformOrigin: 'left bottom' }, tailStyle]}>
      <Svg width={34 * u} height={30 * u} viewBox="0 0 34 30"><Path d="M2 26 C 14 22, 26 20, 30 6" stroke={colors.brandDeep} strokeWidth={7} strokeLinecap="round" fill="none" /><Circle cx="30" cy="6" r="4" fill={colors.brandTertiary} /></Svg>
    </Animated.View>
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, bodyStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Ellipse cx="50" cy="74" rx="30" ry="19" fill={colors.brandDeep} />
        <Ellipse cx="50" cy="80" rx="18" ry="10" fill={colors.brandTertiary} opacity={0.35} />
        <Circle cx="30" cy="88" r="5" fill={colors.brandDeep} /><Circle cx="44" cy="91" r="5" fill={colors.brandDeep} />
      </Svg>
    </Animated.View>
    {/* Head with ears, eyes, nose, whiskers and yawning mouth. */}
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, headStyle]}>
      <Animated.View style={[{ position: 'absolute', left: 26 * u, top: 14 * u, width: 16 * u, height: 16 * u, transformOrigin: 'right bottom' }, earStyle]}>
        <Svg width={16 * u} height={16 * u} viewBox="0 0 16 16"><Path d="M2 16 L3 1 L15 11 Z" fill={colors.brandDeep} /><Path d="M5 13 L6 5 L12 10 Z" fill={colors.instagram} opacity={0.6} /></Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Path d="M58 30 L60 15 L72 25 Z" fill={colors.brandDeep} /><Path d="M61 27 L62 19 L68 24 Z" fill={colors.instagram} opacity={0.6} />
        <Circle cx="50" cy="42" r="22" fill={colors.brandDeep} />
        <Ellipse cx="50" cy="50" rx="11" ry="7" fill={colors.brandTertiary} opacity={0.45} />
        <Path d="M47 49 L50 52 L53 49 Z" fill={colors.instagram} />
        <Path d="M20 46 L38 49 M20 54 L38 52 M80 46 L62 49 M80 54 L62 52" stroke={colors.brandTertiary} strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
        <Path d="M38 31 Q41 27 44 31 M56 31 Q59 27 62 31" stroke={colors.brandTertiary} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
      </Svg>
      <Animated.View style={[{ position: 'absolute', left: 38 * u, top: 37 * u, width: 24 * u, height: 8 * u, flexDirection: 'row', justifyContent: 'space-between' }, eyesStyle]}>
        {[0, 1].map(i => <View key={i} style={{ width: 8 * u, height: 8 * u, borderRadius: 4 * u, backgroundColor: sleepy ? colors.brandTertiary : colors.goldText, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 2.6 * u, height: 6 * u, borderRadius: 1.3 * u, backgroundColor: colors.pageTop }} /></View>)}
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 45 * u, top: 54 * u, width: 10 * u, height: 8 * u, borderBottomLeftRadius: 5 * u, borderBottomRightRadius: 5 * u, borderTopLeftRadius: 2 * u, borderTopRightRadius: 2 * u, backgroundColor: colors.pageTop, transformOrigin: 'center top', borderWidth: 1, borderColor: colors.instagram }, mouthStyle]}>
        <View style={{ position: 'absolute', bottom: 0, left: 2 * u, right: 2 * u, height: 3 * u, borderTopLeftRadius: 2 * u, borderTopRightRadius: 2 * u, backgroundColor: colors.instagram, opacity: 0.8 }} />
      </Animated.View>
    </Animated.View>
  </View>;
}
