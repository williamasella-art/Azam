import React from 'react';
import { ImageBackground, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Button, Card, Icon, Page, T, Tap } from '@/src/components/ui';
import { AnimatedCat } from '@/src/components/AnimatedCat';
import { PRAYER_ICONS } from '@/src/components/SocialDemo';
import { APP_CATEGORIES } from '@/src/components/FormSheets';

export const APPS: { name: string; icon: string; color: string }[] = [
  { name: 'Instagram', icon: 'logo-instagram', color: 'instagram' }, { name: 'TikTok', icon: 'logo-tiktok', color: 'tiktok' }, { name: 'YouTube', icon: 'logo-youtube', color: 'youtube' },
  { name: 'X', icon: 'logo-twitter', color: 'x' }, { name: 'Facebook', icon: 'logo-facebook', color: 'facebook' }, { name: 'Chrome', icon: 'logo-chrome', color: 'chrome' }, { name: 'Game', icon: 'game-controller', color: 'game' },
];
export function Focus() {
  const { settings, updateSettings, setModal, go } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const togglePrayer = (name: string) => updateSettings({ blocked_prayers: settings.blocked_prayers.includes(name) ? settings.blocked_prayers.filter((p: string) => p !== name) : [...settings.blocked_prayers, name] });
  const toggleApp = (name: string) => updateSettings({ blocked_apps: settings.blocked_apps.includes(name) ? settings.blocked_apps.filter((p: string) => p !== name) : [...settings.blocked_apps, name] });
  const removeApp = (name: string) => updateSettings({ custom_apps: (settings.custom_apps || []).filter((a: any) => a.name !== name), blocked_apps: settings.blocked_apps.filter((p: string) => p !== name) });
  const customApps: any[] = settings.custom_apps || [];
  return <Page title="App Blocker" subtitle="Dunia bisa menunggu. Salat dulu.">
    <ImageBackground source={IMG.instagram} style={s.hero} imageStyle={{ borderRadius: 28 }}>
      <LinearGradient colors={[colors.transparent, colors.overlay, colors.heroShade]} locations={[0, 0.5, 1]} style={s.shade} />
      <View style={s.heroBody}><Badge text="DEMONSTRASI DALAM APLIKASI" icon="sparkles-outline" light />
        <View style={s.row}><View style={{ flex: 1 }}><T size={20} weight="800" color={colors.heroInk}>Pemblokiran aplikasi</T><T size={11} color={colors.heroMuted}>{settings.blocker_enabled ? `Aktif · ${settings.reminder_minutes} menit sebelum azan` : 'Nonaktif · ketuk untuk mengaktifkan'}</T></View>
          <Switch testID="blocker-enabled-switch" value={settings.blocker_enabled} onValueChange={(value) => updateSettings({ blocker_enabled: value })} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>
      </View>
    </ImageBackground>
    <Card style={s.card}>
      <View style={s.row}><Icon name="hourglass-outline" size={20} color={colors.gold} /><View style={{ flex: 1 }}><T weight="700" size={15}>Diingatkan sebelum azan</T><T size={11} muted>Aplikasi dijeda sejak waktu ini sampai kamu mencatat salat.</T></View></View>
      <View style={s.chipRow}>{[5, 10, 15, 30].map(m => { const on = settings.reminder_minutes === m; return <Tap key={m} testID={`reminder-minutes-${m}`} onPress={() => updateSettings({ reminder_minutes: m })} style={[s.minute, on && s.minuteOn]}><T size={20} weight="800" color={on ? colors.onBrandPrimary : colors.onSurface}>{m}</T><T size={10} color={on ? colors.onBrandPrimary : colors.muted}>menit</T></Tap>; })}</View>
      <View style={s.row}><Icon name="time-outline" size={20} color={colors.brandTertiary} /><View style={{ flex: 1 }}><T weight="700" size={15}>Waktu salat yang dijaga</T></View></View>
      <View style={s.chipRow}>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => { const on = settings.blocked_prayers.includes(name); return <Tap testID={`blocker-prayer-${name.toLowerCase()}`} key={name} onPress={() => togglePrayer(name)} style={[s.prayerChip, on && s.prayerOn]} accessibilityState={{ selected: on }}><Icon name={PRAYER_ICONS[name]} size={18} color={on ? colors.onBrandPrimary : colors.muted} /><T size={10} weight="700" color={on ? colors.onBrandPrimary : colors.muted}>{name}</T>{on && <View style={s.check}><Icon name="checkmark" size={10} color={colors.onSuccess} /></View>}</Tap>; })}</View>
    </Card>
    <Card style={s.card}>
      <View style={s.row}><Icon name="apps-outline" size={20} color={colors.brandTertiary} /><View style={{ flex: 1 }}><T weight="700" size={15}>Aplikasi yang diblokir</T><T size={11} muted>{settings.blocked_apps.length ? `${settings.blocked_apps.length} aplikasi dipilih` : 'Pilih aplikasi yang paling sering mengganggu'}</T></View></View>
      <View style={s.appGrid}>{APPS.map(app => { const on = settings.blocked_apps.includes(app.name); return <Tap key={app.name} testID={`select-app-${app.name.toLowerCase()}`} onPress={() => toggleApp(app.name)} style={[s.appTile, on && s.appOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
        <View style={[s.appIcon, { backgroundColor: (colors as any)[app.color] }]}><Icon name={app.icon} size={24} color={colors.white} /></View><T size={10} weight="600">{app.name}</T>
        <View style={[s.appCheck, on ? { backgroundColor: colors.success } : { backgroundColor: colors.glassStrong }]}><Icon name={on ? 'lock-closed' : 'add'} size={10} color={on ? colors.onSuccess : colors.onSurface} /></View>
      </Tap>; })}</View>
      <View style={s.row}><Icon name="phone-portrait-outline" size={20} color={colors.brandTertiary} /><View style={{ flex: 1 }}><T weight="700" size={15}>Aplikasi di ponselmu</T><T size={11} muted>{customApps.length ? `${customApps.length} aplikasi ditambahkan sendiri` : 'Tambahkan aplikasi apa pun: sosmed, game, belanja, lainnya'}</T></View></View>
      <View style={s.appGrid}>{customApps.map(app => { const on = settings.blocked_apps.includes(app.name); const cat = APP_CATEGORIES.find(c => c.key === app.category) || APP_CATEGORIES[4]; return <Tap key={app.name} testID={`custom-app-${app.name.toLowerCase().replaceAll(' ', '-')}`} onPress={() => toggleApp(app.name)} style={[s.appTile, on && s.appOn]} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
        <View style={[s.appIcon, { backgroundColor: colors.brandSecondary }]}><Icon name={cat.icon} size={22} color={colors.onBrandSecondary} /></View><T size={10} weight="600" numberOfLines={1}>{app.name}</T><T size={8} muted>{app.category}</T>
        <View style={[s.appCheck, on ? { backgroundColor: colors.success } : { backgroundColor: colors.glassStrong }]}><Icon name={on ? 'lock-closed' : 'add'} size={10} color={on ? colors.onSuccess : colors.onSurface} /></View>
        <Tap testID={`custom-app-remove-${app.name.toLowerCase().replaceAll(' ', '-')}`} onPress={() => removeApp(app.name)} style={s.appRemove} accessibilityLabel={`Hapus ${app.name}`}><Icon name="close" size={10} color={colors.muted} /></Tap>
      </Tap>; })}
        <Tap testID="add-app-button" onPress={() => setModal({ type: 'add-app' })} style={[s.appTile, s.appAdd]}><View style={[s.appIcon, { backgroundColor: colors.brandPrimary }]}><Icon name="add" size={24} color={colors.onBrandPrimary} /></View><T size={10} weight="700" color={colors.onBrandSecondary}>Tambah</T></Tap></View>
      <Button testID="blocker-demo-button" title="Coba jeda salat sekarang" icon="play" onPress={() => setModal({ type: 'blocker', prayer: 'Magrib' })} />
      <T size={10} muted style={{ textAlign: 'center' }}>Pemblokiran sistem penuh hadir pada versi native. Di Expo, ini demonstrasi berlabel.</T>
    </Card>
    <Card style={s.card}><View style={s.row}><View style={s.alarmArt}><AnimatedCat size={84} /></View><View style={{ flex: 1 }}><T size={16} weight="700">Alarm bangun dzikir</T><T size={11} muted>Ucapkan dzikir, tahan tombol untuk mematikan.</T></View></View>
      <Tap testID="alarm-edit-button" style={s.alarmRow} onPress={() => setModal({ type: 'alarm-settings' })}><View><T testID="alarm-time" size={40} weight="800" style={{ letterSpacing: -1.5 }}>{settings.alarm_time.replace(':', '.')}</T><T size={12} color={colors.onBrandSecondary}>“{settings.alarm_phrase}”</T></View><View style={s.editPill}><Icon name="create-outline" size={16} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>Ubah</T></View></Tap>
      <Button testID="alarm-demo-button" title="Coba alarm" variant="secondary" icon="alarm-outline" onPress={() => setModal({ type: 'alarm' })} />
    </Card>
    <Tap testID="focus-ambient-button" style={s.proCard} onPress={() => setModal({ type: 'ambient' })}><View style={[s.proArt, { backgroundColor: colors.brandSecondary, alignItems: 'center', justifyContent: 'center' }]}><Icon name="rainy-outline" size={28} color={colors.onBrandSecondary} /></View><View style={{ flex: 1, gap: 4 }}><Badge text="RAMAH ADHD" icon="sparkles-outline" /><T size={15} weight="700">Suasana tenang saat membaca</T><T size={11} muted>Atur volume hujan & kucing — juga tersedia di pembaca Al-Qur’an.</T></View><Icon name="chevron-forward" color={colors.muted} /></Tap>
    <Tap testID="focus-pro-button" style={s.proCard} onPress={() => go('pro')}><LinearGradient colors={[colors.goldSoft, colors.transparent]} style={s.shade} /><ImageBackground source={IMG.hajj} style={s.proArt} imageStyle={{ borderRadius: 20 }} /><View style={{ flex: 1, gap: 4 }}><Badge text="AZAM PRO · PRATINJAU" gold icon="sparkles" /><T size={15} weight="700">Panduan Haji & Umroh, suara premium</T><T size={11} muted>Jelajahi fitur lanjutan tanpa pembayaran.</T></View><Icon name="arrow-forward" color={colors.goldText} /></Tap>
  </Page>;
}
const useStyles = makeStyles(c => ({
  hero: { height: 210, borderRadius: 28, justifyContent: 'flex-end' }, shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 }, heroBody: { padding: 18, gap: 10 },
  card: { gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, chipRow: { flexDirection: 'row', gap: 8 },
  minute: { flex: 1, minHeight: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, minuteOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  prayerChip: { flex: 1, minHeight: 66, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, prayerOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, check: { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: c.success, alignItems: 'center', justifyContent: 'center' },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, appTile: { width: '22.5%', minHeight: 92, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, appOn: { borderColor: c.brandTertiary, backgroundColor: c.brandSecondary }, appIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, appCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, appRemove: { position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: c.glassStrong, alignItems: 'center', justifyContent: 'center' }, appAdd: { borderStyle: 'dashed', borderColor: c.brandTertiary },
  alarmArt: { width: 72, height: 72, borderRadius: 22, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, alarmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, editPill: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, paddingHorizontal: 14, backgroundColor: c.brandSecondary, borderRadius: 14 },
  proCard: { padding: 16, borderRadius: 24, borderWidth: 1, borderColor: c.goldSoft, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' }, proArt: { width: 64, height: 64, borderRadius: 20 },
}));
