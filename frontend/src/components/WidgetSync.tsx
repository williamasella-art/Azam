import { useEffect } from 'react';
import { useApp } from '@/src/AppContext';
import { syncWidgets } from '@/src/widgets/widgetData';

/** Pushes fresh prayer times + daily verse to the home/lock-screen widgets whenever they change. */
export function WidgetSync() {
  const { settings, prayers, daily } = useApp();
  const list = prayers.data?.prayers; const verse = daily.data;
  useEffect(() => {
    if (!settings || !list?.length) return;
    void syncWidgets({
      city: settings.city, timezone: prayers.data?.timezone || settings.timezone, prayers: list,
      verse: verse ? { teksArab: verse.teksArab, teksIndonesia: verse.teksIndonesia, surah: verse.surah, nomorAyat: verse.nomorAyat } : null,
      updatedAt: new Date().toISOString(),
    }).catch(() => { /* Widgets are optional; the in-app schedule is unaffected. */ });
  }, [settings, list, verse, prayers.data?.timezone]);
  return null;
}
