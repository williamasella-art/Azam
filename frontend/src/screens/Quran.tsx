import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, Switch, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useApp } from '@/src/AppContext';
import { api } from '@/src/api';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Card, Icon, Page, Status, T, Tap } from '@/src/components/ui';

export function Quran() {
  const { read, settings } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('Semua');
  const query = useQuery({ queryKey: ['quran'], queryFn: () => api('/quran').then(r => r.data), staleTime: 3600000 });
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const items = (query.data || []).filter((q: any) => (normalize(q.namaLatin).includes(normalize(search)) || q.arti.toLowerCase().includes(search.toLowerCase()) || String(q.nomor) === search) && (filter === 'Semua' || (filter === 'Makkiyah' ? q.tempatTurun === 'Mekah' : q.tempatTurun === 'Madinah')));
  return <Page title="Al-Qur’an" subtitle="Setiap ayat, selangkah lebih dekat." scroll={false}>
    <View style={s.search}><Icon name="search-outline" color={colors.muted} size={20} /><TextInput testID="quran-search-input" placeholder="Cari surah atau arti…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={s.searchInput} />{search !== '' && <Tap testID="quran-search-clear-button" style={s.smallButton} onPress={() => setSearch('')}><Icon name="close" size={18} /></Tap>}</View>
    <View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipContent}>{['Semua', 'Makkiyah', 'Madaniyah'].map(value => <Tap testID={`quran-filter-${value.toLowerCase()}`} key={value} onPress={() => setFilter(value)} style={[s.chip, filter === value && s.chipActive]}><T size={12} weight="600" color={filter === value ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{value}</T></Tap>)}</ScrollView></View>
    {query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <FlatList testID="quran-surah-list" data={items} keyExtractor={item => String(item.nomor)} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}
      ListHeaderComponent={!search && filter === 'Semua' ? <Tap testID="quran-continue-button" style={s.readingCard} onPress={() => read(settings.last_surah)}><View style={{ flex: 1, gap: 6 }}><T size={10} weight="700" color={colors.onBrandSecondary}>RUANG UNTUK HATI</T><T size={18} weight="800">{settings.last_verse > 1 ? 'Lanjutkan bacaan' : 'Mulai dengan Bismillah'}</T><T size={12} muted>{settings.last_verse > 1 ? `Surah ${settings.last_surah} · ayat ${settings.last_verse}` : '114 surah, lengkap dengan terjemahan'}</T></View><View style={s.bookArt}><Icon name="book-outline" size={40} color={colors.onBrandSecondary} /></View></Tap> : null}
      ListEmptyComponent={<Card><T testID="quran-empty-state" muted style={{ textAlign: 'center' }}>Surah tidak ditemukan. Coba nama atau nomor lain.</T></Card>}
      renderItem={({ item }) => <Tap testID={`surah-${item.nomor}-button`} onPress={() => read(item.nomor)} style={s.surahRow}><View style={s.number}><T size={12} weight="700" color={colors.onBrandSecondary}>{item.nomor}</T></View><View style={{ flex: 1, gap: 3 }}><T size={15} weight="700">{item.namaLatin}</T><T size={10} muted>{item.arti} · {item.jumlahAyat} ayat</T></View><View style={{ alignItems: 'flex-end' }}><T arabic size={23} color={colors.onBrandSecondary}>{item.nama}</T><T size={9} muted>{item.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}</T></View></Tap>}
      ListFooterComponent={<T size={10} muted style={s.source}>Teks & terjemahan Indonesia · EQuran.id</T>} />}
  </Page>;
}

