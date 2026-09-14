import React, { useRef, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { AlarmSettingsSheet, LocationSheet, NotificationSheet } from './FormSheets';
import { DemoOverlay } from './DemoOverlay';
import { Badge, Button, Card, Icon, Logo, T, Tap } from './ui';
import { LevelBadge } from '@/src/screens/Progress';

export function Toast() {
  const { toast, modal, screen, settings } = useApp(); const s = useStyles(); const insets = useSafeAreaInsets(); if (!toast) return null;
  const aboveTabs = !modal && settings?.onboarded && ['home', 'qibla', 'quran', 'focus', 'progress'].includes(screen);
  return <View testID="app-toast" accessibilityLiveRegion="polite" style={[s.toast, { bottom: (aboveTabs ? 100 : 24) + insets.bottom }]}><T size={12} style={s.toastText}>{toast}</T></View>;
}
/** Story-style share card (9:16-ish) rendered to an image on native, text fallback elsewhere. */
function ShareSheet() {
  const { modal, progress, notify, user, settings } = useApp(); const s = useStyles(); const { colors } = useTheme(); const verse = modal.verse; const shot = useRef<any>(null);
  const [busy, setBusy] = useState(false); const [styleIndex, setStyleIndex] = useState(0);
  const isVerse = modal.type === 'share-verse'; const completed = modal.type === 'success';
  const level = progress.data?.levels?.filter((l: any) => l.unlocked).at(-1);
  const streak = progress.data?.streak || 0;
  const title = isVerse ? 'Seayat untuk hati' : completed ? `Alhamdulillah, ${modal.prayer}.` : `${streak} hari streak salat 🔥`;
  const message = isVerse ? `${verse.teksArab}\n\n${verse.teksIndonesia}\nQS. ${verse.surah}: ${verse.nomorAyat}\n\nSeayat untuk hati — Azam` : completed ? `Alhamdulillah, saya telah menunaikan salat ${modal.prayer}. Satu langkah kecil untuk lebih istiqamah.\n\nTemani perjalanan baikmu bersama Azam.` : `${streak} hari streak salat 🔥 ${progress.data?.total || 0} salat tercatat${level ? ` · Level ${level.name}` : ''}. Bukan sempurna, tetapi terus berusaha.\n\n#AzamAppBlocker`;
  const share = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && shot.current && await Sharing.isAvailableAsync()) {
        const uri = await shot.current.capture();
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: title, UTI: 'public.png' });
      } else await Share.share({ message, title });
    } catch { notify('Berbagi belum tersedia di perangkat ini.'); } finally { setBusy(false); }
  };
  const gradients = [[colors.transparent, colors.overlay], [colors.brandDeep, colors.pageTop], [colors.gold, colors.pageTop]];
  return <View style={s.body}>
    <ViewShot ref={shot} options={{ format: 'png', quality: 1 }} style={s.shotWrap}>
      <ImageBackground source={IMG.shareBg} style={s.shareTemplate} imageStyle={{ borderRadius: 28 }} testID="share-template">
        <LinearGradient colors={gradients[styleIndex] as any} style={s.shareShade} />
        <Logo size={30} wordmark />
        {isVerse ? <View style={s.verseBox}><T arabic size={24} color={colors.heroInk} style={s.center}>{verse.teksArab}</T><T size={12} color={colors.heroMuted} style={s.center}>“{verse.teksIndonesia}”</T><Badge text={`QS. ${verse.surah} : ${verse.nomorAyat}`} gold /></View>
          : <><LevelBadge name={completed ? 'Bintang' : level?.name || 'Awan'} size={132} locked={!completed && !level} />
            <T size={26} weight="800" color={colors.heroInk} style={s.center}>{title}</T>
            {!completed && <View style={s.statsRow}>{[[streak, 'hari'], [progress.data?.total || 0, 'salat'], [progress.data?.best || 0, 'terbaik']].map(([v, l]) => <View key={String(l)} style={s.statPill}><T size={20} weight="800" color={colors.heroInk}>{v}</T><T size={9} color={colors.heroMuted}>{l}</T></View>)}</View>}
            <T size={12} color={colors.heroMuted} style={s.center}>{completed ? 'Semoga langkah kecil hari ini menjadi kebiasaan baik esok hari.' : `${user?.guest ? 'Sahabat Azam' : user?.name} · ${settings?.city}`}</T></>}
        <T size={10} color={colors.heroMuted}>#AzamAppBlocker · Jeda sejenak, dekat kembali</T>
      </ImageBackground>
    </ViewShot>
    <View style={s.optionsRow}>{['Langit', 'Biru', 'Emas'].map((name, i) => <Button key={name} size="sm" testID={`share-style-${i}`} style={{ flex: 1 }} title={name} variant={styleIndex === i ? 'primary' : 'secondary'} onPress={() => setStyleIndex(i)} />)}</View>
    <Button testID="share-confirm-button" title={Platform.OS === 'web' ? 'Bagikan sebagai teks' : 'Bagikan ke Story / WhatsApp'} icon="share-social" loading={busy} onPress={share} variant="gold" />
    <T size={10} muted style={s.center}>{Platform.OS === 'web' ? 'Di ponsel, kartu ini dibagikan sebagai gambar.' : 'Kartu dibagikan sebagai gambar ke aplikasi pilihanmu.'}</T>
  </View>;
}
function DaySheet() {
  const { modal, progress, checkin, checking, day } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const names = (modal.date === day ? progress.data?.today : progress.data?.calendar[modal.date]) || [];
  return <View style={s.body}><T size={14} muted>{new Date(`${modal.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</T><T muted size={12}>Ketuk untuk mencatat atau membatalkan catatan salat.</T>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => <Tap testID={`day-checkin-${name.toLowerCase()}`} disabled={checking} key={name} style={s.dayRow} onPress={() => checkin(name, modal.date)}><Icon name={names.includes(name) ? 'checkmark-circle' : 'ellipse-outline'} color={names.includes(name) ? colors.success : colors.borderStrong} /><T size={16} weight="600" style={{ flex: 1 }}>{name}</T><T size={11} muted>{names.includes(name) ? 'Selesai' : 'Belum dicatat'}</T></Tap>)}</View>;
}
function WidgetPreview() {
  const { daily } = useApp(); const s = useStyles(); const { colors } = useTheme(); const [style, setStyle] = useState(0);
  return <View style={s.body}><Badge text="PRATINJAU DESAIN · BUKAN WIDGET AKTIF" /><T size={12} muted>Lihat tampilan ayat harian. Pemasangan widget layar kunci dan penggantian ikon sistem belum tersedia.</T>
    <ImageBackground source={style === 1 ? IMG.heroBirds : IMG.shareBg} style={s.widgetPhone} imageStyle={{ borderRadius: 32 }}><T size={13} color={colors.heroMuted}>Senin, perjalanan yang baru</T><T size={60} weight="700" color={colors.heroInk}>05.00</T><View style={s.widgetCard}><T size={10} color={colors.heroMuted}>SEAYAT HARI INI</T>{daily.data ? <><T arabic size={22} color={colors.heroInk} style={s.center}>{daily.data.teksArab}</T><T size={11} color={colors.heroMuted} style={s.center}>{daily.data.teksIndonesia}</T><T size={10} color={colors.gold}>QS. {daily.data.surah} : {daily.data.nomorAyat}</T></> : <T muted>Ayat dimuat ketika koneksi tersedia.</T>}</View></ImageBackground>
    <View style={s.optionsRow}>{['Langit', 'Burung'].map((name, index) => <Button key={name} testID={`widget-style-${index}`} style={{ flex: 1 }} title={name} variant={style === index ? 'primary' : 'secondary'} onPress={() => setStyle(index)} />)}</View>
  </View>;
}
function RakaatPreview() {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.body}><Badge text="KONSEP PRO · BELUM TERSEDIA" gold /><LevelBadge name="Purnama" size={110} style={{ alignSelf: 'center' }} /><T size={24} weight="800">Fokus pada salatmu.</T><T muted>Penghitungan rakaat otomatis membutuhkan integrasi sensor native dan pengujian posisi perangkat. Versi ini tidak mendeteksi sujud atau menghitung rakaat otomatis.</T><Card><Icon name="information-circle-outline" color={colors.onBrandSecondary} /><T size={12} muted style={{ marginTop: 12 }}>Fitur belum dapat diaktifkan. Jangan mengandalkan pratinjau ini untuk menentukan jumlah rakaat.</T></Card></View>;
}
export function GlobalOverlay() {
  const { modal, setModal, logout } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets();
  const isDemo = modal?.type === 'blocker' || modal?.type === 'alarm';
  const titles: Record<string, string> = { location: 'Atur lokasi', notifications: 'Pengingat salat', 'alarm-settings': 'Alarm dzikir', success: 'Satu langkah baik', 'share-verse': 'Bagikan ayat', 'share-progress': 'Bagikan ke Story', day: 'Catatan salat', 'widget-preview': 'Ayat di layar kunci', 'rakaat-preview': 'Penghitung rakaat', logout: 'Keluar dari Azam?' };
  if (!modal) return null;
  return <Modal key={modal.type} visible transparent={!isDemo} animationType="slide" onRequestClose={() => setModal(null)} statusBarTranslucent>
    <GestureHandlerRootView style={{ flex: 1 }}>{modal && (isDemo ? <DemoOverlay key={modal.type} /> : <KeyboardAvoidingView style={s.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Tap testID="modal-backdrop" onPress={() => setModal(null)} style={s.backdrop}><View /></Tap>
      <View style={[s.sheet, { paddingBottom: insets.bottom + 20, marginTop: insets.top + 16 }]}><View style={s.handle} /><View style={s.sheetHeader}><T size={20} weight="800" style={{ flex: 1 }}>{modal.title || titles[modal.type]}</T><Tap testID="modal-close-button" style={s.closeButton} onPress={() => setModal(null)}><Icon name="close" size={22} /></Tap></View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          {modal.type === 'location' && <LocationSheet />}{modal.type === 'notifications' && <NotificationSheet />}{modal.type === 'alarm-settings' && <AlarmSettingsSheet />}
          {['success', 'share-verse', 'share-progress'].includes(modal.type) && <ShareSheet />}{modal.type === 'day' && <DaySheet />}{modal.type === 'widget-preview' && <WidgetPreview />}{modal.type === 'rakaat-preview' && <RakaatPreview />}
          {modal.type === 'info' && <View style={s.body}><View style={s.verseIcon}><Icon name="information-circle-outline" size={35} color={colors.brandTertiary} /></View><T muted size={15}>{modal.message}</T><Button testID="info-dismiss-button" title="Mengerti" onPress={() => setModal(null)} /></View>}
          {modal.type === 'logout' && <View style={s.body}><T muted>Catatan tamu tidak dapat dipulihkan setelah keluar. Jika menggunakan Google, Anda dapat masuk kembali ke akun yang sama.</T><Button testID="logout-confirm-button" title="Ya, keluar" variant="danger" onPress={logout} /><Button testID="logout-cancel-button" title="Tetap di sini" variant="secondary" onPress={() => setModal(null)} /></View>}
        </ScrollView>
      </View><Toast />
    </KeyboardAvoidingView>)}</GestureHandlerRootView>
  </Modal>;
}
const useStyles = makeStyles(c => ({
  modalRoot: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: c.overlay }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, sheet: { width: '100%', maxWidth: 560, maxHeight: '92%', minHeight: '50%', backgroundColor: c.surfaceSecondary, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', borderTopWidth: 1, borderColor: c.border }, handle: { width: 34, height: 4, backgroundColor: c.borderStrong, borderRadius: 3, alignSelf: 'center', marginTop: 12 }, sheetHeader: { paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, closeButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: c.glass, justifyContent: 'center', alignItems: 'center' }, sheetContent: { paddingHorizontal: 22, paddingBottom: 22 }, body: { gap: 18 }, center: { textAlign: 'center' },
  shotWrap: { borderRadius: 28, overflow: 'hidden' }, shareTemplate: { padding: 22, alignItems: 'center', gap: 16, borderRadius: 28, minHeight: 420, justifyContent: 'center', overflow: 'hidden' }, shareShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85 }, verseBox: { gap: 12, alignItems: 'center', paddingVertical: 20 }, statsRow: { flexDirection: 'row', gap: 10 }, statPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: c.glassStrong, alignItems: 'center', minWidth: 76 },
  verseIcon: { width: 78, height: 78, borderRadius: 27, backgroundColor: c.brandSecondary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }, dayRow: { padding: 16, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: c.surface, borderRadius: 17, borderWidth: 1, borderColor: c.border }, widgetPhone: { padding: 22, borderRadius: 32, alignItems: 'center', gap: 10, minHeight: 355, overflow: 'hidden' }, widgetCard: { backgroundColor: c.overlay, padding: 18, borderRadius: 22, gap: 10, alignItems: 'center', marginTop: 14 }, optionsRow: { flexDirection: 'row', gap: 10 },
  toast: { position: 'absolute', bottom: 24, left: 24, right: 24, padding: 16, backgroundColor: c.surfaceInverse, borderRadius: 17, alignSelf: 'center', maxWidth: 500, pointerEvents: 'none' }, toastText: { color: c.onSurfaceInverse, textAlign: 'center' },
}));
