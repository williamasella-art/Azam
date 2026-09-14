import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { AlarmSettingsSheet, AppsSheet, LocationSheet, NotificationSheet } from './FormSheets';
import { DemoOverlay } from './DemoOverlay';
import { Badge, Button, Card, Icon, T, Tap } from './ui';
import { LevelArt } from './illustrations';

export function Toast() {
  const { toast, modal, screen, settings } = useApp(); const s = useStyles(); const insets = useSafeAreaInsets(); if (!toast) return null;
  const aboveTabs = !modal && settings?.onboarded && ['home', 'quran', 'focus', 'progress'].includes(screen);
  return <View testID="app-toast" accessibilityLiveRegion="polite" style={[s.toast, { bottom: (aboveTabs ? 108 : 24) + insets.bottom }]}><T size={12} style={s.toastText}>{toast}</T></View>;
}
function ShareSheet() {
  const { modal, progress, notify } = useApp(); const s = useStyles(); const { colors } = useTheme(); const verse = modal.verse;
  const isVerse = modal.type === 'share-verse'; const completed = modal.type === 'success';
  const title = isVerse ? 'Seayat untuk hati' : completed ? `Alhamdulillah, ${modal.prayer}.` : 'Langkah kecil. Niat besar.';
  const share = async () => {
    const message = isVerse ? `${verse.teksArab}\n\n${verse.teksIndonesia}\nQS. ${verse.surah}: ${verse.nomorAyat}\n\nSeayat untuk hati — Azam` : completed ? `Alhamdulillah, saya telah menunaikan salat ${modal.prayer}. Satu langkah kecil untuk lebih istiqamah.\n\nTemani perjalanan baikmu bersama Azam.` : `${progress.data?.streak || 0} hari istiqamah, ${progress.data?.total || 0} salat tercatat. Bukan sempurna, tetapi terus berusaha.\n\nJejak kebaikan bersama Azam.`;
    try { await Share.share({ message, title }); } catch { notify('Berbagi belum tersedia di perangkat ini.'); }
  };
  return <View style={s.body}>
    <View testID="share-template" style={s.shareTemplate}><Badge text="AZAM · JEJAK KEBAIKAN" icon="sparkles-outline" />{isVerse ? <View style={s.verseIcon}><Icon name="book-outline" size={34} color={colors.onBrandSecondary} /></View> : <LevelArt kind={completed ? 'star' : 'cloud'} size={118} />}<T size={26} weight="800" style={s.center}>{title}</T>
      {isVerse ? <><T arabic size={26} style={s.center}>{verse.teksArab}</T><T size={13} muted style={s.center}>“{verse.teksIndonesia}”</T><T size={11} color={colors.onBrandSecondary}>QS. {verse.surah} : {verse.nomorAyat}</T></> : completed ? <T muted size={13} style={s.center}>Semoga langkah kecil hari ini{"\n"}menjadi kebiasaan baik esok hari.</T> : <><T size={46} weight="800" color={colors.onBrandSecondary}>{progress.data?.streak || 0}<T size={17} color={colors.onBrandSecondary}> hari</T></T><T muted size={13}>Terus merawat niat, satu salat setiap waktu.</T></>}
      <View style={s.shareBrand}><Icon name="moon" size={16} color={colors.brandPrimary} /><T weight="800" size={18}>azam.</T></View>
    </View><Button testID="share-confirm-button" title="Bagikan kebaikan" icon="share-social-outline" onPress={share} /><T size={10} muted style={s.center}>Dibagikan sebagai teks melalui aplikasi pilihanmu.</T>
  </View>;
}
function DaySheet() {
  const { modal, progress, checkin, checking, day } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const names = (modal.date === day ? progress.data?.today : progress.data?.calendar[modal.date]) || [];
  return <View style={s.body}><T size={14} muted>{new Date(`${modal.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</T><T muted size={12}>Ketuk untuk mencatat atau membatalkan catatan salat. Catat sesuai ibadah yang telah ditunaikan.</T>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => <Tap testID={`day-checkin-${name.toLowerCase()}`} disabled={checking} key={name} style={s.dayRow} onPress={() => checkin(name, modal.date)}><Icon name={names.includes(name) ? 'checkmark-circle' : 'ellipse-outline'} color={names.includes(name) ? colors.success : colors.borderStrong} /><T size={16} weight="600" style={{ flex: 1 }}>{name}</T><T size={11} muted>{names.includes(name) ? 'Selesai' : 'Belum dicatat'}</T></Tap>)}</View>;
}
function WidgetPreview() {
  const { daily } = useApp(); const s = useStyles(); const { colors } = useTheme(); const [style, setStyle] = useState(0);
  return <View style={s.body}><Badge text="PRATINJAU DESAIN · BUKAN WIDGET AKTIF" /><T size={12} muted>Lihat tampilan ayat harian. Pemasangan widget layar kunci dan penggantian ikon sistem belum tersedia.</T>
    <View style={[s.widgetPhone, style === 1 && { backgroundColor: colors.brandSecondary }]}><T size={13} color={colors.onBrandSecondary}>Senin, perjalanan yang baru</T><T size={62} weight="700" color={colors.onBrandSecondary}>05.00</T><View style={s.widgetCard}><T size={10} color={colors.onBrandSecondary}>SEAYAT HARI INI</T>{daily.data ? <><T arabic size={23} style={s.center}>{daily.data.teksArab}</T><T size={11} style={s.center}>{daily.data.teksIndonesia}</T><T size={10} color={colors.onBrandSecondary}>QS. {daily.data.surah} : {daily.data.nomorAyat}</T></> : <T muted>Ayat dimuat ketika koneksi tersedia.</T>}</View></View>
    <View style={s.optionsRow}>{['Awan', 'Langit'].map((name, index) => <Button key={name} testID={`widget-style-${index}`} style={{ flex: 1 }} title={name} variant={style === index ? 'primary' : 'secondary'} onPress={() => setStyle(index)} />)}</View>
  </View>;
}
function RakaatPreview() {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.body}><Badge text="KONSEP PRO · BELUM TERSEDIA" /><LevelArt kind="moon" size={110} /><T size={25} weight="800">Fokus pada salatmu.</T><T muted>Penghitungan rakaat otomatis membutuhkan integrasi sensor native dan pengujian posisi perangkat. Versi ini tidak mendeteksi sujud atau menghitung rakaat otomatis.</T><Card><Icon name="information-circle-outline" color={colors.onBrandSecondary} /><T size={12} muted style={{ marginTop: 12 }}>Fitur belum dapat diaktifkan. Jangan mengandalkan pratinjau ini untuk menentukan jumlah rakaat.</T></Card></View>;
}
export function GlobalOverlay() {
  const { modal, setModal, logout } = useApp(); const s = useStyles(); const { colors, scheme } = useTheme(); const insets = useSafeAreaInsets();
  const isDemo = modal?.type === 'blocker' || modal?.type === 'alarm';
  const titles: Record<string, string> = { location: 'Atur lokasi', notifications: 'Pengingat salat', apps: 'Pilih aplikasi', 'alarm-settings': 'Alarm syukur', success: 'Satu langkah baik', 'share-verse': 'Bagikan ayat', 'share-progress': 'Bagikan perjalanan', day: 'Catatan salat', 'widget-preview': 'Ayat di layar kunci', 'rakaat-preview': 'Penghitung rakaat', logout: 'Keluar dari Azam?' };
  // Fully unmount closed portals: stale exit animations must never intercept
  // the next tap or retain sheet scroll state when reopened quickly.
  if (!modal) return null;
  return <Modal key={modal.type} visible transparent={!isDemo} animationType="slide" onRequestClose={() => setModal(null)} statusBarTranslucent>
    <GestureHandlerRootView style={{ flex: 1 }}>{modal && (isDemo ? <DemoOverlay key={modal.type} /> : <KeyboardAvoidingView style={s.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BlurView intensity={20} tint={scheme === 'dark' ? 'dark' : 'light'} style={s.backdrop}><Tap testID="modal-backdrop" onPress={() => setModal(null)} style={{ flex: 1 }}><View /></Tap></BlurView>
      <View style={[s.sheet, { paddingBottom: insets.bottom + 20, marginTop: insets.top + 16 }]}><View style={s.handle} /><View style={s.sheetHeader}><T size={21} weight="800" style={{ flex: 1 }}>{modal.title || titles[modal.type]}</T><Tap testID="modal-close-button" style={s.closeButton} onPress={() => setModal(null)}><Icon name="close" size={23} /></Tap></View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          {modal.type === 'location' && <LocationSheet />}{modal.type === 'notifications' && <NotificationSheet />}{modal.type === 'apps' && <AppsSheet />}{modal.type === 'alarm-settings' && <AlarmSettingsSheet />}
          {['success', 'share-verse', 'share-progress'].includes(modal.type) && <ShareSheet />}{modal.type === 'day' && <DaySheet />}{modal.type === 'widget-preview' && <WidgetPreview />}{modal.type === 'rakaat-preview' && <RakaatPreview />}
          {modal.type === 'info' && <View style={s.body}><View style={s.verseIcon}><Icon name="information-circle-outline" size={35} color={colors.brandPrimary} /></View><T muted size={15}>{modal.message}</T><Button testID="info-dismiss-button" title="Mengerti" onPress={() => setModal(null)} /></View>}
          {modal.type === 'logout' && <View style={s.body}><T muted>Catatan tamu tidak dapat dipulihkan setelah keluar. Jika menggunakan Google, Anda dapat masuk kembali ke akun yang sama.</T><Button testID="logout-confirm-button" title="Ya, keluar" onPress={logout} /><Button testID="logout-cancel-button" title="Tetap di sini" variant="secondary" onPress={() => setModal(null)} /></View>}
        </ScrollView>
      </View><Toast />
    </KeyboardAvoidingView>)}</GestureHandlerRootView>
  </Modal>;
}
const useStyles = makeStyles(c => ({
  modalRoot: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: c.overlay }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, sheet: { width: '100%', maxWidth: 560, maxHeight: '90%', minHeight: '56%', backgroundColor: c.surfaceSecondary, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' }, handle: { width: 34, height: 4, backgroundColor: c.borderStrong, borderRadius: 3, alignSelf: 'center', marginTop: 12 }, sheetHeader: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }, closeButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: c.surfaceTertiary, justifyContent: 'center', alignItems: 'center' }, sheetContent: { paddingHorizontal: 24, paddingBottom: 22 }, body: { gap: 20 }, center: { textAlign: 'center' },
  shareTemplate: { padding: 23, alignItems: 'center', gap: 20, borderRadius: 25, backgroundColor: c.brandSecondary }, shareBrand: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 }, verseIcon: { width: 78, height: 78, borderRadius: 27, backgroundColor: c.brandSecondary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }, dayRow: { padding: 17, minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: c.surface, borderRadius: 17, borderWidth: 1, borderColor: c.border }, widgetPhone: { padding: 23, borderRadius: 35, backgroundColor: c.skyTop, alignItems: 'center', gap: 10, borderWidth: 5, borderColor: c.borderStrong, minHeight: 355 }, widgetCard: { backgroundColor: c.glass, padding: 18, borderRadius: 23, gap: 10, alignItems: 'center', marginTop: 15 }, optionsRow: { flexDirection: 'row', gap: 12 },
  toast: { position: 'absolute', bottom: 24, left: 24, right: 24, padding: 16, backgroundColor: c.surfaceInverse, borderRadius: 17, alignSelf: 'center', maxWidth: 500, pointerEvents: 'none' }, toastText: { color: c.onSurfaceInverse, textAlign: 'center' },
}));