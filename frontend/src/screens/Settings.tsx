import React, { useEffect, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ImageBackground, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { PRO_AMBIENTS } from '@/src/ambient';
import { Badge, Button, Card, Icon, IconBox, Page, Section, T, Tap } from '@/src/components/ui';

function SettingRow({ icon, title, value, onPress, testID, children, gold }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <Tap testID={testID} onPress={onPress} style={s.settingRow}><IconBox name={icon} size={40} icon={19} bg={gold ? colors.goldSoft : undefined} color={gold ? colors.goldText : undefined} /><View style={{ flex: 1 }}><T size={13} weight="600">{title}</T>{value && <T size={10} muted>{value}</T>}</View>{children || <Icon name="chevron-forward" color={colors.muted} size={17} />}</Tap>;
}
export function Settings() {
  const { user, settings, updateSettings, setModal, go, setShowIntro, lastTab, alarms } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const gender = settings.gender === 'wanita' ? 'Perempuan' : settings.gender === 'pria' ? 'Laki-laki' : 'Belum diatur';
  return <Page title="Pengaturan" back={lastTab} subtitle="Azam, sesuai kenyamananmu.">
    <Card style={s.profile}><View style={s.avatar}><T weight="800" size={22} color={colors.onBrandPrimary}>{user.name[0]}</T></View><View style={{ flex: 1 }}><T size={18} weight="800">{user.name}</T><T size={11} muted>{user.guest ? 'Menjelajah tanpa akun' : user.email}</T></View><Badge text={settings.pro_preview ? 'PRO PREVIEW' : 'SAHABAT'} gold={settings.pro_preview} /></Card>
    <Tap testID="settings-pro-button" style={s.proBanner} onPress={() => go('pro')}><ImageBackground source={IMG.hajj} style={s.proBg} imageStyle={{ borderRadius: 26 }}><LinearGradient colors={[colors.heroShade, colors.transparent]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.proShade} /><View style={{ flex: 1, gap: 8, padding: 20, maxWidth: '68%' }}><Badge text="AZAM PRO" gold icon="sparkles" light /><T size={20} weight="800" color={colors.heroInk}>Haji & Umroh,{"\n"}suara premium, tema.</T><T size={11} color={colors.goldText}>Jelajahi pratinjau Pro →</T></View></ImageBackground></Tap>
    <View style={s.group}><Section title="Preferensi ibadah" /><Card style={s.groupCard}>
      <SettingRow testID="settings-location-button" icon="location-outline" title="Lokasi & jadwal salat" value={`${settings.city} · Kemenag RI`} onPress={() => setModal({ type: 'location' })} />
      <SettingRow testID="settings-notifications-button" icon="notifications-outline" title="Notifikasi salat" value={settings.notifications ? 'Izin diaktifkan' : 'Ketuk untuk mengatur izin'} onPress={() => setModal({ type: 'notifications' })} />
      <View style={s.settingRow}><IconBox name="volume-high-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">Suara azan</T><T size={10} muted>{settings.adhan_sound ? 'Azan berkumandang saat waktu salat tiba' : 'Hanya pengingat tanpa suara azan'}</T></View><Switch testID="settings-adhan-switch" value={!!settings.adhan_sound} onValueChange={(v) => updateSettings({ adhan_sound: v })} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>
      <SettingRow testID="settings-reminder-button" icon="hourglass-outline" title="Blokir sebelum azan" value={`${settings.reminder_minutes} menit · atur di App Blocker`} onPress={() => go('focus')} />
      <SettingRow testID="settings-alarm-button" icon="alarm-outline" title="Alarm dzikir" value={`${(alarms.data || []).filter((a: any) => a.enabled).length} alarm aktif · tanggal, jam & pengulangan`} onPress={() => go('alarms')} />
      <View style={s.settingRow}><IconBox name="people-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">Jenis kelamin</T><T size={10} muted>{gender}</T></View><View style={{ flexDirection: 'row', gap: 6 }}>{[['pria', 'man'], ['wanita', 'woman']].map(([key, icon]) => <Tap key={key} testID={`settings-gender-${key}`} onPress={() => updateSettings({ gender: key })} style={[s.genderBtn, settings.gender === key && s.genderOn]}><Icon name={icon} size={18} color={settings.gender === key ? colors.onBrandPrimary : colors.muted} /></Tap>)}</View></View>
    </Card></View>
    <View style={s.group}><Section title="Tampilan & kenyamanan" /><Card style={s.groupCard}>
      <View style={s.settingRow}><IconBox name="moon-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">Mode malam</T><T size={10} muted>Biru lebih pekat · pratinjau Pro</T></View><Switch testID="settings-dark-theme-switch" value={settings.dark} onValueChange={(v) => updateSettings({ dark: v, pro_preview: v || settings.pro_preview })} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>
      <SettingRow testID="settings-ambient-button" icon="rainy-outline" title="Suasana tenang" value={`Hujan ${Math.round(settings.rain_volume * 100)}% · Kucing ${Math.round(settings.cat_volume * 100)}% · ramah ADHD`} onPress={() => setModal({ type: 'ambient' })} />
      <SettingRow testID="settings-widget-button" icon="grid-outline" title="Widget & ikon" value="Pratinjau desain Pro" onPress={() => setModal({ type: 'widget-preview' })} />
      <SettingRow testID="settings-ads-button" icon="megaphone-outline" title="Tentang iklan" value="Belum ada iklan pada versi ini" onPress={() => setModal({ type: 'info', title: 'Ruang iklan', message: 'Versi ini belum menampilkan iklan dan belum terhubung ke jaringan iklan. Opsi bebas iklan direncanakan untuk Azam Pro.' })} />
    </Card></View>
    <View style={s.group}><Section title="Tentang Azam" /><Card style={s.groupCard}>
      <SettingRow testID="settings-guide-button" icon="play-circle-outline" title="Lihat lagi cara penggunaan" onPress={() => setShowIntro(true)} />
      <SettingRow testID="settings-privacy-button" icon="shield-checkmark-outline" title="Privasi & sumber data" onPress={() => setModal({ type: 'info', title: 'Privasi & sumber data', message: 'Azam menyimpan pengaturan dan catatan salat pada server untuk sesi Anda. Koordinat dikirim ke AlAdhan untuk perhitungan jadwal; lokasi tidak dilacak di latar belakang. Al-Qur’an dan terjemahan Indonesia berasal dari EQuran.id. Login Google dikelola Emergent. Tidak ada rekaman suara yang dikirim pada versi ini.\n\nSuara azan: “Adhan wiki” dari Wikimedia Commons, lisensi CC BY-SA 3.0. Kalender Hijriah: perhitungan Umm al-Qura.' })} />
      <SettingRow testID="settings-version-button" icon="information-circle-outline" title="Azam – App Blocker" value="Versi 2.0 · Dengan niat baik" onPress={() => setModal({ type: 'info', title: 'Tentang versi ini', message: 'Fitur aktif: jadwal salat dengan suara azan, Al-Qur’an, arah kiblat, catatan salat, kalender & hari besar Islam, pencapaian, panduan Haji & Umrah bertahap, alarm dzikir dengan tanggal & jam (berbunyi lewat notifikasi HP), suasana tenang, dan mode malam. Pemblokir aplikasi, widget sistem, dan penghitung rakaat otomatis masih memerlukan integrasi native. Semua demonstrasi diberi label.' })} />
    </Card></View>
    <Button testID="settings-logout-button" title="Keluar dari sesi" variant="secondary" icon="log-out-outline" onPress={() => setModal({ type: 'logout' })} />
    <T style={{ textAlign: 'center' }} size={10} muted>Dibuat untuk jeda yang lebih bermakna.</T>
  </Page>;
}

export function Pro() {
  const { settings, updateSettings, setModal, go, notify, lastTab } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const shimmer = useSharedValue(0);
  useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true); }, [shimmer]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.35 + shimmer.value * 0.45, transform: [{ translateX: -120 + shimmer.value * 240 }] }));
  const features = [
    { icon: 'navigate-circle', title: 'Haji & Umrah', text: 'Panduan bertahap: persiapan, umrah, haji, doa.', badge: 'Buka panduan', action: () => go('hajj'), available: true, image: IMG.hajj },
    { icon: 'musical-notes', title: 'Suara premium', text: `${PRO_AMBIENTS.map(a => a.label).join(' · ')}`, badge: 'Segera hadir', action: () => setModal({ type: 'ambient' }), available: false, image: IMG.rain },
    { icon: 'moon', title: 'Mode malam', text: 'Biru pekat, nyaman saat qiyamul lail.', badge: settings.dark ? 'Aktif ✓' : 'Coba sekarang', action: () => updateSettings({ dark: !settings.dark, pro_preview: true }), available: true },
    { icon: 'shield-checkmark', title: 'Jeda dengan ayat', text: 'Layar jeda salat menampilkan ayat harian.', badge: 'Demonstrasi', action: () => setModal({ type: 'blocker', pro: true, prayer: 'Magrib' }), available: true },
    { icon: 'grid', title: 'Widget layar kunci', text: 'Ayat harian & hitung mundur azan.', badge: 'Lihat desain', action: () => setModal({ type: 'widget-preview' }), available: true },
    { icon: 'radio', title: 'Penghitung rakaat', text: 'Riset sensor · belum tersedia.', badge: 'Konsep', action: () => setModal({ type: 'rakaat-preview' }), available: false },
  ];
  const compare = [['Jadwal salat, Al-Qur’an, kiblat, streak', true, true], ['Hujan & kucing (volume)', true, true], ['Panduan Haji & Umroh', false, true], ['Suara premium: petir, ombak, api, burung', false, true], ['Mode malam & widget layar kunci', false, true], ['Jeda salat dengan ayat', false, true], ['Bebas iklan selamanya', false, true]];
  return <Page title="Azam Pro" back={lastTab === 'home' ? 'settings' : lastTab} subtitle="Ruang yang lebih personal untuk iman.">
    <ImageBackground source={IMG.hajj} style={s.proHero} imageStyle={{ borderRadius: 28 }} testID="pro-hero"><LinearGradient colors={[colors.transparent, colors.overlay, colors.heroShade]} style={s.proShade} />
      <Animated.View pointerEvents="none" style={[s.shimmer, glow]}><LinearGradient colors={[colors.transparent, colors.goldSoft, colors.transparent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} /></Animated.View>
      <View style={{ padding: 20, gap: 8 }}><Badge text={settings.pro_preview ? 'PRATINJAU PRO AKTIF' : 'AZAM PRO'} gold icon="sparkles" light /><T size={30} weight="800" color={colors.heroInk} style={{ letterSpacing: -1, lineHeight: 36 }}>Sedikit jeda.{"\n"}Lebih banyak makna.</T><T size={12} color={colors.heroMuted}>Semua ibadah utama tetap gratis. Pro menambah kedalaman: panduan, suara, tema, widget.</T></View></ImageBackground>
    <View style={s.planRow}>{[['Bulanan', 'Fleksibel, berhenti kapan saja', 'pro-plan-monthly'], ['Tahunan', 'Paling hemat · 2 bulan gratis', 'pro-plan-yearly']].map(([name, text, id], i) => <Tap key={String(name)} testID={String(id)} onPress={() => notify('Langganan Pro dibuka setelah pembayaran aktif. Nikmati pratinjau gratis dulu.')} style={[s.plan, i === 1 && s.planBest]}>{i === 1 && <View style={s.bestTag}><T size={9} weight="800" color={colors.goldInk}>TERBAIK</T></View>}<T size={11} weight="700" color={colors.goldText}>{name}</T><T size={22} weight="800">Segera</T><T size={10} muted>{text}</T></Tap>)}</View>
    <Button testID="pro-preview-button" title={settings.pro_preview ? 'Pratinjau Pro aktif ✓' : 'Coba pratinjau Pro gratis'} icon="sparkles" variant="gold" onPress={() => updateSettings({ pro_preview: !settings.pro_preview })} />
    <Section title="Yang kamu dapatkan" />
    <View style={s.featureGrid}>{features.map((f, i) => <Tap testID={`pro-feature-${i}`} key={f.title} style={[s.featureCard, !f.available && s.featureLocked]} onPress={f.action}>
      {f.image ? <ImageBackground source={f.image} style={s.featureArt} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={[colors.transparent, colors.overlay]} style={[s.proShade, { borderRadius: 16 }]} /><Icon name={f.icon} size={22} color={colors.gold} /></ImageBackground> : <IconBox name={f.icon} size={48} icon={22} bg={f.available ? colors.goldSoft : undefined} color={f.available ? colors.goldText : colors.muted} />}
      <T size={14} weight="800">{f.title}</T><T size={11} muted numberOfLines={2}>{f.text}</T><View style={s.featureBadge}><T size={10} weight="700" color={f.available ? colors.goldText : colors.muted}>{f.badge}</T><Icon name={f.available ? 'arrow-forward' : 'lock-closed-outline'} size={12} color={f.available ? colors.goldText : colors.muted} /></View></Tap>)}</View>
    <Section title="Gratis vs Pro" /><Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}><View style={[s.compareRow, { backgroundColor: colors.goldSoft }]}><T size={11} weight="800" style={{ flex: 1 }}>Fitur</T><T size={11} weight="800" style={s.compareCol}>Gratis</T><T size={11} weight="800" color={colors.goldText} style={s.compareCol}>Pro</T></View>
      {compare.map(([label, free, pro]) => <View key={String(label)} style={s.compareRow}><T size={12} style={{ flex: 1 }}>{label}</T><View style={s.compareCol}><Icon name={free ? 'checkmark-circle' : 'remove-circle-outline'} size={18} color={free ? colors.success : colors.muted} /></View><View style={s.compareCol}><Icon name={pro ? 'checkmark-circle' : 'remove-circle-outline'} size={18} color={colors.goldText} /></View></View>)}</Card>
    <T muted size={11} style={{ textAlign: 'center' }}>Belum ada tagihan pada versi ini. Al-Qur’an lengkap dan terjemahan tetap gratis untuk semua.</T>
  </Page>;
}

