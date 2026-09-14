import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Linking, Platform, ScrollView, Share, Switch, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG, LEVEL_COPY } from '@/src/assets';
import { Badge, Button, Icon, Logo, T, Tap } from './ui';
import { LevelBadge } from './LevelBadge';
import { PulseFlame, SkyLife } from './SkyLife';

const TEMPLATES = [
  { key: 'langit', label: 'Langit', image: IMG.shareBg }, { key: 'burung', label: 'Burung', image: IMG.heroBirds },
  { key: 'tenang', label: 'Tenang', image: IMG.welcome }, { key: 'haji', label: 'Ka’bah', image: IMG.hajj },
];
/** Rotates daily: the default caption changes every day so stories never look the same twice. */
export const CAPTIONS = ['Bukan sempurna, tetap berusaha', 'Istiqamah dulu, viral belakangan', 'Jeda sejenak, dekat kembali', 'Alhamdulillah, satu hari lagi', 'Sibuk boleh, salat jangan tertunda', 'Lima waktu, satu tujuan', 'Tenang itu pilihan, salat itu jalannya', 'Hari ini aku menang dari malas', 'Pelan-pelan, yang penting terus', 'Dunia menunggu, Allah lebih dulu', 'Satu sujud lebih berarti dari seribu scroll', 'Konsisten kecil, dampak besar', 'Bismillah, lanjut lagi besok', 'Jaga salat, salat menjagamu'];
const dayIndex = (d = new Date()) => Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

