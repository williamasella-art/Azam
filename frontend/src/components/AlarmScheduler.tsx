import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useApp } from '@/src/AppContext';
import { Alarm, nextFire, scheduleSnooze, syncAlarmNotifications } from '@/src/alarms';

/**
 * Keeps the OS notification schedule in step with the saved alarms and routes taps on
 * alarm notifications (or their Tunda / Matikan actions) back into the app.
 */
export function AlarmScheduler() {
  const { user, alarms, saveAlarm, setModal, notify } = useApp();
  const list: Alarm[] | undefined = alarms.data;
  const listRef = useRef<Alarm[] | undefined>(list); listRef.current = list;
  const pending = useRef<string | null>(null);
  const finish = useRef<(a: Alarm) => void>(() => {});
  finish.current = (a: Alarm) => { if (a.repeat === 'once' && a.enabled) void saveAlarm({ ...a, enabled: false }, a.id).catch(() => {}); };
  const open = (id: string) => {
    const alarm = listRef.current?.find(a => a.id === id);
    if (alarm) { pending.current = null; setModal({ type: 'alarm', alarm }); } else pending.current = id;
  };
  useEffect(() => {
    if (Platform.OS === 'web' || !list) return;
    if (pending.current) open(pending.current);
    // One-time alarms whose moment has passed are switched off so the list stays honest.
    for (const a of list) if (a.repeat === 'once' && a.enabled && !nextFire(a)) finish.current(a);
    const run = () => { syncAlarmNotifications(list).catch(() => notify('Alarm belum bisa dijadwalkan di perangkat ini.')); };
    run();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') run(); });
    return () => sub.remove();
  }, [list, notify]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (Platform.OS === 'web' || !user) return;
    let subs: { remove: () => void }[] = []; let cancelled = false;
    const respond = (response: any) => {
      const data = response?.notification?.request?.content?.data; if (data?.type !== 'alarm') return;
      const alarm = listRef.current?.find(a => a.id === data.alarmId);
      if (response.actionIdentifier === 'snooze') { if (alarm) { void scheduleSnooze(alarm); notify(`Alarm ditunda ${alarm.snooze_minutes} menit.`); } return; }
      if (response.actionIdentifier === 'dismiss') { if (alarm) finish.current(alarm); return; }
      open(data.alarmId);
    };
    (async () => {
      const n = await import('expo-notifications');
      n.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
      if (cancelled) return;
      subs = [
        n.addNotificationReceivedListener(event => { const data = event.request.content.data; if (data?.type === 'alarm' && AppState.currentState === 'active') open(String(data.alarmId)); }),
        n.addNotificationResponseReceivedListener(respond),
      ];
      const last = await n.getLastNotificationResponseAsync().catch(() => null);
      if (last) { respond(last); await n.clearLastNotificationResponseAsync().catch(() => {}); }
    })().catch(() => {});
    return () => { cancelled = true; subs.forEach(s => s.remove()); };
  }, [user, notify, setModal]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
