import React from 'react';
import { Switch, View } from 'react-native';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Card, Icon, Page, Section, T, Tap } from '@/src/components/ui';
import { LevelArt } from '@/src/components/illustrations';

function SettingRow({ icon, title, value, onPress, testID, children }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <Tap testID={testID} onPress={onPress} style={s.settingRow}><View style={s.rowIcon}><Icon name={icon} color={colors.onBrandSecondary} size={20} /></View><View style={{ flex: 1 }}><T size={13} weight="600">{title}</T>{value && <T size={10} muted>{value}</T>}</View>{children || <Icon name="chevron-forward" color={colors.muted} size={17} />}</Tap>;
}
export function Settings() {
  const { user, settings, updateSettings, setModal, go } = useApp(); const s = useStyles(); const { colors } = useTheme();
  return <Page title="Pengaturan" back="home" subtitle="Azam, sesuai kenyamananmu.">
    <Card style={s.profile}><View style={s.avatar}><T weight="800" size={22} color={colors.onBrandSecondary}>{user.name[0]}</T></View><View style={{ flex: 1 }}><T size={18} weight="800">{user.name}</T><T size={11} muted>{user.guest ? 'Menjelajah tanpa akun' : user.email}</T></View><Badge text={settings.pro_preview ? 'PRO PREVIEW' : 'SAHABAT'} /></Card>
    {user.guest && <T size={11} muted>Progres tamu tersimpan untuk sesi ini. Jika keluar, data tamu tidak dapat dipulihkan melalui akun Google.</T>}
    <Tap testID="settings-pro-button" style={s.proBanner} onPress={() => go('pro')}><View style={{ flex: 1, gap: 9 }}><Badge text="AZAM PRO" gold icon="sparkles" /><T size={22} weight="800">Lebih personal.{"\n"}Lebih menenangkan.</T><T size={11} color={colors.onBrandSecondary}>Jelajahi pratinjau Pro  →</T></View><LevelArt kind="moon" size={90} /></Tap>
    <View style={s.group}><Section title="Preferensi ibadah" /><Card style={s.groupCard}>
      <SettingRow testID="settings-location-button" icon="location-outline" title="Lokasi & jadwal salat" value={`${settings.city} · Kemenag RI`} onPress={() => setModal({ type: 'location' })} />
      <SettingRow testID="settings-notifications-button" icon="notifications-outline" title="Notifikasi salat" value={settings.notifications ? 'Izin diaktifkan' : 'Ketuk untuk mengatur izin'} onPress={() => setModal({ type: 'notifications' })} />
      <SettingRow testID="settings-alarm-button" icon="alarm-outline" title="Alarm syukur" value={`${settings.alarm_time} · Demonstrasi`} onPress={() => setModal({ type: 'alarm-settings' })} />
    </Card></View>
    <View style={s.group}><Section title="Tampilan & kenyamanan" /><Card style={s.groupCard}>
      <View style={s.settingRow}><View style={s.rowIcon}><Icon name="moon-outline" color={colors.onBrandSecondary} size={20} /></View><View style={{ flex: 1 }}><T size={13} weight="600">Tema gelap</T><T size={10} muted>Pratinjau Pro · tanpa pembayaran</T></View><Switch testID="settings-dark-theme-switch" value={settings.dark} onValueChange={(v) => updateSettings({ dark: v, pro_preview: v || settings.pro_preview })} trackColor={{ false: colors.border, true: colors.brandPrimary }} thumbColor={colors.onBrandPrimary} /></View>
      <SettingRow testID="settings-widget-button" icon="grid-outline" title="Widget & ikon" value="Pratinjau desain Pro" onPress={() => setModal({ type: 'widget-preview' })} />
      <SettingRow testID="settings-ambient-button" icon="rainy-outline" title="Suasana membaca" value="Hujan lembut tersedia di pembaca" onPress={() => go('quran')} />
      <SettingRow testID="settings-ads-button" icon="megaphone-outline" title="Tentang iklan" value="Belum ada iklan pada versi ini" onPress={() => setModal({ type: 'info', title: 'Ruang iklan', message: 'Versi ini belum menampilkan iklan dan belum terhubung ke jaringan iklan. Opsi bebas iklan direncanakan untuk Azam Pro.' })} />
    </Card></View>
    <View style={s.group}><Section title="Tentang Azam" /><Card style={s.groupCard}>
      <SettingRow testID="settings-guide-button" icon="help-circle-outline" title="Panduan penggunaan" onPress={() => updateSettings({ onboarded: false })} />
      <SettingRow testID="settings-privacy-button" icon="shield-checkmark-outline" title="Privasi & sumber data" onPress={() => setModal({ type: 'info', title: 'Privasi & sumber data', message: 'Azam menyimpan pengaturan dan catatan salat pada server untuk sesi Anda. Koordinat dikirim ke AlAdhan untuk perhitungan jadwal; lokasi tidak dilacak di latar belakang. Al-Qur’an dan terjemahan Indonesia berasal dari EQuran.id. Login Google dikelola Emergent. Tidak ada rekaman suara yang dikirim pada versi ini.' })} />
      <SettingRow testID="settings-version-button" icon="information-circle-outline" title="Azam – App Blocker" value="Versi 1.0 · Dengan niat baik" onPress={() => setModal({ type: 'info', title: 'Tentang versi ini', message: 'Fitur aktif: jadwal salat, Al-Qur’an, arah kiblat, catatan salat, kalender, pencapaian, dan tema gelap. Pemblokir aplikasi, alarm latar belakang, widget sistem, dan penghitung rakaat otomatis masih memerlukan integrasi native. Semua demonstrasi diberi label.' })} />
    </Card></View>
    <Button testID="settings-logout-button" title="Keluar dari sesi" variant="secondary" icon="log-out-outline" onPress={() => setModal({ type: 'logout' })} />
    <T style={{ textAlign: 'center' }} size={10} muted>Dibuat untuk jeda yang lebih bermakna.</T>
  </Page>;
}