/** Interactive 9:16 story composer: template or own photo (background / centre), tint, caption, date, daily verse, stats, then share. */
export function ShareComposer() {
  const { modal, progress, notify, user, settings, daily, prayers } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { width } = useWindowDimensions();
  const shot = useRef<any>(null); const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState(0); const [tint, setTint] = useState(0); const [caption, setCaption] = useState(dayIndex() % CAPTIONS.length);
  const [showStats, setShowStats] = useState(true); const [showName, setShowName] = useState(true); const [showVerse, setShowVerse] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null); const [photoMode, setPhotoMode] = useState<'bg' | 'center'>('center'); const [blocked, setBlocked] = useState(false);
  const verse = modal.verse; const isVerse = modal.type === 'share-verse'; const completed = modal.type === 'success'; const isBadge = modal.type === 'share-badge'; const badge = modal.level;
  const level = progress.data?.levels?.filter((l: any) => l.unlocked).at(-1); const streak = progress.data?.streak || 0;
  const title = isVerse ? 'Seayat untuk hati' : completed ? `Alhamdulillah, ${modal.prayer}.` : isBadge ? `Lencana ${badge.name} tercapai` : `${streak} hari streak salat`;
  const today = new Date(); const dateLabel = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hijri = prayers.data?.hijri ? `${prayers.data.hijri.day} ${prayers.data.hijri.month.en} ${prayers.data.hijri.year} H` : '';
  const dailyVerse = daily.data; const verseSnippet = dailyVerse ? `“${dailyVerse.teksIndonesia.length > 110 ? dailyVerse.teksIndonesia.slice(0, 108).trim() + '…' : dailyVerse.teksIndonesia}”` : '';
  const message = isVerse ? `${verse.teksArab}\n${verse.teksLatin ? verse.teksLatin + '\n' : ''}\n${verse.teksIndonesia}\nQS. ${verse.surah}: ${verse.nomorAyat}\n\nSeayat untuk hati — Azam`
    : isBadge ? `Alhamdulillah, lencana ${badge.name} tercapai 🌙 ${badge.days} hari berturut-turut salat lengkap.\n${LEVEL_COPY[badge.name]}\n${CAPTIONS[caption]}.\n${dateLabel}\n\n#AzamAppBlocker`
      : `${title} 🔥 ${progress.data?.total || 0} salat tercatat${level ? ` · Level ${level.name}` : ''}.\n${CAPTIONS[caption]}.\n${dateLabel}${showVerse && dailyVerse ? `\n${verseSnippet} (QS. ${dailyVerse.surah}: ${dailyVerse.nomorAyat})` : ''}\n\n#AzamAppBlocker`;
  const cardWidth = Math.min(width, 560) - 44; const cardHeight = Math.round(cardWidth * 16 / 9);
  const gradients = [[colors.transparent, colors.overlay], [colors.brandDeep, colors.heroShade], [colors.gold, colors.heroShade]];
  useEffect(() => { if (isVerse) setPhotoMode('bg'); }, [isVerse]);
  const pick = async (camera: boolean) => {
    try {
      const ask = camera ? ImagePicker.requestCameraPermissionsAsync : ImagePicker.requestMediaLibraryPermissionsAsync;
      const check = camera ? ImagePicker.getCameraPermissionsAsync : ImagePicker.getMediaLibraryPermissionsAsync;
      if (Platform.OS !== 'web') {
        let permission = await check();
        if (!permission.granted && permission.canAskAgain) permission = await ask();
        if (!permission.granted) { setBlocked(!permission.canAskAgain); notify(camera ? 'Izin kamera diperlukan untuk selfie.' : 'Izin galeri diperlukan untuk memilih foto.'); return; }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: photoMode === 'bg' ? [9, 16] : [3, 4], quality: 0.85 };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) { setPhoto(result.assets[0].uri); setBlocked(false); }
    } catch { notify(camera ? 'Kamera belum tersedia di perangkat ini.' : 'Foto belum bisa dipilih.'); }
  };
  const share = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && shot.current && await Sharing.isAvailableAsync()) {
        const uri = await shot.current.capture();
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: title, UTI: 'public.png' });
      } else await Share.share({ message, title });
    } catch { notify('Berbagi belum tersedia di perangkat ini.'); } finally { setBusy(false); }
  };
  const useBg = photo && photoMode === 'bg'; const centerPhoto = photo && photoMode === 'center';
  const heroSize = isBadge ? 150 : 128;
  return <View style={s.body}>
    <ViewShot ref={shot} options={{ format: 'png', quality: 1 }} style={s.shotWrap}>
      <Animated.View key={`${template}-${tint}-${useBg ? 'p' : 't'}`} entering={ZoomIn.duration(300)}>
        <ImageBackground source={useBg ? { uri: photo } : TEMPLATES[template].image} style={[s.card, { width: cardWidth, height: cardHeight }]} imageStyle={{ borderRadius: 28 }} testID="share-template">
          <LinearGradient colors={gradients[tint] as any} style={[s.shade, useBg && { opacity: 0.55 }]} />
          {!useBg && <SkyLife width={cardWidth} height={cardHeight} birds={2} stars={7} />}
          <View style={s.cardTop}><Logo size={28} wordmark color={colors.heroInk} /><Badge text={isVerse ? 'SEAYAT' : completed ? 'SALAT TERCATAT' : isBadge ? `LENCANA ${badge.name.toUpperCase()}` : `LEVEL ${(level?.name || 'PEMULA').toUpperCase()}`} gold light /></View>
          <View style={s.middle}>
            {centerPhoto && <View style={s.photoFrame} testID="share-photo-center"><Image source={{ uri: photo }} style={s.photo} /><View style={s.photoRing} /></View>}
            {isVerse ? <View style={s.verseBox}><T arabic size={26} color={colors.heroInk} style={s.center}>{verse.teksArab}</T>{verse.teksLatin && <T size={11} weight="600" color={colors.gold} style={s.center}>{verse.teksLatin}</T>}<T size={13} color={colors.heroMuted} style={s.center}>“{verse.teksIndonesia}”</T><Badge text={`QS. ${verse.surah} : ${verse.nomorAyat}`} gold light /></View>
              : isBadge ? <View style={s.streakBox} testID="share-badge-box">
                {!centerPhoto && <LevelBadge name={badge.name} size={heroSize} />}
                <T size={12} weight="700" color={colors.gold} style={{ letterSpacing: 1.2 }}>MASYA ALLAH</T>
                <T testID="share-badge-title" size={32} weight="800" color={colors.heroInk} style={{ letterSpacing: -1, lineHeight: 38 }}>Level {badge.name}</T>
                <T size={12} color={colors.heroMuted} style={[s.center, { paddingHorizontal: 8, lineHeight: 18 }]}>{LEVEL_COPY[badge.name]}</T>
                <View style={s.statPill}><T size={16} weight="800" color={colors.heroInk}>{badge.days} hari</T><T size={9} color={colors.heroMuted}>berturut-turut</T></View>
              </View>
              : <View style={s.streakBox}>
                {!centerPhoto && <LevelBadge name={completed ? 'Bintang' : level?.name || 'Awan'} size={heroSize} locked={!completed && !level} />}
                <View style={s.streakRow}><PulseFlame size={30} color={colors.gold} /><T testID="share-streak-count" size={54} weight="800" color={colors.heroInk} style={{ letterSpacing: -2, lineHeight: 60 }}>{completed ? modal.prayer : streak}</T></View>
                <T size={16} weight="700" color={colors.heroInk}>{completed ? 'Alhamdulillah, tercatat.' : 'hari streak salat'}</T>
                {showStats && !completed && <Animated.View entering={FadeIn} style={s.statsRow}>{[[progress.data?.total || 0, 'salat'], [progress.data?.best || 0, 'terbaik'], [progress.data?.complete_days || 0, 'lengkap']].map(([v, l]) => <View key={String(l)} style={s.statPill}><T size={18} weight="800" color={colors.heroInk}>{v}</T><T size={9} color={colors.heroMuted}>{l}</T></View>)}</Animated.View>}
              </View>}
            {!isVerse && showVerse && dailyVerse && <View style={s.verseStrip} testID="share-daily-verse"><T size={11} color={colors.heroMuted} style={[s.center, { lineHeight: 16 }]}>{verseSnippet}</T><T size={9} weight="700" color={colors.gold}>QS. {dailyVerse.surah} : {dailyVerse.nomorAyat}</T></View>}
          </View>
          <View style={s.cardBottom}><T size={13} weight="700" color={colors.heroInk} style={s.center}>{CAPTIONS[caption]}</T>
            <View style={s.dateRow}><Icon name="calendar-clear-outline" size={11} color={colors.heroMuted} /><T testID="share-date" size={10} color={colors.heroMuted}>{dateLabel}{hijri ? ` · ${hijri}` : ''}</T></View>
            {showName && !isVerse && <T size={10} color={colors.heroMuted}>{user?.guest ? 'Sahabat Azam' : user?.name} · {settings?.city}</T>}<T size={9} color={colors.heroMuted}>#AzamAppBlocker</T></View>
        </ImageBackground>
      </Animated.View>
    </ViewShot>
    <View style={s.group}><View style={s.rowBetween}><T size={12} weight="700">Foto sendiri</T>{photo && <Tap testID="share-photo-remove" onPress={() => setPhoto(null)} style={s.textBtn}><Icon name="close-circle" size={14} color={colors.muted} /><T size={11} color={colors.muted}>Hapus foto</T></Tap>}</View>
      <View style={s.optionsRow}><Button size="sm" testID="share-photo-camera" style={{ flex: 1 }} title="Selfie" icon="camera-outline" variant="secondary" onPress={() => pick(true)} disabled={Platform.OS === 'web'} /><Button size="sm" testID="share-photo-gallery" style={{ flex: 1 }} title="Galeri" icon="images-outline" variant="secondary" onPress={() => pick(false)} /></View>
      {blocked && <Button size="sm" testID="share-photo-settings" title="Buka Pengaturan izin" variant="secondary" onPress={() => Linking.openSettings()} />}
      {photo && !isVerse && <View style={s.optionsRow}>{[['center', 'Di tengah', 'person-circle-outline'], ['bg', 'Jadi latar', 'image-outline']].map(([key, label, icon]) => <Tap key={key} testID={`share-photo-mode-${key}`} onPress={() => setPhotoMode(key as any)} style={[s.chip, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }, photoMode === key && s.chipOn]}><Icon name={icon} size={14} color={photoMode === key ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><T size={11} weight="600" color={photoMode === key ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{label}</T></Tap>)}</View>}
      <T size={10} muted>{Platform.OS === 'web' ? 'Selfie kamera tersedia di ponsel; di web pilih dari galeri.' : 'Selfie atau foto galeri bisa ditempatkan di tengah kartu atau menjadi latar penuh.'}</T></View>
    <View style={s.group}><T size={12} weight="700">Latar template</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{TEMPLATES.map((item, i) => <Tap key={item.key} testID={`share-template-${item.key}`} onPress={() => { setTemplate(i); if (photoMode === 'bg') setPhotoMode('center'); }} style={[s.thumb, template === i && !useBg && s.thumbOn]} accessibilityState={{ selected: template === i }}><Image source={item.image} style={s.thumbImage} /><T size={9} weight="700" color={colors.white}>{item.label}</T></Tap>)}</ScrollView></View></View>
    <View style={s.group}><T size={12} weight="700">Nuansa</T><View style={s.optionsRow}>{['Langit', 'Biru', 'Emas'].map((name, i) => <Button key={name} size="sm" testID={`share-style-${i}`} style={{ flex: 1 }} title={name} variant={tint === i ? (i === 2 ? 'gold' : 'primary') : 'secondary'} onPress={() => setTint(i)} />)}</View></View>
    <View style={s.group}><View style={s.rowBetween}><T size={12} weight="700">Caption hari ini</T><Tap testID="share-caption-shuffle" onPress={() => setCaption(c => (c + 1) % CAPTIONS.length)} style={s.textBtn}><Icon name="shuffle" size={14} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>Ganti</T></Tap></View><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{CAPTIONS.map((text, i) => <Tap key={text} testID={`share-caption-${i}`} onPress={() => setCaption(i)} style={[s.chip, caption === i && s.chipOn]}><T size={11} weight="600" color={caption === i ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{text}</T></Tap>)}</ScrollView></View></View>
    {!isVerse && <View style={s.switchRow}>{!isBadge && <View style={s.switchItem}><T size={12}>Statistik</T><Switch testID="share-stats-switch" value={showStats} onValueChange={setShowStats} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>}<View style={s.switchItem}><T size={12}>Nama & kota</T><Switch testID="share-name-switch" value={showName} onValueChange={setShowName} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View><View style={s.switchItem}><T size={12}>Ayat</T><Switch testID="share-verse-switch" value={showVerse} onValueChange={setShowVerse} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View></View>}
    <Button testID="share-confirm-button" title={Platform.OS === 'web' ? 'Bagikan sebagai teks' : 'Bagikan ke Story / WhatsApp'} icon="share-social" loading={busy} onPress={share} variant="gold" />
    <View style={s.hint}><Icon name="information-circle-outline" size={14} color={colors.muted} /><T size={10} muted style={{ flex: 1 }}>{Platform.OS === 'web' ? 'Di ponsel, kartu ini dibagikan sebagai gambar story vertikal 9:16.' : 'Kartu story 9:16 dibagikan sebagai gambar ke aplikasi pilihanmu.'}</T></View>
  </View>;
}
const useStyles = makeStyles(c => ({
  body: { gap: 16 }, center: { textAlign: 'center' }, shotWrap: { borderRadius: 28, overflow: 'hidden', alignSelf: 'center' },
  card: { borderRadius: 28, overflow: 'hidden', padding: 22, justifyContent: 'space-between', backgroundColor: c.heroShade }, shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, middle: { alignItems: 'center', gap: 14 }, cardBottom: { alignItems: 'center', gap: 5 }, dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  photoFrame: { width: '58%', aspectRatio: 3 / 4, borderRadius: 26, overflow: 'hidden', backgroundColor: c.overlay }, photo: { width: '100%', height: '100%' }, photoRing: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26, borderWidth: 3, borderColor: c.gold },
  verseBox: { gap: 14, alignItems: 'center', paddingVertical: 12 }, streakBox: { alignItems: 'center', gap: 8 }, streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verseStrip: { alignItems: 'center', gap: 3, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: c.overlay, alignSelf: 'stretch' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 6 }, statPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: c.overlay, alignItems: 'center', minWidth: 70 },
  group: { gap: 8 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, textBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, paddingHorizontal: 6 },
  chipRow: { height: 56, flexShrink: 0, marginVertical: -8 }, chips: { gap: 8, alignItems: 'center' },
  thumb: { width: 72, height: 44, flexShrink: 0, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: c.heroShade }, thumbOn: { borderColor: c.brandPrimary }, thumbImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.8 },
  chip: { height: 36, flexShrink: 0, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, chipOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  optionsRow: { flexDirection: 'row', gap: 10 }, switchRow: { flexDirection: 'row', gap: 8 }, switchItem: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  hint: { flexDirection: 'row', gap: 6, alignItems: 'center' },
}));
