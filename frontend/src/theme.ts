import { useMemo, useSyncExternalStore } from 'react';
import { Appearance, StyleSheet } from 'react-native';

const light = {
  surface: '#FFFFFF', onSurface: '#0F172A', surfaceSecondary: '#F8FAFC', onSurfaceSecondary: '#334155',
  surfaceTertiary: '#F1F5F9', onSurfaceTertiary: '#475569', surfaceInverse: '#0F172A', onSurfaceInverse: '#FFFFFF',
  brand: '#38BDF8', onBrand: '#FFFFFF', brandPrimary: '#0EA5E9', onBrandPrimary: '#FFFFFF',
  brandSecondary: '#E0F2FE', onBrandSecondary: '#0284C7', brandTertiary: '#BAE6FD', onBrandTertiary: '#0369A1',
  success: '#10B981', onSuccess: '#FFFFFF', warning: '#F59E0B', onWarning: '#FFFFFF',
  error: '#EF4444', onError: '#FFFFFF', info: '#0EA5E9', onInfo: '#FFFFFF',
  border: '#E2E8F0', borderStrong: '#CBD5E1', divider: '#F1F5F9', muted: '#94A3B8',
  skyTop: '#E0F4FF', skyBottom: '#B5E1FA', skyDeep: '#6CB9E3', skyHill: '#A3D4EF',
  illustrationWhite: '#FCFEFF', illustrationShade: '#D5EBF7', illustrationNavy: '#174F76',
  heroInk: '#123F60', heroMuted: '#46718C', goldSoft: '#FFF4D6', goldInk: '#96681D',
  transparent: 'transparent', overlay: 'rgba(10,32,52,0.45)', glass: 'rgba(255,255,255,0.87)',
};
export type ThemeColors = typeof light;
export type ColorScheme = 'light' | 'dark';
export const defaultScheme: ColorScheme = 'light';
export const themes: Record<ColorScheme, ThemeColors> = { light, dark: {
  ...light, surface: '#132739', onSurface: '#F2F8FE', surfaceSecondary: '#0B1B2A', onSurfaceSecondary: '#CCDCE8',
  surfaceTertiary: '#1B3449', onSurfaceTertiary: '#A9C3D8', surfaceInverse: '#E5F3FC', onSurfaceInverse: '#10283A',
  brandSecondary: '#163D57', onBrandSecondary: '#7FD6FF', brandTertiary: '#23516D', onBrandTertiary: '#A4DFFA',
  border: '#274258', borderStrong: '#395D77', divider: '#20394D', muted: '#7795AB',
  skyTop: '#163B5B', skyBottom: '#235778', skyDeep: '#326B91', skyHill: '#2B5774',
  heroInk: '#EFF9FF', heroMuted: '#B1D8F0', goldSoft: '#3C3422', goldInk: '#F2D28B',
  glass: 'rgba(19,39,57,0.94)',
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