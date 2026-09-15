import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../AppContext';
import { api } from '../api';
import { useI18n } from '../i18n';
import { SUNNAH, SUNNAH_KEYS, sunnahSlots, type SunnahKey } from '../sunnah';
import { makeStyles, useTheme } from '../theme';
import { Badge, Button, Card, Icon, IconBox, Page, T, Tap } from '../components/ui';

const CHECK_LABEL: Record<string, { mark: string; done: string }> = {
  id: { mark: 'Tandai sudah salat hari ini', done: 'Sudah dicatat hari ini' },
  en: { mark: 'Mark as prayed today', done: 'Recorded today' },
  ms: { mark: 'Tanda sudah solat hari ini', done: 'Sudah direkod hari ini' },
  ar: { mark: 'سجّل أنك صليت اليوم', done: 'سُجِّل اليوم' },
};

export function SunnahScreen() {
  const { settings, updateSettings, prayers, notify, go, lastTab, user, day } = useApp();
  const { t, lang } = useI18n(); const s = useStyles(); const { colors } = useTheme();
  const [open, setOpen] = useState<SunnahKey | null>('tahajud');
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ['sunnah-status', user?.user_id], enabled: !!user, queryFn: () => api('/sunnah/status').then(r => r.data) });
  const doneToday: string[] = status.data?.today || [];
  const label = CHECK_LABEL[lang] || CHECK_LABEL.id;
  const pro = !!settings?.pro_preview; const enabled: SunnahKey[] = settings?.sunnah_reminders || [];
  const slots = sunnahSlots(prayers.data);
  const markToday = async (key: SunnahKey) => {
    try { await api('/sunnah/checkin', { key, day: status.data?.date || day }, 'PUT'); await queryClient.invalidateQueries({ queryKey: ['sunnah-status'] }); }
    catch (e: any) { notify(e.message); }
  };
  const toggle = async (key: SunnahKey) => {
    const next = enabled.includes(key) ? enabled.filter(k => k !== key) : [...enabled, key];
    if (await updateSettings({ sunnah_reminders: next })) notify(t(next.includes(key) ? 'sunnah.on' : 'sunnah.off', { name: t(`sunnah.${key}`) }));
  };
  return <Page title={t('sunnah.title')} subtitle={t('sunnah.subtitle')} back={lastTab} testID="sunnah-screen">
    {!pro && <Card style={s.proCard} testID="sunnah-pro-gate">
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><IconBox name="sparkles" bg={colors.goldSoft} color={colors.goldText} /><T size={13} style={{ flex: 1 }}>{t('sunnah.proNote')}</T></View>
      <Button title={t('sunnah.enablePro')} testID="sunnah-enable-pro-button" icon="sparkles" size="sm" onPress={() => go('pro')} />
    </Card>}
    {pro && !settings?.notifications && <View style={s.hint} testID="sunnah-notif-hint"><Icon name="notifications-off-outline" size={16} color={colors.warning} /><T size={12} color={colors.warning} style={{ flex: 1 }}>{t('sunnah.needNotif')}</T></View>}
    <View style={{ gap: 12 }}>
      {SUNNAH_KEYS.map(key => {
        const info = SUNNAH[key]; const on = enabled.includes(key); const expanded = open === key; const didToday = doneToday.includes(key);
        return <Card key={key} testID={`sunnah-card-${key}`} style={[s.card, on && s.cardOn]}>
          <Tap testID={`sunnah-toggle-${key}`} onPress={() => setOpen(expanded ? null : key)} style={s.row} haptic={false}>
            <IconBox name={info.icon} bg={on ? colors.brandPrimary : colors.brandSecondary} color={on ? colors.onBrandPrimary : colors.onBrandSecondary} />
            <View style={{ flex: 1 }}>
              <T weight="800" size={16}>{t(`sunnah.${key}`)}</T>
              <T muted size={12}>{slots[key].length ? `${slots[key][0].time}${slots[key].length > 1 ? ` +${slots[key].length - 1}` : ''} · ` : ''}{t(`sunnah.${key}Time`)}</T>
            </View>
            <View style={s.switchWrap}>
              <Switch testID={`sunnah-switch-${key}`} value={on} disabled={!pro} onValueChange={() => toggle(key)} trackColor={{ false: colors.solidStrong, true: colors.brandPrimary }} thumbColor={colors.white} ios_backgroundColor={colors.solidStrong} />
            </View>
          </Tap>
          {expanded && <View style={s.detail} testID={`sunnah-detail-${key}`}>
            <T size={13} muted>{t(`sunnah.${key}Desc`)}</T>
            <View style={s.chips}><Badge text={`${info.rakaat} ${t('sunnah.rakaat')}`} icon="layers-outline" />{slots[key].map(slot => <Badge key={slot.time + slot.label.id} text={`${slot.label[lang]} · ${slot.time}`} icon="time-outline" />)}</View>
            <View style={s.niat}>
              <T size={10} weight="800" color={colors.onBrandSecondary} style={{ letterSpacing: 1 }}>{t('sunnah.niat')}</T>
              <T arabic size={24} style={s.arabic} testID={`sunnah-niat-arabic-${key}`}>{info.arabic}</T>
              <T size={14} weight="600" style={{ fontStyle: 'italic' }} testID={`sunnah-niat-latin-${key}`}>{info.latin}</T>
              <T size={12} muted>{t(`sunnah.meaning.${key}`)}</T>
            </View>
            <Tap testID={`sunnah-checkin-${key}`} onPress={() => markToday(key)} style={[s.checkin, didToday && s.checkinDone]} accessibilityRole="checkbox" accessibilityState={{ checked: didToday }}>
              <Icon name={didToday ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={didToday ? colors.success : colors.onBrandSecondary} />
              <T size={13} weight="700" color={didToday ? colors.success : colors.onBrandSecondary}>{didToday ? label.done : label.mark}</T>
            </Tap>
          </View>}
        </Card>;
      })}
    </View>
    <T muted size={12} style={{ textAlign: 'center' }}>{t('sunnah.notifHint')} {t('sunnah.footer')}</T>
  </Page>;
}

const useStyles = makeStyles(c => ({
  proCard: { gap: 14, backgroundColor: c.goldSoft, borderColor: c.gold },
  hint: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: c.glass },
  card: { padding: 14, gap: 0 }, cardOn: { borderColor: c.brandPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  switchWrap: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 18, backgroundColor: c.surfaceTertiary },
  detail: { gap: 12, paddingTop: 14, marginTop: 12, borderTopWidth: 1, borderTopColor: c.divider },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  niat: { gap: 8, padding: 14, borderRadius: 18, backgroundColor: c.brandSecondary },
  arabic: { textAlign: 'right', lineHeight: 44, writingDirection: 'rtl' },
  checkin: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, checkinDone: { backgroundColor: c.surface, borderColor: c.success },
}));
