import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { api } from '@/src/api';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Button, Card, Icon, Page, Status, T, Tap } from '@/src/components/ui';

/** Unwraps a compass heading so the animation always takes the shortest path. */
function unwrap(previous: number, next: number) { let delta = ((next - previous + 540) % 360) - 180; if (delta < -180) delta += 360; return previous + delta; }
// Real-time follow: a very short linear tween keeps the dial glued to the sensor without visible lag.
const FOLLOW = { duration: 60, easing: Easing.linear };

export function Qibla() {
  const { settings, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { width } = useWindowDimensions();
  const [heading, setHeading] = useState<number | null>(null); const [accuracy, setAccuracy] = useState(0); const [simulated, setSimulated] = useState(0);
  const query = useQuery({ queryKey: ['qibla', settings.latitude, settings.longitude], queryFn: () => api(`/qibla?latitude=${settings.latitude}&longitude=${settings.longitude}`).then(r => r.data) });
  const bearing = query.data?.bearing || 0; const bearingRef = useRef(bearing); bearingRef.current = bearing;
  const dial = useSharedValue(0); const needle = useSharedValue(0); const pulse = useSharedValue(1); const last = useRef(0); const smoothed = useRef<number | null>(null);
  const sensor = heading !== null;
  const current = sensor ? heading : simulated;
  // Pushes a heading into the dial/needle shared values. Called straight from the sensor callback so
  // the UI thread follows the phone with zero React re-render latency.
  const drive = (value: number, animate = true) => {
    const target = unwrap(last.current, value); last.current = target;
    if (animate) { dial.value = withTiming(-target, FOLLOW); needle.value = withTiming(bearingRef.current - target, FOLLOW); }
    else { dial.value = -target; needle.value = bearingRef.current - target; }
  };
  useEffect(() => { if (!sensor) drive(simulated); }, [simulated, sensor]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { drive(last.current, false); }, [bearing]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null; let cancelled = false; let lastUi = 0;
    (async () => {
      if (Platform.OS === 'web') return;
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) return;
      const sub = await Location.watchHeadingAsync(value => {
        if (cancelled) return;
        const raw = value.trueHeading >= 0 ? value.trueHeading : value.magHeading;
        // Adaptive smoothing: big turns pass through almost raw (instant response), tiny changes are damped (no jitter).
        const previous = smoothed.current ?? raw;
        const delta = unwrap(previous, raw) - previous;
        const alpha = Math.min(1, 0.35 + Math.abs(delta) / 25);
        const next = ((previous + delta * alpha) % 360 + 360) % 360;
        smoothed.current = next;
        drive(next);
        // Text/state updates are throttled to ~8 Hz — they only feed labels and the aligned check.
        const stamp = Date.now();
        if (stamp - lastUi > 120) { lastUi = stamp; setHeading(next); setAccuracy(value.accuracy); }
      });
      if (cancelled) sub.remove(); else subscription = sub;
    })().catch(() => setHeading(null));
    return () => { cancelled = true; subscription?.remove(); };
  }, [settings.location_set, settings.latitude, settings.longitude]); // eslint-disable-line react-hooks/exhaustive-deps
  const delta = Math.abs(((bearing - current + 540) % 360) - 180);
  const aligned = delta <= 5 && (!sensor || accuracy >= 2);
  useEffect(() => { pulse.value = withSpring(aligned ? 1.06 : 1, { damping: 8 }); if (aligned && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }, [aligned, pulse]);
  const dialStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${dial.value}deg` }] }));
  const needleStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${needle.value}deg` }] }));
  const uprightStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-needle.value}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const size = Math.min(width - 60, 330); const half = size / 2;
  // Drag anywhere on the dial to spin it in simulation mode (no sensor).
  const spinStart = useRef({ angle: 0, value: 0 }); const simRef = useRef(0); simRef.current = simulated;
  const angleOf = (x: number, y: number) => (Math.atan2(y - half, x - half) * 180) / Math.PI;
  const spin = useMemo(() => Gesture.Pan().enabled(!sensor).runOnJS(true)
    .onBegin(e => { spinStart.current = { angle: angleOf(e.x, e.y), value: simRef.current }; })
    .onUpdate(e => { setSimulated((((spinStart.current.value + angleOf(e.x, e.y) - spinStart.current.angle) % 360) + 360) % 360); }), [sensor, half]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Page title="Arah kiblat" subtitle="Satu arah, menyatukan hati.">
    <Tap testID="qibla-location-button" style={s.location} onPress={() => setModal({ type: 'location' })}><Icon name="location" color={colors.brandTertiary} size={16} /><T size={13} weight="700">{settings.city}</T><Icon name="chevron-down" color={colors.muted} size={15} /></Tap>
    {query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <>
      <View style={s.compassWrap}><Badge text={sensor ? 'KOMPAS PERANGKAT' : 'MODE SIMULASI · TANPA SENSOR'} icon="compass-outline" />
        <GestureDetector gesture={spin}><View testID="qibla-compass" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[s.ring, { width: size, height: size, borderRadius: half, borderColor: aligned ? colors.success : colors.border }, ringStyle]} />
          <Animated.View style={[{ position: 'absolute', width: size, height: size }, dialStyle]}>
            <Svg width={size} height={size} viewBox="0 0 340 340"><Circle cx="170" cy="170" r="160" fill={colors.solid} /><Circle cx="170" cy="170" r="130" fill={colors.surfaceSecondary} />
              {Array.from({ length: 72 }, (_, i) => <Line key={i} x1="170" y1={i % 6 === 0 ? '18' : '22'} x2="170" y2={i % 6 === 0 ? '36' : '30'} transform={`rotate(${i * 5} 170 170)`} stroke={i % 18 === 0 ? colors.brandTertiary : i % 6 === 0 ? colors.onSurfaceTertiary : colors.borderStrong} strokeWidth={i % 6 === 0 ? 2.5 : 1} strokeLinecap="round" />)}
              {[['U', 170, 70], ['T', 275, 176], ['S', 170, 282], ['B', 65, 176]].map(([label, x, y]) => <SvgText key={String(label)} x={x} y={y} fill={label === 'U' ? colors.brandTertiary : colors.onSurfaceTertiary} fontSize="18" fontWeight="700" textAnchor="middle" fontFamily="PlusJakartaSans-Bold">{label}</SvgText>)}
              <G>{Array.from({ length: 8 }, (_, i) => <Circle key={i} cx="170" cy="120" r="2" fill={colors.muted} transform={`rotate(${i * 45 + 22.5} 170 170)`} />)}</G>
            </Svg>
          </Animated.View>
          <Animated.View style={[{ position: 'absolute', width: size, height: size, alignItems: 'center' }, needleStyle]}>
            <Animated.View style={[s.kaabaWrap, { top: size * 0.10, borderColor: aligned ? colors.success : colors.gold }, uprightStyle]}><Image source={IMG.kaaba} style={s.kaaba} /></Animated.View>
            <View style={[s.needle, { top: size * 0.10 + 52, height: half - size * 0.10 - 52, backgroundColor: aligned ? colors.success : colors.brandTertiary }]} />
            <View style={[s.needleTail, { top: half, height: half * 0.36 }]} />
          </Animated.View>
          <View style={s.hub}><Icon name="navigate" size={18} color={colors.onBrandPrimary} /></View>
        </View></GestureDetector>
        <T testID="qibla-bearing" size={40} weight="800" style={{ letterSpacing: -1.5 }}>{bearing.toFixed(1)}<T size={26} color={colors.brandTertiary}>°</T></T>
        <T testID="qibla-sensor-status" size={13} weight="600" color={aligned ? colors.success : colors.onBrandSecondary}>{aligned ? 'Kamu menghadap kiblat ✓' : sensor ? 'Putar perangkat mengikuti Ka’bah' : `Kiblat ${bearing.toFixed(0)}° searah jarum jam dari utara`}</T>
        <T size={11} muted>{query.data.distance_km.toLocaleString('id-ID')} km menuju Ka’bah</T>
      </View>
      {!sensor && <Card style={s.sim}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="hand-left-outline" size={18} color={colors.onBrandSecondary} /><T size={13} weight="700">Geser kompas atau slider</T><View style={{ flex: 1 }} /><T testID="qibla-simulated-heading" size={12} weight="700" color={colors.onBrandSecondary}>{Math.round(simulated)}°</T></View>
        <Slider testID="qibla-simulation-slider" style={{ height: 40 }} minimumValue={0} maximumValue={359} step={1} value={simulated} onValueChange={setSimulated} minimumTrackTintColor={colors.brandPrimary} maximumTrackTintColor={colors.borderStrong} thumbTintColor={colors.brandTertiary} accessibilityLabel="Simulasi arah perangkat" />
        <T size={11} muted>Sensor kompas tidak tersedia di pratinjau ini. Geser untuk melihat animasi; di ponsel, kompas mengikuti gerakan perangkat.</T></Card>}
      {sensor && <Card style={s.sim}><Icon name="information-circle-outline" color={colors.onBrandSecondary} /><T size={12} muted>Letakkan ponsel mendatar, jauhi benda logam, lalu gerakkan membentuk angka delapan untuk kalibrasi.</T>{accuracy < 2 && <T size={11} color={colors.warning}>Akurasi sensor rendah. Kalibrasikan sebelum mengikuti arah.</T>}</Card>}
      <Button testID="qibla-manual-location-button" variant="secondary" title="Ubah lokasi otomatis / manual" icon="locate-outline" onPress={() => setModal({ type: 'location' })} />
    </>}
  </Page>;
}
const useStyles = makeStyles(c => ({
  location: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 18, backgroundColor: c.glass, borderRadius: 15, borderWidth: 1, borderColor: c.border },
  compassWrap: { alignItems: 'center', gap: 10 }, ring: { position: 'absolute', borderWidth: 3 },
  kaabaWrap: { position: 'absolute', width: 52, height: 52, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: c.gold }, kaaba: { width: '100%', height: '100%' },
  needle: { position: 'absolute', width: 8, borderRadius: 4 }, needleTail: { position: 'absolute', width: 6, borderRadius: 3, backgroundColor: c.borderStrong },
  hub: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: c.surfaceSecondary },
  sim: { gap: 8 },
}));
