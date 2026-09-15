import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, Switch, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useApp } from '@/src/AppContext';
import { useAmbient } from '@/src/ambient';
import { api } from '@/src/api';
import { fontFor, makeStyles, useTheme } from '@/src/theme';
import { Badge, Card, Icon, Page, Paper, Status, T, Tap } from '@/src/components/ui';
import { useI18n } from '@/src/i18n';
import { screenText } from '@/src/screenText';

export function Quran() {
  const { read, settings } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const { lang } = useI18n(); const tx = screenText(lang).quran;
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('Semua');
  const query = useQuery({ queryKey: ['quran'], queryFn: () => api('/quran').then(r => r.data), staleTime: 3600000 });
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const items = (query.data || []).filter((q: any) => (normalize(q.namaLatin).includes(normalize(search)) || q.arti.toLowerCase().includes(search.toLowerCase()) || String(q.nomor) === search) && (filter === 'Semua' || (filter === 'Makkiyah' ? q.tempatTurun === 'Mekah' : q.tempatTurun === 'Madinah')));
  const filterLabel = (v: string) => v === 'Semua' ? tx.filterAll : v === 'Makkiyah' ? tx.makki : tx.madani;
  return <Page title={tx.title} subtitle={tx.subtitle} scroll={false}>
    <View style={s.search}><Icon name="search-outline" color={colors.muted} size={20} /><TextInput testID="quran-search-input" placeholder={tx.searchPlaceholder} placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={s.searchInput} />{search !== '' && <Tap testID="quran-search-clear-button" style={s.smallButton} onPress={() => setSearch('')}><Icon name="close" size={18} /></Tap>}</View>
    <View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipContent}>{['Semua', 'Makkiyah', 'Madaniyah'].map(value => <Tap testID={`quran-filter-${value.toLowerCase()}`} key={value} onPress={() => setFilter(value)} style={[s.chip, filter === value && s.chipActive]}><T size={12} weight="600" color={filter === value ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{filterLabel(value)}</T></Tap>)}</ScrollView></View>
    {query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <FlatList testID="quran-surah-list" data={items} keyExtractor={item => String(item.nomor)} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
      ListHeaderComponent={!search && filter === 'Semua' ? <Tap testID="quran-continue-button" style={s.readingCard} onPress={() => read(settings.last_surah)}><LinearGradient colors={[colors.brandDeep, colors.solidStrong]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.readingBg} /><View style={{ flex: 1, gap: 6 }}><T size={10} weight="700" color={colors.heroMuted}>{tx.eyebrow}</T><T size={18} weight="800" color={colors.heroInk}>{settings.last_verse > 1 ? tx.continueReading : tx.startBismillah}</T><T size={12} color={colors.heroMuted}>{settings.last_verse > 1 ? tx.surahVerse(settings.last_surah, settings.last_verse) : tx.fullList}</T></View><View style={s.bookArt}><Icon name="book" size={36} color={colors.heroInk} /></View></Tap> : null}
      ListEmptyComponent={<Card><T testID="quran-empty-state" muted style={{ textAlign: 'center' }}>{tx.empty}</T></Card>}
      renderItem={({ item }) => <Tap testID={`surah-${item.nomor}-button`} onPress={() => read(item.nomor)} style={s.surahRow}><View style={s.number}><T size={12} weight="800" color={colors.onBrandPrimary}>{item.nomor}</T></View><View style={{ flex: 1, gap: 2 }}><T size={15} weight="700">{item.namaLatin}</T><T size={10} muted>{item.arti} · {item.jumlahAyat} {tx.verses} · {item.tempatTurun === 'Mekah' ? tx.makki : tx.madani}</T></View><T arabic size={22} color={colors.brandTertiary}>{item.nama}</T></Tap>}
      ListFooterComponent={<T size={10} muted style={s.source}>{tx.listSource}</T>} />}
  </Page>;
}

