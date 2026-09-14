import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApp } from '@/src/AppContext';
import { fontFor, makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { AddAppSheet, AlarmFormSheet, LocationSheet, NotificationSheet } from './FormSheets';
import { AmbientCard } from './AmbientCard';
import { AdhanSheet } from './AdhanPlayer';
import { DemoOverlay } from './DemoOverlay';
import { Badge, Button, Card, Icon, T, Tap } from './ui';
import { LevelBadge } from './LevelBadge';
import { ShareComposer } from './ShareComposer';
import { LevelUpOverlay } from './LevelUp';
import { LANGUAGES, useI18n } from '@/src/i18n';
import { api } from '@/src/api';

const STRINGS_ID_MODAL: Record<string, true> = { location: true, notifications: true, 'alarm-form': true, success: true, 'share-verse': true, 'share-progress': true, 'share-badge': true, day: true, ambient: true, adhan: true, 'add-app': true, 'widget-preview': true, 'rakaat-preview': true, logout: true, language: true, profile: true };

function LanguageSheet() {
  const { settings, updateSettings, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { t } = useI18n();
  const current = settings?.language || 'id';
  return <View style={s.body} testID="language-sheet"><T muted size={13}>{t('language.hint')}</T>
    {LANGUAGES.map(l => <Tap key={l.key} testID={`language-option-${l.key}`} style={[s.dayRow, current === l.key && { borderColor: colors.brandPrimary, backgroundColor: colors.brandSecondary }]} onPress={async () => { if (await updateSettings({ language: l.key })) setModal(null); }}>
      <View style={s.flag}><T size={11} weight="800" color={colors.onBrandSecondary}>{l.flag}</T></View><View style={{ flex: 1 }}><T size={16} weight="700">{l.native}</T><T size={11} muted>{l.label}</T></View><Icon name={current === l.key ? 'radio-button-on' : 'radio-button-off'} color={current === l.key ? colors.brandPrimary : colors.borderStrong} />
    </Tap>)}
  </View>;
}
function ProfileSheet() {
  const { user, setUser, setModal, notify } = useApp(); const s = useStyles(); const { t } = useI18n();
  const [name, setName] = useState(user.name); const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim()) return; setSaving(true);
    try { setUser(await api('/profile', { name: name.trim() }, 'PUT')); setModal(null); } catch (e: any) { notify(e.message); } finally { setSaving(false); }
  };
  return <View style={s.body} testID="profile-sheet"><T muted size={13}>{t('settings.editName')}</T>
    <TextInput testID="profile-name-input" value={name} onChangeText={setName} maxLength={60} style={s.input} placeholder={t('settings.editName')} returnKeyType="done" onSubmitEditing={save} autoFocus />
    <Button testID="profile-save-button" title={t('common.save')} icon="checkmark" loading={saving} disabled={!name.trim()} onPress={save} />
  </View>;
}

