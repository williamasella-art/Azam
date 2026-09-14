import { useMemo, useSyncExternalStore } from 'react';
import { Appearance, StyleSheet } from 'react-native';

// "Langit" (default): light-blue + deep-navy blended UI. White is reserved for
// paper surfaces (reading, calendar, forms). "Malam" (dark) is a deeper night blue.
const light = {
  pageTop: '#08223B', pageBottom: '#155F98',
  surface: 'rgba(255,255,255,0.10)', onSurface: '#F5FBFF', surfaceSecondary: '#0B2A4A', onSurfaceSecondary: '#D7EAF8',
  surfaceTertiary: 'rgba(255,255,255,0.16)', onSurfaceTertiary: '#B4D4EC', surfaceInverse: '#FFFFFF', onSurfaceInverse: '#0B2A4A',
  solid: '#14446E', solidStrong: '#1B5486',
  brand: '#38BDF8', onBrand: '#062138', brandPrimary: '#5CCBFF', onBrandPrimary: '#062138', brandDeep: '#0EA5E9',
  brandSecondary: 'rgba(125,211,252,0.20)', onBrandSecondary: '#A6E3FF', brandTertiary: '#7DD3FC', onBrandTertiary: '#062138',
  success: '#34D399', onSuccess: '#03281B', warning: '#FBBF24', onWarning: '#2A1B00',
  error: '#FB7185', onError: '#FFFFFF', info: '#5CCBFF', onInfo: '#062138',
  border: 'rgba(255,255,255,0.14)', borderStrong: 'rgba(255,255,255,0.30)', divider: 'rgba(255,255,255,0.10)', muted: '#86A9C6',
  paper: '#FFFFFF', onPaper: '#0F2A44', paperMuted: '#5B7A94', paperTint: '#EAF6FE', paperBorder: '#D9EAF6',
  gold: '#F5C86A', goldInk: '#3A2A08', goldSoft: 'rgba(245,200,106,0.20)', goldText: '#FFE3A3',
  heroInk: '#FFFFFF', heroMuted: '#CFE7F8',
  transparent: 'transparent', overlay: 'rgba(3,15,28,0.70)', glass: 'rgba(255,255,255,0.12)', glassStrong: 'rgba(255,255,255,0.22)',
  shadow: '#38BDF8', black: '#000000',
  instagram: '#E1306C', tiktok: '#111111', youtube: '#FF0000', x: '#000000', chrome: '#4285F4', facebook: '#1877F2', game: '#7C3AED', white: '#FFFFFF',
};
export type ThemeColors = typeof light;
export type ColorScheme = 'light' | 'dark';
export const defaultScheme: ColorScheme = 'light';
export const themes: Record<ColorScheme, ThemeColors> = { light, dark: {
  ...light, pageTop: '#030C17', pageBottom: '#0A2A47',
  surface: 'rgba(255,255,255,0.07)', surfaceSecondary: '#050F1C', onSurfaceSecondary: '#C4DAEC', surfaceTertiary: 'rgba(255,255,255,0.12)',
  solid: '#0C2740', solidStrong: '#12334F', brandSecondary: 'rgba(125,211,252,0.14)', border: 'rgba(255,255,255,0.10)', muted: '#6F91AE',
  paper: '#F3F8FC', paperTint: '#E1EFF8', glass: 'rgba(255,255,255,0.08)', overlay: 'rgba(0,6,14,0.80)',
} };
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
  return w >= 800 ? 'Poppins-ExtraBold' : w >= 700 ? 'Poppins-Bold' : w >= 600 ? 'Poppins-SemiBold' : w >= 500 ? 'Poppins-Medium' : 'Poppins-Regular';
};
