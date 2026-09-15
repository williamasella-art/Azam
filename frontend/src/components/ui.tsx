import React from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { fontFor, makeStyles, useTheme } from '@/src/theme';
import { useApp } from '@/src/AppContext';
import { useI18n } from '@/src/i18n';
import { IMG } from '@/src/assets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function T({ children, size = 14, weight = '400', muted, color, style, arabic, testID, paper, ...rest }: any) {
  const { colors } = useTheme(); const { lang } = useI18n();
  const base = paper ? (muted ? colors.paperMuted : colors.onPaper) : (muted ? colors.onSurfaceTertiary : colors.onSurface);
  const rtl = lang === 'ar' ? { writingDirection: 'rtl' as const, textAlign: 'right' as const } : null;
  return <Text testID={testID} {...rest} style={[{ fontFamily: arabic ? 'Amiri' : fontFor(weight), fontSize: size,
    color: color || base, lineHeight: arabic ? size * 1.95 : size * 1.45 }, rtl, style]}>{children}</Text>;
}
export function Icon({ name, size = 22, color }: { name: any; size?: number; color?: string }) {
  const { colors } = useTheme(); return <Ionicons name={name} size={size} color={color || colors.onSurface} />;
}
export function Tap({ children, onPress, style, testID, disabled, haptic = true, ...rest }: { children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; testID: string; disabled?: boolean; haptic?: boolean; [key: string]: any }) {
  const scale = useSharedValue(1); const dim = useSharedValue(1);
  const press = () => { if (haptic && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(); };
  const anim = useAnimatedStyle(() => ({ opacity: disabled ? 0.45 : dim.value, transform: [{ scale: scale.value }] }));
  return <AnimatedPressable accessibilityRole="button" testID={testID} onPress={press} disabled={disabled} {...rest}
    onPressIn={() => { scale.value = withSpring(0.985, { damping: 20, stiffness: 400 }); dim.value = withTiming(0.92, { duration: 70 }); }}
    onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); dim.value = withTiming(1, { duration: 120 }); }}
    style={[style, anim]}>{children}</AnimatedPressable>;
}
/** Interactive gradient button. variant: primary (sky gradient) | secondary (glass) | gold | paper | danger */
export function Button({ title, onPress, testID, variant = 'primary', icon, loading, style, disabled, size = 'md' }: any) {
  const s = useStyles(); const { colors } = useTheme();
  const text = variant === 'primary' ? colors.onBrandPrimary : variant === 'gold' ? colors.goldInk : variant === 'paper' ? colors.onPaper : variant === 'danger' ? colors.onError : colors.onSurface;
  const gradient = variant === 'primary' ? [colors.brandTertiary, colors.brandDeep] : variant === 'gold' ? [colors.goldText, colors.gold] : variant === 'danger' ? [colors.error, colors.error] : variant === 'paper' ? [colors.paper, colors.paperTint] : [colors.glassStrong, colors.glass];
  return <Tap testID={testID} onPress={onPress} disabled={disabled || loading} style={[s.buttonWrap, size === 'sm' && s.buttonSm, variant === 'primary' && s.buttonGlow, style]}>
    <LinearGradient colors={gradient as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.button, size === 'sm' && s.buttonSmInner, variant === 'secondary' && s.secondaryButton]}>
      {loading ? <ActivityIndicator color={text} /> : <>
        {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} color={text} />}
        <T weight="700" size={size === 'sm' ? 12 : 14} color={text}>{title}</T></>}
    </LinearGradient>
  </Tap>;
}
export function Card({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  const s = useStyles(); return <View testID={testID} style={[s.card, style]}>{children}</View>;
}
/** White surface, reserved for reading/calendar/forms. */
export function Paper({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  const s = useStyles(); return <View testID={testID} style={[s.paper, style]}>{children}</View>;
}
export function Section({ title, action, onPress, testID, light }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.section}><T weight="700" size={17} color={light ? colors.onPaper : undefined}>{title}</T>{action && <Tap testID={testID || 'section-action'} onPress={onPress} style={s.textAction}><T size={12} weight="700" color={colors.onBrandSecondary}>{action}</T><Icon name="arrow-forward" size={15} color={colors.onBrandSecondary} /></Tap>}</View>;
}
export function Bg({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <LinearGradient colors={[colors.pageTop, colors.pageBottom]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={[{ flex: 1 }, style]}>{children}</LinearGradient>;
}
export function Logo({ size = 40, wordmark, light, color }: { size?: number; wordmark?: boolean; light?: boolean; color?: string }) {
  const { colors } = useTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Image source={IMG.logo} style={{ width: size, height: size, borderRadius: size * 0.28 }} accessibilityLabel="Logo Azam" />
    {wordmark && <T size={size * 0.6} weight="800" color={color || (light ? colors.onPaper : colors.onSurface)} style={{ letterSpacing: -0.5 }}>Azam</T>}
  </View>;
}
export function Page({ children, title, subtitle, back, right, scroll = true, testID }: any) {
  const s = useStyles(); const { go } = useApp();
  return <Bg><View style={s.header}>
    {back && <Tap testID="header-back-button" onPress={() => go(back)} style={s.iconButton}><Icon name="arrow-back" /></Tap>}
    <View style={s.headerText}><T size={22} weight="800" testID="screen-title">{title}</T>{subtitle && <T muted size={12}>{subtitle}</T>}</View>{right}
    {!back && <Tap testID="header-settings-button" onPress={() => go('settings')} style={s.iconButton} accessibilityLabel="Pengaturan"><Icon name="settings-outline" size={20} /></Tap>}
  </View>{scroll ? <ScrollView testID={testID} showsVerticalScrollIndicator={false} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Animated.View entering={FadeInDown.duration(300)} style={s.body}>{children}</Animated.View>
  </ScrollView> : <View style={{ flex: 1 }}>{children}</View>}</Bg>;
}
export function Status({ loading, error, retry, message = 'Memuat sebentar…' }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <View testID={loading ? 'loading-state' : 'error-state'} style={s.status}>{loading ? <ActivityIndicator color={colors.brandPrimary} /> : <Icon name="cloud-offline-outline" size={30} color={colors.muted} />}
    <T muted style={{ textAlign: 'center' }}>{loading ? message : error?.message || 'Belum dapat memuat data.'}</T>{retry && !loading && <Button title="Coba lagi" testID="retry-button" onPress={retry} variant="secondary" />}</View>;
}
/** `light`: badge sits on a dark photo/overlay — translucent dark pill with light (or gold) text. */
export function Badge({ text, icon, gold = false, light = false, style }: any) {
  const s = useStyles(); const { colors } = useTheme(); const color = light ? (gold ? colors.gold : colors.heroInk) : gold ? colors.goldText : colors.onBrandSecondary;
  return <View style={[s.badge, gold && { backgroundColor: colors.goldSoft }, light && { backgroundColor: colors.overlay }, style]}>{icon && <Icon name={icon} size={12} color={color} />}<T size={10} weight="800" color={color} style={{ letterSpacing: 0.6 }}>{text}</T></View>;
}
export function IconBox({ name, size = 44, color, bg, icon = 20 }: any) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center', backgroundColor: bg || colors.brandSecondary }}><Icon name={name} size={icon} color={color || colors.onBrandSecondary} /></View>;
}
export const useStyles = makeStyles(c => ({
  header: { paddingHorizontal: 22, minHeight: 72, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 }, iconButton: { height: 44, width: 44, borderRadius: 16, backgroundColor: c.glass, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
  content: { paddingHorizontal: 22, paddingBottom: 32 }, body: { gap: 20 },
  card: { padding: 18, backgroundColor: c.surface, borderRadius: 24, borderWidth: 1, borderColor: c.border },
  paper: { padding: 18, backgroundColor: c.paper, borderRadius: 24 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  textAction: { flexDirection: 'row', gap: 6, alignItems: 'center', minHeight: 44 },
  buttonWrap: { borderRadius: 18, minHeight: 54 }, buttonSm: { minHeight: 40 }, buttonGlow: { shadowColor: c.shadow, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  button: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonSmInner: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 14 },
  secondaryButton: { borderWidth: 1, borderColor: c.borderStrong },
  status: { padding: 24, gap: 16, justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: c.brandSecondary, borderRadius: 10, alignSelf: 'flex-start' },
}));
