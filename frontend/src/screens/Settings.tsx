import React, { useEffect, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ActivityIndicator, ImageBackground, Linking, Platform, Switch, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { IMG } from '@/src/assets';
import { PRO_AMBIENTS } from '@/src/ambient';
import { api, uploadPhoto } from '@/src/api';
import { LANGUAGES, useI18n } from '@/src/i18n';
import { startTrialPatch, trialInfo } from '@/src/pro';
import { Avatar } from '@/src/components/Avatar';
import { Badge, Button, Card, Icon, IconBox, Page, Section, T, Tap } from '@/src/components/ui';

function SettingRow({ icon, title, value, onPress, testID, children, gold }: any) {
  const s = useStyles(); const { colors } = useTheme();
  return <Tap testID={testID} onPress={onPress} style={s.settingRow}><IconBox name={icon} size={40} icon={19} bg={gold ? colors.goldSoft : undefined} color={gold ? colors.goldText : undefined} /><View style={{ flex: 1 }}><T size={13} weight="600">{title}</T>{value && <T size={10} muted>{value}</T>}</View>{children || <Icon name="chevron-forward" color={colors.muted} size={17} />}</Tap>;
}
/** Profile photo picker: contextual permission ask, one retry, then a Settings deep link (never a dead end). */
function ProfilePhoto() {
  const { user, setUser, notify, setModal } = useApp(); const { t } = useI18n(); const s = useStyles(); const { colors } = useTheme();
  const [busy, setBusy] = useState(false); const queryClient = useQueryClient();
  const pick = async () => {
    if (busy) return;
    const ImagePicker = await import('expo-image-picker');
    if (Platform.OS !== 'web') {
      let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setModal({ type: 'info', title: t('settings.changePhoto'), message: t('settings.photoPermission'), actionTitle: t('settings.openSettings'), action: () => Linking.openSettings() }); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    setBusy(true);
    try { const asset = result.assets[0]; const next = await uploadPhoto(asset.uri, asset.mimeType, asset.fileName); setUser(next); queryClient.invalidateQueries({ queryKey: ['me'] }); notify(t('settings.photoSaved')); }
    catch (e: any) { notify(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (busy) return; setBusy(true);
    try { setUser(await api('/profile/photo', undefined, 'DELETE')); notify(t('settings.photoRemoved')); } catch (e: any) { notify(e.message); } finally { setBusy(false); }
  };
  return <View style={s.photoCol}>
    <Tap testID="settings-photo-button" onPress={pick} style={s.avatarWrap} accessibilityLabel={t('settings.changePhoto')}>
      <Avatar name={user.name} photoPath={user.photo_path} size={72} testID="settings-avatar" />
      <View style={s.camBadge}>{busy ? <ActivityIndicator size="small" color={colors.onBrandPrimary} /> : <Icon name="camera" size={13} color={colors.onBrandPrimary} />}</View>
    </Tap>
    {user.photo_path && <Tap testID="settings-photo-remove-button" onPress={remove} style={{ minHeight: 32, justifyContent: 'center' }}><T size={10} color={colors.error} weight="600">{t('settings.removePhoto')}</T></Tap>}
  </View>;
}
export function Settings() {
  const { user, settings, updateSettings, setModal, go, setShowIntro, lastTab, alarms, notify } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { t } = useI18n();
  const gender = settings.gender === 'wanita' ? t('settings.female') : settings.gender === 'pria' ? t('settings.male') : t('settings.unset');
  const language = LANGUAGES.find(l => l.key === settings.language) || LANGUAGES[0];
  const switchTrack = { false: colors.solidStrong, true: colors.brandPrimary };
  const trial = trialInfo(settings); const pro = !!settings.pro_preview;
  const toggleDark = (v: boolean) => { if (!pro) { notify(t('pro.needTrial')); go('pro'); return; } updateSettings({ dark: v }); };
  return <Page title={t('settings.title')} back={lastTab} subtitle={t('settings.subtitle')}>
    <Card style={s.profile} testID="settings-profile-card"><ProfilePhoto /><View style={{ flex: 1, gap: 2 }}><T size={18} weight="800" testID="settings-user-name">{user.name}</T><T size={11} muted>{user.guest ? t('settings.guest') : user.email}</T><Tap testID="settings-edit-name-button" onPress={() => setModal({ type: 'profile' })} style={s.editName}><Icon name="pencil" size={12} color={colors.onBrandSecondary} /><T size={11} weight="700" color={colors.onBrandSecondary}>{t('settings.editName')}</T></Tap></View><Badge text={pro ? `PRO · ${trial.daysLeft} ${t('common.days').toUpperCase()}` : 'SAHABAT'} gold={pro} /></Card>
    <Tap testID="settings-pro-button" style={s.proBanner} onPress={() => go('pro')}><ImageBackground source={IMG.heroBirds} style={s.proBg} imageStyle={{ borderRadius: 26 }}><LinearGradient colors={[colors.heroShade, colors.transparent]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.proShade} /><View style={{ flex: 1, gap: 8, padding: 20, maxWidth: '72%' }}><Badge text="AZAM PRO" gold icon="sparkles" light /><T size={19} weight="800" color={colors.heroInk}>{t('settings.proBanner')}</T><T size={11} color={colors.goldText}>{t('settings.proLink')}</T></View></ImageBackground></Tap>
    <View style={s.group}><Section title={t('settings.worship')} /><Card style={s.groupCard}>
      <SettingRow testID="settings-location-button" icon="location-outline" title={t('settings.location')} value={`${settings.city} · Kemenag RI`} onPress={() => setModal({ type: 'location' })} />
      <SettingRow testID="settings-notifications-button" icon="notifications-outline" title={t('settings.notifications')} value={settings.notifications ? t('settings.notifOn') : t('settings.notifOff')} onPress={() => setModal({ type: 'notifications' })} />
      <View style={s.settingRow}><IconBox name="volume-high-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">{t('settings.adhan')}</T><T size={10} muted>{settings.adhan_sound ? t('settings.adhanOn') : t('settings.adhanOff')}</T></View><Switch testID="settings-adhan-switch" value={!!settings.adhan_sound} onValueChange={(v) => updateSettings({ adhan_sound: v })} trackColor={switchTrack} thumbColor={colors.white} ios_backgroundColor={colors.solidStrong} /></View>
      <SettingRow testID="settings-sunnah-button" icon="moon-outline" gold title={t('settings.sunnah')} value={t('settings.sunnahValue', { n: (settings.sunnah_reminders || []).length })} onPress={() => go('sunnah')} />
      <SettingRow testID="settings-reminder-button" icon="hourglass-outline" title={t('settings.blockBefore')} value={t('settings.blockValue', { n: settings.reminder_minutes })} onPress={() => go('focus')} />
      <SettingRow testID="settings-alarm-button" icon="alarm-outline" title={t('settings.alarm')} value={t('settings.alarmValue', { n: (alarms.data || []).filter((a: any) => a.enabled).length })} onPress={() => go('alarms')} />
      <View style={s.settingRow}><IconBox name="people-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">{t('settings.gender')}</T><T size={10} muted>{gender}</T></View><View style={{ flexDirection: 'row', gap: 6 }}>{[['pria', 'man'], ['wanita', 'woman']].map(([key, icon]) => <Tap key={key} testID={`settings-gender-${key}`} onPress={() => updateSettings({ gender: key })} style={[s.genderBtn, settings.gender === key && s.genderOn]}><Icon name={icon} size={18} color={settings.gender === key ? colors.onBrandPrimary : colors.muted} /></Tap>)}</View></View>
    </Card></View>
    <View style={s.group}><Section title={t('settings.display')} /><Card style={s.groupCard}>
      <View style={s.settingRow}><IconBox name="person-circle-outline" size={40} icon={19} /><View style={{ flex: 1 }}><T size={13} weight="600">{t('settings.homePhoto')}</T><T size={10} muted>{!user.photo_path ? t('settings.homePhotoNeed') : settings.home_photo ? t('settings.homePhotoOn') : t('settings.homePhotoOff')}</T></View><Switch testID="settings-home-photo-switch" value={!!settings.home_photo && !!user.photo_path} disabled={!user.photo_path} onValueChange={(v) => updateSettings({ home_photo: v })} trackColor={switchTrack} thumbColor={colors.white} ios_backgroundColor={colors.solidStrong} /></View>
      <SettingRow testID="settings-language-button" icon="language-outline" title={t('settings.language')} value={`${language.native} · ${language.label}`} onPress={() => setModal({ type: 'language' })}><View style={s.langPill}><T size={10} weight="800" color={colors.onBrandSecondary}>{language.flag}</T></View></SettingRow>
      <View style={s.settingRow}><IconBox name="moon-outline" size={40} icon={19} bg={pro ? undefined : colors.goldSoft} color={pro ? undefined : colors.goldText} /><View style={{ flex: 1 }}><T size={13} weight="600">{t('settings.dark')}</T><T size={10} muted>{t('settings.darkSub')}</T></View><Switch testID="settings-dark-theme-switch" value={settings.dark} onValueChange={toggleDark} trackColor={switchTrack} thumbColor={colors.white} ios_backgroundColor={colors.solidStrong} /></View>
      <SettingRow testID="settings-ambient-button" icon="rainy-outline" title={t('settings.ambient')} value={t('settings.ambientValue', { r: Math.round(settings.rain_volume * 100), c: Math.round(settings.cat_volume * 100) })} onPress={() => setModal({ type: 'ambient' })} />
      <SettingRow testID="settings-widget-button" icon="grid-outline" title={t('settings.widget')} value={t('settings.widgetSub')} onPress={() => setModal({ type: 'widget-preview' })} />
      <SettingRow testID="settings-ads-button" icon="megaphone-outline" title={t('settings.ads')} value={t('settings.adsSub')} onPress={() => setModal({ type: 'info', title: 'Ruang iklan', message: 'Versi ini belum menampilkan iklan dan belum terhubung ke jaringan iklan. Opsi bebas iklan direncanakan untuk Azam Pro.' })} />
    </Card></View>
    <View style={s.group}><Section title={t('settings.about')} /><Card style={s.groupCard}>
      <SettingRow testID="settings-guide-button" icon="play-circle-outline" title={t('settings.guide')} onPress={() => setShowIntro(true)} />
      <SettingRow testID="settings-privacy-button" icon="shield-checkmark-outline" title={t('settings.privacy')} onPress={() => setModal({ type: 'info', title: 'Privasi & sumber data', message: 'Azam menyimpan pengaturan, foto profil, dan catatan salat pada server untuk sesi Anda. Foto profil disimpan di penyimpanan terkelola dan hanya dapat dilihat oleh akun Anda. Koordinat dikirim ke AlAdhan untuk perhitungan jadwal; lokasi tidak dilacak di latar belakang. Al-Qur’an dan terjemahan Indonesia berasal dari EQuran.id. Login Google dikelola Emergent. Tidak ada rekaman suara yang dikirim pada versi ini.\n\nSuara azan: “Adhan wiki” dari Wikimedia Commons, lisensi CC BY-SA 3.0. Kalender Hijriah: perhitungan Umm al-Qura.' })} />
      <SettingRow testID="settings-version-button" icon="information-circle-outline" title={t('settings.version')} value={t('settings.versionSub')} onPress={() => setModal({ type: 'info', title: 'Tentang versi ini', message: 'Fitur aktif: jadwal salat dengan suara azan, pengingat salat sunah (Pro), Al-Qur’an, arah kiblat, catatan salat, kalender & hari besar Islam, pencapaian, panduan Haji & Umrah bertahap, alarm dzikir dengan tanggal & jam (berbunyi lewat notifikasi HP), suasana tenang, mode malam, foto profil, dan 4 bahasa antarmuka. Pemblokir aplikasi, widget sistem, dan penghitung rakaat otomatis masih memerlukan integrasi native. Semua demonstrasi diberi label.' })} />
    </Card></View>
    <Button testID="settings-logout-button" title={t('settings.logout')} variant="secondary" icon="log-out-outline" onPress={() => setModal({ type: 'logout' })} />
    <T style={{ textAlign: 'center' }} size={10} muted>{t('settings.footer')}</T>
  </Page>;
}

export function Pro() {
  const { settings, updateSettings, setModal, go, notify, lastTab } = useApp(); const s = useStyles(); const { colors } = useTheme(); const { t } = useI18n();
  const trial = trialInfo(settings); const pro = !!settings.pro_preview;
  const startTrial = async () => { if (await updateSettings(startTrialPatch())) notify(t('pro.trialStarted')); };
  const shimmer = useSharedValue(0);
  useEffect(() => { shimmer.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true); }, [shimmer]);
  const glow = useAnimatedStyle(() => ({ opacity: 0.35 + shimmer.value * 0.45, transform: [{ translateX: -120 + shimmer.value * 240 }] }));
  // Lead with the broadly-wanted features; Hajj & Umrah sits later so newcomers do not assume Pro is pilgrimage-only.
  const features = [
    { icon: 'moon', title: t('pro.f.sunnah'), text: t('pro.f.sunnahText'), badge: t('pro.f.sunnahBadge'), action: () => go('sunnah'), available: true, image: IMG.heroBirds },
    { icon: 'contrast', title: t('pro.f.dark'), text: t('pro.f.darkText'), badge: settings.dark ? t('pro.f.darkOn') : t('pro.f.darkTry'), action: () => pro ? updateSettings({ dark: !settings.dark }) : notify(t('pro.needTrial')), available: true },
    { icon: 'alarm', title: t('settings.alarm'), text: t('home.alarmHint'), badge: pro ? t('common.active') : t('common.pro'), action: () => go('alarms'), available: true },
    { icon: 'musical-notes', title: t('pro.f.sound'), text: `${PRO_AMBIENTS.map(a => a.label).join(' · ')}`, badge: t('common.soon'), action: () => setModal({ type: 'ambient' }), available: false, image: IMG.rain },
    { icon: 'shield-checkmark', title: t('pro.f.verse'), text: t('pro.f.verseText'), badge: t('pro.f.demo'), action: () => setModal({ type: 'blocker', pro: true, prayer: 'Magrib' }), available: true },
    { icon: 'grid', title: t('pro.f.widget'), text: t('pro.f.widgetText'), badge: t('pro.f.widgetBadge'), action: () => setModal({ type: 'widget-preview' }), available: true },
    { icon: 'navigate-circle', title: t('pro.f.hajj'), text: t('pro.f.hajjText'), badge: t('pro.f.hajjBadge'), action: () => go('hajj'), available: true, image: IMG.hajj },
    { icon: 'radio', title: t('pro.f.rakaat'), text: t('pro.f.rakaatText'), badge: t('pro.f.concept'), action: () => setModal({ type: 'rakaat-preview' }), available: false },
  ];
  const compare = [[t('pro.c.basic'), true, true], [t('pro.c.ambient'), true, true], [t('pro.c.sunnah'), false, true], [t('settings.alarm'), false, true], [t('pro.c.dark'), false, true], [t('pro.c.sound'), false, true], [t('pro.c.verse'), false, true], [t('pro.c.hajj'), false, true], [t('pro.c.ads'), false, true]];
  return <Page title={t('pro.title')} back={lastTab === 'home' ? 'settings' : lastTab} subtitle={t('pro.subtitle')}>
    <ImageBackground source={IMG.heroBirds} style={s.proHero} imageStyle={{ borderRadius: 28 }} testID="pro-hero"><LinearGradient colors={[colors.transparent, colors.overlay, colors.heroShade]} style={s.proShade} />
      <Animated.View pointerEvents="none" style={[s.shimmer, glow]}><LinearGradient colors={[colors.transparent, colors.goldSoft, colors.transparent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} /></Animated.View>
      <View style={{ padding: 20, gap: 8 }}><Badge text={pro ? t('pro.trialBadge', { n: trial.daysLeft }) : t('pro.heroBadge')} gold icon="sparkles" light /><T size={30} weight="800" color={colors.heroInk} style={{ letterSpacing: -1, lineHeight: 36 }}>{t('pro.heroTitle')}</T><T size={12} color={colors.heroMuted}>{t('pro.heroText')}</T></View></ImageBackground>
    <View style={s.planRow}>{[[t('pro.monthly'), t('pro.monthlySub'), 'pro-plan-monthly'], [t('pro.yearly'), t('pro.yearlySub'), 'pro-plan-yearly']].map(([name, text, id], i) => <Tap key={String(id)} testID={String(id)} onPress={() => notify(t('pro.paymentSoon'))} style={[s.plan, i === 1 && s.planBest]}>{i === 1 && <View style={s.bestTag}><T size={9} weight="800" color={colors.goldInk}>{t('pro.best')}</T></View>}<T size={11} weight="700" color={colors.goldText}>{name}</T><T size={22} weight="800">{t('pro.soonPrice')}</T><T size={10} muted>{text}</T></Tap>)}</View>
    {pro ? <Card style={s.trialCard} testID="pro-trial-active"><IconBox name="sparkles" size={44} icon={20} bg={colors.gold} color={colors.goldInk} /><View style={{ flex: 1 }}><T size={14} weight="800">{t('pro.trialActive', { n: trial.daysLeft })}</T><T size={11} muted>{t('pro.trialNote')}</T></View></Card>
      : trial.expired ? <Card style={s.trialCard} testID="pro-trial-ended"><IconBox name="time-outline" size={44} icon={20} /><View style={{ flex: 1 }}><T size={14} weight="800">{t('pro.trialEnded')}</T><T size={11} muted>{t('pro.paymentSoon')}</T></View></Card>
        : <View style={{ gap: 8 }}><Button testID="pro-trial-button" title={t('pro.trialStart')} icon="sparkles" variant="gold" onPress={startTrial} /><T size={11} muted style={{ textAlign: 'center' }}>{t('pro.trialNote')}</T></View>}
    <Section title={t('pro.get')} />
    <View style={s.featureGrid}>{features.map((f, i) => <Tap testID={`pro-feature-${i}`} key={f.title} style={[s.featureCard, !f.available && s.featureLocked]} onPress={f.action}>
      {f.image ? <ImageBackground source={f.image} style={s.featureArt} imageStyle={{ borderRadius: 16 }}><LinearGradient colors={[colors.transparent, colors.overlay]} style={[s.proShade, { borderRadius: 16 }]} /><Icon name={f.icon} size={22} color={colors.gold} /></ImageBackground> : <IconBox name={f.icon} size={48} icon={22} bg={f.available ? colors.goldSoft : undefined} color={f.available ? colors.goldText : colors.muted} />}
      <T size={14} weight="800">{f.title}</T><T size={11} muted numberOfLines={2}>{f.text}</T><View style={s.featureBadge}><T size={10} weight="700" color={f.available ? colors.goldText : colors.muted}>{f.badge}</T><Icon name={f.available ? 'arrow-forward' : 'lock-closed-outline'} size={12} color={f.available ? colors.goldText : colors.muted} /></View></Tap>)}</View>
    <Section title={t('pro.compare')} /><Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}><View style={[s.compareRow, { backgroundColor: colors.goldSoft }]}><T size={11} weight="800" style={{ flex: 1 }}>{t('pro.feature')}</T><T size={11} weight="800" style={s.compareCol}>{t('pro.free')}</T><T size={11} weight="800" color={colors.goldText} style={s.compareCol}>Pro</T></View>
      {compare.map(([label, free, pro]) => <View key={String(label)} style={s.compareRow}><T size={12} style={{ flex: 1 }}>{label}</T><View style={s.compareCol}><Icon name={free ? 'checkmark-circle' : 'remove-circle-outline'} size={18} color={free ? colors.success : colors.muted} /></View><View style={s.compareCol}><Icon name={pro ? 'checkmark-circle' : 'remove-circle-outline'} size={18} color={colors.goldText} /></View></View>)}</Card>
    <T muted size={11} style={{ textAlign: 'center' }}>{t('pro.footer')}</T>
  </Page>;
}

const useStyles = makeStyles(c => ({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16 }, photoCol: { alignItems: 'center', gap: 2 }, avatarWrap: { width: 72, height: 72 },
  camBadge: { position: 'absolute', right: -2, bottom: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: c.brandPrimary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface },
  editName: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 28, alignSelf: 'flex-start' }, langPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: c.brandSecondary },
  proBanner: { borderRadius: 26, overflow: 'hidden' }, proBg: { minHeight: 150, justifyContent: 'center' }, proShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 26 },
  group: { gap: 10 }, groupCard: { paddingVertical: 4, paddingHorizontal: 14 }, settingRow: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 70, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.divider },
  genderBtn: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.glass, borderWidth: 1, borderColor: c.border }, genderOn: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
  proHero: { height: 250, borderRadius: 28, justifyContent: 'flex-end', overflow: 'hidden' }, shimmer: { position: 'absolute', top: 0, bottom: 0, width: 160 }, featureLocked: { opacity: 0.65 },
  planRow: { flexDirection: 'row', gap: 10 }, plan: { flex: 1, padding: 14, borderRadius: 20, gap: 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, planBest: { borderColor: c.gold, borderWidth: 2, backgroundColor: c.goldSoft }, bestTag: { position: 'absolute', top: -1, right: 12, backgroundColor: c.gold, paddingHorizontal: 8, paddingVertical: 3, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  trialCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.gold, backgroundColor: c.goldSoft },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, featureCard: { width: '48%', flexGrow: 1, padding: 14, borderRadius: 22, gap: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, featureArt: { height: 64, borderRadius: 16, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8, overflow: 'hidden' }, featureBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  compareRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 46, borderBottomWidth: 1, borderBottomColor: c.divider }, compareCol: { width: 54, alignItems: 'center', textAlign: 'center' },
}));
