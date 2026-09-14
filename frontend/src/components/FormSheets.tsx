import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, ScrollView, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '@/src/AppContext';
import { api } from '@/src/api';
import { fontFor, makeStyles, useTheme } from '@/src/theme';
import { openSettings, requestLocation, requestNotifications } from '@/src/permissions';
import { Alarm, AlarmRepeat, DAY_SHORT, describeRepeat, localDay, nextFire, openSystemAlarm, showTime, untilText } from '@/src/alarms';
import { cancelPrayerNotifications } from './PrayerNotifications';
import { Button, Card, Icon, T, Tap } from './ui';

export const CITIES = [
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
    <T size={14} weight="700">Atau pilih kota</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{CITIES.map(item => <Tap testID={`location-city-${item.name.toLowerCase().replaceAll(' ', '-')}`} key={item.name} onPress={() => { setCity(item.name); setLatitude(String(item.lat)); setLongitude(String(item.lon)); }} style={[s.chip, city === item.name && s.chipActive]}><T size={11} weight="600" color={city === item.name ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{item.name}</T></Tap>)}</ScrollView></View>
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
  return <View style={s.body}><View style={s.centerIcon}><Icon name="notifications-outline" size={43} color={colors.brandPrimary} /></View><T size={23} weight="800" style={s.center}>Pengingat untuk kembali.</T><T muted style={s.center}>Izinkan notifikasi agar Azam dapat mengingatkan waktu salat. Izin baru diminta setelah Anda menekan tombol di bawah.</T><Card><T size={12} muted>Pengingat salat dijadwalkan untuk sisa hari ini ketika Azam dibuka. Alarm dzikir yang kamu setel berbunyi sesuai tanggal & jamnya, juga saat aplikasi ditutup.</T></Card>
    {message !== '' && <T testID="notification-status-message" size={12} color={colors.onBrandSecondary}>{message}</T>}
    <Button testID="notification-enable-button" title={settings.notifications ? 'Periksa izin notifikasi' : 'Izinkan notifikasi'} onPress={request} loading={busy} />
    {blocked && <Button testID="notification-open-settings-button" title="Buka Pengaturan" onPress={openSettings} variant="secondary" />}
    {settings.notifications && <Button testID="notification-disable-button" title="Nonaktifkan pengingat" variant="secondary" onPress={async () => { await cancelPrayerNotifications(); await updateSettings({ notifications: false }); setModal(null); }} />}
    <Button testID="notification-skip-button" title="Lanjutkan tanpa notifikasi" variant="secondary" onPress={() => setModal(null)} />
  </View>;
}

export const DZIKIR = ['Alhamdulillah', 'Masya Allah', 'Ya Rahman, Ya Rahim', 'Subhanallah', 'Allahu Akbar', 'La ilaha illallah', 'Astaghfirullahal ‘adzim', 'Bismillahirrahmanirrahim', 'Hasbunallah wa ni‘mal wakil', 'La hawla wa la quwwata illa billah', 'Allahumma shalli ‘ala Muhammad'];
const ITEM_H = 44;
/** Snapping wheel picker: scroll (or tap an item) to choose hours / minutes — no typing required. */
export function Wheel({ items, value, onChange, testID, pad = true }: { items: number[]; value: number; onChange: (v: number) => void; testID: string; pad?: boolean }) {
  const s = useStyles(); const { colors } = useTheme(); const ref = useRef<ScrollView>(null); const index = Math.max(0, items.indexOf(value));
  useEffect(() => { ref.current?.scrollTo({ y: index * ITEM_H, animated: false }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const settle = (y: number) => { const i = Math.min(items.length - 1, Math.max(0, Math.round(y / ITEM_H))); if (items[i] !== value) onChange(items[i]); };
  return <View style={s.wheel} testID={testID}><View pointerEvents="none" style={s.wheelHighlight} />
    <ScrollView ref={ref} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H} decelerationRate="fast" contentContainerStyle={{ paddingVertical: ITEM_H }} scrollEventThrottle={16}
      onScroll={e => settle(e.nativeEvent.contentOffset.y)} onMomentumScrollEnd={e => settle(e.nativeEvent.contentOffset.y)} onScrollEndDrag={e => settle(e.nativeEvent.contentOffset.y)} nestedScrollEnabled>
      {items.map((item, i) => <Tap key={item} testID={`${testID}-${item}`} haptic={false} onPress={() => { onChange(item); ref.current?.scrollTo({ y: i * ITEM_H, animated: true }); }} style={s.wheelItem}><T size={item === value ? 26 : 18} weight={item === value ? '800' : '500'} color={item === value ? colors.onSurface : colors.muted}>{pad ? String(item).padStart(2, '0') : item}</T></Tap>)}
    </ScrollView></View>;
}
export const REPEATS: { key: AlarmRepeat; label: string; icon: string }[] = [{ key: 'once', label: 'Sekali', icon: 'calendar-outline' }, { key: 'daily', label: 'Setiap hari', icon: 'sunny-outline' }, { key: 'weekly', label: 'Mingguan', icon: 'repeat-outline' }];
const upcomingDates = () => Array.from({ length: 30 }, (_, i) => localDay(new Date(Date.now() + i * 86400000)));
/** Create or edit one alarm: date/time, label, repeat pattern, snooze, and the dzikir phrase. */
export function AlarmFormSheet() {
  const { modal, saveAlarm, removeAlarm, setModal, notify } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const editing: Alarm | undefined = modal.alarm;
  const [hour, setHour] = useState(Number((editing?.time || '04:30').split(':')[0])); const [minute, setMinute] = useState(Number((editing?.time || '04:30').split(':')[1]));
  const [label, setLabel] = useState(editing?.label || 'Bangun dzikir'); const [repeat, setRepeat] = useState<AlarmRepeat>(editing?.repeat || 'once');
  const [date, setDate] = useState(editing?.date || localDay(new Date(Date.now() + 86400000))); const [weekdays, setWeekdays] = useState<number[]>(editing?.weekdays?.length ? editing.weekdays : [1, 2, 3, 4, 5]);
  const [snooze, setSnooze] = useState(editing?.snooze_minutes || 5);
  const [phrase, setPhrase] = useState(editing?.phrase && DZIKIR.includes(editing.phrase) ? editing.phrase : DZIKIR[0]); const [custom, setCustom] = useState(editing?.phrase && !DZIKIR.includes(editing.phrase) ? editing.phrase : '');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [permission, setPermission] = useState<'granted' | 'missing' | 'blocked' | 'web'>(Platform.OS === 'web' ? 'web' : 'granted');
  useEffect(() => { if (Platform.OS !== 'web') import('expo-notifications').then(n => n.getPermissionsAsync()).then(p => setPermission(p.granted ? 'granted' : p.canAskAgain ? 'missing' : 'blocked')).catch(() => {}); }, []);
  const chosen = custom.trim() || phrase; const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const draft = { label: label.trim(), time, repeat, date: repeat === 'once' ? date : null, weekdays: repeat === 'weekly' ? weekdays : [], enabled: editing?.enabled ?? true, phrase: chosen.trim(), snooze_minutes: snooze };
  const preview = nextFire(draft);
  const askPermission = async () => {
    const result: any = await requestNotifications();
    setPermission(result.granted ? 'granted' : result.canAskAgain ? 'missing' : 'blocked');
    if (result.granted) notify('Izin notifikasi aktif. Alarm akan berbunyi di HP ini.');
  };
  const save = async () => {
    if (!draft.label) { setError('Beri nama alarmnya, mis. Bangun subuh.'); return; }
    if (!chosen.trim()) { setError('Pilih atau tulis satu dzikir.'); return; }
    if (repeat === 'weekly' && !weekdays.length) { setError('Pilih minimal satu hari.'); return; }
    if (repeat === 'once' && !preview) { setError('Waktu ini sudah lewat. Pilih tanggal atau jam berikutnya.'); return; }
    setBusy(true); setError('');
    try { await saveAlarm({ ...draft, enabled: true }, editing?.id); setModal(null); notify(editing ? 'Alarm diperbarui.' : preview ? `Alarm disetel · berbunyi dalam ${untilText(preview)}.` : 'Alarm disimpan.'); }
    catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  const remove = async () => { if (!editing) return; setBusy(true); try { await removeAlarm(editing.id); setModal(null); notify('Alarm dihapus.'); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  const toClock = async () => { try { await openSystemAlarm(draft); } catch { setError('Aplikasi Jam di HP belum bisa dibuka dari sini. Alarm notifikasi Azam tetap berjalan.'); } };
  return <View style={s.body}>
    <View style={s.timeRow}><Wheel testID="alarm-hour-wheel" items={Array.from({ length: 24 }, (_, i) => i)} value={hour} onChange={setHour} /><T size={34} weight="800" style={{ marginTop: 8 }}>:</T><Wheel testID="alarm-minute-wheel" items={Array.from({ length: 60 }, (_, i) => i)} value={minute} onChange={setMinute} /></View>
    <T testID="alarm-time-preview" size={13} weight="700" style={s.center}>{preview ? `Berbunyi ${describeRepeat(draft).toLowerCase()} pukul ${showTime(time)} · dalam ${untilText(preview)}` : `Pukul ${showTime(time)} · waktu ini sudah lewat`}</T>
    <View style={s.field}><T size={12} weight="600">Nama alarm</T><TextInput testID="alarm-label-input" style={s.input} value={label} onChangeText={setLabel} maxLength={60} placeholder="mis. Bangun subuh, Tahajud" placeholderTextColor={colors.muted} /></View>
    <T size={12} weight="600">Pengulangan</T>
    <View style={s.segment}>{REPEATS.map(r => <Tap key={r.key} testID={`alarm-repeat-${r.key}`} style={[s.segmentItem, repeat === r.key && s.chipActive]} onPress={() => setRepeat(r.key)} accessibilityState={{ selected: repeat === r.key }}><Icon name={r.icon} size={15} color={repeat === r.key ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><T size={12} weight="600" color={repeat === r.key ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{r.label}</T></Tap>)}</View>
    {repeat === 'once' && <View style={s.field}><T size={12} weight="600">Tanggal</T><View style={s.dateRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{upcomingDates().map((d, i) => { const on = d === date; const dt = new Date(`${d}T12:00:00`); return <Tap key={d} testID={`alarm-date-${d}`} style={[s.dateChip, on && s.chipActive]} onPress={() => setDate(d)} accessibilityState={{ selected: on }}><T size={10} weight="600" color={on ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : DAY_SHORT[dt.getDay()]}</T><T size={16} weight="800" color={on ? colors.onBrandPrimary : colors.onSurface}>{dt.getDate()}</T><T size={9} color={on ? colors.onBrandPrimary : colors.muted}>{dt.toLocaleDateString('id-ID', { month: 'short' })}</T></Tap>; })}</ScrollView></View>
      <T testID="alarm-date-preview" size={11} muted>{new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</T></View>}
    {repeat === 'weekly' && <View style={s.field}><T size={12} weight="600">Hari</T><View style={s.weekRow}>{DAY_SHORT.map((d, i) => { const on = weekdays.includes(i); return <Tap key={d} testID={`alarm-weekday-${i}`} style={[s.dayChip, on && s.chipActive]} onPress={() => setWeekdays(on ? weekdays.filter(x => x !== i) : [...weekdays, i].sort())} accessibilityState={{ selected: on }}><T size={11} weight="700" color={on ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{d}</T></Tap>; })}</View></View>}
    <T size={12} weight="600">Tunda (snooze)</T><View style={s.wrapChips}>{[5, 10, 15].map(m => <Tap key={m} testID={`alarm-snooze-${m}`} style={[s.chip, snooze === m && s.chipActive]} onPress={() => setSnooze(m)}><T size={12} weight="600" color={snooze === m ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{m} menit</T></Tap>)}</View>
    <T weight="700">Dzikir yang diucapkan</T><T muted size={11}>Pilih dari daftar atau tulis dzikir pilihanmu sendiri.</T>
    <View style={s.wrapChips}>{DZIKIR.map((p, i) => <Tap key={p} testID={`alarm-phrase-${i}`} style={[s.chip, chosen === p && s.chipActive]} onPress={() => { setPhrase(p); setCustom(''); }}><T size={12} weight="600" color={chosen === p ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{p}</T></Tap>)}</View>
    <TextInput testID="alarm-phrase-input" style={s.input} value={custom} onChangeText={setCustom} maxLength={80} placeholder="Tulis dzikir sendiri, mis. Ya Latif, Ya Karim" placeholderTextColor={colors.muted} />
    {permission !== 'granted' && permission !== 'web' && <Card style={s.info}><Icon name="notifications-outline" size={22} color={colors.onBrandSecondary} /><View style={{ flex: 1, gap: 8 }}><T size={12} muted>Agar alarm berbunyi di HP ini, Azam perlu izin notifikasi. Alarm tetap tersimpan meski belum diizinkan.</T>{permission === 'missing' ? <Button testID="alarm-permission-button" title="Izinkan notifikasi" size="sm" onPress={askPermission} /> : <Button testID="alarm-open-settings-button" title="Buka Pengaturan" size="sm" variant="secondary" onPress={openSettings} />}</View></Card>}
    {permission === 'web' && <T size={11} muted>Di pratinjau web alarm hanya tersimpan; ia berbunyi saat Azam dibuka di HP.</T>}
    {error !== '' && <T testID="alarm-form-error" color={colors.error} size={12}>{error}</T>}
    <Button testID="alarm-save-button" title={editing ? 'Simpan perubahan' : 'Setel alarm'} icon="alarm-outline" onPress={save} loading={busy} />
    {Platform.OS === 'android' && <Button testID="alarm-system-clock-button" title="Setel juga di Jam HP" icon="phone-portrait-outline" variant="secondary" onPress={toClock} />}
    {editing && <Button testID="alarm-delete-button" title="Hapus alarm" icon="trash-outline" variant="danger" onPress={remove} disabled={busy} />}
  </View>;
}
export const APP_CATEGORIES: { key: string; icon: string }[] = [{ key: 'Sosmed', icon: 'chatbubbles-outline' }, { key: 'Game', icon: 'game-controller-outline' }, { key: 'Video', icon: 'videocam-outline' }, { key: 'Belanja', icon: 'cart-outline' }, { key: 'Lainnya', icon: 'apps-outline' }];
/** Add any app the user wants to pause — typed manually, or picked from installed apps on Android native builds. */
export function AddAppSheet() {
  const { settings, updateSettings, setModal, notify } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [name, setName] = useState(''); const [category, setCategory] = useState('Sosmed'); const [installed, setInstalled] = useState<any[] | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const add = async (label: string, pkg = '') => {
    const trimmed = label.trim(); if (!trimmed) { setError('Tulis nama aplikasinya dulu.'); return; }
    if ([...(settings.custom_apps || []).map((a: any) => a.name.toLowerCase())].includes(trimmed.toLowerCase())) { setError('Aplikasi ini sudah ada di daftar.'); return; }
    if (await updateSettings({ custom_apps: [...(settings.custom_apps || []), { name: trimmed, category, package: pkg }], blocked_apps: [...settings.blocked_apps, trimmed] })) { setModal(null); notify(`${trimmed} ditambahkan dan diblokir saat azan.`); }
  };
  const loadInstalled = async () => {
    setBusy(true); setError('');
    try {
      const kit = require('react-native-launcher-kit'); // eslint-disable-line @typescript-eslint/no-require-imports
      const apps = await kit.InstalledApps.getSortedApps();
      setInstalled(apps.filter((a: any) => a.label && a.packageName !== 'com.emergent.qurandaily.fst79v'));
    } catch { setError('Daftar aplikasi terpasang hanya tersedia di build Android (bukan Expo Go). Tambahkan secara manual di atas.'); } finally { setBusy(false); }
  };
  return <View style={s.body}><T muted size={12}>Pilih aplikasi mana pun di ponselmu yang ingin dijeda saat azan — sosmed, game, belanja, atau lainnya.</T>
    <View style={s.field}><T size={12} weight="600">Nama aplikasi</T><TextInput testID="add-app-name-input" style={s.input} value={name} onChangeText={setName} maxLength={60} placeholder="mis. WhatsApp, Mobile Legends, Shopee" placeholderTextColor={colors.muted} /></View>
    <T size={12} weight="600">Kategori</T><View style={s.wrapChips}>{APP_CATEGORIES.map(item => <Tap key={item.key} testID={`add-app-category-${item.key.toLowerCase()}`} style={[s.chip, { flexDirection: 'row', gap: 6 }, category === item.key && s.chipActive]} onPress={() => setCategory(item.key)}><Icon name={item.icon} size={14} color={category === item.key ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><T size={12} weight="600" color={category === item.key ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{item.key}</T></Tap>)}</View>
    {error !== '' && <T testID="add-app-error" size={12} color={colors.error}>{error}</T>}
    <Button testID="add-app-save-button" title="Tambahkan & blokir" icon="add-circle-outline" onPress={() => add(name)} />
    {Platform.OS === 'android' && <Button testID="add-app-installed-button" title="Pilih dari aplikasi terpasang" icon="phone-portrait-outline" variant="secondary" loading={busy} onPress={loadInstalled} />}
    {installed && installed.slice(0, 80).map((app: any) => <Tap key={app.packageName} testID={`installed-app-${app.packageName}`} onPress={() => add(app.label, app.packageName)} style={s.appRow}>{app.icon ? <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={s.appIcon} /> : <View style={s.appIcon}><Icon name="apps-outline" size={20} color={colors.onBrandSecondary} /></View>}<T size={14} weight="600" style={{ flex: 1 }}>{app.label}</T><Icon name="add-circle-outline" size={20} color={colors.brandPrimary} /></Tap>)}
    <T size={10} muted>Pemblokiran sistem penuh (Accessibility/Usage Access) hadir pada build native. Di Expo, jeda ditampilkan di dalam Azam.</T>
  </View>;
}
const useStyles = makeStyles(c => ({
  body: { gap: 18 }, info: { backgroundColor: c.brandSecondary, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }, chipRow: { height: 56, flexShrink: 0, marginVertical: -9 }, chips: { gap: 8, alignItems: 'center', paddingHorizontal: 0 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 15, borderWidth: 1, borderColor: c.border, backgroundColor: c.glass, justifyContent: 'center', alignItems: 'center', borderRadius: 12 }, chipActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, wrapChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { gap: 8 }, input: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: 15, height: 51, paddingHorizontal: 15, fontFamily: fontFor('500'), fontSize: 14, color: c.onSurface, backgroundColor: c.surface, outlineWidth: 0 }, twoFields: { flexDirection: 'row', gap: 12 }, flexField: { flex: 1, gap: 8 }, center: { textAlign: 'center' }, centerIcon: { width: 90, height: 90, borderRadius: 30, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 10 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 60, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: c.border }, appIcon: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: c.brandSecondary },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, wheel: { width: 96, height: ITEM_H * 3, borderRadius: 20, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }, wheelHighlight: { position: 'absolute', top: ITEM_H, left: 6, right: 6, height: ITEM_H, borderRadius: 14, backgroundColor: c.brandSecondary, borderWidth: 1, borderColor: c.brandTertiary }, wheelItem: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  segment: { flexDirection: 'row', gap: 8 }, segmentItem: { flex: 1, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: c.border, backgroundColor: c.glass },
  dateRow: { height: 72, flexShrink: 0 }, dateChip: { width: 62, height: 68, flexShrink: 0, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border, backgroundColor: c.glass },
  weekRow: { flexDirection: 'row', gap: 6 }, dayChip: { flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border, backgroundColor: c.glass },
}));