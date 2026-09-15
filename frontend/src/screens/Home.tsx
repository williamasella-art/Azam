import React, { useState } from 'react';
import { Image, ImageBackground, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Bg, Icon, IconBox, Logo, Paper, Section, Status, T, Tap } from '@/src/components/ui';
import { PrayerSky } from '@/src/components/PrayerSky';
import { Avatar } from '@/src/components/Avatar';
import { useI18n } from '@/src/i18n';
import { PulseFlame, SkyLife } from '@/src/components/SkyLife';
import { StreakNudge } from '@/src/components/StreakNudge';
import { describeRepeat, showTime, soonest, untilText } from '@/src/alarms';

// Hero sky tint by time of day (kept identical in light/dark: it describes the real sky, not the UI theme).
const SKY_TINT: Record<'dawn' | 'day' | 'dusk' | 'night', string[] | null> = {
  dawn: ['rgba(255,196,160,0.38)', 'rgba(90,120,170,0.22)', 'rgba(0,0,0,0)'],
  day: ['rgba(150,205,245,0.62)', 'rgba(60,140,205,0.30)', 'rgba(0,0,0,0)'],
  dusk: ['rgba(255,160,100,0.42)', 'rgba(110,70,120,0.26)', 'rgba(0,0,0,0)'],
  night: null,
};
const skyPhase = (hour: number): keyof typeof SKY_TINT => hour >= 4 && hour < 6 ? 'dawn' : hour < 17 ? 'day' : hour < 19 ? 'dusk' : 'night';