export function Pro() {
  const { settings, updateSettings, setModal, go } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const features = [
    ['moon-outline', 'Tenang dalam gelap', 'Tema malam biru pekat yang nyaman di mata.', 'Tersedia untuk dicoba', () => updateSettings({ dark: !settings.dark, pro_preview: true })],
    ['grid-outline', 'Ayat di layar kunci', 'Widget harian dan pilihan ikon personal.', 'Pratinjau desain', () => setModal({ type: 'widget-preview' })],
    ['shield-checkmark-outline', 'Jeda dengan pengingat ayat', 'Tampilan jeda salat yang lebih bermakna.', 'Demonstrasi', () => setModal({ type: 'blocker', pro: true })],
    ['rainy-outline', 'Suasana yang menenangkan', 'Hujan lembut tersedia; gemuruh dan dengkur kucing direncanakan.', 'Hujan dapat dicoba', () => go('quran')],
    ['radio-outline', 'Penghitung rakaat', 'Penghitungan sujud otomatis memerlukan sensor native.', 'Belum tersedia', () => setModal({ type: 'rakaat-preview' })],
    ['leaf-outline', 'Ruang tanpa iklan', 'Lebih sedikit distraksi saat merawat iman.', 'Belum ada iklan', () => setModal({ type: 'info', title: 'Ruang tanpa iklan', message: 'Versi saat ini belum memasang iklan. Penghilangan iklan dan pembelian Pro belum diaktifkan.' })],
  ];
  return <Page title="Azam Pro" back="settings" subtitle="Ruang yang lebih personal untuk iman.">
    <View style={s.proHero}><Badge text="PRATINJAU · TANPA PEMBAYARAN" gold icon="sparkles" /><LevelArt kind="sunny" size={125} /><T size={29} weight="800" style={{ textAlign: 'center', letterSpacing: -1 }}>Sedikit jeda.{"\n"}Lebih banyak makna.</T><T muted size={12} style={{ textAlign: 'center' }}>Kenali pengalaman Pro. Tidak ada tagihan,{"\n"}langganan, atau pembelian pada versi ini.</T></View>
    <Button testID="pro-theme-preview-button" title={settings.dark ? 'Kembali ke tema terang' : 'Coba suasana tema gelap'} icon={settings.dark ? 'sunny-outline' : 'moon-outline'} onPress={() => updateSettings({ dark: !settings.dark, pro_preview: true })} />
    {features.map(([icon, title, description, badge, action], i) => <Tap testID={`pro-feature-${i}`} key={String(title)} style={s.feature} onPress={action as () => void}><View style={s.rowIcon}><Icon name={icon} size={22} color={colors.onBrandSecondary} /></View><View style={{ flex: 1, gap: 5 }}><T size={16} weight="700">{title as string}</T><T size={12} muted>{description as string}</T><T size={10} weight="600" color={colors.onBrandSecondary}>{badge as string}</T></View><Icon name="chevron-forward" color={colors.muted} size={15} /></Tap>)}
    <T muted size={11} style={{ textAlign: 'center' }}>Al-Qur’an lengkap dan terjemahan tetap gratis.{"\n"}Ibadah utama selalu untuk semua.</T>
  </Page>;
}
const useStyles = makeStyles(c => ({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 18 }, avatar: { width: 47, height: 47, borderRadius: 17, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center' }, proBanner: { backgroundColor: c.brandSecondary, borderRadius: 25, padding: 23, flexDirection: 'row', alignItems: 'center', gap: 9 },
  group: { gap: 10 }, groupCard: { paddingVertical: 3, paddingHorizontal: 16 }, settingRow: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 77, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.divider }, rowIcon: { width: 39, height: 43, backgroundColor: c.brandSecondary, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, proHero: { alignItems: 'center', gap: 18 }, feature: { backgroundColor: c.surface, borderRadius: 21, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: c.border },
}));