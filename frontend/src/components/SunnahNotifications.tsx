import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useApp } from '@/src/AppContext';
import { getLanguage, translate } from '@/src/i18n';
import { sunnahSlots, type SunnahKey } from '@/src/sunnah';
import { storage } from '@/src/utils/storage';

const IDS_KEY = 'sunnah-notification-ids';
async function cancelAll(n: any) {
  const ids = ((await storage.getItem<any>(IDS_KEY, null)) as string[] | null) || [];
  for (const id of ids) await n.cancelScheduledNotificationAsync(id).catch(() => {});
  await storage.setItem(IDS_KEY, [] as any);
}
/** Pro: schedules today's sunnah prayer reminders (Tahajjud, Duha, Witr, Rawatib) on the device. */
export function SunnahNotifications() {
  const { settings, prayers, day } = useApp();
  const data = prayers.data; const keys: SunnahKey[] = settings?.sunnah_reminders || [];
  const signature = keys.join(',');
  useEffect(() => {
    if (Platform.OS === 'web' || !data) return;
    let cancelled = false;
    (async () => {
      const n = await import('expo-notifications');
      await cancelAll(n);
      if (!settings?.notifications || !settings?.pro_preview || !keys.length) return;
      if (!(await n.getPermissionsAsync()).granted) return;
      const local = new Intl.DateTimeFormat('en-GB', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
      const [h, m, sec] = local.split(':').map(Number); const nowSec = h * 3600 + m * 60 + sec;
      const slots = sunnahSlots(data); const lang = getLanguage(); const ids: string[] = [];
      for (const key of keys) for (const slot of slots[key]) {
        if (cancelled) return;
        const [sh, sm] = slot.time.split(':').map(Number);
        const seconds = sh * 3600 + sm * 60 - nowSec;
        if (seconds <= 0) continue;
        ids.push(await n.scheduleNotificationAsync({ content: { title: `${translate(`sunnah.${key}` as any)} · ${slot.label[lang]}`, body: translate(`sunnah.${key}Desc` as any), sound: true, data: { type: 'sunnah', key } }, trigger: { type: n.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false, channelId: 'prayers' } }));
      }
      await storage.setItem(IDS_KEY, ids as any);
    })().catch(() => {});
    return () => { cancelled = true; };
  }, [settings?.notifications, settings?.pro_preview, signature, data, day]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
