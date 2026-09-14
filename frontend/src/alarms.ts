import { Platform } from 'react-native';
import { storage } from './utils/storage';

export type AlarmRepeat = 'once' | 'daily' | 'weekly';
export type Alarm = {
  id: string; label: string; time: string; repeat: AlarmRepeat; date: string | null; weekdays: number[];
  enabled: boolean; phrase: string; snooze_minutes: number; created_at?: string; updated_at?: string;
};
export const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const CHANNEL = 'alarms';
const MAP_KEY = 'alarm-notification-map';

export const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const showTime = (time: string) => time.replace(':', '.');
export function describeRepeat(a: Pick<Alarm, 'repeat' | 'date' | 'weekdays'>) {
  if (a.repeat === 'daily') return 'Setiap hari';
  if (a.repeat === 'weekly') {
    const days = [...a.weekdays].sort();
    if (days.length === 7) return 'Setiap hari';
    if (days.join() === '1,2,3,4,5') return 'Hari kerja';
    if (days.join() === '0,6') return 'Akhir pekan';
    return days.map(d => DAY_SHORT[d]).join(', ');
  }
  if (!a.date) return 'Sekali';
  const date = new Date(`${a.date}T12:00:00`);
  const today = localDay(); const tomorrow = localDay(new Date(Date.now() + 86400000));
  const prefix = a.date === today ? 'Hari ini' : a.date === tomorrow ? 'Besok' : date.toLocaleDateString('id-ID', { weekday: 'long' });
  return `${prefix}, ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
/** Next moment this alarm rings in the device's local time, or null when a one-time alarm has passed. */
export function nextFire(a: Pick<Alarm, 'repeat' | 'date' | 'weekdays' | 'time'>, now = new Date()): Date | null {
  const [h, m] = a.time.split(':').map(Number);
  if (a.repeat === 'once') { if (!a.date) return null; const d = new Date(`${a.date}T${a.time}:00`); return d > now ? d : null; }
  for (let offset = 0; offset < 8; offset++) {
    const d = new Date(now); d.setDate(now.getDate() + offset); d.setHours(h, m, 0, 0);
    if (d <= now) continue;
    if (a.repeat === 'daily' || a.weekdays.includes(d.getDay())) return d;
  }
  return null;
}
export function untilText(target: Date, now = new Date()) {
  const minutes = Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
  if (minutes < 1) return 'kurang dari semenit';
  const days = Math.floor(minutes / 1440); const hours = Math.floor((minutes % 1440) / 60); const mins = minutes % 60;
  if (days > 0) return `${days} hari ${hours} jam`;
  if (hours > 0) return `${hours} jam ${mins} menit`;
  return `${mins} menit`;
}
export function soonest(alarms: Alarm[] | undefined, now = new Date()) {
  let best: { alarm: Alarm; at: Date } | null = null;
  for (const alarm of alarms || []) {
    if (!alarm.enabled) continue;
    const at = nextFire(alarm, now);
    if (at && (!best || at < best.at)) best = { alarm, at };
  }
  return best;
}

const content = (n: any, a: Alarm, snoozed = false) => ({
  title: snoozed ? `${a.label} · ditunda` : a.label,
  body: `${showTime(a.time)} · Ucapkan “${a.phrase}”, lalu buka Azam untuk mematikan.`,
  sound: 'default', data: { type: 'alarm', alarmId: a.id, snoozed }, categoryIdentifier: 'alarm',
  priority: n.AndroidNotificationPriority.MAX, interruptionLevel: 'timeSensitive' as const, sticky: true, autoDismiss: false, vibrate: [0, 500, 500, 500],
});
async function prepare(n: any) {
  if (Platform.OS === 'android') await n.setNotificationChannelAsync(CHANNEL, { name: 'Alarm dzikir', importance: n.AndroidImportance.MAX, sound: 'default', vibrationPattern: [0, 500, 500, 500], bypassDnd: true, lockscreenVisibility: n.AndroidNotificationVisibility.PUBLIC, enableVibrate: true });
  await n.setNotificationCategoryAsync('alarm', [
    { identifier: 'snooze', buttonTitle: 'Tunda', options: { opensAppToForeground: false } },
    { identifier: 'dismiss', buttonTitle: 'Matikan', options: { opensAppToForeground: false } },
  ]);
}
async function scheduleOne(n: any, a: Alarm): Promise<string[]> {
  const [hour, minute] = a.time.split(':').map(Number); const T = n.SchedulableTriggerInputTypes;
  if (a.repeat === 'once') { const date = nextFire(a); return date ? [await n.scheduleNotificationAsync({ content: content(n, a), trigger: { type: T.DATE, date, channelId: CHANNEL } })] : []; }
  if (a.repeat === 'daily') return [await n.scheduleNotificationAsync({ content: content(n, a), trigger: { type: T.DAILY, hour, minute, channelId: CHANNEL } })];
  const ids: string[] = [];
  for (const d of a.weekdays) ids.push(await n.scheduleNotificationAsync({ content: content(n, a), trigger: { type: T.WEEKLY, weekday: d + 1, hour, minute, channelId: CHANNEL } }));
  return ids;
}
/** Re-registers every enabled alarm with the OS so they ring (sound + vibration) even when Azam is closed. */
export async function syncAlarmNotifications(alarms: Alarm[]): Promise<'web' | 'no-permission' | 'ok'> {
  if (Platform.OS === 'web') return 'web';
  const n = await import('expo-notifications');
  const permission = await n.getPermissionsAsync();
  if (!permission.granted) return 'no-permission';
  await prepare(n);
  const previous = ((await storage.getItem<any>(MAP_KEY, null)) as Record<string, string[]> | null) || {};
  for (const ids of Object.values(previous)) for (const id of ids) await n.cancelScheduledNotificationAsync(id).catch(() => {});
  const next: Record<string, string[]> = {};
  for (const alarm of alarms.filter(a => a.enabled)) { const ids = await scheduleOne(n, alarm); if (ids.length) next[alarm.id] = ids; }
  await storage.setItem(MAP_KEY, next as any);
  return 'ok';
}
export async function scheduleSnooze(a: Alarm) {
  if (Platform.OS === 'web') return false;
  const n = await import('expo-notifications');
  if (!(await n.getPermissionsAsync()).granted) return false;
  await prepare(n);
  await n.scheduleNotificationAsync({ content: content(n, a, true), trigger: { type: n.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: a.snooze_minutes * 60, repeats: false, channelId: CHANNEL } });
  return true;
}
export async function dismissAlarmNotifications() {
  if (Platform.OS === 'web') return;
  const n = await import('expo-notifications');
  const shown = await n.getPresentedNotificationsAsync();
  for (const item of shown) if (item.request.content.data?.type === 'alarm') await n.dismissNotificationAsync(item.request.identifier).catch(() => {});
}
/** Android only: hands the alarm to the phone's Clock app so it also rings through the system alarm. */
export async function openSystemAlarm(a: Pick<Alarm, 'time' | 'label'>) {
  if (Platform.OS !== 'android') return false;
  const IntentLauncher = await import('expo-intent-launcher');
  const [hour, minute] = a.time.split(':').map(Number);
  await IntentLauncher.startActivityAsync('android.intent.action.SET_ALARM', { extra: { 'android.intent.extra.alarm.HOUR': hour, 'android.intent.extra.alarm.MINUTES': minute, 'android.intent.extra.alarm.MESSAGE': a.label, 'android.intent.extra.alarm.SKIP_UI': false, 'android.intent.extra.alarm.VIBRATE': true } });
  return true;
}
