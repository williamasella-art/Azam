import React from 'react';
import { Image, ImageBackground, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Bg, Icon, IconBox, Logo, Paper, Section, Status, T, Tap } from '@/src/components/ui';
import { PRAYER_ICONS } from '@/src/components/SocialDemo';

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
  const salutation = settings.gender === 'wanita' ? 'Ukhti' : settings.gender === 'pria' ? 'Akhi' : 'Sahabat';
  const hour = Number(timeNow.slice(0, 2)); const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  return <Bg>
    <View style={s.header}><Logo size={38} wordmark />
      <View style={s.headerRight}><Tap testID="home-location-button" style={s.location} onPress={() => setModal({ type: 'location' })}><Icon name="location" size={13} color={colors.brandTertiary} /><T numberOfLines={1} size={12} weight="600" style={{ maxWidth: 84 }}>{settings.city}</T><Icon name="chevron-down" size={12} color={colors.muted} /></Tap>
      <Tap testID="home-settings-button" style={s.settings} onPress={() => go('settings')}><Icon name="settings-outline" size={20} /></Tap></View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <Animated.View entering={FadeInDown.duration(500)} style={s.contentInner}>
        <View style={s.greeting}><View style={{ flex: 1 }}><T muted size={12}>{greet}, {salutation} {user.guest ? '' : user.name.split(' ')[0]}</T><T size={22} weight="800" style={s.greetingTitle}>Assalamu’alaikum ✨</T></View>
          <Tap testID="home-streak-button" onPress={() => go('progress')} style={s.streak}><LinearGradient colors={[colors.gold, colors.warning]} style={s.streakBg} /><Icon name="flame" size={18} color={colors.goldInk} /><T weight="800" color={colors.goldInk}>{progress.data?.streak ?? 0}</T><T size={10} weight="600" color={colors.goldInk}>hari</T></Tap></View>
        <ImageBackground source={IMG.heroBirds} style={s.hero} imageStyle={s.heroImage} testID="next-prayer-card">
          <LinearGradient colors={[colors.transparent, colors.overlay, colors.pageTop]} locations={[0, 0.55, 1]} style={s.heroShade} />
          <View style={s.heroContent}><View style={s.heroEyebrow}><View style={s.dot} /><T size={10} weight="700" color={colors.heroMuted}>SALAT BERIKUTNYA{isTomorrow ? ' · BESOK' : ''}</T></View>
            {nextQuery.isLoading ? <Status loading /> : nextQuery.error ? <Tap testID="prayer-retry-button" onPress={() => nextQuery.refetch()}><T color={colors.heroInk} size={13}>Jadwal belum tersedia. Ketuk untuk mencoba lagi.</T></Tap> : <View style={s.heroRow}>
              <View><T testID="next-prayer-name" size={22} weight="700" color={colors.heroInk}>{next?.name}</T><T testID="next-prayer-time" size={46} weight="800" color={colors.heroInk} style={s.heroTime}>{next?.time.replace(':', '.')}</T></View>
              <View style={s.countdown}><Icon name="hourglass-outline" size={14} color={colors.gold} /><T testID="prayer-countdown" size={13} weight="700" color={colors.heroInk}>{countdown}</T></View>
            </View>}
            <View style={s.heroFooter}><Icon name="calendar-clear-outline" size={12} color={colors.heroMuted} /><T size={10} color={colors.heroMuted}>{prayers.data?.hijri ? `${prayers.data.hijri.day} ${prayers.data.hijri.month.en} ${prayers.data.hijri.year} H` : 'Jadwal salat berdasarkan lokasi'} · {settings.city}</T></View>
          </View>
        </ImageBackground>
        <View style={s.prayerSection}><View style={s.rowBetween}><T size={15} weight="700">Salat hari ini</T><T testID="today-prayer-count" size={11} muted>{complete.length} dari 5 selesai</T></View>
          <View style={s.prayerRow}>{list.map((p: any) => {
            const done = complete.includes(p.name); const active = !isTomorrow && next?.name === p.name;
            return <Tap testID={`prayer-checkin-${p.name.toLowerCase()}`} key={p.name} disabled={checking} onPress={() => checkin(p.name)} style={[s.prayerCell, active && s.prayerActive, done && s.prayerDone]} accessibilityLabel={`Catat salat ${p.name}`}>
              <Icon name={done ? 'checkmark-circle' : PRAYER_ICONS[p.name]} size={20} color={done ? colors.success : active ? colors.onBrandPrimary : colors.brandTertiary} />
              <T size={10} weight="600" color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{p.name}</T><T size={11} weight="700" color={active ? colors.onBrandPrimary : colors.onSurface}>{p.time.replace(':', '.')}</T>
            </Tap>;
          })}</View>
          {prayers.error && <T size={11} muted>Jadwal belum tersedia. Coba muat ulang di kartu atas.</T>}
        </View>
        <Tap testID="home-focus-button" onPress={() => go('focus')} style={s.blockerCard}><Image source={IMG.instagram} style={s.blockerArt} /><View style={{ flex: 1, gap: 4 }}><Badge text={settings.blocker_enabled ? 'BLOKIR AKTIF' : 'BLOKIR NONAKTIF'} icon={settings.blocker_enabled ? 'shield-checkmark' : 'shield-outline'} /><T weight="700" size={14}>Jeda aplikasi saat azan</T><T size={11} muted>{settings.blocker_enabled ? `${settings.reminder_minutes} menit sebelum azan · ${settings.blocked_apps.length} aplikasi` : 'Ketuk untuk mengaktifkan pemblokir'}</T></View><Icon name="chevron-forward" size={18} color={colors.muted} /></Tap>
        <View style={s.quickRow}>
          <Tap testID="home-qibla-button" style={s.quickCard} onPress={() => go('qibla')}><Image source={IMG.kaaba} style={s.quickArt} /><T weight="700" size={13}>Kiblat</T><T size={10} muted>Arah Ka’bah</T></Tap>
          <Tap testID="home-quran-button" style={s.quickCard} onPress={() => go('quran')}><IconBox name="book" size={52} icon={26} bg={colors.brandDeep} color={colors.white} /><T weight="700" size={13}>Al-Qur’an</T><T size={10} muted>114 surah</T></Tap>
          <Tap testID="home-pro-button" style={s.quickCard} onPress={() => go('pro')}><Image source={IMG.hajj} style={s.quickArt} /><T weight="700" size={13}>Haji & Umroh</T><T size={10} color={colors.goldText}>PRO</T></Tap>
        </View>
        <View style={s.dailySection}><Section title="Seayat untuk hari ini" action="Baca" testID="daily-read-button" onPress={() => daily.data && read(daily.data.number)} />
          <Paper style={s.dailyCard} testID="daily-verse-card">{daily.isLoading ? <Status loading /> : daily.error ? <Status error={daily.error} retry={daily.refetch} /> : <>
            <View style={s.rowBetween}><View style={s.paperBadge}><Icon name="book-outline" size={12} color={colors.brandDeep} /><T size={10} weight="800" color={colors.brandDeep}>QS. {daily.data?.surah} : {daily.data?.nomorAyat}</T></View><Tap testID="daily-share-button" onPress={() => setModal({ type: 'share-verse', verse: daily.data })} style={s.share}><Icon name="share-social-outline" size={18} color={colors.brandDeep} /></Tap></View>
            <T arabic paper size={25} testID="daily-arabic-text" style={s.arabic}>{daily.data?.teksArab}</T><T paper muted size={12} style={s.translation}>“{daily.data?.teksIndonesia}”</T>
          </>}</Paper>
        </View>
        <T testID="prayer-data-source" muted size={9} style={{ textAlign: 'center' }}>{prayers.data?.method || 'Kemenag RI · AlAdhan'} · {settings.city}{!settings.location_set ? ' (lokasi awal)' : ''} · Cocokkan dengan masjid setempat.</T>
      </Animated.View>
    </ScrollView>
  </Bg>;
}
const useStyles = makeStyles(c => ({
  header: { paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 }, headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  location: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, settings: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  content: { paddingHorizontal: 22, paddingBottom: 24 }, contentInner: { gap: 20 }, greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, greetingTitle: { letterSpacing: -0.7, marginTop: 2 },
  streak: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, minHeight: 44, alignItems: 'center', borderRadius: 16, overflow: 'hidden' }, streakBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hero: { height: 236, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end' }, heroImage: { borderRadius: 28 }, heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, heroContent: { padding: 20, gap: 6 }, heroEyebrow: { flexDirection: 'row', gap: 6, alignItems: 'center' }, dot: { width: 6, height: 6, backgroundColor: c.gold, borderRadius: 3 }, heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, heroTime: { letterSpacing: -2, lineHeight: 54 }, countdown: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.glassStrong, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8 }, heroFooter: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  prayerSection: { gap: 12 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, prayerRow: { flexDirection: 'row', gap: 6 }, prayerCell: { flex: 1, minHeight: 84, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 4, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, prayerActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, prayerDone: { borderColor: c.success },
  blockerCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' }, blockerArt: { width: 72, height: 72, borderRadius: 18 },
  quickRow: { flexDirection: 'row', gap: 10 }, quickCard: { flex: 1, padding: 12, borderRadius: 22, alignItems: 'center', gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, quickArt: { width: 52, height: 52, borderRadius: 17 },
  dailySection: { gap: 10 }, dailyCard: { gap: 12 }, paperBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.paperTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, share: { height: 44, width: 40, alignItems: 'center', justifyContent: 'center' }, arabic: { textAlign: 'right', writingDirection: 'rtl' }, translation: { lineHeight: 21 },
}));