export function Home() {
  const { settings, user, go, prayers, tomorrowPrayers, progress, daily, now, setModal, checkin, checking, read, alarms, events } = useApp();
  const { t, prayer, locale } = useI18n();
  const nextEvent = (events.data || []).find((e: any) => e.days_until >= 0);
  const nextAlarm = soonest(alarms.data, now);
  const s = useStyles(); const { colors } = useTheme(); const [heroSize, setHeroSize] = useState({ w: 0, h: 0 });
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
  const salutation = settings.gender === 'wanita' ? t('home.sister') : settings.gender === 'pria' ? t('home.brother') : t('home.friend');
  const hour = Number(timeNow.slice(0, 2)); const greet = hour < 11 ? t('home.morning') : hour < 15 ? t('home.noon') : hour < 18 ? t('home.afternoon') : t('home.night');
  const phase = skyPhase(hour); const tint = SKY_TINT[phase];
  const firstName = user.guest ? '' : user.name.split(' ')[0];
  const hijri = prayers.data?.hijri ? `${prayers.data.hijri.day} ${prayers.data.hijri.month.en} ${prayers.data.hijri.year} H` : '';
  const showPhoto = !!settings.home_photo && !!user.photo_path;
  return <Bg>
    <View style={s.header}>
      <Tap testID="home-brand-button" onPress={() => go('settings')} style={s.brand} haptic={false} accessibilityLabel="Azam">
        {showPhoto ? <View style={s.brandPhoto}><Avatar photoPath={user.photo_path} size={40} testID="home-avatar" /><T size={22} weight="800" style={{ letterSpacing: -0.5 }}>Azam</T></View> : <Logo size={38} wordmark />}
      </Tap>
      <View style={s.headerRight}><Tap testID="home-location-button" style={s.location} onPress={() => setModal({ type: 'location' })}><Icon name="location" size={13} color={colors.brandTertiary} /><T numberOfLines={1} size={12} weight="600" style={{ maxWidth: 72 }}>{settings.city}</T><Icon name="chevron-down" size={12} color={colors.muted} /></Tap>
      <Tap testID="home-settings-button" style={s.settings} onPress={() => go('settings')}><Icon name="settings-outline" size={20} /></Tap></View>
    </View>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <Animated.View entering={FadeInDown.duration(500)} style={s.contentInner}>
        <View style={s.greeting}><View style={{ flex: 1, gap: 2 }}><T size={13} muted numberOfLines={1} testID="home-greet-line">{greet}, {salutation}{firstName ? ` ${firstName}` : ''}</T><T size={26} weight="800" testID="home-greeting" style={s.greetingTitle} numberOfLines={1} adjustsFontSizeToFit>{t('home.salam')} ✨</T></View>
          <Tap testID="home-streak-button" onPress={() => go('progress')} style={s.streak}><LinearGradient colors={[colors.gold, colors.warning]} style={s.streakBg} /><PulseFlame size={18} color={colors.goldInk} /><T weight="800" color={colors.goldInk}>{progress.data?.streak ?? 0}</T><T size={10} weight="600" color={colors.goldInk}>{t('common.days')}</T></Tap></View>
        <ImageBackground source={IMG.heroBirds} style={s.hero} imageStyle={s.heroImage} testID="next-prayer-card" onLayout={e => setHeroSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          {tint && <LinearGradient testID={`hero-sky-${phase}`} colors={tint as any} locations={[0, 0.55, 1]} style={s.heroShade} />}
          <LinearGradient colors={[colors.transparent, colors.overlay, colors.heroShade]} locations={[0, 0.55, 1]} style={s.heroShade} />
          {heroSize.w > 0 && <SkyLife width={heroSize.w} height={heroSize.h} birds={3} stars={phase === 'night' ? 6 : phase === 'day' ? 0 : 2} />}
          <View style={s.heroContent}><View style={s.heroEyebrow}><View style={s.dot} /><T size={10} weight="700" color={colors.heroMuted}>{t('home.nextPrayer')}{isTomorrow ? ` · ${t('home.tomorrow')}` : ''}</T></View>
            {nextQuery.isLoading ? <Status loading /> : nextQuery.error ? <Tap testID="prayer-retry-button" onPress={() => nextQuery.refetch()}><T color={colors.heroInk} size={13}>{t('common.retry')}</T></Tap> : <View style={s.heroRow}>
              <View><T testID="next-prayer-name" size={22} weight="700" color={colors.heroInk}>{next ? prayer(next.name) : ''}</T><T testID="next-prayer-time" size={46} weight="800" color={colors.heroInk} style={s.heroTime}>{next?.time.replace(':', '.')}</T></View>
              <View style={s.countdown}><Icon name="hourglass-outline" size={14} color={colors.gold} /><T testID="prayer-countdown" size={13} weight="700" color={colors.heroInk}>{countdown}</T></View>
            </View>}
            <View style={s.heroFooter}><Icon name="calendar-clear-outline" size={12} color={colors.heroMuted} /><T size={10} color={colors.heroMuted} numberOfLines={1}>{hijri ? `${hijri} · ` : `${now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })} · `}{settings.city}</T></View>
          </View>
        </ImageBackground>
        <View style={s.prayerSection}><View style={s.rowBetween}><T size={15} weight="700">{t('home.today')}</T><T testID="today-prayer-count" size={11} muted>{t('home.doneOf', { n: complete.length })}</T></View>
          <View style={s.prayerRow}>{list.map((p: any) => {
            const done = complete.includes(p.name); const active = !isTomorrow && next?.name === p.name;
            return <Tap testID={`prayer-checkin-${p.name.toLowerCase()}`} key={p.name} disabled={checking} onPress={() => checkin(p.name)} style={[s.prayerCell, active && s.prayerActive, done && s.prayerDone]} accessibilityLabel={`Catat salat ${p.name}`}>
              <View style={s.skyWrap}><PrayerSky name={p.name} size={44} />{done && <View style={s.doneBadge}><Icon name="checkmark" size={11} color={colors.onSuccess} /></View>}</View>
              <T size={10} weight="600" color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{prayer(p.name)}</T><T size={11} weight="700" color={active ? colors.onBrandPrimary : colors.onSurface}>{p.time.replace(':', '.')}</T>
            </Tap>;
          })}</View>
          {prayers.error && <T size={11} muted>{t('common.retry')}</T>}
        </View>
        <StreakNudge list={list} complete={complete} timeNow={timeNow} />
        <Tap testID="home-focus-button" onPress={() => go('focus')} style={s.blockerCard}><Image source={IMG.instagram} style={s.blockerArt} /><View style={{ flex: 1, gap: 4 }}><Badge text={settings.blocker_enabled ? t('home.blockerOn') : t('home.blockerOff')} icon={settings.blocker_enabled ? 'shield-checkmark' : 'shield-outline'} /><T weight="700" size={14}>{t('home.pauseApps')}</T><T size={11} muted>{settings.blocker_enabled ? t('home.beforeAdhan', { n: settings.reminder_minutes, apps: settings.blocked_apps.length }) : t('home.tapEnable')}</T></View><Icon name="chevron-forward" size={18} color={colors.muted} /></Tap>
        {nextEvent && <Tap testID="home-event-button" onPress={() => go('progress')} style={s.eventPill}><Icon name={nextEvent.icon} size={18} color={colors.goldText} /><View style={{ flex: 1 }}><T size={12} weight="700">{nextEvent.name}</T><T size={10} muted>{nextEvent.hijri} · {new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}</T></View><Badge text={nextEvent.days_until === 0 ? t('home.eventToday') : t('home.eventIn', { n: nextEvent.days_until })} gold /></Tap>}
        <Tap testID="home-alarm-button" onPress={() => go('alarms')} style={s.blockerCard}><IconBox name="alarm" size={56} icon={26} bg={colors.brandPrimary} color={colors.onBrandPrimary} /><View style={{ flex: 1, gap: 4 }}><Badge text={`${nextAlarm ? t('home.nextAlarm') : t('home.dzikirAlarm')} · ${t('common.pro')}`} icon={settings.pro_preview ? 'alarm-outline' : 'lock-closed'} gold /><T weight="700" size={14}>{nextAlarm ? `${showTime(nextAlarm.alarm.time)} · ${nextAlarm.alarm.label}` : t('home.wakeDzikir')}</T><T size={11} muted>{nextAlarm ? `${describeRepeat(nextAlarm.alarm)} · ${t('home.in')} ${untilText(nextAlarm.at, now)}` : t('home.alarmHint')}</T></View><Icon name="chevron-forward" size={18} color={colors.muted} /></Tap>
        <View style={s.quickRow}>
          <Tap testID="home-qibla-button" style={s.quickCard} onPress={() => go('qibla')}><Image source={IMG.kaaba} style={s.quickArt} /><T weight="700" size={13}>{t('home.qibla')}</T><T size={10} muted>{t('home.kaaba')}</T></Tap>
          <Tap testID="home-quran-button" style={s.quickCard} onPress={() => go('quran')}><IconBox name="book" size={52} icon={26} bg={colors.brandDeep} color={colors.white} /><T weight="700" size={13}>{t('home.quran')}</T><T size={10} muted>{t('home.surahs')}</T></Tap>
          <Tap testID="home-sunnah-button" style={s.quickCard} onPress={() => go('sunnah')}><IconBox name="moon" size={52} icon={26} bg={colors.gold} color={colors.goldInk} /><T weight="700" size={13}>{t('home.sunnah')}</T><T size={10} color={colors.goldText}>{t('common.pro')}</T></Tap>
        </View>
        <Tap testID="home-pro-banner" onPress={() => go('pro')} style={s.proBanner}><ImageBackground source={IMG.heroBirds} style={s.proBg} imageStyle={{ borderRadius: 24 }}><LinearGradient colors={[colors.heroShade, colors.overlay, colors.transparent]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.heroShade} /><View style={s.proBody}><Badge text="AZAM PRO" gold icon="sparkles" style={{ backgroundColor: colors.gold }} /><T size={17} weight="800" color={colors.heroInk}>{t('home.proTitle')}</T><View style={s.proCta}><T size={11} weight="700" color={colors.goldInk}>{settings.pro_preview ? t('home.proActive') : t('home.proTry')}</T><Icon name="arrow-forward" size={13} color={colors.goldInk} /></View></View></ImageBackground></Tap>
        <View style={s.dailySection}><Section title={t('home.verse')} action={t('home.read')} testID="daily-read-button" onPress={() => daily.data && read(daily.data.number)} />
          <Paper style={s.dailyCard} testID="daily-verse-card">{daily.isLoading ? <Status loading /> : daily.error ? <Status error={daily.error} retry={daily.refetch} /> : <>
            <View style={s.rowBetween}><View style={s.paperBadge}><Icon name="book-outline" size={12} color={colors.brandDeep} /><T size={10} weight="800" color={colors.brandDeep}>QS. {daily.data?.surah} : {daily.data?.nomorAyat}</T></View><Tap testID="daily-share-button" onPress={() => setModal({ type: 'share-verse', verse: daily.data })} style={s.share}><Icon name="share-social-outline" size={18} color={colors.brandDeep} /></Tap></View>
            <T arabic paper size={25} testID="daily-arabic-text" style={s.arabic}>{daily.data?.teksArab}</T>{daily.data?.teksLatin && <T paper testID="daily-latin-text" size={11} weight="600" color={colors.brandDeep} style={{ fontStyle: 'italic', lineHeight: 17 }}>{daily.data.teksLatin}</T>}<T paper muted size={12} style={s.translation}>“{daily.data?.teksIndonesia}”</T>
          </>}</Paper>
        </View>
        <T testID="prayer-data-source" muted size={9} style={{ textAlign: 'center' }}>{prayers.data?.method || 'Kemenag RI · AlAdhan'} · {settings.city}{!settings.location_set ? ` ${t('home.initialLocation')}` : ''} · {t('home.source')}</T>
      </Animated.View>
    </ScrollView>
  </Bg>;
}
const useStyles = makeStyles(c => ({
  header: { paddingHorizontal: 22, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 72 }, headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }, brand: { flexDirection: 'row', alignItems: 'center', minHeight: 44 }, brandPhoto: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  location: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, settings: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border },
  content: { paddingHorizontal: 22, paddingBottom: 24 }, contentInner: { gap: 20 }, greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingTop: 4 }, greetingTitle: { letterSpacing: -0.8, lineHeight: 32 },
  streak: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, minHeight: 44, alignItems: 'center', borderRadius: 16, overflow: 'hidden' }, streakBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hero: { height: 236, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end' }, heroImage: { borderRadius: 28 }, heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, heroContent: { padding: 20, gap: 6 }, heroEyebrow: { flexDirection: 'row', gap: 6, alignItems: 'center' }, dot: { width: 6, height: 6, backgroundColor: c.gold, borderRadius: 3 }, heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, heroTime: { letterSpacing: -2, lineHeight: 54 }, countdown: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.glassStrong, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8 }, heroFooter: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  prayerSection: { gap: 12 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, prayerRow: { flexDirection: 'row', gap: 6 }, prayerCell: { flex: 1, minHeight: 104, paddingVertical: 10, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 4, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, prayerActive: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, prayerDone: { borderColor: c.success, backgroundColor: c.surface },
  skyWrap: { width: 44, height: 44, marginBottom: 2 }, doneBadge: { position: 'absolute', right: -5, top: -5, width: 18, height: 18, borderRadius: 9, backgroundColor: c.success, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface },
  blockerCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' }, blockerArt: { width: 72, height: 72, borderRadius: 18 },
  eventPill: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.goldSoft },
  quickRow: { flexDirection: 'row', gap: 10 }, quickCard: { flex: 1, padding: 12, borderRadius: 22, alignItems: 'center', gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, quickArt: { width: 52, height: 52, borderRadius: 17 },
  proBanner: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: c.gold }, proBg: { minHeight: 132, justifyContent: 'center' }, proBody: { padding: 16, gap: 8, maxWidth: '78%' }, proCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: c.gold, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  dailySection: { gap: 10 }, dailyCard: { gap: 12 }, paperBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.paperTint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, share: { height: 44, width: 40, alignItems: 'center', justifyContent: 'center' }, arabic: { textAlign: 'right', writingDirection: 'rtl' }, translation: { lineHeight: 21 },
}));
