import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Button, Card, Icon, IconBox, Page, T, Tap } from '@/src/components/ui';
import { AnimatedCat } from '@/src/components/AnimatedCat';
import { PrayerSky } from '@/src/components/PrayerSky';
import { APP_CATEGORIES } from '@/src/components/FormSheets';
import { describeRepeat, showTime, soonest, untilText } from '@/src/alarms';
import { useI18n } from '@/src/i18n';

export const APPS: { name: string; icon: string; color: string }[] = [
  { name: 'Instagram', icon: 'logo-instagram', color: 'instagram' }, { name: 'TikTok', icon: 'logo-tiktok', color: 'tiktok' }, { name: 'YouTube', icon: 'logo-youtube', color: 'youtube' },
  { name: 'X', icon: 'logo-twitter', color: 'x' }, { name: 'Facebook', icon: 'logo-facebook', color: 'facebook' }, { name: 'Chrome', icon: 'logo-chrome', color: 'chrome' }, { name: 'Game', icon: 'game-controller', color: 'game' },
];

/** Smooth, theme-aligned on/off toggle for the App Blocker (sits on the dark hero photo). */
function BlockerToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const s = useStyles(); const { colors } = useTheme();
  const p = useSharedValue(value ? 1 : 0);
  useEffect(() => { p.value = withTiming(value ? 1 : 0, { duration: 240 }); }, [value, p]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(255,255,255,0.22)', colors.brandTertiary]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * 26 }] }));
  return <Tap testID="blocker-enabled-toggle" haptic={false} onPress={() => onChange(!value)} style={s.togglePill} accessibilityRole="switch" accessibilityState={{ checked: value }}>
    <T size={11} weight="800" color={colors.heroInk} style={{ letterSpacing: 1 }}>{value ? 'ON' : 'OFF'}</T>
    <Animated.View testID="blocker-enabled-switch" style={[s.toggleTrack, track]}><Animated.View style={[s.toggleKnob, knob]} /></Animated.View>
  </Tap>;
}
export function Focus() {
  const { settings, updateSettings, setModal, go, alarms, now, notify } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { t, prayer } = useI18n();
  const pro = !!settings.pro_preview;
  const nextAlarm = soonest(alarms.data, now); const activeAlarms = pro ? (alarms.data || []).filter((a: any) => a.enabled).length : 0;
  const togglePrayer = (name: string) => updateSettings({ blocked_prayers: settings.blocked_prayers.includes(name) ? settings.blocked_prayers.filter((p: string) => p !== name) : [...settings.blocked_prayers, name] });
  const toggleApp = (name: string) => updateSettings({ blocked_apps: settings.blocked_apps.includes(name) ? settings.blocked_apps.filter((p: string) => p !== name) : [...settings.blocked_apps, name] });
  const removeApp = (name: string) => updateSettings({ custom_apps: (settings.custom_apps || []).filter((a: any) => a.name !== name), blocked_apps: settings.blocked_apps.filter((p: string) => p !== name) });
  const customApps: any[] = settings.custom_apps || [];
  const on = !!settings.blocker_enabled;
  const openAlarm = (form?: any) => { if (!pro) { notify(t('pro.needTrial')); go('pro'); return; } setModal(form || { type: 'alarm-form' }); };
  const Head = ({ icon, title, sub, gold }: { icon: string; title: string; sub?: string; gold?: boolean }) => <View style={s.row}><IconBox name={icon} size={40} icon={19} bg={gold ? colors.goldSoft : undefined} color={gold ? colors.goldText : undefined} /><View style={{ flex: 1 }}><T weight="700" size={15}>{title}</T>{sub && <T size={11} muted>{sub}</T>}</View></View>;
  return <Page title={t('focus.title')} subtitle={t('focus.subtitle')}>
    <ImageBackground source={IMG.instagram} style={s.hero} imageStyle={{ borderRadius: 28 }}>
      <LinearGradient colors={[colors.transparent, colors.overlay, colors.heroShade]} locations={[0, 0.45, 1]} style={s.shade} />
      <View style={s.heroBody}>
        <View style={s.badgeRow}><Badge text={on ? t('home.blockerOn') : t('home.blockerOff')} icon={on ? 'shield-checkmark' : 'shield-outline'} light gold={on} /><Badge text={t('focus.demo')} icon="sparkles-outline" light /></View>
        <View style={s.row}><View style={{ flex: 1 }}><T size={22} weight="800" color={colors.heroInk} style={{ letterSpacing: -0.6 }}>{t('focus.blocking')}</T><T size={11} color={colors.heroMuted}>{on ? t('focus.onSub', { n: settings.reminder_minutes }) : t('focus.offSub')}</T></View>
          <BlockerToggle value={on} onChange={(value) => updateSettings({ blocker_enabled: value })} /></View>
        <View style={s.statRow}>
          {[[String(settings.reminder_minutes), 'menit', 'hourglass-outline'], [String(settings.blocked_prayers.length), 'salat', 'time-outline'], [String(settings.blocked_apps.length), 'aplikasi', 'apps-outline']].map(([v, l, i]) => <View key={l} style={s.stat} testID={`blocker-stat-${l}`}><Icon name={i} size={13} color={colors.gold} /><T size={14} weight="800" color={colors.heroInk}>{v}</T><T size={10} color={colors.heroMuted}>{l}</T></View>)}
        </View>
      </View>
    </ImageBackground>
    <Card style={s.card}>
      <Head icon="hourglass-outline" gold title="Diingatkan sebelum azan" sub="Aplikasi dijeda sejak waktu ini sampai kamu mencatat salat." />
      <View style={s.segment}>{[5, 10, 15, 30].map(m => { const sel = settings.reminder_minutes === m; return <Tap key={m} testID={`reminder-minutes-${m}`} onPress={() => updateSettings({ reminder_minutes: m })} style={[s.segmentItem, sel && s.segmentOn]} accessibilityState={{ selected: sel }}>{sel && <LinearGradient colors={[colors.brandTertiary, colors.brandDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.segmentBg} />}<T size={18} weight="800" color={sel ? colors.onBrandPrimary : colors.onSurface}>{m}</T><T size={9} weight="600" color={sel ? colors.onBrandPrimary : colors.muted}>menit</T></Tap>; })}</View>
      <Head icon="time-outline" title="Waktu salat yang dijaga" sub={`${settings.blocked_prayers.length} dari 5 waktu`} />
      <View style={s.chipRow}>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => { const sel = settings.blocked_prayers.includes(name); return <Tap testID={`blocker-prayer-${name.toLowerCase()}`} key={name} onPress={() => togglePrayer(name)} style={[s.prayerChip, sel && s.prayerOn]} accessibilityState={{ selected: sel }}><View style={[s.skyWrap, !sel && s.skyOff]}><PrayerSky name={name} size={40} radius={13} /></View><T size={10} weight="700" color={sel ? colors.onSurface : colors.muted}>{prayer(name)}</T>{sel && <View style={s.check}><Icon name="checkmark" size={10} color={colors.onSuccess} /></View>}</Tap>; })}</View>
    </Card>
    <Card style={s.card}>
      <Head icon="apps-outline" title="Aplikasi yang diblokir" sub={settings.blocked_apps.length ? `${settings.blocked_apps.length} aplikasi dipilih` : 'Pilih aplikasi yang paling sering mengganggu'} />
      <View style={s.appGrid}>{APPS.map(app => { const sel = settings.blocked_apps.includes(app.name); return <Tap key={app.name} testID={`select-app-${app.name.toLowerCase()}`} onPress={() => toggleApp(app.name)} style={[s.appTile, sel && s.appOn]} accessibilityRole="checkbox" accessibilityState={{ checked: sel }}>
        <View style={[s.appIcon, { backgroundColor: (colors as any)[app.color] }, !sel && s.appIconOff]}><Icon name={app.icon} size={24} color={colors.white} /></View><T size={10} weight="700" color={sel ? colors.onSurface : colors.onSurfaceTertiary}>{app.name}</T>
        <View style={[s.appCheck, sel ? { backgroundColor: colors.success } : { backgroundColor: colors.glassStrong }]}><Icon name={sel ? 'lock-closed' : 'add'} size={10} color={sel ? colors.onSuccess : colors.onSurface} /></View>
      </Tap>; })}</View>
      <Head icon="phone-portrait-outline" title="Aplikasi di ponselmu" sub={customApps.length ? `${customApps.length} aplikasi ditambahkan sendiri` : 'Tambahkan aplikasi apa pun: sosmed, game, belanja, lainnya'} />
      <View style={s.appGrid}>{customApps.map(app => { const sel = settings.blocked_apps.includes(app.name); const cat = APP_CATEGORIES.find(c => c.key === app.category) || APP_CATEGORIES[4]; return <Tap key={app.name} testID={`custom-app-${app.name.toLowerCase().replaceAll(' ', '-')}`} onPress={() => toggleApp(app.name)} style={[s.appTile, sel && s.appOn]} accessibilityRole="checkbox" accessibilityState={{ checked: sel }}>
        <View style={[s.appIcon, { backgroundColor: colors.brandSecondary }]}><Icon name={cat.icon} size={22} color={colors.onBrandSecondary} /></View><T size={10} weight="700" numberOfLines={1}>{app.name}</T><T size={8} muted>{app.category}</T>
        <View style={[s.appCheck, sel ? { backgroundColor: colors.success } : { backgroundColor: colors.glassStrong }]}><Icon name={sel ? 'lock-closed' : 'add'} size={10} color={sel ? colors.onSuccess : colors.onSurface} /></View>
        <Tap testID={`custom-app-remove-${app.name.toLowerCase().replaceAll(' ', '-')}`} onPress={() => removeApp(app.name)} style={s.appRemove} accessibilityLabel={`Hapus ${app.name}`}><Icon name="close" size={10} color={colors.muted} /></Tap>
      </Tap>; })}
        <Tap testID="add-app-button" onPress={() => setModal({ type: 'add-app' })} style={[s.appTile, s.appAdd]}><View style={[s.appIcon, { backgroundColor: colors.brandPrimary }]}><Icon name="add" size={24} color={colors.onBrandPrimary} /></View><T size={10} weight="700" color={colors.onBrandSecondary}>Tambah</T></Tap></View>
      <Button testID="blocker-demo-button" title="Coba jeda salat sekarang" icon="play" onPress={() => setModal({ type: 'blocker', prayer: 'Magrib' })} />
      <T size={10} muted style={{ textAlign: 'center' }}>Pemblokiran sistem penuh hadir pada versi native. Di Expo, ini demonstrasi berlabel.</T>
    </Card>
    <Card style={[s.card, !pro && s.cardPro]}><View style={s.row}><View style={s.alarmArt}><AnimatedCat size={84} /></View><View style={{ flex: 1, gap: 4 }}><Badge text={pro ? `${t('common.pro')} · ${t('common.active').toUpperCase()}` : `${t('common.pro')} · ${t('pro.trialStart').toUpperCase()}`} gold icon={pro ? 'sparkles' : 'lock-closed'} /><T size={16} weight="700">Alarm bangun dzikir</T><T size={11} muted>{!pro ? t('alarm.proText') : activeAlarms ? `${activeAlarms} alarm aktif · berbunyi lewat notifikasi HP` : 'Atur tanggal & jam, alarm berbunyi di HP-mu.'}</T></View></View>
      {pro && <Tap testID="alarm-edit-button" style={s.alarmRow} onPress={() => openAlarm(nextAlarm ? { type: 'alarm-form', alarm: nextAlarm.alarm, title: 'Ubah alarm' } : undefined)}><View><T testID="alarm-time" size={40} weight="800" style={{ letterSpacing: -1.5 }}>{nextAlarm ? showTime(nextAlarm.alarm.time) : '--.--'}</T><T size={12} color={colors.onBrandSecondary}>{nextAlarm ? `${nextAlarm.alarm.label} · ${describeRepeat(nextAlarm.alarm)} · dalam ${untilText(nextAlarm.at, now)}` : 'Belum ada alarm berikutnya'}</T></View><View style={s.editPill}><Icon name={nextAlarm ? 'create-outline' : 'add'} size={16} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>{nextAlarm ? 'Ubah' : 'Tambah'}</T></View></Tap>}
      <View style={s.chipRow}>{pro ? <><Button testID="alarm-manage-button" title="Kelola alarm" icon="alarm-outline" style={{ flex: 1 }} onPress={() => go('alarms')} /><Button testID="alarm-demo-button" title="Coba alarm" variant="secondary" icon="play-outline" style={{ flex: 1 }} onPress={() => setModal({ type: 'alarm' })} /></>
        : <Button testID="alarm-manage-button" title={t('pro.trialStart')} icon="sparkles" variant="gold" style={{ flex: 1 }} onPress={() => go('pro')} />}</View>
    </Card>
    <Tap testID="focus-ambient-button" style={s.proCard} onPress={() => setModal({ type: 'ambient' })}><View style={[s.proArt, { backgroundColor: colors.brandSecondary, alignItems: 'center', justifyContent: 'center' }]}><Icon name="rainy-outline" size={28} color={colors.onBrandSecondary} /></View><View style={{ flex: 1, gap: 4 }}><Badge text="RAMAH ADHD" icon="sparkles-outline" /><T size={15} weight="700">Suasana tenang saat membaca</T><T size={11} muted>Atur volume hujan & kucing — juga tersedia di pembaca Al-Qur’an.</T></View><Icon name="chevron-forward" color={colors.muted} /></Tap>
    <Tap testID="focus-pro-button" style={s.proCard} onPress={() => go('pro')}><LinearGradient colors={[colors.goldSoft, colors.transparent]} style={s.shade} /><ImageBackground source={IMG.hajj} style={s.proArt} imageStyle={{ borderRadius: 20 }} /><View style={{ flex: 1, gap: 4 }}><Badge text={pro ? 'AZAM PRO · AKTIF' : 'AZAM PRO · GRATIS 3 HARI'} gold icon="sparkles" /><T size={15} weight="700">Panduan Haji & Umroh, alarm dzikir, suara premium</T><T size={11} muted>{pro ? 'Jelajahi semua fitur Pro.' : t('pro.trialNote')}</T></View><Icon name="arrow-forward" color={colors.goldText} /></Tap>
  </Page>;
}
const useStyles = makeStyles(c => ({
  hero: { minHeight: 240, borderRadius: 28, justifyContent: 'flex-end', overflow: 'hidden' }, togglePill: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, borderRadius: 24, backgroundColor: c.glassStrong, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }, toggleTrack: { width: 52, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' }, toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.white, shadowColor: c.black, shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 }, shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 }, heroBody: { padding: 18, gap: 12 },
  statRow: { flexDirection: 'row', gap: 8 }, badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  card: { gap: 16 }, cardPro: { borderColor: c.gold, backgroundColor: c.goldSoft }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, chipRow: { flexDirection: 'row', gap: 8 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 20, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, segmentItem: { flex: 1, minHeight: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, segmentOn: { shadowColor: c.shadow, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }, segmentBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  prayerChip: { flex: 1, minHeight: 84, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, prayerOn: { backgroundColor: c.surface, borderColor: c.brandTertiary }, skyWrap: { width: 40, height: 40 }, skyOff: { opacity: 0.45 }, check: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: c.success, alignItems: 'center', justifyContent: 'center' },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, appTile: { width: '22.5%', minHeight: 96, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, appOn: { borderColor: c.brandTertiary, backgroundColor: c.brandSecondary }, appIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, appIconOff: { opacity: 0.6 }, appCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, appRemove: { position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: c.glassStrong, alignItems: 'center', justifyContent: 'center' }, appAdd: { borderStyle: 'dashed', borderColor: c.brandTertiary },
  alarmArt: { width: 72, height: 72, borderRadius: 22, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, alarmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, editPill: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, paddingHorizontal: 14, backgroundColor: c.brandSecondary, borderRadius: 14 },
  proCard: { padding: 16, borderRadius: 24, borderWidth: 1, borderColor: c.goldSoft, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' }, proArt: { width: 64, height: 64, borderRadius: 20 },
}));
