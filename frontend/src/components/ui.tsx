import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, useTheme } from '@/src/theme';
import { useApp } from '@/src/AppContext';

export function T({ children, size = 14, weight = '400', muted, color, style, arabic, testID, ...rest }: any) {
  const { colors } = useTheme();
  return <Text testID={testID} {...rest} style={[{ fontFamily: arabic ? 'Amiri' : 'Jakarta', fontSize: size, fontWeight: weight,
    color: color || (muted ? colors.onSurfaceTertiary : colors.onSurface), lineHeight: arabic ? size * 1.95 : size * 1.5 }, style]}>{children}</Text>;
}
export function Icon({ name, size = 22, color }: { name: any; size?: number; color?: string }) {
  const { colors } = useTheme(); return <Ionicons name={name} size={size} color={color || colors.onSurface} />;
}
export function Tap({ children, onPress, style, testID, disabled, ...rest }: { children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>; testID: string; disabled?: boolean; [key: string]: any }) {
  return <Pressable accessibilityRole="button" testID={testID} onPress={onPress} disabled={disabled} {...rest}
    style={({ pressed }) => [style, { opacity: disabled ? 0.5 : pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>{children}</Pressable>;
}
export function Button({ title, onPress, testID, variant = 'primary', icon, loading, style, disabled }: any) {
  const s = useStyles(); const { colors } = useTheme(); const secondary = variant !== 'primary';
  return <Tap testID={testID} onPress={onPress} disabled={disabled || loading} style={[s.button, secondary && s.secondaryButton, style]}>
    {loading ? <ActivityIndicator color={secondary ? colors.onBrandSecondary : colors.onBrandPrimary} /> : <>
      {icon && <Icon name={icon} size={20} color={secondary ? colors.onBrandSecondary : colors.onBrandPrimary} />}
      <T weight="700" size={14} color={secondary ? colors.onBrandSecondary : colors.onBrandPrimary}>{title}</T></>}
  </Tap>;
}
export function Card({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) {
  const s = useStyles(); return <View testID={testID} style={[s.card, style]}>{children}</View>;
}
export function Section({ title, action, onPress, testID }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.section}><T weight="700" size={18}>{title}</T>{action && <Tap testID={testID || 'section-action'} onPress={onPress} style={s.textAction}><T size={12} weight="700" color={colors.onBrandSecondary}>{action}</T><Icon name="arrow-forward" size={15} color={colors.onBrandSecondary} /></Tap>}</View>;
}
export function Page({ children, title, subtitle, back, right, scroll = true }: any) {
  const s = useStyles(); const { go } = useApp();
  return <View style={s.page}><View style={s.header}>
    {back && <Tap testID="header-back-button" onPress={() => go(back)} style={s.iconButton}><Icon name="arrow-back" /></Tap>}
    <View style={s.headerText}><T size={24} weight="800" testID="screen-title">{title}</T>{subtitle && <T muted size={12}>{subtitle}</T>}</View>{right}
  </View>{scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Animated.View entering={FadeInDown.duration(350).springify()} style={s.body}>{children}</Animated.View>
  </ScrollView> : <View style={s.page}>{children}</View>}</View>;
}
export function Status({ loading, error, retry, message = 'Memuat sebentar…' }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <View testID={loading ? 'loading-state' : 'error-state'} style={s.status}>{loading ? <ActivityIndicator color={colors.brandPrimary} /> : <Icon name="cloud-offline-outline" size={30} color={colors.muted} />}
    <T muted style={{ textAlign: 'center' }}>{loading ? message : error?.message || 'Belum dapat memuat data.'}</T>{retry && !loading && <Button title="Coba lagi" testID="retry-button" onPress={retry} variant="secondary" />}</View>;
}
export function Badge({ text, icon, gold = false }: any) {
  const s = useStyles(); const { colors } = useTheme(); return <View style={[s.badge, gold && { backgroundColor: colors.goldSoft }]}>{icon && <Icon name={icon} size={12} color={gold ? colors.goldInk : colors.onBrandSecondary} />}<T size={10} weight="800" color={gold ? colors.goldInk : colors.onBrandSecondary}>{text}</T></View>;
}
export const useStyles = makeStyles(c => ({
  page: { flex: 1, backgroundColor: c.surfaceSecondary },
  header: { paddingHorizontal: 24, minHeight: 76, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surfaceSecondary },
  headerText: { flex: 1 }, iconButton: { height: 44, width: 44, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingBottom: 28 }, body: { gap: 24 },
  card: { padding: 20, backgroundColor: c.surface, borderRadius: 24, borderWidth: 1, borderColor: c.border + '70' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  textAction: { flexDirection: 'row', gap: 6, alignItems: 'center', minHeight: 44 },
  button: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18, backgroundColor: c.brandPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  secondaryButton: { backgroundColor: c.brandSecondary },
  status: { padding: 24, gap: 16, justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: c.brandSecondary, borderRadius: 10 },
}));