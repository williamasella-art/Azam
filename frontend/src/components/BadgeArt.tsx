import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/src/theme';

/** Hand-drawn vector medallions for the four levels: Awan · Bintang · Purnama · Syams. */
export function BadgeArt({ name, size = 96, locked = false }: { name: string; size?: number; locked?: boolean }) {
  const { colors } = useTheme();
  const id = name.toLowerCase();
  const star = (cx: number, cy: number, outer: number, inner: number, points = 5) => Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner; const a = (Math.PI / points) * i - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');
  const palette = {
    Awan: { top: colors.brandTertiary, bottom: colors.brandDeep, glow: colors.brandTertiary, ink: colors.white },
    Bintang: { top: colors.brandPrimary, bottom: colors.heroShade, glow: colors.gold, ink: colors.gold },
    Purnama: { top: colors.brandDeep, bottom: colors.heroShade, glow: colors.goldSoft, ink: colors.goldSoft },
    Syams: { top: colors.gold, bottom: colors.brandDeep, glow: colors.gold, ink: colors.gold },
  }[name as 'Awan' | 'Bintang' | 'Purnama' | 'Syams'] || { top: colors.brandPrimary, bottom: colors.brandDeep, glow: colors.brandTertiary, ink: colors.white };
  return <Svg width={size} height={size} viewBox="0 0 120 120" opacity={locked ? 0.4 : 1}>
    <Defs>
      <RadialGradient id={`bg-${id}`} cx="50%" cy="35%" r="75%"><Stop offset="0" stopColor={palette.top} /><Stop offset="1" stopColor={palette.bottom} /></RadialGradient>
      <RadialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%"><Stop offset="0.55" stopColor={palette.glow} stopOpacity="0.9" /><Stop offset="1" stopColor={palette.glow} stopOpacity="0" /></RadialGradient>
      <LinearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={colors.gold} /><Stop offset="0.5" stopColor={colors.goldSoft} /><Stop offset="1" stopColor={colors.goldText} /></LinearGradient>
      <LinearGradient id={`cloud-${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.white} /><Stop offset="1" stopColor={colors.brandSecondary} /></LinearGradient>
      <RadialGradient id={`moon-${id}`} cx="40%" cy="35%" r="70%"><Stop offset="0" stopColor={colors.white} /><Stop offset="0.7" stopColor={colors.goldSoft} /><Stop offset="1" stopColor={colors.gold} /></RadialGradient>
      <RadialGradient id={`sun-${id}`} cx="45%" cy="40%" r="60%"><Stop offset="0" stopColor={colors.goldSoft} /><Stop offset="0.6" stopColor={colors.gold} /><Stop offset="1" stopColor={colors.goldText} /></RadialGradient>
      <LinearGradient id={`star-${id}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.goldSoft} /><Stop offset="0.55" stopColor={colors.gold} /><Stop offset="1" stopColor={colors.goldText} /></LinearGradient>
    </Defs>
    <Circle cx="60" cy="60" r="58" fill={`url(#glow-${id})`} />
    <Circle cx="60" cy="60" r="50" fill={`url(#bg-${id})`} />
    <Circle cx="60" cy="60" r="50" fill="none" stroke={`url(#ring-${id})`} strokeWidth="3" />
    <Circle cx="60" cy="60" r="45" fill="none" stroke={colors.white} strokeOpacity="0.18" strokeWidth="1" />
    {name === 'Awan' && <G>
      <Circle cx="82" cy="40" r="9" fill={colors.goldSoft} opacity="0.9" />
      <Path d="M34 74 h50 a11 11 0 0 0 1 -22 a15 15 0 0 0 -28 -6 a11 11 0 0 0 -16 10 a9 9 0 0 0 -7 18 z" fill={`url(#cloud-${id})`} />
      <Ellipse cx="60" cy="76" rx="26" ry="3" fill={colors.brandDeep} opacity="0.25" />
      <Polygon points={star(30, 38, 4, 1.6, 4)} fill={colors.white} opacity="0.9" />
      <Polygon points={star(88, 66, 3, 1.2, 4)} fill={colors.white} opacity="0.7" />
    </G>}
    {name === 'Bintang' && <G>
      <Polygon points={star(60, 62, 30, 13)} fill={`url(#star-${id})`} stroke={colors.goldSoft} strokeWidth="1.5" strokeLinejoin="round" />
      <Polygon points={star(60, 62, 30, 13)} fill={colors.white} opacity="0.12" transform="translate(-2 -3) scale(0.9) translate(6 7)" />
      <Polygon points={star(30, 36, 5, 2, 4)} fill={colors.goldSoft} />
      <Polygon points={star(90, 40, 4, 1.6, 4)} fill={colors.goldSoft} opacity="0.8" />
      <Polygon points={star(86, 84, 3, 1.2, 4)} fill={colors.goldSoft} opacity="0.7" />
    </G>}
    {name === 'Purnama' && <G>
      <Circle cx="60" cy="60" r="31" fill={colors.gold} opacity="0.35" />
      <Circle cx="60" cy="60" r="27" fill={`url(#moon-${id})`} />
      <Circle cx="50" cy="52" r="5" fill={colors.gold} opacity="0.35" /><Circle cx="68" cy="66" r="4" fill={colors.gold} opacity="0.3" /><Circle cx="58" cy="72" r="2.5" fill={colors.gold} opacity="0.3" /><Circle cx="70" cy="50" r="2" fill={colors.gold} opacity="0.3" />
      <Polygon points={star(28, 40, 4, 1.6, 4)} fill={colors.goldSoft} opacity="0.9" />
      <Polygon points={star(92, 76, 3, 1.2, 4)} fill={colors.goldSoft} opacity="0.7" />
      <Polygon points={star(34, 84, 2.5, 1, 4)} fill={colors.goldSoft} opacity="0.6" />
    </G>}
    {name === 'Syams' && <G>
      {Array.from({ length: 12 }, (_, i) => <Line key={i} x1="60" y1="17" x2="60" y2={i % 2 === 0 ? '27' : '24'} stroke={colors.goldSoft} strokeWidth={i % 2 === 0 ? 4 : 2.5} strokeLinecap="round" transform={`rotate(${i * 30} 60 60)`} />)}
      <Circle cx="60" cy="60" r="27" fill={colors.gold} opacity="0.35" />
      <Circle cx="60" cy="60" r="22" fill={`url(#sun-${id})`} stroke={colors.goldSoft} strokeWidth="1.5" />
      <Circle cx="52" cy="52" r="6" fill={colors.white} opacity="0.35" />
    </G>}
    {!['Awan', 'Bintang', 'Purnama', 'Syams'].includes(name) && <Polygon points={star(60, 62, 26, 11)} fill={`url(#star-${id})`} />}
  </Svg>;
}
