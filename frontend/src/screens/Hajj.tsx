import React, { useMemo, useState } from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { Badge, Button, Card, Icon, Page, Paper, T, Tap } from '@/src/components/ui';

type Step = { id: string; title: string; text: string; dua?: { arab: string; latin?: string; arti: string; label?: string } };
type Phase = { key: string; title: string; short: string; icon: string; intro: string; steps: Step[] };
const TALBIYAH = { label: 'Talbiyah', arab: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيْكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيْكَ لَكَ', latin: 'Labbaik Allahumma labbaik, labbaika la syarika laka labbaik, innal hamda wan ni’mata laka wal mulk, la syarika lak.', arti: 'Aku datang memenuhi panggilan-Mu ya Allah. Tiada sekutu bagi-Mu. Sungguh segala puji, nikmat, dan kerajaan adalah milik-Mu.' };
export const HAJJ_PHASES: Phase[] = [
  { key: 'persiapan', title: 'Persiapan sebelum berangkat', short: 'Persiapan', icon: 'briefcase-outline', intro: 'Bekal ilmu, fisik, dan hati sebelum menuju Tanah Suci.', steps: [
    { id: 'p1', title: 'Luruskan niat & selesaikan urusan', text: 'Niatkan hanya untuk Allah. Lunasi utang, minta maaf kepada keluarga dan tetangga, tinggalkan nafkah untuk yang ditinggalkan.', dua: { label: 'Doa memohon keikhlasan', arab: 'اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا وَذَنْبًا مَغْفُورًا', latin: 'Allahummaj’alhu hajjan mabruran wa dzanban maghfuran.', arti: 'Ya Allah, jadikanlah ini haji yang mabrur dan dosa yang diampuni.' } },
    { id: 'p2', title: 'Belajar manasik', text: 'Ikuti bimbingan manasik KBIH/Kemenag. Pahami rukun, wajib, sunnah, dan larangan ihram agar ibadah tertib.' },
    { id: 'p3', title: 'Kesehatan & dokumen', text: 'Vaksin meningitis, cek kesehatan, paspor, visa, gelang identitas, obat pribadi, dua set pakaian ihram, sandal, dan tas kecil.' },
    { id: 'p4', title: 'Doa keluar rumah & safar', text: 'Salat dua rakaat sebelum berangkat, pamit kepada keluarga, dan berdoa saat kendaraan mulai bergerak.', dua: { label: 'Doa safar', arab: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', latin: 'Subhanalladzi sakhkhara lana hadza wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun.', arti: 'Maha Suci Allah yang menundukkan kendaraan ini untuk kami, padahal kami tidak mampu menguasainya, dan sungguh kepada Tuhan kami, kami akan kembali.' } },
  ] },
  { key: 'umrah', title: 'Umrah', short: 'Umrah', icon: 'walk-outline', intro: 'Ihram → tawaf → sa’i → tahallul. Kerjakan berurutan.', steps: [
    { id: 'u1', title: 'Ihram dari miqat', text: 'Mandi, pakai wewangian di badan (bukan kain ihram), kenakan ihram, salat dua rakaat, lalu berniat saat melewati miqat.', dua: { label: 'Niat umrah', arab: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً', latin: 'Labbaika Allahumma ‘umratan.', arti: 'Aku datang memenuhi panggilan-Mu ya Allah untuk berumrah.' } },
    { id: 'u2', title: 'Talbiyah sepanjang perjalanan', text: 'Ucapkan talbiyah berulang hingga memulai tawaf. Laki-laki mengeraskan suara, perempuan melirihkan.', dua: TALBIYAH },
    { id: 'u3', title: 'Masuk Masjidil Haram', text: 'Masuk dengan kaki kanan, berdoa, lalu menuju Ka’bah. Saat melihat Ka’bah, angkat tangan dan berdoa apa saja.', dua: { label: 'Doa masuk masjid', arab: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', latin: 'Bismillah wash-shalatu was-salamu ‘ala rasulillah, Allahummaftah li abwaba rahmatik.', arti: 'Dengan nama Allah, salawat dan salam atas Rasulullah. Ya Allah, bukakan untukku pintu-pintu rahmat-Mu.' } },
    { id: 'u4', title: 'Tawaf tujuh putaran', text: 'Mulai dari garis Hajar Aswad, Ka’bah di sisi kiri. Setiap putaran isyaratkan tangan ke Hajar Aswad sambil takbir. Antara Rukun Yamani dan Hajar Aswad baca doa sapu jagat.', dua: { label: 'Doa antara Rukun Yamani & Hajar Aswad', arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', latin: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina ‘adzaban-nar.', arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka.' } },
    { id: 'u5', title: 'Salat di belakang Maqam Ibrahim & minum zamzam', text: 'Dua rakaat ringan (Al-Kafirun & Al-Ikhlas), lalu minum air zamzam menghadap Ka’bah sambil berdoa.', dua: { label: 'Doa minum zamzam', arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ', latin: 'Allahumma inni as’aluka ‘ilman nafi’an wa rizqan wasi’an wa syifa’an min kulli da’.', arti: 'Ya Allah, aku memohon ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit.' } },
    { id: 'u6', title: 'Sa’i Shafa–Marwah tujuh kali', text: 'Mulai di Shafa menghadap Ka’bah, bertakbir dan berdoa, lalu berjalan ke Marwah (dihitung satu). Laki-laki berlari kecil di antara dua lampu hijau.', dua: { label: 'Dzikir di Shafa & Marwah', arab: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', latin: 'La ilaha illallahu wahdahu la syarika lah, lahul mulku wa lahul hamdu wa huwa ‘ala kulli syai’in qadir.', arti: 'Tiada Tuhan selain Allah Yang Esa, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Maha Kuasa atas segala sesuatu.' } },
    { id: 'u7', title: 'Tahallul', text: 'Laki-laki mencukur habis atau memendekkan seluruh rambut; perempuan memotong seujung jari. Umrah selesai, larangan ihram gugur.' },
  ] },
  { key: 'haji', title: 'Haji · 8–13 Dzulhijjah', short: 'Haji', icon: 'flag-outline', intro: 'Puncak ibadah: Mina, Arafah, Muzdalifah, jumrah, tawaf ifadhah.', steps: [
    { id: 'h1', title: '8 Dzulhijjah · Tarwiyah', text: 'Berihram haji dari penginapan (bagi tamattu’), berniat, lalu menuju Mina. Bermalam di Mina, salat lima waktu tanpa dijamak.', dua: { label: 'Niat haji', arab: 'لَبَّيْكَ اللَّهُمَّ حَجًّا', latin: 'Labbaika Allahumma hajjan.', arti: 'Aku datang memenuhi panggilan-Mu ya Allah untuk berhaji.' } },
    { id: 'h2', title: '9 Dzulhijjah · Wukuf di Arafah', text: 'Rukun haji. Berada di Arafah dari tergelincir matahari hingga terbenam. Salat Zuhur & Asar dijamak-qashar. Perbanyak doa, dzikir, istighfar, dan talbiyah.', dua: { label: 'Doa terbaik di Arafah', arab: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', latin: 'La ilaha illallahu wahdahu la syarika lah, lahul mulku wa lahul hamdu wa huwa ‘ala kulli syai’in qadir.', arti: 'Tiada Tuhan selain Allah Yang Esa, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Maha Kuasa atas segala sesuatu.' } },
    { id: 'h3', title: 'Malam 10 · Mabit di Muzdalifah', text: 'Salat Magrib & Isya dijamak. Bermalam hingga lewat tengah malam (lansia/uzur boleh lebih awal). Kumpulkan batu kerikil untuk jumrah.' },
    { id: 'h4', title: '10 Dzulhijjah · Jumrah Aqabah', text: 'Lontar tujuh batu ke Jumrah Aqabah, bertakbir setiap lontaran. Talbiyah berhenti saat mulai melontar.', dua: { label: 'Saat melontar', arab: 'بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ', latin: 'Bismillah, Allahu akbar.', arti: 'Dengan nama Allah, Allah Maha Besar.' } },
    { id: 'h5', title: 'Hadyu & tahallul awal', text: 'Menyembelih hadyu (tamattu’/qiran), lalu mencukur rambut. Tahallul awal: boleh melepas ihram, kecuali hubungan suami-istri.' },
    { id: 'h6', title: 'Tawaf Ifadhah & Sa’i haji', text: 'Rukun haji. Tawaf tujuh putaran lalu sa’i. Setelahnya tahallul tsani: seluruh larangan ihram gugur.', dua: { label: 'Doa antara Rukun Yamani & Hajar Aswad', arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', latin: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina ‘adzaban-nar.', arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka.' } },
    { id: 'h7', title: '11–13 Dzulhijjah · Mabit di Mina & tiga jumrah', text: 'Bermalam di Mina. Setiap hari setelah zawal lontar Ula, Wustha, lalu Aqabah, tujuh batu masing-masing. Nafar awal: pulang 12 Dzulhijjah sebelum terbenam; nafar tsani: 13 Dzulhijjah.' },
    { id: 'h8', title: 'Tawaf Wada’', text: 'Tawaf perpisahan sebelum meninggalkan Makkah, tanpa sa’i. Perbanyak doa dan syukur.', dua: { label: 'Doa perpisahan', arab: 'اللَّهُمَّ لَا تَجْعَلْهُ آخِرَ الْعَهْدِ بِبَيْتِكَ الْحَرَامِ', latin: 'Allahumma la taj’alhu akhiral ‘ahdi bibaitikal haram.', arti: 'Ya Allah, jangan jadikan ini kunjungan terakhirku ke rumah-Mu yang mulia.' } },
  ] },
];
const FORBIDDEN = ['Memakai pakaian berjahit (laki-laki) & menutup wajah/telapak tangan (perempuan)', 'Memotong rambut atau kuku', 'Memakai wewangian setelah ihram', 'Berburu / membunuh binatang darat', 'Menikah, meminang, atau berhubungan suami-istri', 'Bertengkar dan berkata kotor'];
const ALL_STEPS = HAJJ_PHASES.flatMap(p => p.steps);

/** Step-by-step Hajj & Umrah companion: what to do, what to read, and a tick-off progress tracker synced to the account. */
export function Hajj() {
  const { settings, updateSettings, notify } = useApp(); const s = useStyles(); const { colors } = useTheme();
  const done: string[] = settings.hajj_done || [];
  const nextStep = useMemo(() => ALL_STEPS.find(step => !done.includes(step.id)), [done]);
  const [phaseKey, setPhaseKey] = useState(() => HAJJ_PHASES.find(p => p.steps.some(st => st.id === nextStep?.id))?.key || 'persiapan');
  const [open, setOpen] = useState<string | null>(nextStep?.id || null); const [showForbidden, setShowForbidden] = useState(false);
  const phase = HAJJ_PHASES.find(p => p.key === phaseKey) || HAJJ_PHASES[0];
  const percent = Math.round((done.length / ALL_STEPS.length) * 100);
  const toggle = async (id: string) => {
    const next = done.includes(id) ? done.filter(d => d !== id) : [...done, id];
    const ok = await updateSettings({ hajj_done: next });
    if (ok && !done.includes(id)) { const upcoming = ALL_STEPS.find(st => !next.includes(st.id)); if (upcoming) { setOpen(upcoming.id); const p = HAJJ_PHASES.find(ph => ph.steps.some(st => st.id === upcoming.id)); if (p) setPhaseKey(p.key); notify(`Selesai. Berikutnya: ${upcoming.title}`); } else notify('Masya Allah, seluruh langkah selesai. Semoga haji mabrur.'); }
  };
  const reset = async () => { if (await updateSettings({ hajj_done: [] })) { setPhaseKey('persiapan'); setOpen('p1'); notify('Progres manasik direset.'); } };
  return <Page title="Haji & Umrah" back="pro" subtitle="Langkah demi langkah, doa demi doa.">
    <ImageBackground source={IMG.hajj} style={s.hero} imageStyle={{ borderRadius: 28 }}><LinearGradient colors={[colors.transparent, colors.heroShade]} style={s.shade} />
      <View style={{ padding: 18, gap: 8 }}><Badge text="PANDUAN BERTAHAP" gold icon="footsteps-outline" light />
        <T size={22} weight="800" color={colors.heroInk}>{nextStep ? nextStep.title : 'Seluruh langkah selesai'}</T>
        <T size={11} color={colors.heroMuted}>{nextStep ? `Langkah berikutnya · ${HAJJ_PHASES.find(p => p.steps.includes(nextStep))?.title}` : 'Semoga menjadi haji yang mabrur.'}</T>
        <View style={s.progressRow}><View style={s.track}><View style={[s.fill, { width: `${percent}%` }]} /></View><T testID="hajj-progress-label" size={11} weight="700" color={colors.heroInk}>{done.length}/{ALL_STEPS.length} · {percent}%</T></View>
      </View></ImageBackground>
    <View style={s.chipRow}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{HAJJ_PHASES.map(p => { const on = p.key === phaseKey; const count = p.steps.filter(st => done.includes(st.id)).length; return <Tap key={p.key} testID={`hajj-phase-${p.key}`} onPress={() => setPhaseKey(p.key)} style={[s.chip, on && s.chipOn]} accessibilityState={{ selected: on }}><Icon name={p.icon} size={15} color={on ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><T size={12} weight="600" color={on ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{p.short}</T><View style={[s.count, on && { backgroundColor: colors.glassStrong }]}><T size={9} weight="800" color={on ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{count}/{p.steps.length}</T></View></Tap>; })}</ScrollView></View>
    <T size={12} muted style={{ paddingHorizontal: 4 }}>{phase.intro}</T>
    <View style={s.timeline}>{phase.steps.map((step, i) => { const isDone = done.includes(step.id); const isOpen = open === step.id; const isNext = nextStep?.id === step.id; return <Animated.View key={step.id} layout={Layout.springify().damping(18)} entering={FadeInDown.delay(i * 40).duration(300)} style={s.stepRow}>
      <View style={s.rail}><Tap testID={`hajj-step-check-${step.id}`} onPress={() => toggle(step.id)} style={[s.checkbox, isDone && s.checkboxDone, isNext && !isDone && s.checkboxNext]} accessibilityRole="checkbox" accessibilityState={{ checked: isDone }}>{isDone ? <Icon name="checkmark" size={16} color={colors.onSuccess} /> : <T size={12} weight="800" color={isNext ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{i + 1}</T>}</Tap>{i < phase.steps.length - 1 && <View style={[s.line, isDone && { backgroundColor: colors.success }]} />}</View>
      <Card style={[s.stepCard, isNext && !isDone && s.stepNext, isDone && s.stepDone]}>
        <Tap testID={`hajj-step-${step.id}`} onPress={() => setOpen(isOpen ? null : step.id)} style={s.stepHead}><View style={{ flex: 1, gap: 2 }}>{isNext && !isDone && <T size={9} weight="800" color={colors.onBrandSecondary}>LANGKAH BERIKUTNYA</T>}<T size={14} weight="700" color={isDone ? colors.muted : colors.onSurface} style={isDone && { textDecorationLine: 'line-through' }}>{step.title}</T></View><Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} /></Tap>
        {isOpen && <Animated.View entering={FadeInDown.duration(220)} style={{ gap: 12 }}>
          <T size={13} style={{ lineHeight: 20 }}>{step.text}</T>
          {step.dua && <Paper style={s.dua}><T size={10} weight="800" color={colors.brandDeep}>{(step.dua.label || 'Doa').toUpperCase()}</T><T arabic paper size={22} style={{ textAlign: 'right', lineHeight: 40 }}>{step.dua.arab}</T>{step.dua.latin && <T paper size={12} weight="600" style={{ fontStyle: 'italic' }}>{step.dua.latin}</T>}<T paper muted size={12}>“{step.dua.arti}”</T></Paper>}
          <Button testID={`hajj-step-done-${step.id}`} size="sm" title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'} icon={isDone ? 'refresh-outline' : 'checkmark-circle-outline'} variant={isDone ? 'secondary' : 'primary'} onPress={() => toggle(step.id)} />
        </Animated.View>}
      </Card>
    </Animated.View>; })}</View>
    <Card style={{ gap: 12 }}><Tap testID="hajj-forbidden-toggle" onPress={() => setShowForbidden(v => !v)} style={s.stepHead}><Icon name="ban-outline" size={20} color={colors.error} /><T size={14} weight="700" style={{ flex: 1 }}>Larangan saat ihram</T><Icon name={showForbidden ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} /></Tap>
      {showForbidden && FORBIDDEN.map((item, i) => <View key={item} style={s.forbiddenRow}><View style={s.num}><T size={11} weight="800" color={colors.onBrandPrimary}>{i + 1}</T></View><T size={13} style={{ flex: 1, lineHeight: 20 }}>{item}</T></View>)}</Card>
    <Paper style={{ gap: 8, alignItems: 'center' }}><T size={10} weight="800" color={colors.brandDeep}>TALBIYAH</T><T arabic paper size={24} style={{ textAlign: 'center', lineHeight: 44 }}>{TALBIYAH.arab}</T><T paper muted size={12} style={{ textAlign: 'center' }}>“{TALBIYAH.arti}”</T></Paper>
    {done.length > 0 && <Button testID="hajj-reset-button" title="Reset progres manasik" variant="secondary" icon="refresh-outline" onPress={reset} />}
    <T muted size={10} style={{ textAlign: 'center' }}>Ringkasan edukatif berdasarkan manasik umum. Ikuti bimbingan pembimbing ibadah/KBIH resmi untuk pelaksanaan.</T>
  </Page>;
}
const useStyles = makeStyles(c => ({
  hero: { height: 220, borderRadius: 28, justifyContent: 'flex-end' }, shade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }, track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: c.glassStrong, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 4, backgroundColor: c.gold },
  chipRow: { height: 56, flexShrink: 0 }, chips: { gap: 8, alignItems: 'center', paddingHorizontal: 2 }, chip: { height: 36, flexShrink: 0, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, chipOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, count: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: c.surfaceTertiary },
  timeline: { gap: 0 }, stepRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' }, rail: { width: 36, alignItems: 'center' }, checkbox: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: c.borderStrong, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }, checkboxDone: { backgroundColor: c.success, borderColor: c.success }, checkboxNext: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }, line: { flex: 1, width: 2, backgroundColor: c.borderStrong, marginVertical: 4 },
  stepCard: { flex: 1, gap: 12, marginBottom: 12, padding: 14 }, stepNext: { borderColor: c.brandTertiary, backgroundColor: c.brandSecondary }, stepDone: { opacity: 0.85 }, stepHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  dua: { gap: 8 }, forbiddenRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, num: { width: 26, height: 26, borderRadius: 9, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
}));
