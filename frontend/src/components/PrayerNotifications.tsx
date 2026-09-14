import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useApp } from '@/src/AppContext';
import { storage } from '@/src/utils/storage';

const IDS_KEY = 'prayer-notification-ids';
/** Cancels only the prayer reminders, leaving user alarms scheduled. */
export async function cancelPrayerNotifications() {
  if (Platform.OS === 'web') return;
  const n = await import('expo-notifications');
  const ids = ((await storage.getItem<any>(IDS_KEY, null)) as string[] | null) || [];
  for (const id of ids) await n.cancelScheduledNotificationAsync(id).catch(() => {});
  await storage.setItem(IDS_KEY, [] as any);
}
export function PrayerNotifications() {
  const { settings, prayers, day, notify } = useApp();
  const data = prayers.data;
  useEffect(() => {
    if (Platform.OS === 'web' || !settings?.notifications || !data) return;
    let cancelled = false;
    (async () => {
      const n = await import('expo-notifications');
      const permission = await n.getPermissionsAsync();
      if (!permission.granted) return;
      await cancelPrayerNotifications();
      const now = new Date();
      const local = new Intl.DateTimeFormat('en-GB', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
      const [h, m, sec] = local.split(':').map(Number);
      const ids: string[] = [];
      for (const p of data.prayers) {
        if (cancelled) return;
        const [ph, pm] = p.time.split(':').map(Number);
        const seconds = ph * 3600 + pm * 60 - (h * 3600 + m * 60 + sec);
        if (seconds > 0) ids.push(await n.scheduleNotificationAsync({ content: { title: `Saatnya salat ${p.name}`, body: 'Jeda sejenak dari layar. Dekatkan hati bersama Azam.', sound: true, data: { type: 'prayer' } }, trigger: { type: n.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false, channelId: 'prayers' } }));
      }
      await storage.setItem(IDS_KEY, ids as any);
    })().catch(() => notify('Pengingat perangkat belum dapat dijadwalkan. Jadwal salat tetap tersedia.'));
    return () => { cancelled = true; };
  }, [settings?.notifications, data, day, notify]);
  return null;
}
