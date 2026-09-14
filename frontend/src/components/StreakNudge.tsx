import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { storage } from '@/src/utils/storage';
import { Icon, T, Tap } from './ui';
import { PRAYER_ICONS } from './SocialDemo';
import { PulseFlame } from './SkyLife';

/** Gentle evening nudge (after Magrib) listing today's unchecked prayers, dismissible once per day. */
export function StreakNudge({ list, complete, timeNow }: { list: any[]; complete: string[]; timeNow: string }) {
  const { user, day, progress, checkin, checking } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const key = `streak-nudge:${user?.user_id}:${day}`;
  useEffect(() => { setDismissed(null); storage.getItem(key, false).then(v => setDismissed(!!v)); }, [key]);
  const magrib = list.find((p: any) => p.name === 'Magrib');
  const missing = list.filter((p: any) => !complete.includes(p.name));
  if (!magrib || timeNow.slice(0, 5) < magrib.time || !missing.length || dismissed !== false) return null;
  const streak = progress.data?.streak || 0;
  const dismiss = async () => { await storage.setItem(key, true); setDismissed(true); };
  return <Animated.View entering={FadeInDown.duration(450)} exiting={FadeOut.duration(250)} testID="streak-nudge-card" style={s.card}>
    <LinearGradient colors={[colors.goldSoft, colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.bg} />
    <View style={s.head}>
      <View style={s.flame}><PulseFlame size={22} color={colors.gold} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <T testID="streak-nudge-title" size={14} weight="800">{streak > 0 ? `Streak ${streak} harimu menunggu` : 'Lengkapi hari ini, mulai streak'}</T>
        <T testID="streak-nudge-message" size={11} muted>Masih ada {missing.length} salat belum dicatat. Lengkapi sebelum hari berganti, tanpa terburu-buru.</T>
      </View>
      <Tap testID="streak-nudge-dismiss-button" onPress={dismiss} style={s.dismiss} accessibilityLabel="Tutup pengingat"><Icon name="close" size={18} color={colors.muted} /></Tap>
    </View>
    <View style={s.row}>{missing.map((p: any) => <Tap key={p.name} testID={`streak-nudge-checkin-${p.name.toLowerCase()}`} disabled={checking} onPress={() => checkin(p.name)} style={s.chip} accessibilityLabel={`Catat salat ${p.name}`}>
      <Icon name={PRAYER_ICONS[p.name]} size={16} color={colors.goldText} /><T size={12} weight="700" color={colors.goldText}>{p.name}</T><Icon name="add-circle-outline" size={14} color={colors.goldText} />
    </Tap>)}</View>
  </Animated.View>;
}
const useStyles = makeStyles(c => ({
  card: { borderRadius: 22, borderWidth: 1, borderColor: c.gold, padding: 14, gap: 12, overflow: 'hidden', backgroundColor: c.surface },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flame: { width: 44, height: 44, borderRadius: 15, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' },
  dismiss: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 13, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.gold },
}));
