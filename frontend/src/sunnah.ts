import type { Lang } from './i18n';

export type SunnahKey = 'tahajud' | 'dhuha' | 'witir' | 'rawatib';
export const SUNNAH_KEYS: SunnahKey[] = ['tahajud', 'dhuha', 'witir', 'rawatib'];
export const SUNNAH: Record<SunnahKey, { icon: string; rakaat: string; arabic: string; latin: string }> = {
  tahajud: { icon: 'moon', rakaat: '2–12', arabic: 'أُصَلِّي سُنَّةَ التَّهَجُّدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى', latin: 'Ushalli sunnatat-tahajjudi rak‘ataini lillāhi ta‘ālā' },
  dhuha: { icon: 'sunny', rakaat: '2–12', arabic: 'أُصَلِّي سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلَّهِ تَعَالَى', latin: 'Ushalli sunnatadh-dhuhā rak‘ataini lillāhi ta‘ālā' },
  witir: { icon: 'star', rakaat: '1, 3, 5…', arabic: 'أُصَلِّي سُنَّةَ الْوِتْرِ رَكْعَةً لِلَّهِ تَعَالَى', latin: 'Ushalli sunnatal-witri rak‘atan lillāhi ta‘ālā' },
  rawatib: { icon: 'repeat', rakaat: '2', arabic: 'أُصَلِّي سُنَّةَ الصُّبْحِ رَكْعَتَيْنِ قَبْلِيَّةً لِلَّهِ تَعَالَى', latin: 'Ushalli sunnatash-shubhi rak‘ataini qabliyyatan lillāhi ta‘ālā' },
};

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (min: number) => { const m = ((min % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

/** Reminder slots (HH:MM, local prayer timezone) derived from today's prayer schedule. */
export function sunnahSlots(data: any): Record<SunnahKey, { time: string; label: Record<Lang, string> }[]> {
  const get = (name: string) => { const p = data?.prayers?.find((x: any) => x.name === name); return p ? toMin(p.time) : null; };
  const subuh = get('Subuh'), zuhur = get('Zuhur'), magrib = get('Magrib'), isya = get('Isya');
  const sunrise = data?.sunrise ? toMin(data.sunrise) : subuh !== null ? subuh + 75 : null;
  const slots: Record<SunnahKey, { time: string; label: Record<Lang, string> }[]> = { tahajud: [], dhuha: [], witir: [], rawatib: [] };
  if (magrib !== null && subuh !== null) {
    const night = subuh + 1440 - magrib; // Maghrib → next Fajr; the last third begins two thirds in.
    slots.tahajud.push({ time: fmt(magrib + Math.round(night * 2 / 3)), label: { id: 'Sepertiga malam terakhir', en: 'Last third of the night', ms: 'Sepertiga malam terakhir', ar: 'الثلث الأخير من الليل' } });
  }
  if (sunrise !== null) slots.dhuha.push({ time: fmt(sunrise + 20), label: { id: '20 menit setelah terbit', en: '20 min after sunrise', ms: '20 minit selepas terbit', ar: 'بعد الشروق بـ20 دقيقة' } });
  if (isya !== null) slots.witir.push({ time: fmt(isya + 45), label: { id: 'Setelah Isya', en: 'After Isha', ms: 'Selepas Isyak', ar: 'بعد العشاء' } });
  if (subuh !== null) slots.rawatib.push({ time: fmt(subuh - 15), label: { id: 'Qabliyah Subuh', en: 'Before Fajr', ms: 'Qabliyah Subuh', ar: 'قبل الفجر' } });
  if (zuhur !== null) slots.rawatib.push({ time: fmt(zuhur - 15), label: { id: 'Qabliyah Zuhur', en: 'Before Dhuhr', ms: 'Qabliyah Zohor', ar: 'قبل الظهر' } }, { time: fmt(zuhur + 20), label: { id: 'Ba’diyah Zuhur', en: 'After Dhuhr', ms: 'Ba’diyah Zohor', ar: 'بعد الظهر' } });
  if (magrib !== null) slots.rawatib.push({ time: fmt(magrib + 15), label: { id: 'Ba’diyah Magrib', en: 'After Maghrib', ms: 'Ba’diyah Maghrib', ar: 'بعد المغرب' } });
  if (isya !== null) slots.rawatib.push({ time: fmt(isya + 15), label: { id: 'Ba’diyah Isya', en: 'After Isha', ms: 'Ba’diyah Isyak', ar: 'بعد العشاء' } });
  return slots;
}
