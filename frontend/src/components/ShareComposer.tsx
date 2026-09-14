import React, { useRef, useState } from 'react';
import { Image, ImageBackground, Platform, ScrollView, Share, Switch, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Button, Icon, Logo, T, Tap } from './ui';
import { LevelBadge } from '@/src/screens/Progress';
import { PulseFlame, SkyLife } from './SkyLife';

const TEMPLATES = [
  { key: 'langit', label: 'Langit', image: IMG.shareBg }, { key: 'burung', label: 'Burung', image: IMG.heroBirds },
  { key: 'tenang', label: 'Tenang', image: IMG.welcome }, { key: 'haji', label: 'Ka’bah', image: IMG.hajj },
];
const CAPTIONS = ['Bukan sempurna, tetap berusaha', 'Istiqamah dulu, viral belakangan', 'Jeda sejenak, dekat kembali', 'Alhamdulillah, satu hari lagi'];

/** Interactive story composer: background, tint, caption, stats, then share as image (native) or text (web). */
export function ShareComposer() {
  const { modal, progress, notify, user, settings } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { width } = useWindowDimensions();
  const shot = useRef<any>(null); const [busy, setBusy] = useState(false);
  const [template, setTemplate] = useState(0); const [tint, setTint] = useState(0); const [caption, setCaption] = useState(0); const [showStats, setShowStats] = useState(true); const [showName, setShowName] = useState(true);
  const verse = modal.verse; const isVerse = modal.type === 'share-verse'; const completed = modal.type === 'success';
  const level = progress.data?.levels?.filter((l: any) => l.unlocked).at(-1); const streak = progress.data?.streak || 0;
  const title = isVerse ? 'Seayat untuk hati' : completed ? `Alhamdulillah, ${modal.prayer}.` : `${streak} hari streak salat`;
  const message = isVerse ? `${verse.teksArab}\n\n${verse.teksIndonesia}\nQS. ${verse.surah}: ${verse.nomorAyat}\n\nSeayat untuk hati — Azam` : `${title} 🔥 ${progress.data?.total || 0} salat tercatat${level ? ` · Level ${level.name}` : ''}.\n${CAPTIONS[caption]}.\n\n#AzamAppBlocker`;
  const cardWidth = Math.min(width, 560) - 44; const cardHeight = Math.round(cardWidth * 1.3);
  const gradients = [[colors.transparent, colors.overlay], [colors.brandDeep, colors.pageTop], [colors.gold, colors.pageTop]];
  const share = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && shot.current && await Sharing.isAvailableAsync()) {
        const uri = await shot.current.capture();
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: title, UTI: 'public.png' });
      } else await Share.share({ message, title });
    } catch { notify('Berbagi belum tersedia di perangkat ini.'); } finally { setBusy(false); }
  };
  return <View style={s.body}>
    <ViewShot ref={shot} options={{ format: 'png', quality: 1 }} style={s.shotWrap}>
      <Animated.View key={`${template}-${tint}`} entering={ZoomIn.duration(320)}>
        <ImageBackground source={TEMPLATES[template].image} style={[s.card, { width: cardWidth, height: cardHeight }]} imageStyle={{ borderRadius: 28 }} testID="share-template">
          <LinearGradient colors={gradients[tint] as any} style={s.shade} />
          <SkyLife width={cardWidth} height={cardHeight} birds={2} stars={7} />
          <View style={s.cardTop}><Logo size={28} wordmark /><Badge text={isVerse ? 'SEAYAT' : completed ? 'SALAT TERCATAT' : `LEVEL ${(level?.name || 'PEMULA').toUpperCase()}`} gold /></View>
          {isVerse ? <View style={s.verseBox}><T arabic size={24} color={colors.heroInk} style={s.center}>{verse.teksArab}</T><T size={12} color={colors.heroMuted} style={s.center}>“{verse.teksIndonesia}”</T><Badge text={`QS. ${verse.surah} : ${verse.nomorAyat}`} gold /></View>
            : <View style={s.streakBox}>
              <LevelBadge name={completed ? 'Bintang' : level?.name || 'Awan'} size={124} locked={!completed && !level} />
              <View style={s.streakRow}><PulseFlame size={30} color={colors.gold} /><T testID="share-streak-count" size={54} weight="800" color={colors.heroInk} style={{ letterSpacing: -2, lineHeight: 60 }}>{completed ? modal.prayer : streak}</T></View>
              <T size={16} weight="700" color={colors.heroInk}>{completed ? 'Alhamdulillah, tercatat.' : 'hari streak salat'}</T>
              {showStats && !completed && <Animated.View entering={FadeIn} style={s.statsRow}>{[[progress.data?.total || 0, 'salat'], [progress.data?.best || 0, 'terbaik'], [progress.data?.complete_days || 0, 'lengkap']].map(([v, l]) => <View key={String(l)} style={s.statPill}><T size={18} weight="800" color={colors.heroInk}>{v}</T><T size={9} color={colors.heroMuted}>{l}</T></View>)}</Animated.View>}
            </View>}
          <View style={s.cardBottom}><T size={13} weight="700" color={colors.heroInk} style={s.center}>{CAPTIONS[caption]}</T>{showName && !isVerse && <T size={10} color={colors.heroMuted}>{user?.guest ? 'Sahabat Azam' : user?.name} · {settings?.city}</T>}<T size={9} color={colors.heroMuted}>#AzamAppBlocker</T></View>
        </ImageBackground>
      </Animated.View>
    </ViewShot>
    <View style={s.group}><T size={12} weight="700">Latar</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{TEMPLATES.map((item, i) => <Tap key={item.key} testID={`share-template-${item.key}`} onPress={() => setTemplate(i)} style={[s.thumb, template === i && s.thumbOn]} accessibilityState={{ selected: template === i }}><Image source={item.image} style={s.thumbImage} /><T size={9} weight="700" color={template === i ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{item.label}</T></Tap>)}</ScrollView></View></View>
    <View style={s.group}><T size={12} weight="700">Nuansa</T><View style={s.optionsRow}>{['Langit', 'Biru', 'Emas'].map((name, i) => <Button key={name} size="sm" testID={`share-style-${i}`} style={{ flex: 1 }} title={name} variant={tint === i ? (i === 2 ? 'gold' : 'primary') : 'secondary'} onPress={() => setTint(i)} />)}</View></View>
    <View style={s.group}><T size={12} weight="700">Caption</T><View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{CAPTIONS.map((text, i) => <Tap key={text} testID={`share-caption-${i}`} onPress={() => setCaption(i)} style={[s.chip, caption === i && s.chipOn]}><T size={11} weight="600" color={caption === i ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{text}</T></Tap>)}</ScrollView></View></View>
    {!isVerse && <View style={s.switchRow}><View style={s.switchItem}><T size={12}>Tampilkan statistik</T><Switch testID="share-stats-switch" value={showStats} onValueChange={setShowStats} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View><View style={s.switchItem}><T size={12}>Nama & kota</T><Switch testID="share-name-switch" value={showName} onValueChange={setShowName} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View></View>}
    <Button testID="share-confirm-button" title={Platform.OS === 'web' ? 'Bagikan sebagai teks' : 'Bagikan ke Story / WhatsApp'} icon="share-social" loading={busy} onPress={share} variant="gold" />
    <View style={s.hint}><Icon name="information-circle-outline" size={14} color={colors.muted} /><T size={10} muted style={{ flex: 1 }}>{Platform.OS === 'web' ? 'Di ponsel, kartu ini dibagikan sebagai gambar story 4:5.' : 'Kartu dibagikan sebagai gambar ke aplikasi pilihanmu.'}</T></View>
  </View>;
}
const useStyles = makeStyles(c => ({
  body: { gap: 16 }, center: { textAlign: 'center' }, shotWrap: { borderRadius: 28, overflow: 'hidden', alignSelf: 'center' },
  card: { borderRadius: 28, overflow: 'hidden', padding: 20, justifyContent: 'space-between' }, shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardBottom: { alignItems: 'center', gap: 4 },
  verseBox: { gap: 12, alignItems: 'center', paddingVertical: 12 }, streakBox: { alignItems: 'center', gap: 6 }, streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 6 }, statPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: c.glassStrong, alignItems: 'center', minWidth: 70 },
  group: { gap: 8 }, chipRow: { height: 56, flexShrink: 0, marginVertical: -8 }, chips: { gap: 8, alignItems: 'center' },
  thumb: { width: 72, height: 44, flexShrink: 0, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: c.glass }, thumbOn: { borderColor: c.brandPrimary }, thumbImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.75 },
  chip: { height: 36, flexShrink: 0, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 12, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, chipOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  optionsRow: { flexDirection: 'row', gap: 10 }, switchRow: { flexDirection: 'row', gap: 10 }, switchItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 12, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  hint: { flexDirection: 'row', gap: 6, alignItems: 'center' },
}));
