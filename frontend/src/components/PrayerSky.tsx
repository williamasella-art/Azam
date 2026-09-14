import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Small vector sky scenes for the five daily prayers (static — no animation, so the home list stays smooth).
 * Illustration palettes are intentionally identical in light and dark themes.
 */
const SKIES: Record<string, { top: string; bottom: string; glow: string }> = {
  Subuh: { top: '#1D2B64', bottom: '#F8B195', glow: '#FFD3A5' },
  Zuhur: { top: '#2F80ED', bottom: '#9BD4FF', glow: '#FFF3B0' },
  Asar: { top: '#4A7BD6', bottom: '#FFC371', glow: '#FFE29F' },
  Magrib: { top: '#3A1C71', bottom: '#FF8C42', glow: '#FFB88C' },
  Isya: { top: '#050B2B', bottom: '#243B6B', glow: '#C9D6FF' },
};
export function PrayerSky({ name, size = 44, radius = 14 }: { name: string; size?: number; radius?: number }) {
  const sky = SKIES[name] || SKIES.Zuhur; const id = `sky-${name}`;
  return <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={sky.top} /><Stop offset="1" stopColor={sky.bottom} /></LinearGradient>
      <LinearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={sky.glow} stopOpacity="0.9" /><Stop offset="1" stopColor={sky.glow} stopOpacity="0" /></LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="48" height="48" rx={radius} fill={`url(#${id})`} />
    {name === 'Subuh' && <G>
      <Circle cx="16" cy="12" r="1.2" fill="#FFFFFF" opacity="0.9" /><Circle cx="34" cy="8" r="0.9" fill="#FFFFFF" opacity="0.7" /><Circle cx="27" cy="16" r="0.7" fill="#FFFFFF" opacity="0.6" />
      <Path d="M31 9 a5 5 0 1 0 5 6 a3.8 3.8 0 1 1 -5 -6z" fill="#FFF6D6" />
      <Ellipse cx="24" cy="40" rx="18" ry="9" fill={`url(#${id}-glow)`} />
      <Circle cx="24" cy="38" r="6" fill="#FFB86B" /><Rect x="0" y="36" width="48" height="12" fill="#2B3A67" />
      <Path d="M0 38 Q6 33 12 37 T24 36 T36 37 T48 36 V48 H0z" fill="#1E2A4F" />
    </G>}
    {name === 'Zuhur' && <G>
      <Circle cx="24" cy="18" r="11" fill={sky.glow} opacity="0.45" /><Circle cx="24" cy="18" r="7.5" fill="#FFE47A" /><Circle cx="24" cy="18" r="5" fill="#FFF6BF" />
      <Path d="M8 36 q3 -5 8 -3 q2 -5 7 -3 q4 -2 6 2 q5 -1 6 4 h-27z" fill="#FFFFFF" opacity="0.95" />
      <Path d="M28 42 q2 -3 5 -2 q2 -3 5 -1 q3 -1 4 2 h-14z" fill="#FFFFFF" opacity="0.75" />
    </G>}
    {name === 'Asar' && <G>
      <Circle cx="33" cy="24" r="9" fill={sky.glow} opacity="0.5" /><Circle cx="33" cy="24" r="6" fill="#FFD166" />
      <Path d="M4 30 q3 -5 8 -3 q2 -4 7 -2 q4 -2 6 2 q4 0 5 3 h-26z" fill="#FFFFFF" opacity="0.9" />
      <Rect x="0" y="36" width="48" height="12" fill="#C97B3B" opacity="0.9" />
      <Path d="M0 38 Q10 32 20 37 T40 36 T48 37 V48 H0z" fill="#8E4B25" />
    </G>}
    {name === 'Magrib' && <G>
      <Ellipse cx="24" cy="34" rx="20" ry="10" fill={`url(#${id}-glow)`} />
      <Circle cx="24" cy="32" r="8" fill="#FF6B35" /><Circle cx="24" cy="32" r="5.5" fill="#FFB347" />
      <Rect x="0" y="32" width="48" height="16" fill="#2B1B4D" />
      <Path d="M0 33 Q8 29 14 33 T28 32 T42 33 T48 32 V48 H0z" fill="#1B1038" />
      <Path d="M20 33 h8 v-3 l-4 -3 l-4 3z" fill="#120A26" /><Rect x="23" y="24" width="2" height="4" fill="#120A26" />
      <Path d="M6 12 q2 -1 4 0 q1 -1 3 0" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.7" strokeLinecap="round" />
    </G>}
    {name === 'Isya' && <G>
      <Circle cx="10" cy="10" r="1.3" fill="#FFFFFF" /><Circle cx="20" cy="7" r="0.9" fill="#FFFFFF" opacity="0.8" /><Circle cx="38" cy="13" r="1.1" fill="#FFFFFF" /><Circle cx="14" cy="20" r="0.8" fill="#FFFFFF" opacity="0.6" /><Circle cx="42" cy="24" r="0.7" fill="#FFFFFF" opacity="0.7" /><Circle cx="30" cy="22" r="0.6" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="28" cy="16" r="10" fill={sky.glow} opacity="0.18" />
      <Path d="M30 8 a8 8 0 1 0 8 9 a6 6 0 1 1 -8 -9z" fill="#FFF3C4" />
      <Rect x="0" y="38" width="48" height="10" fill="#0B1533" />
      <Path d="M0 40 Q8 34 16 39 T32 38 T48 39 V48 H0z" fill="#070D24" />
      <Path d="M18 39 h12 v-4 l-6 -4 l-6 4z" fill="#04081A" /><Rect x="23" y="27" width="2" height="4" fill="#04081A" />
    </G>}
  </Svg>;
}
