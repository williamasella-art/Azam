import React from 'react';
import { View } from 'react-native';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Badge, Button, Card, Icon, Page, Section, Status, T, Tap } from '@/src/components/ui';
import { LevelArt } from '@/src/components/illustrations';

export function Progress() {
  const { progress, go, day, month, setMonth, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const data = progress.data;
  const [year, monthNum] = month.split('-').map(Number);
  const first = new Date(year, monthNum - 1, 1).getDay();
  const length = new Date(year, monthNum, 0).getDate();
  const move = (amount: number) => { const d = new Date(year, monthNum - 1 + amount, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };
  const level = data?.levels.filter((l: any) => l.unlocked).at(-1);
  const weekly = Array.from({ length: 7 }, (_, i) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() - 6 + i); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; return { key, date: d, count: data?.recent[key]?.length || 0 }; });
  return <Page title="Jejak kebaikan" subtitle="Bukan sempurna, tetapi terus berusaha." right={<Tap testID="progress-share-button" style={s.headerButton} onPress={() => setModal({ type: 'share-progress' })}><Icon name="share-social-outline" size={20} color={colors.onBrandSecondary} /></Tap>}>
    {progress.isLoading || progress.error ? <Status loading={progress.isLoading} error={progress.error} retry={progress.refetch} /> : <>
      <View style={s.streakHero}><View style={{ flex: 1, gap: 5 }}><Badge text={level ? `LEVEL ${level.name.toUpperCase()}` : 'SETIAP LANGKAH BERARTI'} /><View style={s.streakNumber}><T testID="progress-streak-count" size={49} weight="800" color={colors.onBrandSecondary} style={{ lineHeight: 62, letterSpacing: -2 }}>{data.streak}</T><T size={15} color={colors.onBrandSecondary} style={{ marginBottom: 9 }}>hari istiqamah</T></View><T size={11} muted>{data.streak ? 'Jaga langkah baikmu, satu salat lagi.' : 'Perjalanan indah dimulai hari ini.'}</T></View><LevelArt kind={level?.icon || 'cloud'} size={95} /></View>
      <View style={s.statsRow}>{[[data.total, 'Salat tercatat', 'checkmark-circle-outline'], [data.best, 'Streak terbaik', 'flame-outline'], [data.complete_days, 'Hari lengkap', 'sunny-outline']].map(([value, label, icon]) => <Card key={String(label)} style={s.stat}><Icon name={icon} size={19} color={colors.onBrandSecondary} /><T testID={`stat-${String(label).replaceAll(' ', '-').toLowerCase()}`} size={23} weight="800">{value}</T><T size={9} muted>{label}</T></Card>)}</View>
      <Card style={s.calendar}><View style={s.monthRow}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="calendar-outline" size={19} color={colors.onBrandSecondary} /><T testID="calendar-month-label" weight="700" size={15}>{new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</T></View><View style={{ flexDirection: 'row' }}><Tap testID="calendar-previous-button" style={s.calendarNav} onPress={() => move(-1)}><Icon name="chevron-back" size={18} /></Tap><Tap testID="calendar-next-button" disabled={month >= day.slice(0, 7)} style={s.calendarNav} onPress={() => move(1)}><Icon name="chevron-forward" size={18} /></Tap></View></View>
        <View style={s.weekdays}>{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <View key={d} style={s.weekday}><T size={10} muted>{d}</T></View>)}</View>
        <View style={s.calendarGrid}>{Array.from({ length: first + length }, (_, i) => {
          const n = i - first + 1; const date = `${month}-${String(n).padStart(2, '0')}`; const count = data.calendar[date]?.length || 0;
          if (n < 1) return <View key={i} style={s.dayCell} />;
          return <Tap testID={`calendar-day-${n}`} key={i} disabled={date > day} onPress={() => setModal({ type: 'day', date })} style={[s.dayCell, date === day && s.today]}><T size={12} weight={date === day ? '800' : '500'} color={date === day ? colors.onBrandSecondary : date > day ? colors.muted : colors.onSurface}>{n}</T><View style={[s.dayDot, { backgroundColor: count === 5 ? colors.brandPrimary : count ? colors.brandTertiary : colors.border }]} /></Tap>;
        })}</View>
        <View style={s.legend}>{[[colors.brandPrimary, 'Lengkap'], [colors.brandTertiary, 'Sebagian'], [colors.border, 'Belum dicatat']].map(([color, label]) => <View key={label} style={s.legendItem}><View style={[s.dayDot, { backgroundColor: color }]} /><T size={9} muted>{label}</T></View>)}</View>
      </Card>
      {month === day.slice(0, 7) && <View style={{ gap: 12 }}><Section title="Langkah minggu ini" /><Card style={s.chart}><View style={s.chartBars}>{weekly.map(item => <View key={item.key} style={s.barColumn}><T size={10} color={colors.onBrandSecondary}>{item.count}/5</T><View style={s.barTrack}><View style={[s.bar, { height: `${item.count * 20}%` }]} /></View><T size={10} muted>{item.date.toLocaleDateString('id-ID', { weekday: 'short' })}</T></View>)}</View><T size={10} muted style={{ textAlign: 'center' }}>Lima waktu, lima kesempatan untuk kembali.</T></Card></View>}
      <Tap testID="progress-achievements-button" style={s.achievementLink} onPress={() => go('achievements')}><LevelArt kind="star" size={57} /><View style={{ flex: 1 }}><T size={15} weight="700">Langit pencapaianmu</T><T size={11} muted>Awan, Bintang, Purnama, hingga Syams.</T></View><Icon name="chevron-forward" size={19} color={colors.onBrandSecondary} /></Tap>
      <T size={10} muted style={{ textAlign: 'center' }}>Satu hari streak = lima salat tercatat lengkap.{"\n"}Catatan adalah pengingat pribadi, bukan penilaian ibadah.</T>
    </>}
  </Page>;
}

