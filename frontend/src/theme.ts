import { useMemo, useSyncExternalStore } from 'react';
import { Appearance, StyleSheet } from 'react-native';

// "Langit" (default): bright sky-blue UI — white-blue backgrounds, dark ink text, deep navy only as an
// accent inside hero images (heroShade) and the Pro/gold moments. "Malam" (dark) is the deep night blue.
const light = {
  pageTop: '#F3F8FD', pageBottom: '#DCEBF8',
  surface: '#FFFFFF', onSurface: '#0F2A44', surfaceSecondary: '#F6FAFE', onSurfaceSecondary: '#2C4A66',
  surfaceTertiary: '#E4EFF8', onSurfaceTertiary: '#4E6E8C', surfaceInverse: '#0F2A44', onSurfaceInverse: '#FFFFFF',
  solid: '#E2EEF8', solidStrong: '#CFE3F4',
  brand: '#0EA5E9', onBrand: '#FFFFFF', brandPrimary: '#0B7FC4', onBrandPrimary: '#FFFFFF', brandDeep: '#0A5D95',
  brandSecondary: 'rgba(11,127,196,0.12)', onBrandSecondary: '#0A6AA6', brandTertiary: '#1B93D6', onBrandTertiary: '#FFFFFF',
  success: '#15803D', onSuccess: '#FFFFFF', warning: '#B45309', onWarning: '#FFFFFF',
  error: '#DC2626', onError: '#FFFFFF', info: '#0B7FC4', onInfo: '#FFFFFF',
  border: 'rgba(15,42,68,0.10)', borderStrong: 'rgba(15,42,68,0.24)', divider: 'rgba(15,42,68,0.08)', muted: '#6B89A6',
  paper: '#FFFFFF', onPaper: '#0F2A44', paperMuted: '#5B7A94', paperTint: '#EAF6FE', paperBorder: '#D9EAF6',
  gold: '#F2B93B', goldInk: '#3A2A08', goldSoft: 'rgba(242,185,59,0.18)', goldText: '#8A5A00',
  heroInk: '#FFFFFF', heroMuted: '#D8EAF7', heroShade: '#08223B',
  transparent: 'transparent', overlay: 'rgba(8,34,59,0.72)', glass: 'rgba(11,127,196,0.07)', glassStrong: 'rgba(11,127,196,0.15)',
  shadow: '#0B7FC4', black: '#000000',
  instagram: '#E1306C', tiktok: '#111111', youtube: '#FF0000', x: '#000000', chrome: '#4285F4', facebook: '#1877F2', game: '#7C3AED', white: '#FFFFFF',
};
export type ThemeColors = typeof light;
const dark: ThemeColors = {
  ...light,
  pageTop: '#030C17', pageBottom: '#0A2A47',
  surface: 'rgba(255,255,255,0.07)', onSurface: '#F5FBFF', surfaceSecondary: '#050F1C', onSurfaceSecondary: '#C4DAEC',
  surfaceTertiary: 'rgba(255,255,255,0.12)', onSurfaceTertiary: '#B4D4EC', surfaceInverse: '#FFFFFF', onSurfaceInverse: '#0B2A4A',
  solid: '#0C2740', solidStrong: '#12334F',
  brand: '#38BDF8', onBrand: '#062138', brandPrimary: '#5CCBFF', onBrandPrimary: '#062138', brandDeep: '#0EA5E9',
  brandSecondary: 'rgba(125,211,252,0.14)', onBrandSecondary: '#A6E3FF', brandTertiary: '#7DD3FC', onBrandTertiary: '#062138',
  success: '#34D399', onSuccess: '#03281B', warning: '#FBBF24', onWarning: '#2A1B00', error: '#FB7185', info: '#5CCBFF', onInfo: '#062138',
  border: 'rgba(255,255,255,0.10)', borderStrong: 'rgba(255,255,255,0.30)', divider: 'rgba(255,255,255,0.10)', muted: '#6F91AE',
  paper: '#F3F8FC', paperTint: '#E1EFF8',
  gold: '#F5C86A', goldSoft: 'rgba(245,200,106,0.20)', goldText: '#FFE3A3',
  overlay: 'rgba(0,6,14,0.80)', glass: 'rgba(255,255,255,0.08)', glassStrong: 'rgba(255,255,255,0.22)', shadow: '#38BDF8',
};
export type ColorScheme = 'light' | 'dark';
export const defaultScheme: ColorScheme = 'light';
export const themes: Record<ColorScheme, ThemeColors> = { light, dark };
let active: ColorScheme = 'light';
const listeners = new Set<() => void>();
export function setColorScheme(scheme: ColorScheme | null) {
  active = scheme || 'light';
  if (typeof Appearance.setColorScheme === 'function') Appearance.setColorScheme(active);
  listeners.forEach(fn => fn());
}
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useTheme() {
  const scheme = useSyncExternalStore(subscribe, () => active, () => 'light' as ColorScheme);
  return { scheme, colors: themes[scheme] };
}
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (colors: ThemeColors) => T): () => T {
  return function useStyles() { const { colors } = useTheme(); return useMemo(() => StyleSheet.create(factory(colors)), [colors]); };
}
export const fontFor = (weight: string | number = '400') => {
  const w = Number(weight) || (weight === 'bold' ? 700 : 400);
  return w >= 800 ? 'PlusJakartaSans-ExtraBold' : w >= 700 ? 'PlusJakartaSans-Bold' : w >= 600 ? 'PlusJakartaSans-SemiBold' : w >= 500 ? 'PlusJakartaSans-Medium' : 'PlusJakartaSans-Regular';
};
