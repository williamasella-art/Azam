import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useApp, ScreenName } from '@/src/AppContext';
import { makeStyles, useTheme } from '@/src/theme';
import { Icon, T, Tap } from '@/src/components/ui';
import { GlobalOverlay, Toast } from '@/src/components/GlobalOverlay';
import { PrayerNotifications } from '@/src/components/PrayerNotifications';
import { Loading, Setup, Welcome } from '@/src/screens/Welcome';
import { Home } from '@/src/screens/Home';
import { Quran, Reader } from '@/src/screens/Quran';
import { Focus } from '@/src/screens/Focus';
import { Progress, Achievements } from '@/src/screens/Progress';
import { Qibla } from '@/src/screens/Qibla';
import { Pro, Settings } from '@/src/screens/Settings';

const TABS: { key: ScreenName; label: string; icon: string; selected: string }[] = [
  { key: 'home', label: 'Beranda', icon: 'home-outline', selected: 'home' },
  { key: 'quran', label: 'Al-Qur’an', icon: 'book-outline', selected: 'book' },
  { key: 'focus', label: 'Fokus', icon: 'shield-checkmark-outline', selected: 'shield-checkmark' },
  { key: 'progress', label: 'Progres', icon: 'stats-chart-outline', selected: 'stats-chart' },
];
export default function Index() {
  const { user, loading, settings, screen, go, modal } = useApp(); const { colors, scheme } = useTheme(); const s = useStyles();
  const tabScreen = TABS.some(tab => tab.key === screen);
  const screens: Record<ScreenName, React.ReactNode> = { home: <Home />, quran: <Quran />, focus: <Focus />, progress: <Progress />, reader: <Reader />, qibla: <Qibla />, achievements: <Achievements />, settings: <Settings />, pro: <Pro /> };
  return <View style={s.root}><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    <SafeAreaView style={s.frame} edges={user ? ['top', 'bottom'] : []}>
      {loading ? <Loading /> : !user ? <Welcome /> : !settings?.onboarded ? <Setup /> : <>
        <View style={s.content}>{screens[screen as ScreenName]}</View>
        {tabScreen && <View style={s.navWrap}><BlurView intensity={35} tint={scheme === 'dark' ? 'dark' : 'light'} style={s.nav}>{TABS.map(tab => {
          const active = screen === tab.key;
          return <Tap testID={`tab-${tab.key}`} key={tab.key} onPress={() => go(tab.key)} style={[s.tab, active && s.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            <Icon name={active ? tab.selected : tab.icon} size={21} color={active ? colors.onBrandSecondary : colors.muted} /><T size={9} weight="700" color={active ? colors.onBrandSecondary : colors.onSurfaceTertiary}>{tab.label}</T>
          </Tap>;
        })}</BlurView></View>}
        <PrayerNotifications />
      </>}
      {!modal && <Toast />}
    </SafeAreaView><GlobalOverlay />
  </View>;
}
const useStyles = makeStyles(c => ({
  root: { flex: 1, backgroundColor: c.surfaceSecondary }, frame: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: c.surfaceSecondary }, content: { flex: 1 },
  navWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, backgroundColor: c.surfaceSecondary }, nav: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 25, padding: 7, overflow: 'hidden', backgroundColor: c.glass, borderWidth: 1, borderColor: c.border, gap: 4 },
  tab: { flex: 1, minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 5 }, tabActive: { backgroundColor: c.brandSecondary },
}));