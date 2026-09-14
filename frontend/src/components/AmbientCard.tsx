import React from 'react';
import { Image, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useApp } from '@/src/AppContext';
import { AMBIENTS, PRO_AMBIENTS, useAmbient } from '@/src/ambient';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Card, Icon, IconBox, T, Tap } from './ui';

export function AmbientCard({ compact = false }: { compact?: boolean }) {
  const { active, volumes, toggle, preview, commit } = useAmbient(); const { go } = useApp(); const s = useStyles(); const { colors } = useTheme();
  return <Card style={s.card} testID="ambient-card">
    {!compact && <View style={s.head}><View style={{ flex: 1, gap: 4 }}><Badge text="RAMAH ADHD · FOKUS" icon="sparkles-outline" /><T size={17} weight="800">Suasana tenang</T><T size={11} muted>Atur volume tiap suara sesuai kenyamananmu.</T></View><Image source={active === 'cat' ? IMG.cat : IMG.rain} style={s.art} /></View>}
    {AMBIENTS.map(item => { const on = active === item.key; return <View key={item.key} style={[s.row, on && s.rowOn]}>
      <Tap testID={`ambient-${item.key}-toggle`} onPress={() => toggle(item.key)} style={s.toggle} accessibilityState={{ selected: on }}><IconBox name={on ? 'pause' : item.icon} bg={on ? colors.brandPrimary : colors.brandSecondary} color={on ? colors.onBrandPrimary : colors.onBrandSecondary} /><View style={{ flex: 1 }}><T weight="700" size={14}>{item.label}</T><T size={10} muted>{on ? 'Sedang diputar' : item.description}</T></View><T testID={`ambient-${item.key}-volume`} size={12} weight="700" color={colors.onBrandSecondary}>{Math.round(volumes[item.key] * 100)}%</T></Tap>
      <View style={s.sliderRow}><Icon name="volume-low-outline" size={16} color={colors.muted} />
        <Slider testID={`ambient-${item.key}-slider`} style={s.slider} minimumValue={0} maximumValue={1} step={0.05} value={volumes[item.key]} minimumTrackTintColor={colors.brandPrimary} maximumTrackTintColor={colors.borderStrong} thumbTintColor={colors.brandTertiary} onValueChange={(v: number) => preview(item.key, v)} onSlidingComplete={(v: number) => commit(item.key, v)} accessibilityLabel={`Volume ${item.label}`} />
        <Icon name="volume-high-outline" size={16} color={colors.muted} /></View>
    </View>; })}
    {!compact && <View style={s.proRow}>{PRO_AMBIENTS.map(item => <Tap key={item.key} testID={`ambient-pro-${item.key}`} onPress={() => go('pro')} style={s.proChip} accessibilityLabel={`${item.label} tersedia di Pro`}><Icon name={item.icon} size={18} color={colors.muted} /><T size={10} color={colors.muted}>{item.label}</T><View style={s.lock}><Icon name="lock-closed" size={9} color={colors.goldText} /></View></Tap>)}</View>}
    {!compact && <T size={10} muted>Suara berwarna abu-abu adalah bagian Azam Pro (pratinjau).</T>}
  </Card>;
}
const useStyles = makeStyles(c => ({
  card: { gap: 12 }, head: { flexDirection: 'row', alignItems: 'center', gap: 12 }, art: { width: 74, height: 74, borderRadius: 22 },
  row: { borderRadius: 18, padding: 10, gap: 4, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, rowOn: { borderColor: c.brandTertiary, backgroundColor: c.brandSecondary },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }, sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 }, slider: { flex: 1, height: 36 },
  proRow: { flexDirection: 'row', gap: 8 }, proChip: { flex: 1, minHeight: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: c.surfaceTertiary, opacity: 0.7 }, lock: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' },
}));