function ReaderContent({ data }: { data: any }) {
  const { settings, updateSettings, surah, notify, setModal } = useApp(); const { active } = useAmbient(); const playing: string[] = active; const s = useStyles(); const { colors } = useTheme();
  const { lang } = useI18n(); const tx = screenText(lang).quran;
  const listRef = useRef<FlatList>(null);
  const pendingScroll = useRef<number | null>(settings.last_surah === surah && settings.last_verse > 1 ? Math.min(settings.last_verse, data.ayat.length) - 1 : null);
  const audioUrl = data.audioFull?.['05'] || Object.values(data.audioFull || {})[0];
  const recitation = useAudioPlayer(audioUrl || null); const recitationStatus = useAudioPlayerStatus(recitation);
  useEffect(() => { if (recitationStatus.error) notify(tx.audioError); }, [recitationStatus.error, notify, tx.audioError]);
  const play = () => { if (!audioUrl) return notify(tx.audioUnavailable); if (recitationStatus.playing) recitation.pause(); else recitation.play(); };
  const place = data.tempatTurun === 'Mekah' ? tx.makki : data.tempatTurun === 'Madinah' ? tx.madani : data.tempatTurun;
  return <>
    <View style={s.readerControls}><View style={s.switchLabel}><T size={11} muted>{tx.translation}</T><Switch testID="reader-translation-switch" value={settings.translation} onValueChange={(value) => updateSettings({ translation: value })} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>
      <View style={s.switchLabel}><T size={11} muted>{tx.latin}</T><Switch testID="reader-latin-switch" value={settings.latin} onValueChange={(value) => updateSettings({ latin: value })} trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }} thumbColor={colors.white} /></View>
      <View style={{ flex: 1 }} />
      <Tap testID="reader-ambient-button" style={[s.audioButton, playing.length > 0 && s.audioActive]} onPress={() => setModal({ type: 'ambient' })} accessibilityLabel={tx.ambientLabel}><Icon name={playing.includes('cat') && !playing.includes('rain') ? 'paw-outline' : 'rainy-outline'} size={18} color={playing.length > 0 ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><Icon name="options-outline" size={14} color={playing.length > 0 ? colors.onBrandPrimary : colors.onSurfaceTertiary} /></Tap>
      <Tap testID="reader-audio-button" style={[s.audioButton, s.playButton]} onPress={play}><Icon name={recitationStatus.playing ? 'pause' : 'play'} size={18} color={colors.onBrandPrimary} /><T size={11} weight="700" color={colors.onBrandPrimary}>{recitationStatus.playing ? tx.pause : tx.murottal}</T></Tap>
    </View>
    <FlatList ref={listRef} testID="reader-verse-list" data={data.ayat} keyExtractor={item => String(item.nomorAyat)} showsVerticalScrollIndicator={false} contentContainerStyle={s.list}
      initialNumToRender={Math.max(12, settings.last_surah === surah ? Math.min(settings.last_verse, data.ayat.length) : 1)}
      onContentSizeChange={() => { if (pendingScroll.current !== null) { const index = pendingScroll.current; pendingScroll.current = null; listRef.current?.scrollToIndex({ index, animated: false }); } }}
      onScrollToIndexFailed={({ index, averageItemLength }) => { pendingScroll.current = index; listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false }); }}
      ListHeaderComponent={<Card style={s.readerHero}><Badge text={tx.ayatBadge(place, data.jumlahAyat)} /><T arabic size={34} color={colors.brandTertiary}>{data.nama}</T><T size={20} weight="800">{data.namaLatin}</T><T muted size={12}>{data.arti}</T>{surah !== 1 && surah !== 9 && <T arabic size={24} style={{ textAlign: 'center', marginTop: 10 }}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</T>}</Card>}
      renderItem={({ item }) => {
        const bookmarked = settings.last_surah === surah && settings.last_verse === item.nomorAyat;
        return <Paper testID={`verse-${item.nomorAyat}`} style={s.verse}><View style={s.verseTop}><View style={s.verseNumber}><T size={11} color={colors.brandDeep} weight="800">{surah}:{item.nomorAyat}</T></View><View style={s.verseActions}><Tap testID={`verse-${item.nomorAyat}-share-button`} style={s.smallButton} onPress={() => setModal({ type: 'share-verse', verse: { ...item, surah: data.namaLatin, number: surah } })}><Icon name="share-social-outline" size={18} color={colors.paperMuted} /></Tap><Tap testID={`verse-${item.nomorAyat}-bookmark-button`} style={s.smallButton} onPress={async () => { if (await updateSettings({ last_surah: surah, last_verse: item.nomorAyat })) notify(tx.bookmarkSaved); }}><Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={19} color={bookmarked ? colors.brandDeep : colors.paperMuted} /></Tap></View></View>
          <T arabic paper size={27} testID={`verse-${item.nomorAyat}-arabic`} style={s.arabic}>{item.teksArab}</T>{settings.latin && item.teksLatin && <T paper testID={`verse-${item.nomorAyat}-latin`} size={12} weight="600" color={colors.brandDeep} style={s.latin}>{item.teksLatin}</T>}{settings.translation && <T paper muted testID={`verse-${item.nomorAyat}-translation`} size={13} style={s.translation}>{item.teksIndonesia}</T>}
        </Paper>;
      }} ListFooterComponent={<T muted size={10} style={s.source}>{tx.readerSource}</T>} />
  </>;
}
export function Reader() {
  const { surah } = useApp(); const { lang } = useI18n(); const tx = screenText(lang).quran;
  const query = useQuery({ queryKey: ['surah', surah], queryFn: () => api(`/quran/${surah}`).then(r => r.data), staleTime: 3600000 });
  return <Page title={query.data?.namaLatin || tx.readerTitle} back="quran" subtitle={tx.readerSubtitle} scroll={false}>{query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <ReaderContent key={surah} data={query.data} />}</Page>;
}
const useStyles = makeStyles(c => ({
  search: { marginHorizontal: 22, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, height: 50 }, searchInput: { flex: 1, fontFamily: fontFor('500'), fontSize: 13, color: c.onSurface, height: 48, outlineWidth: 0 },
  chipRow: { height: 56, flexShrink: 0 }, chipContent: { paddingHorizontal: 22, alignItems: 'center', gap: 8 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 18, justifyContent: 'center', borderRadius: 12, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, chipActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  list: { paddingHorizontal: 22, paddingBottom: 28, gap: 10 }, readingCard: { padding: 20, borderRadius: 24, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' }, readingBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, bookArt: { width: 64, height: 78, borderRadius: 22, backgroundColor: c.glassStrong, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-9deg' }] },
  surahRow: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 12, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, number: { width: 40, height: 40, borderRadius: 13, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  source: { textAlign: 'center', marginTop: 20 }, readerControls: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingBottom: 12, gap: 6 }, switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 }, audioButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, minWidth: 44, paddingHorizontal: 8, borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, audioActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, playButton: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary, paddingHorizontal: 14 },
  readerHero: { alignItems: 'center', gap: 5, marginBottom: 6, paddingVertical: 22 }, verse: { gap: 12, padding: 16 }, verseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, verseNumber: { backgroundColor: c.paperTint, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6 }, verseActions: { flexDirection: 'row', gap: 2 }, smallButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }, arabic: { writingDirection: 'rtl', textAlign: 'right', lineHeight: 54 }, latin: { lineHeight: 19, fontStyle: 'italic' }, translation: { lineHeight: 22 },
}));
