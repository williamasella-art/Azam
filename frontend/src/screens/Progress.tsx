import React, { useState } from 'react';
import { FlatList, Image, ImageBackground, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { BADGES, IMG, LEVEL_COPY } from '@/src/assets';
import { Badge, Button, Card, Icon, Page, Paper, Section, Status, T, Tap } from '@/src/components/ui';
import { PulseFlame } from '@/src/components/SkyLife';

export function LevelBadge({ name, size = 96, locked = false, style }: { name: string; size?: number; locked?: boolean; style?: any }) {
  const { colors } = useTheme();
  return <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.surfaceSecondary }, style]}>
    <Image source={BADGES[name]} style={{ width: size, height: size, opacity: locked ? 0.35 : 1 }} accessibilityLabel={`Lencana ${name}`} />
    {locked && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Icon name="lock-closed" size={size * 0.3} color={colors.onSurfaceTertiary} /></View>}
  </View>;
}
export function AchievementSlides({ levels, best }: { levels: any[]; best: number }) {
  const s = useStyles(); const { colors } = useTheme(); const { width } = useWindowDimensions(); const [index, setIndex] = useState(0); const { setModal } = useApp();
  const cardWidth = Math.min(width, 560) - 44;
  return <View style={{ gap: 10 }}>
    <FlatList testID="achievement-slides" data={levels} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={l => l.name} snapToInterval={cardWidth + 12} decelerationRate="fast"
      onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 12)))} contentContainerStyle={{ gap: 12 }}
      renderItem={({ item }) => <ImageBackground source={IMG.shareBg} style={[s.slide, { width: cardWidth }]} imageStyle={{ borderRadius: 26 }} testID={`achievement-${item.name.toLowerCase()}`}>
        <LinearGradient colors={[colors.transparent, colors.overlay]} style={s.slideShade} />
        <LevelBadge name={item.name} size={120} locked={!item.unlocked} />
        <View style={{ alignItems: 'center', gap: 4 }}><Badge text={item.unlocked ? 'TERCAPAI ✓' : `${item.days} HARI BERTURUT`} gold={item.unlocked} /><T size={24} weight="800" color={colors.heroInk}>{item.name}</T><T size={12} color={colors.heroMuted} style={{ textAlign: 'center' }}>{LEVEL_COPY[item.name]}</T></View>
        <View style={s.track}><View style={[s.fill, { width: `${Math.min(100, best / item.days * 100)}%` }]} /></View>
        <T size={10} color={colors.heroMuted}>{Math.min(best, item.days)} / {item.days} hari</T>
        {item.unlocked && <Button size="sm" testID={`achievement-share-${item.name.toLowerCase()}`} title="Bagikan lencana" icon="share-social" variant="gold" onPress={() => setModal({ type: 'share-badge', level: item })} />}
      </ImageBackground>} />
    <View style={s.dots}>{levels.map((l, i) => <View key={l.name} style={[s.dot, i === index && s.dotOn]} />)}</View>
  </View>;
}
export function Progress() {
  const { progress, go, day, month, setMonth, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const data = progress.data;
  const [year, monthNum] = month.split('-').map(Number);
  const first = new Date(year, monthNum - 1, 1).getDay();
  const length = new Date(year, monthNum, 0).getDate();
  const move = (amount: number) => { const d = new Date(year, monthNum - 1 + amount, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };
  const level = data?.levels.filter((l: any) => l.unlocked).at(-1); const nextLevel = data?.levels.find((l: any) => !l.unlocked);
  const weekly = Array.from({ length: 7 }, (_, i) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() - 6 + i); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; return { key, date: d, count: data?.recent[key]?.length || 0 }; });
  return <Page title="Progres" subtitle="Bukan sempurna, tetapi terus berusaha." right={<Tap testID="progress-share-button" style={s.headerButton} onPress={() => setModal({ type: 'share-progress' })}><Icon name="share-social" size={18} color={colors.onBrandPrimary} /><T size={12} weight="700" color={colors.onBrandPrimary}>Story</T></Tap>}>
    {progress.isLoading || progress.error ? <Status loading={progress.isLoading} error={progress.error} retry={progress.refetch} /> : <>
      <Card style={s.streakHero}><LinearGradient colors={[colors.solidStrong, colors.pageTop]} style={s.heroBg} />
        <View style={{ flex: 1, gap: 6 }}><Badge text={level ? `LEVEL ${level.name.toUpperCase()}` : 'MULAI LANGKAH PERTAMA'} gold={!!level} icon="flame" /><View style={s.streakNumber}><T testID="progress-streak-count" size={54} weight="800" color={colors.brandTertiary} style={{ lineHeight: 62, letterSpacing: -2 }}>{data.streak}</T><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}><T size={15} weight="600">hari streak</T><PulseFlame size={20} color={colors.gold} /></View></View>
          <T size={11} muted>{nextLevel ? `${Math.max(0, nextLevel.days - data.best)} hari lagi menuju ${nextLevel.name}` : 'Semua tingkatan tercapai. Masya Allah!'}</T></View>
        <LevelBadge name={level?.name || 'Awan'} size={104} locked={!level} /></Card>
      <View style={s.statsRow}>{[[data.total, 'Salat tercatat', 'checkmark-done-circle'], [data.best, 'Streak terbaik', 'trophy'], [data.complete_days, 'Hari lengkap', 'sunny']].map(([value, label, icon]) => <Card key={String(label)} style={s.stat}><Icon name={icon} size={20} color={colors.gold} /><T testID={`stat-${String(label).replaceAll(' ', '-').toLowerCase()}`} size={24} weight="800">{value}</T><T size={9} muted>{label}</T></Card>)}</View>
      <Section title="Langit pencapaianmu" action="Detail" testID="progress-achievements-button" onPress={() => go('achievements')} />
      <AchievementSlides levels={data.levels} best={data.best} />
      <Paper style={s.calendar}><View style={s.monthRow}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="calendar" size={18} color={colors.brandDeep} /><T paper testID="calendar-month-label" weight="700" size={15}>{new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</T></View><View style={{ flexDirection: 'row' }}><Tap testID="calendar-previous-button" style={s.calendarNav} onPress={() => move(-1)}><Icon name="chevron-back" size={18} color={colors.onPaper} /></Tap><Tap testID="calendar-next-button" disabled={month >= day.slice(0, 7)} style={s.calendarNav} onPress={() => move(1)}><Icon name="chevron-forward" size={18} color={colors.onPaper} /></Tap></View></View>
        <View style={s.weekdays}>{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <View key={d} style={s.weekday}><T paper muted size={10}>{d}</T></View>)}</View>
        <View style={s.calendarGrid}>{Array.from({ length: first + length }, (_, i) => {
          const n = i - first + 1; const date = `${month}-${String(n).padStart(2, '0')}`; const count = data.calendar[date]?.length || 0;
          if (n < 1) return <View key={i} style={s.dayCell} />;
          return <Tap testID={`calendar-day-${n}`} key={i} disabled={date > day} onPress={() => setModal({ type: 'day', date })} style={[s.dayCell, date === day && s.today, count === 5 && s.fullDay]}><T size={12} weight={date === day ? '800' : '500'} color={count === 5 ? colors.white : date > day ? colors.paperMuted : colors.onPaper}>{n}</T><View style={[s.dayDot, { backgroundColor: count === 5 ? colors.white : count ? colors.brandDeep : colors.paperBorder }]} /></Tap>;
        })}</View>
        <View style={s.legend}>{[[colors.brandDeep, 'Lengkap'], [colors.brandTertiary, 'Sebagian'], [colors.paperBorder, 'Belum']].map(([color, label]) => <View key={label} style={s.legendItem}><View style={[s.dayDot, { backgroundColor: color }]} /><T paper muted size={9}>{label}</T></View>)}</View>
      </Paper>
      {month === day.slice(0, 7) && <Card style={s.chart}><Section title="Minggu ini" /><View style={s.chartBars}>{weekly.map(item => <View key={item.key} style={s.barColumn}><T size={10} color={colors.onBrandSecondary}>{item.count}/5</T><View style={s.barTrack}><LinearGradient colors={[colors.brandTertiary, colors.brandDeep]} style={[s.bar, { height: `${Math.max(4, item.count * 20)}%` }]} /></View><T size={10} muted>{item.date.toLocaleDateString('id-ID', { weekday: 'short' })}</T></View>)}</View></Card>}
      <Button testID="achievement-share-button" title="Bagikan streak ke Story" icon="share-social" variant="gold" onPress={() => setModal({ type: 'share-progress' })} />
      <T size={10} muted style={{ textAlign: 'center' }}>Satu hari streak = lima salat tercatat lengkap.{"\n"}Catatan adalah pengingat pribadi, bukan penilaian ibadah.</T>
    </>}
  </Page>;
}
export function Achievements() {
  const { progress, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const levels = progress.data?.levels || []; const best = progress.data?.best || 0;
  return <Page title="Langit pencapaian" back="progress" subtitle="Setiap langkah kecil membuatmu bersinar.">
    <AchievementSlides levels={levels} best={best} />
    {levels.map((level: any) => <Card key={level.name} testID={`achievement-row-${level.name.toLowerCase()}`} style={s.levelCard}><LevelBadge name={level.name} size={72} locked={!level.unlocked} /><View style={{ flex: 1, gap: 5 }}><View style={s.monthRow}><T size={17} weight="800">{level.name}</T><Icon name={level.unlocked ? 'checkmark-circle' : 'lock-closed-outline'} size={17} color={level.unlocked ? colors.success : colors.muted} /></View><T size={11} muted>{LEVEL_COPY[level.name]}</T><View style={s.trackDark}><View style={[s.fill, { width: `${Math.min(100, best / level.days * 100)}%` }]} /></View><T size={10} color={colors.onBrandSecondary}>{Math.min(best, level.days)} / {level.days} hari berturut-turut{level.unlocked ? ' · Tercapai' : ''}</T>
      {level.unlocked && <Tap testID={`achievement-row-share-${level.name.toLowerCase()}`} onPress={() => setModal({ type: 'share-badge', level })} style={s.rowShare}><Icon name="share-social-outline" size={15} color={colors.goldText} /><T size={11} weight="700" color={colors.goldText}>Bagikan lencana ke Story</T></Tap>}</View></Card>)}
    <Button testID="achievement-share-button" title="Bagikan ke Story" icon="share-social" variant="gold" onPress={() => setModal({ type: 'share-progress' })} />
  </Page>;
}
const useStyles = makeStyles(c => ({
  headerButton: { height: 42, paddingHorizontal: 14, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center', borderRadius: 14, flexDirection: 'row', gap: 6 },
  streakHero: { flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden', padding: 20 }, heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, streakNumber: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  statsRow: { flexDirection: 'row', gap: 9 }, stat: { flex: 1, alignItems: 'center', paddingHorizontal: 3, paddingVertical: 16, gap: 4, borderRadius: 20 },
  slide: { minHeight: 330, borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, overflow: 'hidden' }, slideShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  rowShare: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, marginTop: 2 },
  track: { width: '70%', height: 6, borderRadius: 3, backgroundColor: c.glassStrong, overflow: 'hidden' }, trackDark: { height: 5, borderRadius: 3, backgroundColor: c.surfaceTertiary, overflow: 'hidden', marginTop: 4 }, fill: { height: '100%', borderRadius: 3, backgroundColor: c.gold },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.glassStrong }, dotOn: { width: 18, backgroundColor: c.brandTertiary },
  calendar: { gap: 14 }, monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, calendarNav: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' }, weekdays: { flexDirection: 'row' }, weekday: { width: '14.2857%', alignItems: 'center' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 }, dayCell: { width: '14.2857%', height: 46, justifyContent: 'center', alignItems: 'center', gap: 5, borderRadius: 13 }, today: { backgroundColor: c.paperTint, borderWidth: 1, borderColor: c.brandDeep }, fullDay: { backgroundColor: c.brandDeep }, dayDot: { height: 5, width: 5, borderRadius: 3 }, legend: { flexDirection: 'row', justifyContent: 'center', gap: 13, paddingTop: 4 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chart: { gap: 16 }, chartBars: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' }, barColumn: { flex: 1, alignItems: 'center', gap: 8 }, barTrack: { height: 86, width: '65%', borderRadius: 8, overflow: 'hidden', backgroundColor: c.glass, justifyContent: 'flex-end' }, bar: { width: '100%', borderRadius: 8 },
  levelCard: { flexDirection: 'row', gap: 15, alignItems: 'center', padding: 16 },
}));
