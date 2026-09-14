import React, { useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '@/src/AppContext';
import { api } from '@/src/api';
import { makeStyles, useTheme } from '@/src/theme';
import { openSettings, requestLocation, requestNotifications } from '@/src/permissions';
import { Badge, Button, Card, Icon, T, Tap } from './ui';

const CITIES = [
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 }, { name: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { name: 'Surabaya', lat: -7.2575, lon: 112.7521 }, { name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Makassar', lat: -5.1477, lon: 119.4327 }, { name: 'Banda Aceh', lat: 5.5483, lon: 95.3238 },
];
export function LocationSheet() {
  const { settings, updateSettings, setModal, notify, day } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [city, setCity] = useState(settings.city); const [latitude, setLatitude] = useState(String(settings.latitude)); const [longitude, setLongitude] = useState(String(settings.longitude));
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [blocked, setBlocked] = useState(false);
  const save = async (lat: number, lon: number, name: string) => {
    const response = await api(`/prayers?latitude=${lat}&longitude=${lon}&day=${day}`);
    if (await updateSettings({ city: name.trim(), latitude: lat, longitude: lon, timezone: response.data.timezone, location_set: true })) { setModal(null); notify(`Lokasi diperbarui: ${name}`); }
  };
  const gps = async () => {
    setBusy(true); setError('');
    try {
      const permission = await requestLocation();
      if (!permission.granted) { setBlocked(!permission.canAskAgain); setError('Izin lokasi belum diberikan. Anda tetap dapat memilih kota atau mengisi koordinat.'); return; }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      let name = 'Lokasi saya';
      if (Platform.OS !== 'web') { try { const places = await Location.reverseGeocodeAsync(position.coords); name = places[0]?.city || places[0]?.subregion || name; } catch { /* Coordinates remain usable without city lookup. */ } }
      setCity(name); setLatitude(String(position.coords.latitude)); setLongitude(String(position.coords.longitude));
      await save(position.coords.latitude, position.coords.longitude, name);
    } catch (e: any) { setError(e.message || 'Lokasi belum terbaca. Pilih kota secara manual.'); } finally { setBusy(false); }
  };
  const manual = async () => {
    const lat = Number(latitude.replace(',', '.')); const lon = Number(longitude.replace(',', '.'));
    if (!city.trim() || !latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) { setError('Isi nama lokasi, lintang −90 sampai 90, dan bujur −180 sampai 180.'); return; }
    setBusy(true); setError('');
    try { await save(lat, lon, city); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  return <View style={s.body}><Card style={s.info}><Icon name="location-outline" size={24} color={colors.onBrandSecondary} /><T size={12} muted style={{ flex: 1 }}>Lokasi membantu menentukan jadwal salat dan kiblat. Azam tidak melacak lokasi di latar belakang.</T></Card>
    <Button testID="location-gps-button" title="Gunakan lokasi saya" icon="locate-outline" variant="secondary" loading={busy} onPress={gps} />
    {blocked && <Button testID="location-open-settings-button" title="Buka Pengaturan" onPress={() => Platform.OS === 'web' ? setError('Buka izin situs di pengaturan browser untuk mengizinkan lokasi. Pilihan manual tetap tersedia.') : openSettings()} variant="secondary" />}
    <T size={14} weight="700">Atau pilih kota</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{CITIES.map(item => <Tap testID={`location-city-${item.name.toLowerCase().replaceAll(' ', '-')}`} key={item.name} onPress={() => { setCity(item.name); setLatitude(String(item.lat)); setLongitude(String(item.lon)); }} style={[s.chip, city === item.name && s.chipActive]}><T size={11} weight="600" color={city === item.name ? colors.onBrandSecondary : colors.onSurfaceTertiary}>{item.name}</T></Tap>)}</ScrollView></View>
    <View style={s.field}><T size={12} weight="600">Nama lokasi</T><TextInput testID="location-city-input" style={s.input} value={city} onChangeText={setCity} maxLength={80} placeholder="Nama kota / lokasi" placeholderTextColor={colors.muted} /></View>
    <View style={s.twoFields}><View style={s.flexField}><T size={12} weight="600">Lintang</T><TextInput testID="location-latitude-input" style={s.input} value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" placeholder="-6.2088" placeholderTextColor={colors.muted} /></View><View style={s.flexField}><T size={12} weight="600">Bujur</T><TextInput testID="location-longitude-input" style={s.input} value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" placeholder="106.8456" placeholderTextColor={colors.muted} /></View></View>
    {error !== '' && <T testID="location-error" size={12} color={colors.error}>{error}</T>}
    <T size={10} muted>Jadwal dihitung dengan metode Kemenag RI. Cocokkan kembali dengan masjid setempat.</T>
    <Button testID="location-save-button" title="Simpan lokasi" onPress={manual} loading={busy} />
  </View>;
}

export function NotificationSheet() {
  const { settings, updateSettings, notify, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [blocked, setBlocked] = useState(false);
  const request = async () => {
    setBusy(true);
    try {
      const result: any = await requestNotifications();
      if (result.unsupported) { setMessage('Notifikasi perangkat tidak tersedia di pratinjau browser. Anda tetap dapat melihat seluruh jadwal salat.'); return; }
      if (result.granted) { await updateSettings({ notifications: true }); setModal(null); notify('Izin notifikasi diaktifkan. Pengingat hari ini dijadwalkan.'); }
      else { setBlocked(!result.canAskAgain); setMessage('Notifikasi belum diizinkan. Fitur salat dan bacaan tetap dapat digunakan.'); }
    } catch { setMessage('Notifikasi belum tersedia pada perangkat ini. Anda tetap dapat melanjutkan.'); } finally { setBusy(false); }
  };
  return <View style={s.body}><View style={s.centerIcon}><Icon name="notifications-outline" size={43} color={colors.brandPrimary} /></View><T size={23} weight="800" style={s.center}>Pengingat untuk kembali.</T><T muted style={s.center}>Izinkan notifikasi agar Azam dapat mengingatkan waktu salat. Izin baru diminta setelah Anda menekan tombol di bawah.</T><Card><T size={12} muted>Pengingat lokal dijadwalkan untuk sisa hari ini ketika Azam dibuka. Pengingat berulang lintas hari dan alarm latar belakang khusus belum tersedia.</T></Card>
    {message !== '' && <T testID="notification-status-message" size={12} color={colors.onBrandSecondary}>{message}</T>}
    <Button testID="notification-enable-button" title={settings.notifications ? 'Periksa izin notifikasi' : 'Izinkan notifikasi'} onPress={request} loading={busy} />
    {blocked && <Button testID="notification-open-settings-button" title="Buka Pengaturan" onPress={openSettings} variant="secondary" />}
    {settings.notifications && <Button testID="notification-disable-button" title="Nonaktifkan pengingat" variant="secondary" onPress={async () => { if (Platform.OS !== 'web') { const n = await import('expo-notifications'); await n.cancelAllScheduledNotificationsAsync(); } await updateSettings({ notifications: false }); setModal(null); }} />}
    <Button testID="notification-skip-button" title="Lanjutkan tanpa notifikasi" variant="secondary" onPress={() => setModal(null)} />
  </View>;
}

const APPS = [['Instagram', 'logo-instagram', 'Media sosial'], ['TikTok', 'logo-tiktok', 'Video singkat'], ['YouTube', 'logo-youtube', 'Video & hiburan'], ['X', 'logo-twitter', 'Media sosial'], ['Chrome', 'logo-chrome', 'Browser'], ['Facebook', 'logo-facebook', 'Media sosial'], ['Game', 'game-controller-outline', 'Hiburan']];
export function AppsSheet() {
  const { settings, updateSettings, notify, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [selected, setSelected] = useState<string[]>(settings.blocked_apps); const [saving, setSaving] = useState(false);
  const toggle = (name: string) => setSelected(previous => previous.includes(name) ? previous.filter(p => p !== name) : [...previous, name]);
  return <View style={s.body}><Badge text="PILIHAN CONTOH · DEMONSTRASI" /><T size={12} muted>Ini bukan daftar aplikasi yang terpasang. Pilihan disimpan untuk mencoba alur jeda; aplikasi lain belum diblokir.</T>
    {APPS.map(([name, icon, sub]) => <Tap testID={`select-app-${name.toLowerCase()}`} key={name} style={s.appRow} onPress={() => toggle(name)} accessibilityRole="checkbox" accessibilityState={{ checked: selected.includes(name) }}><View style={s.appIcon}><Icon name={icon} size={25} color={colors.onBrandSecondary} /></View><View style={{ flex: 1 }}><T weight="700">{name}</T><T size={11} muted>{sub}</T></View><Icon name={selected.includes(name) ? 'checkbox' : 'square-outline'} color={selected.includes(name) ? colors.brandPrimary : colors.borderStrong} size={24} /></Tap>)}
    <Button testID="selected-apps-save-button" title={`Simpan ${selected.length} aplikasi`} loading={saving} onPress={async () => { setSaving(true); if (await updateSettings({ blocked_apps: selected })) { setModal(null); notify('Pilihan demonstrasi disimpan.'); } setSaving(false); }} />
  </View>;
}

export function AlarmSettingsSheet() {
  const { settings, updateSettings, setModal, notify } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [time, setTime] = useState(settings.alarm_time); const [phrase, setPhrase] = useState(settings.alarm_phrase); const [error, setError] = useState('');
  return <View style={s.body}><Badge text="PENGATURAN DEMONSTRASI" /><T muted size={12}>Waktu dan kalimat disimpan sebagai preferensi. Alarm belum berbunyi otomatis di latar belakang.</T>
    <T weight="700">Waktu bangun</T><TextInput testID="alarm-time-input" style={[s.input, s.timeInput]} value={time} onChangeText={setTime} maxLength={5} placeholder="04:30" placeholderTextColor={colors.muted} keyboardType="numbers-and-punctuation" /><T muted size={11}>Format 24 jam · HH:MM</T>
    <T weight="700">Kalimat pengingat</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{['Alhamdulillah', 'Masya Allah', 'Ya Rahman, Ya Rahim'].map((p, i) => <Tap key={p} testID={`alarm-phrase-${i}`} style={[s.chip, phrase === p && s.chipActive]} onPress={() => setPhrase(p)}><T size={12} weight="600" color={phrase === p ? colors.onBrandSecondary : colors.onSurfaceTertiary}>{p}</T></Tap>)}</ScrollView></View>
    <Card><T size={12} muted>Pada demonstrasi, tahan tombol 3 detik untuk menutup. Pengucapan kalimat belum diverifikasi dan mikrofon tidak digunakan.</T></Card>{error !== '' && <T testID="alarm-form-error" color={colors.error} size={12}>{error}</T>}
    <Button testID="alarm-save-button" title="Simpan alarm" onPress={async () => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { setError('Gunakan waktu valid, misalnya 04:30.'); return; } if (await updateSettings({ alarm_time: time, alarm_phrase: phrase })) { setModal(null); notify('Preferensi alarm disimpan.'); } }} />
  </View>;
}
const useStyles = makeStyles(c => ({
  body: { gap: 18 }, info: { backgroundColor: c.brandSecondary, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }, chipRow: { height: 56, flexShrink: 0, marginVertical: -9 }, chips: { gap: 8, alignItems: 'center', paddingHorizontal: 0 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceTertiary, justifyContent: 'center', borderRadius: 12 }, chipActive: { backgroundColor: c.brandSecondary, borderColor: c.brandTertiary },
  field: { gap: 8 }, input: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: 15, height: 51, paddingHorizontal: 15, fontFamily: 'Jakarta', fontSize: 14, color: c.onSurface, backgroundColor: c.surface, outlineWidth: 0 }, twoFields: { flexDirection: 'row', gap: 12 }, flexField: { flex: 1, gap: 8 }, center: { textAlign: 'center' }, centerIcon: { width: 90, height: 90, borderRadius: 30, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 10 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 66, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border }, appIcon: { width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: c.brandSecondary }, timeInput: { height: 90, textAlign: 'center', fontSize: 42, fontWeight: '700' },
}));