export function Achievements() {
  const { progress, setModal } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const levels = progress.data?.levels || []; const best = progress.data?.best || 0;
  return <Page title="Langit pencapaian" back="progress" subtitle="Setiap langkah kecil membuatmu bersinar.">
    <View style={s.achievementHero}><View style={s.stars}><Icon name="sparkles-outline" color={colors.brand} /><LevelArt kind="moon" size={135} /><Icon name="star-outline" size={18} color={colors.brand} /></View><T size={25} weight="800">Tumbuh dalam istiqamah.</T><T muted size={12} style={{ textAlign: 'center' }}>Tidak perlu membandingkan perjalananmu.{"\n"}Hari ini adalah kesempatan yang baru.</T></View>
    {levels.map((level: any, i: number) => <Card key={level.name} testID={`achievement-${level.name.toLowerCase()}`} style={s.levelCard}><LevelArt kind={level.icon} size={73} locked={!level.unlocked} /><View style={{ flex: 1, gap: 6 }}><View style={s.monthRow}><T size={17} weight="800">{level.name}</T><Icon name={level.unlocked ? 'checkmark-circle' : 'lock-closed-outline'} size={17} color={level.unlocked ? colors.success : colors.muted} /></View><T size={11} muted>{['Langkah pertama yang berarti', 'Tujuh hari merawat niat', 'Terang dalam ketekunan', 'Bersinar dengan konsistensi'][i]}</T><View style={s.progressTrack}><View style={[s.progressFill, { width: `${Math.min(100, best / level.days * 100)}%` }]} /></View><T size={10} color={colors.onBrandSecondary}>{Math.min(best, level.days)} / {level.days} hari berturut-turut{level.unlocked ? ' · Tercapai' : ''}</T></View></Card>)}
    <Button testID="achievement-share-button" title="Bagikan perjalanan baikmu" icon="share-social-outline" onPress={() => setModal({ type: 'share-progress' })} />
  </Page>;
}
const useStyles = makeStyles(c => ({
  headerButton: { height: 44, width: 44, backgroundColor: c.brandSecondary, alignItems: 'center', justifyContent: 'center', borderRadius: 14 }, streakHero: { padding: 21, borderRadius: 25, backgroundColor: c.brandSecondary, flexDirection: 'row', alignItems: 'center', gap: 5 }, streakNumber: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 9 }, stat: { flex: 1, alignItems: 'center', paddingHorizontal: 3, paddingVertical: 17, gap: 5, borderRadius: 19 }, calendar: { padding: 17, gap: 16 }, monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, calendarNav: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' }, weekdays: { flexDirection: 'row' }, weekday: { width: '14.2857%', alignItems: 'center' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 }, dayCell: { width: '14.2857%', height: 46, justifyContent: 'center', alignItems: 'center', gap: 6, borderRadius: 13 }, today: { backgroundColor: c.brandSecondary }, dayDot: { height: 5, width: 5, borderRadius: 3 }, legend: { flexDirection: 'row', justifyContent: 'center', gap: 13, paddingTop: 6 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chart: { gap: 18 }, chartBars: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' }, barColumn: { flex: 1, alignItems: 'center', gap: 10 }, barTrack: { height: 86, width: '65%', borderRadius: 7, overflow: 'hidden', backgroundColor: c.surfaceTertiary, justifyContent: 'flex-end' }, bar: { width: '100%', minHeight: 0, backgroundColor: c.brand, borderRadius: 7 }, achievementLink: { padding: 16, borderRadius: 22, backgroundColor: c.brandSecondary, flexDirection: 'row', alignItems: 'center', gap: 10 },
  achievementHero: { alignItems: 'center', gap: 16, paddingVertical: 8 }, stars: { flexDirection: 'row', gap: 12, alignItems: 'center' }, levelCard: { flexDirection: 'row', gap: 15, alignItems: 'center', padding: 17 }, progressTrack: { height: 5, borderRadius: 3, backgroundColor: c.surfaceTertiary, overflow: 'hidden', marginTop: 5 }, progressFill: { backgroundColor: c.brandPrimary, height: '100%', borderRadius: 3 },
}));