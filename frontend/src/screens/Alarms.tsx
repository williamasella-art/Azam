import React, { useEffect, useState } from 'react';
import { Platform, Switch, View } from 'react-native';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Alarm, describeRepeat, nextFire, openSystemAlarm, showTime, soonest, untilText } from '@/src/alarms';
import { Badge, Button, Card, Icon, Page, Status, T, Tap } from '@/src/components/ui';
import { AnimatedCat } from '@/src/components/AnimatedCat';
import { useI18n } from '@/src/i18n';
import { screenText } from '@/src/screenText';

const META: Record<string, { ringsIn: string; passed: string; off: string }> = {
  id: { ringsIn: 'Berbunyi dalam', passed: 'Waktunya sudah lewat', off: 'Nonaktif' },
  en: { ringsIn: 'Rings in', passed: 'The time has passed', off: 'Off' },
  ms: { ringsIn: 'Berbunyi dalam', passed: 'Waktunya sudah berlalu', off: 'Tidak aktif' },
  ar: { ringsIn: 'يرنّ بعد', passed: 'انقضى الوقت', off: 'متوقف' },
};

export function Alarms() {
  const { alarms, saveAlarm, removeAlarm, setModal, notify, now } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const { lang } = useI18n(); const tx = screenText(lang).alarms; const meta = META[lang] || META.id;
  const list: Alarm[] = alarms.data || [];
  const next = soonest(list, now);
  const [permission, setPermission] = useState<'granted' | 'missing' | 'web'>('web');
  useEffect(() => {
    if (Platform.OS === 'web') return;
    import('expo-notifications').then(n => n.getPermissionsAsync()).then(p => setPermission(p.granted ? 'granted' : 'missing')).catch(() => setPermission('missing'));
  }, [alarms.data]);
  const toggle = async (a: Alarm, enabled: boolean) => {
    try {
      if (enabled && a.repeat === 'once' && !nextFire(a)) { setModal({ type: 'alarm-form', alarm: a, title: tx.editTitle }); notify(tx.passedPickNew); return; }
      await saveAlarm({ ...a, enabled }, a.id); notify(enabled ? tx.on(showTime(a.time)) : tx.off(showTime(a.time)));
    } catch (e: any) { notify(e.message); }
  };
  const remove = async (a: Alarm) => { try { await removeAlarm(a.id); notify(tx.removed); } catch (e: any) { notify(e.message); } };
  const toClock = async (a: Alarm) => { try { await openSystemAlarm(a); } catch { notify('Aplikasi Jam di HP belum bisa dibuka dari sini. Alarm notifikasi Azam tetap berjalan.'); } };
  return <Page title={tx.title} subtitle={tx.subtitle} back="focus"
    right={<Tap testID="alarm-add-button" style={s.addButton} onPress={() => setModal({ type: 'alarm-form' })} accessibilityLabel={tx.addLabel}><Icon name="add" size={24} color={colors.onBrandPrimary} /></Tap>}>
    <Card style={s.hero}><View style={s.heroArt}><AnimatedCat size={92} /></View><View style={{ flex: 1, gap: 4 }}>
      {next ? <><Badge text={tx.nextBadge} icon="alarm-outline" /><T testID="alarms-next-time" size={34} weight="800" style={{ letterSpacing: -1.5 }}>{showTime(next.alarm.time)}</T><T size={12} weight="600">{next.alarm.label}</T><T testID="alarms-next-until" size={11} muted>{describeRepeat(next.alarm)} · {meta.ringsIn} {untilText(next.at, now)}</T></>
        : <><Badge text={tx.noneBadge} icon="moon-outline" /><T size={16} weight="700">{tx.setFirst}</T><T size={11} muted>{tx.setFirstDesc}</T></>}
    </View></Card>
    {permission === 'missing' && <Tap testID="alarms-permission-banner" style={s.warn} onPress={() => setModal({ type: 'notifications' })}><Icon name="notifications-off-outline" size={20} color={colors.warning} /><T size={12} weight="600" color={colors.warning} style={{ flex: 1 }}>{tx.permissionBanner}</T><Icon name="chevron-forward" size={16} color={colors.warning} /></Tap>}
    {alarms.isLoading ? <Status loading /> : alarms.isError ? <Status error={alarms.error} retry={alarms.refetch} /> : !list.length ? <Card style={s.empty}><Icon name="alarm-outline" size={36} color={colors.muted} /><T size={15} weight="700" style={s.center}>{tx.emptyTitle}</T><T size={12} muted style={s.center}>{tx.emptyDesc}</T><Button testID="alarm-empty-add-button" title={tx.add} icon="add-circle-outline" onPress={() => setModal({ type: 'alarm-form' })} /></Card>
      : list.map(a => { const at = a.enabled ? nextFire(a, now) : null; const slug = a.id.slice(-6); return <Card key={a.id} testID={`alarm-card-${slug}`} style={[s.card, !a.enabled && s.cardOff]}>
        <Tap testID={`alarm-edit-${slug}`} style={s.mainRow} onPress={() => setModal({ type: 'alarm-form', alarm: a, title: tx.editTitle })}>
          <View style={{ flex: 1, gap: 2 }}><T testID={`alarm-time-${slug}`} size={40} weight="800" color={a.enabled ? colors.onSurface : colors.muted} style={{ letterSpacing: -1.5 }}>{showTime(a.time)}</T>
            <T size={14} weight="700" numberOfLines={1} color={a.enabled ? colors.onSurface : colors.muted}>{a.label}</T>
            <View style={s.metaRow}><Icon name={a.repeat === 'once' ? 'calendar-outline' : 'repeat-outline'} size={13} color={colors.onBrandSecondary} /><T testID={`alarm-repeat-${slug}`} size={11} color={colors.onBrandSecondary}>{describeRepeat(a)}</T></View>
            <T size={11} muted>{at ? `${meta.ringsIn} ${untilText(at, now)} · “${a.phrase}”` : a.enabled ? meta.passed : meta.off}</T></View>
          <Switch testID={`alarm-switch-${slug}`} value={a.enabled} onValueChange={(value) => toggle(a, value)} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} />
        </Tap>
        <View style={s.actions}>
          <Tap testID={`alarm-preview-${slug}`} style={s.action} onPress={() => setModal({ type: 'alarm', alarm: a, preview: true })}><Icon name="play-outline" size={16} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>{tx.tryTone}</T></Tap>
          {Platform.OS === 'android' && <Tap testID={`alarm-clock-${slug}`} style={s.action} onPress={() => toClock(a)}><Icon name="phone-portrait-outline" size={16} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>{tx.phoneClock}</T></Tap>}
          <Tap testID={`alarm-delete-${slug}`} style={s.action} onPress={() => remove(a)}><Icon name="trash-outline" size={16} color={colors.error} /><T size={11} weight="700" color={colors.error}>{tx.delete}</T></Tap>
        </View>
      </Card>; })}
    <Card style={s.info}><Icon name="information-circle-outline" size={20} color={colors.onBrandSecondary} /><T size={11} muted style={{ flex: 1 }}>{Platform.OS === 'web' ? tx.info.web : Platform.OS === 'android' ? tx.info.android : tx.info.ios}</T></Card>
  </Page>;
}
const useStyles = makeStyles(c => ({
  addButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.surface }, heroArt: { width: 96, height: 96, borderRadius: 30, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  warn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 18, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.gold },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 28 }, center: { textAlign: 'center' },
  card: { gap: 12 }, cardOff: { backgroundColor: c.surfaceSecondary }, mainRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 12 }, action: { flex: 1, minHeight: 40, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: c.glass },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.brandSecondary, borderColor: c.transparent },
}));
