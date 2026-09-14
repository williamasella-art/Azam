import React, { useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import * as Location from 'expo-location';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/src/AppContext';
import { api } from '@/src/api';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Card, Icon, Page, Status, T, Tap } from '@/src/components/ui';

export function Qibla() {
  const { settings, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { width } = useWindowDimensions();
  const [heading, setHeading] = useState<number | null>(null); const [accuracy, setAccuracy] = useState(0);
  const query = useQuery({ queryKey: ['qibla', settings.latitude, settings.longitude], queryFn: () => api(`/qibla?latitude=${settings.latitude}&longitude=${settings.longitude}`).then(r => r.data) });
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null; let cancelled = false;
    (async () => {
      if (Platform.OS === 'web') return;
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) return;
      const sub = await Location.watchHeadingAsync(value => { if (!cancelled) { setHeading(value.trueHeading >= 0 ? value.trueHeading : value.magHeading); setAccuracy(value.accuracy); } });
      if (cancelled) sub.remove(); else subscription = sub;
    })().catch(() => setHeading(null));
    return () => { cancelled = true; subscription?.remove(); };
  }, [settings.location_set, settings.latitude, settings.longitude]);
  const bearing = query.data?.bearing || 0;
  const rotation = bearing - (heading || 0);
  const delta = Math.abs(((rotation + 540) % 360) - 180);
  const aligned = heading !== null && accuracy >= 2 && delta <= 5;
  const size = Math.min(width - 48, 350);
  return <Page title="Arah kiblat" back="home" subtitle="Satu arah, menyatukan hati.">
    <Tap testID="qibla-location-button" style={s.location} onPress={() => setModal({ type: 'location' })}><Icon name="location-outline" color={colors.onBrandSecondary} size={18} /><T size={13} weight="700" color={colors.onBrandSecondary}>{settings.city}</T><Icon name="chevron-down" color={colors.onBrandSecondary} size={15} /></Tap>
    {query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <>
      <View style={s.compassWrap}><Badge text={heading === null ? 'ARAH DARI UTARA' : 'KOMPAS PERANGKAT'} icon="compass-outline" />
        <Svg testID="qibla-compass" width={size} height={size} viewBox="0 0 340 340"><Circle cx="170" cy="170" r="163" fill={colors.brandSecondary} /><Circle cx="170" cy="170" r="143" fill={colors.surface} /><Circle cx="170" cy="170" r="115" stroke={colors.border} strokeWidth="1" fill={colors.surface} />
          <G transform={`rotate(${-(heading || 0)} 170 170)`}>{Array.from({ length: 60 }, (_, i) => <Line key={i} x1="170" y1={i % 5 === 0 ? '34' : '38'} x2="170" y2={i % 5 === 0 ? '48' : '44'} transform={`rotate(${i * 6} 170 170)`} stroke={i % 5 === 0 ? colors.onBrandSecondary : colors.borderStrong} strokeWidth={i % 5 === 0 ? 2 : 1} />)}
            {[['U', 170, 75], ['T', 270, 175], ['S', 170, 274], ['B', 70, 175]].map(([label, x, y]) => <SvgText key={String(label)} x={x} y={y} fill={label === 'U' ? colors.brandPrimary : colors.muted} fontSize="14" fontWeight="600" textAnchor="middle">{label}</SvgText>)}</G>
          <G transform={`rotate(${rotation} 170 170)`}><Path d="M170 83 L188 170 170 155 152 170Z" fill={colors.brandPrimary} /><Path d="M170 250 L152 170 170 184 188 170Z" fill={colors.brandTertiary} /><Circle cx="170" cy="170" r="9" fill={colors.surface} stroke={colors.brandPrimary} strokeWidth="4" /><Path d="M162 58 L170 50 179 58 V69 H162Z" fill={colors.illustrationNavy} /><Line x1="162" y1="59" x2="179" y2="59" stroke={colors.warning} strokeWidth="3" /></G>
        </Svg>
        <T testID="qibla-bearing" size={39} weight="800" style={{ letterSpacing: -1.5 }}>{bearing.toFixed(1)}<T size={26} color={colors.brandPrimary}>°</T></T>
        <T testID="qibla-sensor-status" size={13} weight="600" color={aligned ? colors.success : colors.onBrandSecondary}>{aligned ? 'Anda menghadap kiblat' : heading === null ? 'Se arah jarum jam dari utara sejati'.replace('Se arah', 'Searah') : 'Putar perangkat mengikuti jarum biru'}</T>
        <T size={11} muted>{query.data.distance_km.toLocaleString('id-ID')} km menuju Ka’bah</T>
      </View>
      <Card style={s.info}><Icon name="information-circle-outline" color={colors.onBrandSecondary} /><View style={{ flex: 1, gap: 5 }}><T size={13} weight="700">{heading === null ? 'Petunjuk arah manual' : 'Jaga kompas tetap akurat'}</T><T size={12} muted>{heading === null ? 'Sensor kompas belum tersedia di pratinjau ini. Gunakan kompas fisik untuk mencari sudut di atas dari utara sejati.' : 'Letakkan ponsel mendatar, jauhi benda logam, lalu gerakkan membentuk angka delapan untuk kalibrasi.'}</T>{heading !== null && accuracy < 2 && <T size={11} color={colors.warning}>Akurasi sensor rendah. Kalibrasikan sebelum mengikuti arah.</T>}</View></Card>
      <Button testID="qibla-manual-location-button" variant="secondary" title="Ubah lokasi otomatis / manual" icon="locate-outline" onPress={() => setModal({ type: 'location' })} />
    </>}
  </Page>;
}
const useStyles = makeStyles(c => ({
  location: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 20, backgroundColor: c.brandSecondary, borderRadius: 15 },
  compassWrap: { alignItems: 'center', gap: 9 }, info: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', backgroundColor: c.brandSecondary, padding: 17 },
}));