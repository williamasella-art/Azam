import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/src/theme';

export function MosqueArt({ compact = false }: { compact?: boolean }) {
  const { colors: c } = useTheme();
  return <Svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
    <Defs><LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={c.skyTop} /><Stop offset="1" stopColor={c.skyBottom} /></LinearGradient>
      <LinearGradient id="dome" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={c.illustrationWhite} /><Stop offset="1" stopColor={c.illustrationShade} /></LinearGradient></Defs>
    <Rect width="400" height="300" fill="url(#sky)" />
    <Circle cx="279" cy="85" r="67" fill={c.illustrationWhite} opacity="0.17" />
    <Circle cx="279" cy="85" r="48" fill={c.illustrationWhite} opacity="0.24" />
    <Path d="M115 35 a18 18 0 1 0 20 25 a18 18 0 0 1 -20 -25" fill={c.illustrationWhite} />
    <G fill={c.illustrationWhite} opacity="0.85"><Path d="M322 32 l2 7 7 2 -7 2 -2 7 -2 -7 -7 -2 7 -2Z" /><Path d="M166 68 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z" />
      <Circle cx="203" cy="34" r="2" /><Circle cx="365" cy="93" r="2" /><Circle cx="64" cy="70" r="2" />
      <Path d="M35 120 C35 111 49 109 52 117 C55 103 75 104 78 118 C89 114 95 121 95 126 H35Z" opacity="0.6" />
      <Path d="M318 126 C318 117 331 115 336 122 C339 108 358 110 361 124 C371 120 379 128 377 133 H318Z" opacity="0.7" /></G>
    <Path d="M0 243 Q85 173 189 225 Q283 257 400 210 V300 H0Z" fill={c.skyHill} />
    <Path d="M0 267 Q113 219 213 245 Q304 285 400 240 V300 H0Z" fill={c.skyDeep} opacity="0.42" />
    <Ellipse cx="239" cy="268" rx="111" ry="13" fill={c.illustrationNavy} opacity="0.08" />
    <G transform={compact ? 'translate(70 10) scale(0.95)' : undefined}>
      <Rect x="151" y="151" width="19" height="110" rx="2" fill="url(#dome)" /><Rect x="148" y="147" width="25" height="7" rx="2" fill={c.illustrationWhite} />
      <Path d="M151 143 Q149 130 160 119 Q172 131 170 143Z" fill={c.illustrationWhite} /><Path d="M160 119 V108" stroke={c.illustrationWhite} strokeWidth="2" />
      <Rect x="158" y="168" width="5" height="17" rx="2.5" fill={c.skyDeep} />
      <Rect x="309" y="143" width="17" height="118" rx="2" fill="url(#dome)" /><Rect x="306" y="139" width="23" height="7" rx="2" fill={c.illustrationWhite} />
      <Path d="M309 136 Q307 124 317 113 Q328 124 326 136Z" fill={c.illustrationWhite} /><Path d="M317 114 V103" stroke={c.illustrationWhite} strokeWidth="2" />
      <Rect x="315" y="162" width="5" height="17" rx="2.5" fill={c.skyDeep} />
      <Rect x="178" y="193" width="124" height="69" rx="3" fill="url(#dome)" />
      <Path d="M194 185 C185 151 221 143 240 118 C258 142 292 153 285 185Z" fill="url(#dome)" />
      <Path d="M240 120 V104" stroke={c.illustrationWhite} strokeWidth="2.5" /><Path d="M244 91 a7 7 0 1 0 4 11 a7 7 0 0 1 -4 -11" fill={c.illustrationWhite} />
      <Rect x="190" y="184" width="99" height="11" rx="3" fill={c.illustrationWhite} />
      <Path d="M224 262 V229 Q224 210 240 205 Q256 210 256 229 V262Z" fill={c.skyDeep} />
      <Path d="M233 262 V231 Q233 220 240 217 Q248 221 248 231 V262Z" fill={c.illustrationNavy} opacity="0.45" />
      <Path d="M190 240 V219 Q196 207 203 219 V240Z M276 240 V219 Q283 207 289 219 V240Z" fill={c.skyDeep} />
      <Rect x="171" y="259" width="137" height="6" rx="2" fill={c.illustrationWhite} />
      <Rect x="164" y="265" width="151" height="5" rx="2" fill={c.illustrationShade} />
    </G>
    <Path d="M329 269 Q333 228 346 208 Q340 247 346 268 M345 270 Q354 244 367 237 Q361 259 354 274" fill={c.skyDeep} />
    <Path d="M111 270 Q107 237 97 226 Q99 253 101 271 M118 273 Q124 245 137 235 Q133 260 127 276" fill={c.skyDeep} opacity="0.8" />
  </Svg>;
}

export function LevelArt({ kind = 'cloud', size = 100, locked = false }: { kind?: string; size?: number; locked?: boolean }) {
  const { colors: c } = useTheme();
  const fill = locked ? c.borderStrong : c.brand;
  return <Svg width={size} height={size} viewBox="0 0 120 120"><Circle cx="60" cy="60" r="54" fill={c.brandSecondary} opacity={locked ? 0.4 : 1} /><Circle cx="60" cy="60" r="43" fill={c.surface} opacity="0.65" />
    {kind === 'cloud' ? <G><Path d="M32 75 C13 75 15 48 33 47 C37 25 71 23 81 47 C105 43 112 75 89 79 H32Z" fill={fill} /><Path d="M31 66 C18 58 32 45 43 50 C42 35 63 29 73 42" stroke={c.illustrationWhite} strokeWidth="4" opacity="0.6" fill="none" /></G>
      : kind === 'star' ? <Path d="M60 24 L70 47 96 49 77 67 82 94 60 81 38 94 43 67 24 49 50 47Z" fill={fill} />
      : kind === 'moon' ? <G><Circle cx="60" cy="60" r="32" fill={fill} /><Circle cx="49" cy="47" r="7" fill={c.surface} opacity="0.25" /><Circle cx="71" cy="68" r="11" fill={c.surface} opacity="0.25" /></G>
      : <G><Circle cx="60" cy="60" r="23" fill={c.warning} />{Array.from({ length: 8 }, (_, i) => <Path key={i} d="M60 20V29" stroke={c.warning} strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 45} 60 60)`} />)}</G>}
    {!locked && <G fill={c.brandPrimary}><Path d="M94 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z" /><Circle cx="21" cy="88" r="3" /></G>}
  </Svg>;
}