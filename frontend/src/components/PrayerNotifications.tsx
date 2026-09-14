import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useApp } from '@/src/AppContext';

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
      await n.cancelAllScheduledNotificationsAsync();
      const now = new Date();
      const local = new Intl.DateTimeFormat('en-GB', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
      const [h, m, sec] = local.split(':').map(Number);
      for (const p of data.prayers) {
        if (cancelled) return;
        const [ph, pm] = p.time.split(':').map(Number);
        const seconds = ph * 3600 + pm * 60 - (h * 3600 + m * 60 + sec);
        if (seconds > 0) await n.scheduleNotificationAsync({ content: { title: `Saatnya salat ${p.name}`, body: 'Jeda sejenak dari layar. Dekatkan hati bersama Azam.', sound: true }, trigger: { type: n.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false, channelId: 'prayers' } });
      }
    })().catch(() => notify('Pengingat perangkat belum dapat dijadwalkan. Jadwal salat tetap tersedia.'));
    return () => { cancelled = true; };
  }, [settings?.notifications, data, day, notify]);
  return null;
}