export function Toast() {
  const { toast, modal, screen, settings } = useApp(); const s = useStyles(); const insets = useSafeAreaInsets(); if (!toast) return null;
  const aboveTabs = !modal && settings?.onboarded && ['home', 'qibla', 'quran', 'focus', 'progress'].includes(screen);
  return <View testID="app-toast" accessibilityLiveRegion="polite" style={[s.toast, { bottom: (aboveTabs ? 100 : 24) + insets.bottom }]}><T size={12} style={s.toastText}>{toast}</T></View>;
}
function DaySheet() {
  const { modal, progress, checkin, checking, day } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const names = (modal.date === day ? progress.data?.today : progress.data?.calendar[modal.date]) || [];
  return <View style={s.body}><T size={14} muted>{new Date(`${modal.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</T><T muted size={12}>Ketuk untuk mencatat atau membatalkan catatan salat.</T>{['Subuh', 'Zuhur', 'Asar', 'Magrib', 'Isya'].map(name => <Tap testID={`day-checkin-${name.toLowerCase()}`} disabled={checking} key={name} style={s.dayRow} onPress={() => checkin(name, modal.date)}><Icon name={names.includes(name) ? 'checkmark-circle' : 'ellipse-outline'} color={names.includes(name) ? colors.success : colors.borderStrong} /><T size={16} weight="600" style={{ flex: 1 }}>{name}</T><T size={11} muted>{names.includes(name) ? 'Selesai' : 'Belum dicatat'}</T></Tap>)}</View>;
}
function WidgetPreview() {
  const { daily } = useApp(); const s = useStyles(); const { colors } = useTheme(); const [style, setStyle] = useState(0);
  return <View style={s.body}><Badge text={Platform.OS === 'web' ? 'PRATINJAU DESAIN · WIDGET AKTIF DI BUILD NATIVE' : 'WIDGET LAYAR KUNCI & BERANDA'} gold={Platform.OS !== 'web'} /><T size={12} muted>{Platform.OS === 'web' ? 'Widget ayat harian dan hitung mundur azan tersedia setelah aplikasi dipasang dari build iOS/Android. Di Expo Go dan web, ini pratinjau desainnya.' : 'Tahan layar beranda atau layar kunci → tambah widget → pilih “Azam”. Ada dua pilihan: Seayat hari ini dan Hitung mundur azan. Data diperbarui setiap kali Azam dibuka.'}</T>
    <ImageBackground source={style === 1 ? IMG.heroBirds : IMG.shareBg} style={s.widgetPhone} imageStyle={{ borderRadius: 32 }}><T size={13} color={colors.heroMuted}>Senin, perjalanan yang baru</T><T size={60} weight="700" color={colors.heroInk}>05.00</T><View style={s.widgetCard}><T size={10} color={colors.heroMuted}>SEAYAT HARI INI</T>{daily.data ? <><T arabic size={22} color={colors.heroInk} style={s.center}>{daily.data.teksArab}</T><T size={11} color={colors.heroMuted} style={s.center}>{daily.data.teksIndonesia}</T><T size={10} color={colors.gold}>QS. {daily.data.surah} : {daily.data.nomorAyat}</T></> : <T muted>Ayat dimuat ketika koneksi tersedia.</T>}</View></ImageBackground>
    <View style={s.optionsRow}>{['Langit', 'Burung'].map((name, index) => <Button key={name} testID={`widget-style-${index}`} style={{ flex: 1 }} title={name} variant={style === index ? 'primary' : 'secondary'} onPress={() => setStyle(index)} />)}</View>
  </View>;
}
function RakaatPreview() {
  const s = useStyles(); const { colors } = useTheme();
  return <View style={s.body}><Badge text="KONSEP PRO · BELUM TERSEDIA" gold /><LevelBadge name="Purnama" size={110} style={{ alignSelf: 'center' }} /><T size={24} weight="800">Fokus pada salatmu.</T><T muted>Penghitungan rakaat otomatis membutuhkan integrasi sensor native dan pengujian posisi perangkat. Versi ini tidak mendeteksi sujud atau menghitung rakaat otomatis.</T><Card><Icon name="information-circle-outline" color={colors.onBrandSecondary} /><T size={12} muted style={{ marginTop: 12 }}>Fitur belum dapat diaktifkan. Jangan mengandalkan pratinjau ini untuk menentukan jumlah rakaat.</T></Card></View>;
}
export function GlobalOverlay() {
  const { modal, setModal, logout } = useApp(); const s = useStyles(); const { colors } = useTheme(); const insets = useSafeAreaInsets(); const { t } = useI18n();
  const isDemo = modal?.type === 'blocker' || modal?.type === 'alarm' || modal?.type === 'levelup';
  const modalTitle = modal ? (modal.title || (modal.type in STRINGS_ID_MODAL ? t(`modal.${modal.type}` as any) : '')) : '';
  if (!modal) return null;
  return <Modal key={modal.type} visible transparent={!isDemo} animationType="slide" onRequestClose={() => setModal(null)} statusBarTranslucent>
    <GestureHandlerRootView style={{ flex: 1 }}>{modal && (isDemo ? (modal.type === 'levelup' ? <LevelUpOverlay /> : <DemoOverlay key={modal.type} />) : <KeyboardAvoidingView style={s.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Tap testID="modal-backdrop" onPress={() => setModal(null)} style={s.backdrop}><View /></Tap>
      <View style={[s.sheet, { paddingBottom: insets.bottom + 20, marginTop: insets.top + 16 }]}><View style={s.handle} /><View style={s.sheetHeader}><T size={20} weight="800" style={{ flex: 1 }}>{modalTitle}</T><Tap testID="modal-close-button" style={s.closeButton} onPress={() => setModal(null)}><Icon name="close" size={22} /></Tap></View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          {modal.type === 'location' && <LocationSheet />}{modal.type === 'notifications' && <NotificationSheet />}{modal.type === 'alarm-form' && <AlarmFormSheet />}{modal.type === 'ambient' && <AmbientCard />}{modal.type === 'adhan' && <AdhanSheet />}{modal.type === 'add-app' && <AddAppSheet />}
          {['success', 'share-verse', 'share-progress', 'share-badge'].includes(modal.type) && <ShareComposer />}{modal.type === 'day' && <DaySheet />}{modal.type === 'widget-preview' && <WidgetPreview />}{modal.type === 'rakaat-preview' && <RakaatPreview />}
          {modal.type === 'language' && <LanguageSheet />}{modal.type === 'profile' && <ProfileSheet />}
          {modal.type === 'info' && <View style={s.body}><View style={s.verseIcon}><Icon name="information-circle-outline" size={35} color={colors.brandTertiary} /></View><T muted size={15}>{modal.message}</T>{modal.action && <Button testID="info-action-button" title={modal.actionTitle} icon="open-outline" variant="secondary" onPress={() => { setModal(null); modal.action(); }} />}<Button testID="info-dismiss-button" title={t('common.ok')} onPress={() => setModal(null)} /></View>}
          {modal.type === 'logout' && <View style={s.body}><T muted>Catatan tamu tidak dapat dipulihkan setelah keluar. Jika menggunakan Google, Anda dapat masuk kembali ke akun yang sama.</T><Button testID="logout-confirm-button" title="Ya, keluar" variant="danger" onPress={logout} /><Button testID="logout-cancel-button" title="Tetap di sini" variant="secondary" onPress={() => setModal(null)} /></View>}
        </ScrollView>
      </View><Toast />
    </KeyboardAvoidingView>)}</GestureHandlerRootView>
  </Modal>;
}
const useStyles = makeStyles(c => ({
  modalRoot: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: c.overlay }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, sheet: { width: '100%', maxWidth: 560, maxHeight: '92%', minHeight: '50%', backgroundColor: c.surfaceSecondary, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', borderTopWidth: 1, borderColor: c.border }, handle: { width: 34, height: 4, backgroundColor: c.borderStrong, borderRadius: 3, alignSelf: 'center', marginTop: 12 }, sheetHeader: { paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, closeButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: c.glass, justifyContent: 'center', alignItems: 'center' }, sheetContent: { paddingHorizontal: 22, paddingBottom: 22 }, body: { gap: 18 }, center: { textAlign: 'center' },
  verseIcon: { width: 78, height: 78, borderRadius: 27, backgroundColor: c.brandSecondary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }, dayRow: { padding: 16, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: c.surface, borderRadius: 17, borderWidth: 1, borderColor: c.border }, widgetPhone: { padding: 22, borderRadius: 32, alignItems: 'center', gap: 10, minHeight: 355, overflow: 'hidden' }, widgetCard: { backgroundColor: c.overlay, padding: 18, borderRadius: 22, gap: 10, alignItems: 'center', marginTop: 14 }, optionsRow: { flexDirection: 'row', gap: 10 },
  toast: { position: 'absolute', bottom: 24, left: 24, right: 24, padding: 16, backgroundColor: c.surfaceInverse, borderRadius: 17, alignSelf: 'center', maxWidth: 500, pointerEvents: 'none' }, toastText: { color: c.onSurfaceInverse, textAlign: 'center' },
  flag: { width: 40, height: 40, borderRadius: 13, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: 15, height: 51, paddingHorizontal: 15, fontFamily: fontFor('500'), fontSize: 14, color: c.onSurface, backgroundColor: c.surface, outlineWidth: 0 },
}));
