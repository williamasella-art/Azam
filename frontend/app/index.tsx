import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useApp, ScreenName } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Icon, T, Tap } from '@/src/components/ui';
import { GlobalOverlay, Toast } from '@/src/components/GlobalOverlay';
import { PrayerNotifications } from '@/src/components/PrayerNotifications';
import { AlarmScheduler } from '@/src/components/AlarmScheduler';
import { AdhanPlayer } from '@/src/components/AdhanPlayer';
import { WidgetSync } from '@/src/components/WidgetSync';
import { Alarms } from '@/src/screens/Alarms';
import { Loading, Welcome } from '@/src/screens/Welcome';
import { Intro } from '@/src/screens/Intro';
import { Home } from '@/src/screens/Home';
import { Quran, Reader } from '@/src/screens/Quran';
import { Focus } from '@/src/screens/Focus';
import { Progress, Achievements } from '@/src/screens/Progress';
import { Qibla } from '@/src/screens/Qibla';
import { Pro, Settings } from '@/src/screens/Settings';
import { Hajj } from '@/src/screens/Hajj';

const TABS: { key: ScreenName; label: string; icon: string; selected: string }[] = [
  { key: 'home', label: 'Beranda', icon: 'home-outline', selected: 'home' },
  { key: 'qibla', label: 'Kiblat', icon: 'compass-outline', selected: 'compass' },
  { key: 'focus', label: 'Blocker', icon: 'shield-half-outline', selected: 'shield-half' },
  { key: 'quran', label: 'Al-Qur’an', icon: 'book-outline', selected: 'book' },
  { key: 'progress', label: 'Progres', icon: 'flame-outline', selected: 'flame' },
];
export default function Index() {
  const { user, loading, settings, screen, go, modal, introDone, showIntro } = useApp(); const { colors, scheme } = useTheme(); const s = useStyles();
  const tabScreen = TABS.some(tab => tab.key === screen);
  const screens: Record<ScreenName, React.ReactNode> = { home: <Home />, quran: <Quran />, focus: <Focus />, progress: <Progress />, reader: <Reader />, qibla: <Qibla />, achievements: <Achievements />, settings: <Settings />, pro: <Pro />, hajj: <Hajj />, alarms: <Alarms /> };
  const needsIntro = showIntro || (!user && introDone === false) || (!!user && settings && !settings.onboarded);
  return <View style={s.root}><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    <SafeAreaView style={s.frame} edges={user && !needsIntro ? ['top', 'bottom'] : []}>
      {loading || introDone === null ? <Loading /> : needsIntro ? <Intro /> : !user ? <Welcome /> : <>
        <View style={s.content}>{screens[screen as ScreenName]}</View>
        {tabScreen && <View style={s.navWrap}><View style={s.nav}>{TABS.map(tab => {
          const active = screen === tab.key;
          return <Tap testID={`tab-${tab.key}`} key={tab.key} onPress={() => go(tab.key)} style={s.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            {active && <Animated.View entering={FadeIn.duration(250)} style={s.tabActiveBg}><LinearGradient colors={[colors.brandTertiary, colors.brandDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.tabGradient} /></Animated.View>}
            <Icon name={active ? tab.selected : tab.icon} size={22} color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary} /><T size={9} weight="700" color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary}>{tab.label}</T>
          </Tap>;
        })}</View></View>}
        <PrayerNotifications /><AlarmScheduler /><AdhanPlayer /><WidgetSync />
      </>}
      {!modal && <Toast />}
    </SafeAreaView><GlobalOverlay />
  </View>;
}
const useStyles = makeStyles(c => ({
  root: { flex: 1, backgroundColor: c.pageTop }, frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: c.pageTop }, content: { flex: 1 },
  navWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: c.pageBottom },
  nav: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 26, padding: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, gap: 2, shadowColor: c.black, shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  tab: { flex: 1, minHeight: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden' }, tabActiveBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, tabGradient: { flex: 1, borderRadius: 20 },
}));
