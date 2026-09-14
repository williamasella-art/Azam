import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Card, Icon, Section, Status, T, Tap } from '@/src/components/ui';
import { MosqueArt } from '@/src/components/illustrations';

const prayerIcons: Record<string, string> = { Subuh: 'partly-sunny-outline', Zuhur: 'sunny-outline', Asar: 'partly-sunny-outline', Magrib: 'sunset', Isya: 'moon-outline' };
export function Home() {
  const { settings, user, go, prayers, tomorrowPrayers, progress, daily, now, setModal, checkin, checking, read } = useApp();
  const s = useStyles(); const { colors } = useTheme();
  const timeNow = new Intl.DateTimeFormat('en-GB', { timeZone: prayers.data?.timezone || settings.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const list = prayers.data?.prayers || [];
  const upcomingToday = list.find((p: any) => p.time > timeNow.slice(0, 5));
  const isTomorrow = list.length > 0 && !upcomingToday;
  const next = upcomingToday || tomorrowPrayers.data?.prayers[0];
  const nextQuery = isTomorrow ? tomorrowPrayers : prayers;
  let seconds = 0;
  if (next) { const [h, m] = next.time.split(':').map(Number); const [nh, nm, ns] = timeNow.split(':').map(Number); seconds = h * 3600 + m * 60 - nh * 3600 - nm * 60 - ns; if (seconds < 0) seconds += 86400; }
  const countdown = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const complete = progress.data?.today || [];
  return <View style={s.page}>
    <View style={s.header}><View style={s.brand}><View style={s.logo}><Icon name="moon" size={21} color={colors.onBrandPrimary} /></View><T size={27} weight="800">azam<T size={28} color={colors.brandPrimary}>.</T></T></View>
      <View style={s.headerRight}><Tap testID="home-location-button" style={s.location} onPress={() => setModal({ type: 'location' })}><Icon name="location-outline" size={14} color={colors.onBrandSecondary} /><T numberOfLines={1} size={12} weight="600" color={colors.onBrandSecondary} style={{ maxWidth: 88 }}>{settings.city}</T><Icon name="chevron-down" size={12} color={colors.onBrandSecondary} /></Tap>
      <Tap testID="home-settings-button" style={s.settings} onPress={() => go('settings')}><Icon name="options-outline" size={21} /></Tap></View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <Animated.View entering={FadeInDown.duration(500)} style={s.contentInner}>
        <View style={s.greeting}><View><T muted size={12}>Assalamu’alaikum, {user.guest ? 'Sahabat' : user.name.split(' ')[0]}</T><T size={23} weight="800" style={s.greetingTitle}>Sejenak untuk-Nya.</T></View><Tap testID="home-streak-button" onPress={() => go('progress')} style={s.streak}><Icon name="flame-outline" size={18} color={colors.onBrandSecondary} /><T weight="800" color={colors.onBrandSecondary}>{progress.data?.streak ?? 0}</T></Tap></View>
        <View style={s.hero} testID="next-prayer-card"><View style={s.heroArt}><MosqueArt compact /></View>
          <View style={s.heroContent}><View style={s.heroEyebrow}><View style={s.dot} /><T size={10} weight="700" color={colors.heroMuted}>SALAT BERIKUTNYA</T></View>
            {nextQuery.isLoading ? <Status loading /> : nextQuery.error ? <Tap testID="prayer-retry-button" onPress={() => nextQuery.refetch()}><T color={colors.heroInk} size={13}>Jadwal belum tersedia. Ketuk untuk mencoba lagi.</T></Tap> : <>
              <T testID="next-prayer-name" size={isTomorrow ? 20 : 23} weight="700" color={colors.heroInk}>{next?.name}{isTomorrow ? ' · besok' : ''}</T>
              <T testID="next-prayer-time" size={43} weight="800" color={colors.heroInk} style={s.heroTime}>{next?.time.replace(':', '.')}</T>
              <View style={s.countdown}><Icon name="time-outline" size={14} color={colors.heroInk} /><T testID="prayer-countdown" size={11} weight="600" color={colors.heroInk}>{countdown} lagi</T></View>
            </>}
          </View><View style={s.heroFooter}><Icon name="calendar-clear-outline" size={12} color={colors.heroInk} /><T size={10} color={colors.heroInk}>{prayers.data?.hijri ? `${prayers.data.hijri.day} ${prayers.data.hijri.month.en} ${prayers.data.hijri.year} H` : 'Jadwal salat berdasarkan lokasi'}</T></View>
        </View>
        <View style={s.prayerSection}><View style={s.rowBetween}><T size={14} weight="700">Salat hari ini</T><T testID="today-prayer-count" size={11} muted>{complete.length} dari 5 selesai</T></View>
          <View style={s.prayerRow}>{list.map((p: any) => {
            const done = complete.includes(p.name); const active = !isTomorrow && next?.name === p.name;
            return <Tap testID={`prayer-checkin-${p.name.toLowerCase()}`} key={p.name} disabled={checking} onPress={() => checkin(p.name)} style={[s.prayerCell, active && s.prayerActive]} accessibilityLabel={`Catat salat ${p.name}`}>
              <Icon name={done ? 'checkmark-circle' : prayerIcons[p.name] === 'sunset' ? 'cloudy-night-outline' : prayerIcons[p.name]} size={19} color={done ? colors.success : active ? colors.onBrandSecondary : colors.muted} />
              <T size={10} weight="600" color={active ? colors.onBrandSecondary : colors.onSurfaceTertiary}>{p.name}</T><T size={11} weight="700" color={active ? colors.onBrandSecondary : colors.onSurface}>{p.time.replace(':', '.')}</T>
            </Tap>;
          })}</View>
          {prayers.error && <T size={11} muted>Jadwal belum tersedia. Coba muat ulang di kartu atas.</T>}
        </View>
        <View style={s.quickRow}>
          <Tap testID="home-quran-button" style={s.quickCard} onPress={() => go('quran')}><View style={s.quickIcon}><Icon name="book-outline" color={colors.onBrandSecondary} size={23} /></View><View style={s.quickText}><T weight="700" size={14}>Al-Qur’an</T><T size={10} muted>Tenangkan hati</T></View></Tap>
          <Tap testID="home-qibla-button" style={s.quickCard} onPress={() => go('qibla')}><View style={s.quickIcon}><Icon name="compass-outline" color={colors.onBrandSecondary} size={25} /></View><View style={s.quickText}><T weight="700" size={14}>Kiblat</T><T size={10} muted>Temukan arah</T></View></Tap>
        </View>
        <View style={s.dailySection}><Section title="Seayat untuk hari ini" action="Baca" testID="daily-read-button" onPress={() => daily.data && read(daily.data.number)} />
          <Card style={s.dailyCard} testID="daily-verse-card">{daily.isLoading ? <Status loading /> : daily.error ? <Status error={daily.error} retry={daily.refetch} /> : <>
            <View style={s.rowBetween}><Badge text={`QS. ${daily.data?.surah} : ${daily.data?.nomorAyat}`} icon="book-outline" /><Tap testID="daily-share-button" onPress={() => setModal({ type: 'share-verse', verse: daily.data })} style={s.share}><Icon name="share-social-outline" size={18} color={colors.onBrandSecondary} /></Tap></View>
            <T arabic size={25} testID="daily-arabic-text" style={s.arabic}>{daily.data?.teksArab}</T><T size={12} muted style={s.translation}>“{daily.data?.teksIndonesia}”</T>
            <View style={s.dailyFooter}><View style={s.shortLine} /><T size={10} color={colors.onBrandSecondary}>Pengingat kecil, makna yang besar.</T></View>
          </>}</Card>
        </View>
        <Tap testID="home-focus-button" onPress={() => go('focus')} style={s.focusCard}><View style={s.quickIcon}><Icon name="shield-checkmark-outline" color={colors.onBrandSecondary} /></View><View style={{ flex: 1 }}><T weight="700" size={13}>Beri ruang untuk ibadah</T><T size={11} muted>Atur jeda aplikasi saat waktu salat.</T></View><Icon name="chevron-forward" size={17} color={colors.muted} /></Tap>
        <T testID="prayer-data-source" muted size={9} style={{ textAlign: 'center' }}>{prayers.data?.method || 'Kemenag RI · AlAdhan'} · {settings.city}{!settings.location_set ? ' (lokasi awal)' : ''}{'\n'}Cocokkan jadwal dengan masjid setempat.</T>
      </Animated.View>
    </ScrollView>
  </View>;
}
const useStyles = makeStyles(c => ({
  page: { flex: 1, backgroundColor: c.surfaceSecondary }, header: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 76 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brandPrimary }, headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  location: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9 }, settings: { width: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: c.surface },
  content: { paddingHorizontal: 24, paddingBottom: 24 }, contentInner: { gap: 21 }, greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, greetingTitle: { letterSpacing: -0.75, marginTop: 2 }, streak: { flexDirection: 'row', gap: 5, padding: 10, minHeight: 44, alignItems: 'center', borderRadius: 15, backgroundColor: c.brandSecondary },
  hero: { height: 222, borderRadius: 25, overflow: 'hidden', backgroundColor: c.skyTop }, heroArt: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, heroContent: { padding: 21, alignItems: 'flex-start', gap: 5, maxWidth: '65%' }, heroEyebrow: { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 4 }, dot: { width: 5, height: 5, backgroundColor: c.onBrandSecondary, borderRadius: 3 }, heroTime: { letterSpacing: -2, lineHeight: 54 }, countdown: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.glass, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10, marginTop: 4 }, heroFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 9, backgroundColor: c.glass, flexDirection: 'row', gap: 6, alignItems: 'center' },
  prayerSection: { gap: 12 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, prayerRow: { flexDirection: 'row', gap: 6 }, prayerCell: { flex: 1, minHeight: 83, borderRadius: 15, justifyContent: 'center', alignItems: 'center', gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border + '80' }, prayerActive: { backgroundColor: c.brandSecondary, borderColor: c.brandTertiary },
  quickRow: { flexDirection: 'row', gap: 11 }, quickCard: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 20, alignItems: 'center', gap: 9, backgroundColor: c.surface, minHeight: 79, borderWidth: 1, borderColor: c.border + '70' }, quickIcon: { width: 38, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brandSecondary }, quickText: { flex: 1 },
  dailySection: { gap: 7 }, dailyCard: { gap: 13, padding: 18 }, share: { height: 44, width: 36, alignItems: 'center', justifyContent: 'center' }, arabic: { textAlign: 'right', writingDirection: 'rtl' }, translation: { lineHeight: 21 }, dailyFooter: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 2 }, shortLine: { width: 16, height: 2, backgroundColor: c.brand }, focusCard: { flexDirection: 'row', gap: 12, padding: 17, borderRadius: 20, backgroundColor: c.brandSecondary, alignItems: 'center' },
}));