const useStyles = makeStyles(c => ({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16 }, avatar: { width: 47, height: 47, borderRadius: 17, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  proBanner: { borderRadius: 26, overflow: 'hidden' }, proBg: { minHeight: 150, justifyContent: 'center' }, proShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26 },
  group: { gap: 10 }, groupCard: { paddingVertical: 4, paddingHorizontal: 14 }, settingRow: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 70, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.divider },
  genderBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, genderOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  proHero: { height: 250, borderRadius: 28, justifyContent: 'flex-end', overflow: 'hidden' }, shimmer: { position: 'absolute', top: 0, bottom: 0, width: 160 }, featureLocked: { opacity: 0.65 },
  planRow: { flexDirection: 'row', gap: 10 }, plan: { flex: 1, padding: 14, borderRadius: 20, gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, planBest: { borderColor: c.gold, borderWidth: 2, backgroundColor: c.goldSoft }, bestTag: { position: 'absolute', top: -1, right: 12, backgroundColor: c.gold, paddingHorizontal: 8, paddingVertical: 3, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, featureCard: { width: '48%', flexGrow: 1, padding: 14, borderRadius: 22, gap: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, featureArt: { height: 64, borderRadius: 16, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8, overflow: 'hidden' }, featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 46, borderBottomWidth: 1, borderBottomColor: c.divider }, compareCol: { width: 54, alignItems: 'center', textAlign: 'center' },
}));
