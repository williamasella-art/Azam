import { Platform } from 'react-native';
import { storage } from '@/src/utils/storage';

export const WIDGET_DATA_KEY = 'azam-widget-data';
export const APP_GROUP = 'group.com.emergent.qurandaily.fst79v';
export const ANDROID_WIDGETS = { ayat: 'AzamAyat', azan: 'AzamAzan' } as const;

export type WidgetData = {
  city: string; timezone: string;
  prayers: { name: string; time: string }[];
  verse: { teksArab: string; teksIndonesia: string; surah: string; nomorAyat: number } | null;
  updatedAt: string;
};

/** Next prayer for the widget, computed at render time (widgets cannot tick every second). */
export function nextPrayer(data: WidgetData, now = new Date()) {
  const local = new Intl.DateTimeFormat('en-GB', { timeZone: data.timezone || 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const [h, m] = local.split(':').map(Number); const nowMin = h * 60 + m;
  const upcoming = data.prayers.find(p => { const [ph, pm] = p.time.split(':').map(Number); return ph * 60 + pm > nowMin; });
  const target = upcoming || data.prayers[0];
  if (!target) return null;
  const [th, tm] = target.time.split(':').map(Number);
  let diff = th * 60 + tm - nowMin; if (!upcoming) diff += 1440;
  const label = diff >= 60 ? `${Math.floor(diff / 60)} jam ${diff % 60} mnt` : `${diff} menit`;
  return { ...target, tomorrow: !upcoming, minutes: diff, label };
}

/** Persists widget data and asks both platforms' widgets to redraw. No-op in Expo Go / web. */
/* eslint-disable @typescript-eslint/no-require-imports -- native modules are loaded lazily so Expo Go / web never touch them. */
export async function syncWidgets(data: WidgetData) {
  await storage.setItem(WIDGET_DATA_KEY, data as any);
  if (Platform.OS === 'android') {
    try {
      const { requestWidgetUpdate } = require('react-native-android-widget');
      const { AyatWidget, AzanWidget } = require('./AzamWidgets');
      await requestWidgetUpdate({ widgetName: ANDROID_WIDGETS.ayat, renderWidget: () => AyatWidget({ data }) });
      await requestWidgetUpdate({ widgetName: ANDROID_WIDGETS.azan, renderWidget: () => AzanWidget({ data }) });
    } catch { /* Native widget module is only present in a development or store build. */ }
  } else if (Platform.OS === 'ios') {
    try {
      const { ExtensionStorage } = require('@bacons/apple-targets');
      const store = new ExtensionStorage(APP_GROUP);
      store.set('widget', JSON.stringify(data));
      ExtensionStorage.reloadWidget();
    } catch { /* WidgetKit extension exists only in a native build. */ }
  }
}
