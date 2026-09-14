import React from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Card, Icon, Page, Section, T, Tap } from '@/src/components/ui';

export function Focus() {
  const { settings, updateSettings, setModal, go } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const togglePrayer = (name: string) => updateSettings({ blocked_prayers: settings.blocked_prayers.includes(name) ? settings.blocked_prayers.filter((p: string) => p !== name) : [...settings.blocked_prayers, name] });
  return <Page title="Ruang fokus" subtitle="Jeda dari layar. Hadir dalam salat.">
    <View style={s.hero}><View style={s.shieldCircle}><Icon name="shield-checkmark-outline" size={47} color={colors.onBrandSecondary} /></View><Badge text="DEMONSTRASI" /><T size={23} weight="800" style={s.center}>Dunia bisa menunggu.</T><T muted size={12} style={s.center}>Luangkan waktu untuk yang paling berarti.{"\n"}Mulai dengan satu jeda yang baik.</T></View>
    <Card style={s.card}><View style={s.row}><View style={s.iconBox}><Icon name="lock-closed-outline" color={colors.onBrandSecondary} /></View><View style={{ flex: 1 }}><T weight="700" size={15}>Jeda aplikasi</T><T size={10} muted>{settings.blocker_enabled ? 'Preferensi demonstrasi aktif' : 'Atur waktu bebas distraksi'}</T></View><Switch testID="blocker-enabled-switch" value={settings.blocker_enabled} onValueChange={(value) => updateSettings({ blocker_enabled: value })} trackColor={{ false: colors.border, true: colors.brandPrimary }} thumbColor={colors.onBrandPrimary} /></View>
      <T size={12} muted>Demonstrasi muncul pada waktu pilihan selama Azam terbuka dan aplikasi contoh dipilih. Aplikasi lain belum benar-benar diblokir.</T>
      <Section title="Waktu jeda" />
      <View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipContent}>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => <Tap testID={`blocker-prayer-${name.toLowerCase()}`} key={name} onPress={() => togglePrayer(name)} style={[s.chip, settings.blocked_prayers.includes(name) && s.chipSelected]}><T weight="600" size={11} color={settings.blocked_prayers.includes(name) ? colors.onBrandSecondary : colors.onSurfaceTertiary}>{name}</T></Tap>)}</ScrollView></View>
      <Tap testID="blocker-select-apps-button" style={s.selectRow} onPress={() => setModal({ type: 'apps' })}><Icon name="apps-outline" color={colors.onBrandSecondary} /><View style={{ flex: 1 }}><T weight="700" size={13}>Aplikasi pilihan</T><T size={11} muted>{settings.blocked_apps.length ? `${settings.blocked_apps.length} aplikasi contoh dipilih` : 'Pilih aplikasi untuk demonstrasi'}</T></View><Icon name="chevron-forward" size={18} color={colors.muted} /></Tap>
      <Button testID="blocker-demo-button" title="Coba jeda salat" icon="play-outline" onPress={() => setModal({ type: 'blocker' })} />
    </Card>
    <Card style={s.card}><View style={s.row}><View style={s.iconBox}><Icon name="alarm-outline" color={colors.onBrandSecondary} /></View><View style={{ flex: 1 }}><T size={16} weight="700">Bangun dengan syukur</T><T size={10} muted>Alarm tekan lama · demonstrasi</T></View></View>
      <Tap testID="alarm-edit-button" style={s.alarmRow} onPress={() => setModal({ type: 'alarm-settings' })}><View><T testID="alarm-time" size={39} weight="800" style={{ letterSpacing: -1.5 }}>{settings.alarm_time.replace(':', '.')}</T><T size={12} muted>{settings.alarm_phrase}</T></View><View style={s.editPill}><Icon name="create-outline" size={18} color={colors.onBrandSecondary} /><T size={11} color={colors.onBrandSecondary}>Ubah</T></View></Tap>
      <T size={12} muted>Tahan tombol selama 3 detik untuk menutup. Pengenalan ucapan dan alarm latar belakang belum aktif.</T>
      <Button testID="alarm-demo-button" title="Coba alarm" variant="secondary" icon="volume-medium-outline" onPress={() => setModal({ type: 'alarm' })} />
    </Card>
    <Tap testID="focus-pro-button" style={s.proCard} onPress={() => go('pro')}><View style={{ flex: 1, gap: 6 }}><Badge text="AZAM PRO · PRATINJAU" gold icon="sparkles" /><T size={15} weight="700">Jeda dengan sentuhan ayat</T><T size={11} muted>Kenali pengalaman ibadah yang lebih personal.</T></View><Icon name="arrow-forward" color={colors.goldInk} /></Tap>
  </Page>;
}
const useStyles = makeStyles(c => ({
  hero: { alignItems: 'center', gap: 12, paddingVertical: 10 }, shieldCircle: { height: 92, width: 92, borderRadius: 32, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 3, transform: [{ rotate: '-5deg' }] }, center: { textAlign: 'center' },
  card: { gap: 18 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, iconBox: { height: 44, width: 44, borderRadius: 15, backgroundColor: c.brandSecondary, justifyContent: 'center', alignItems: 'center' },
  chipRow: { height: 56, flexShrink: 0, marginTop: -16, marginBottom: -8 }, chipContent: { gap: 7, alignItems: 'center', paddingHorizontal: 0 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 13, borderRadius: 11, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceTertiary, justifyContent: 'center' }, chipSelected: { borderColor: c.brandTertiary, backgroundColor: c.brandSecondary },
  selectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: c.divider, paddingTop: 18, minHeight: 65 }, alarmRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, editPill: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, paddingHorizontal: 14, backgroundColor: c.brandSecondary, borderRadius: 14 }, proCard: { padding: 20, borderRadius: 22, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 14 },
}));