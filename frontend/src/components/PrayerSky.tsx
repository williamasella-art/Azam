import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Small vector sky scenes for the five daily prayers (static — no animation, so the home list stays smooth).
 * Palette intentionally kept soft and blue-forward so the icons harmonise with the sky-blue Azam UI
 * (no harsh dark navy or vivid purple). Identical in light and dark themes.
 */
const SKIES: Record<string, { top: string; bottom: string; glow: string; land: string; landDeep: string; sun: string }> = {
  Subuh: { top: '#7FA8D6', bottom: '#DCE8F5', glow: '#F6D9C0', land: '#9BB6D4', landDeep: '#7F9DC0', sun: '#F4C89A' },
  Zuhur: { top: '#4FA3E3', bottom: '#CFE7FA', glow: '#FBEEC0', land: '#BFE0F5', landDeep: '#A9D2ED', sun: '#FBE7A8' },
  Asar: { top: '#5B9BD5', bottom: '#D6E7F5', glow: '#F3DEBB', land: '#B7CFE4', landDeep: '#9BB6CF', sun: '#F2CE97' },
  Magrib: { top: '#5E7BB0', bottom: '#E7C6B4', glow: '#F1CBB2', land: '#5F6E96', landDeep: '#4C5B82', sun: '#EBA07A' },
  Isya: { top: '#274472', bottom: '#5C7CAE', glow: '#CDDCF3', land: '#22385C', landDeep: '#1B2E4E', sun: '#EAF1FB' },
};
export function PrayerSky({ name, size = 44, radius = 14 }: { name: string; size?: number; radius?: number }) {
  const sky = SKIES[name] || SKIES.Zuhur; const id = `sky-${name}`;
  return <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={sky.top} /><Stop offset="1" stopColor={sky.bottom} /></LinearGradient>
      <LinearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={sky.glow} stopOpacity="0.85" /><Stop offset="1" stopColor={sky.glow} stopOpacity="0" /></LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="48" height="48" rx={radius} fill={`url(#${id})`} />
    {name === 'Subuh' && <G>
      <Circle cx="16" cy="12" r="1.1" fill="#FFFFFF" opacity="0.85" /><Circle cx="34" cy="8" r="0.8" fill="#FFFFFF" opacity="0.65" /><Circle cx="27" cy="16" r="0.6" fill="#FFFFFF" opacity="0.55" />
      <Path d="M31 9 a5 5 0 1 0 5 6 a3.8 3.8 0 1 1 -5 -6z" fill="#FFF6E6" opacity="0.9" />
      <Ellipse cx="24" cy="40" rx="18" ry="9" fill={`url(#${id}-glow)`} />
      <Circle cx="24" cy="38" r="6" fill={sky.sun} /><Rect x="0" y="36" width="48" height="12" fill={sky.land} />
      <Path d="M0 38 Q6 33 12 37 T24 36 T36 37 T48 36 V48 H0z" fill={sky.landDeep} />
    </G>}
    {name === 'Zuhur' && <G>
      <Circle cx="24" cy="18" r="11" fill={sky.glow} opacity="0.4" /><Circle cx="24" cy="18" r="7.5" fill={sky.sun} /><Circle cx="24" cy="18" r="5" fill="#FFF7DC" />
      <Path d="M8 36 q3 -5 8 -3 q2 -5 7 -3 q4 -2 6 2 q5 -1 6 4 h-27z" fill="#FFFFFF" opacity="0.92" />
      <Path d="M28 42 q2 -3 5 -2 q2 -3 5 -1 q3 -1 4 2 h-14z" fill="#FFFFFF" opacity="0.7" />
    </G>}
    {name === 'Asar' && <G>
      <Circle cx="33" cy="24" r="9" fill={sky.glow} opacity="0.45" /><Circle cx="33" cy="24" r="6" fill={sky.sun} />
      <Path d="M4 30 q3 -5 8 -3 q2 -4 7 -2 q4 -2 6 2 q4 0 5 3 h-26z" fill="#FFFFFF" opacity="0.85" />
      <Rect x="0" y="36" width="48" height="12" fill={sky.land} />
      <Path d="M0 38 Q10 32 20 37 T40 36 T48 37 V48 H0z" fill={sky.landDeep} />
    </G>}
    {name === 'Magrib' && <G>
      <Ellipse cx="24" cy="34" rx="20" ry="10" fill={`url(#${id}-glow)`} />
      <Circle cx="24" cy="32" r="8" fill={sky.sun} /><Circle cx="24" cy="32" r="5.5" fill="#F6C39E" />
      <Rect x="0" y="32" width="48" height="16" fill={sky.land} />
      <Path d="M0 33 Q8 29 14 33 T28 32 T42 33 T48 32 V48 H0z" fill={sky.landDeep} />
      <Path d="M20 33 h8 v-3 l-4 -3 l-4 3z" fill={sky.landDeep} /><Rect x="23" y="24" width="2" height="4" fill={sky.landDeep} />
      <Path d="M6 12 q2 -1 4 0 q1 -1 3 0" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" />
    </G>}
    {name === 'Isya' && <G>
      <Circle cx="10" cy="10" r="1.2" fill="#FFFFFF" opacity="0.9" /><Circle cx="20" cy="7" r="0.8" fill="#FFFFFF" opacity="0.75" /><Circle cx="38" cy="13" r="1" fill="#FFFFFF" opacity="0.85" /><Circle cx="14" cy="20" r="0.7" fill="#FFFFFF" opacity="0.55" /><Circle cx="42" cy="24" r="0.6" fill="#FFFFFF" opacity="0.6" /><Circle cx="30" cy="22" r="0.6" fill="#FFFFFF" opacity="0.55" />
      <Circle cx="28" cy="16" r="10" fill={sky.glow} opacity="0.16" />
      <Path d="M30 8 a8 8 0 1 0 8 9 a6 6 0 1 1 -8 -9z" fill={sky.sun} />
      <Rect x="0" y="38" width="48" height="10" fill={sky.land} />
      <Path d="M0 40 Q8 34 16 39 T32 38 T48 39 V48 H0z" fill={sky.landDeep} />
      <Path d="M18 39 h12 v-4 l-6 -4 l-6 4z" fill={sky.landDeep} /><Rect x="23" y="27" width="2" height="4" fill={sky.landDeep} />
    </G>}
  </Svg>;
}