function ReaderContent({ data }: { data: any }) {
  const { settings, updateSettings, surah, notify, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const listRef = useRef<FlatList>(null);
  const pendingScroll = useRef<number | null>(settings.last_surah === surah && settings.last_verse > 1 ? Math.min(settings.last_verse, data.ayat.length) - 1 : null);
  const audioUrl = data.audioFull?.['05'] || Object.values(data.audioFull || {})[0];
  const recitation = useAudioPlayer(audioUrl || null); const recitationStatus = useAudioPlayerStatus(recitation);
  const rain = useAudioPlayer(require('../../assets/audio/rain.wav')); const rainStatus = useAudioPlayerStatus(rain);
  const [rainOn, setRainOn] = useState(false);
  useEffect(() => { rain.loop = true; rain.volume = 0.28; }, [rain]);
  useEffect(() => { if (recitationStatus.error) notify('Audio belum bisa diputar. Periksa koneksi lalu coba lagi.'); }, [recitationStatus.error, notify]);
  const play = () => { if (!audioUrl) return notify('Audio surah ini belum tersedia.'); if (recitationStatus.playing) recitation.pause(); else recitation.play(); };
  const toggleRain = () => { if (rainOn) rain.pause(); else rain.play(); setRainOn(!rainOn); };
  return <>
    <View style={s.readerControls}><View style={s.switchLabel}><T size={11} muted>Terjemahan</T><Switch testID="reader-translation-switch" value={settings.translation} onValueChange={(value) => updateSettings({ translation: value })} trackColor={{ false: colors.border, true: colors.brandPrimary }} thumbColor={colors.onBrandPrimary} /></View>
      <Tap testID="reader-rain-button" style={[s.audioButton, rainOn && s.audioActive]} onPress={toggleRain}><Icon name="rainy-outline" size={19} color={rainOn ? colors.onBrandSecondary : colors.onSurfaceTertiary} /><T size={11} muted>Hujan</T></Tap>
      <Tap testID="reader-audio-button" style={s.audioButton} onPress={play}><Icon name={recitationStatus.playing ? 'pause' : 'play'} size={18} color={colors.onBrandSecondary} /><T size={11} color={colors.onBrandSecondary}>{recitationStatus.playing ? 'Jeda' : 'Murotal'}</T></Tap>
    </View>
    <FlatList ref={listRef} testID="reader-verse-list" data={data.ayat} keyExtractor={item => String(item.nomorAyat)} showsVerticalScrollIndicator={false} contentContainerStyle={s.list}
      initialNumToRender={Math.max(12, settings.last_surah === surah ? Math.min(settings.last_verse, data.ayat.length) : 1)}
      onContentSizeChange={() => { if (pendingScroll.current !== null) { const index = pendingScroll.current; pendingScroll.current = null; listRef.current?.scrollToIndex({ index, animated: false }); } }}
      onScrollToIndexFailed={({ index, averageItemLength }) => { pendingScroll.current = index; listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false }); }}
      ListHeaderComponent={<Card style={s.readerHero}><Badge text={`${data.tempatTurun} · ${data.jumlahAyat} AYAT`} /><T arabic size={32} color={colors.onBrandSecondary}>{data.nama}</T><T size={20} weight="800">{data.namaLatin}</T><T muted size={12}>{data.arti}</T>{surah !== 1 && surah !== 9 && <T arabic size={25} style={{ textAlign: 'center', marginTop: 12 }}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</T>}</Card>}
      renderItem={({ item }) => {
        const bookmarked = settings.last_surah === surah && settings.last_verse === item.nomorAyat;
        return <View testID={`verse-${item.nomorAyat}`} style={s.verse}><View style={s.verseTop}><View style={s.verseNumber}><T size={11} color={colors.onBrandSecondary} weight="700">{surah}:{item.nomorAyat}</T></View><View style={s.verseActions}><Tap testID={`verse-${item.nomorAyat}-share-button`} style={s.smallButton} onPress={() => setModal({ type: 'share-verse', verse: { ...item, surah: data.namaLatin, number: surah } })}><Icon name="share-social-outline" size={18} color={colors.muted} /></Tap><Tap testID={`verse-${item.nomorAyat}-bookmark-button`} style={s.smallButton} onPress={async () => { if (await updateSettings({ last_surah: surah, last_verse: item.nomorAyat })) notify('Penanda bacaan disimpan.'); }}><Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={19} color={bookmarked ? colors.brandPrimary : colors.muted} /></Tap></View></View>
          <T arabic size={28} testID={`verse-${item.nomorAyat}-arabic`} style={s.arabic}>{item.teksArab}</T>{settings.translation && <T testID={`verse-${item.nomorAyat}-translation`} muted size={13} style={s.translation}>{item.teksIndonesia}</T>}
        </View>;
      }} ListFooterComponent={<T muted size={10} style={s.source}>Sumber: EQuran.id · Murotal: Misyari Rasyid Alafasy{rainStatus.playing ? '\nSuasana hujan lembut aktif' : ''}</T>} />
  </>;
}
export function Reader() {
  const { surah } = useApp();
  const query = useQuery({ queryKey: ['surah', surah], queryFn: () => api(`/quran/${surah}`).then(r => r.data), staleTime: 3600000 });
  return <Page title={query.data?.namaLatin || 'Membaca Al-Qur’an'} back="quran" subtitle="Baca perlahan, resapi maknanya." scroll={false}>{query.isLoading || query.error ? <Status loading={query.isLoading} error={query.error} retry={query.refetch} /> : <ReaderContent key={surah} data={query.data} />}</Page>;
}
const useStyles = makeStyles(c => ({
  search: { marginHorizontal: 24, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, height: 50 }, searchInput: { flex: 1, fontFamily: 'Jakarta', fontSize: 13, color: c.onSurface, height: 48, outlineWidth: 0 },
  chipRow: { height: 56, flexShrink: 0 }, chipContent: { paddingHorizontal: 24, alignItems: 'center', gap: 8 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 18, justifyContent: 'center', borderRadius: 12, backgroundColor: c.surfaceTertiary, borderWidth: 1, borderColor: c.transparent }, chipActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  list: { paddingHorizontal: 24, paddingBottom: 28 }, readingCard: { backgroundColor: c.brandSecondary, padding: 20, borderRadius: 24, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }, bookArt: { width: 65, height: 80, borderRadius: 22, backgroundColor: c.surface + '90', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-9deg' }] },
  surahRow: { flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border }, number: { width: 39, height: 42, borderRadius: 13, borderWidth: 1, borderColor: c.brandTertiary, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center' },
  source: { textAlign: 'center', marginTop: 24 }, readerControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 12, gap: 8 }, switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 5 }, audioButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8, borderRadius: 12 }, audioActive: { backgroundColor: c.brandSecondary },
  readerHero: { alignItems: 'center', gap: 5, marginBottom: 18, backgroundColor: c.brandSecondary, paddingVertical: 24 }, verse: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: c.border, gap: 12 }, verseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, verseNumber: { backgroundColor: c.brandSecondary, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6 }, verseActions: { flexDirection: 'row', gap: 2 }, smallButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }, arabic: { writingDirection: 'rtl', textAlign: 'right', lineHeight: 57 }, translation: { lineHeight: 23 },
}));