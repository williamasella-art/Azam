import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { ErrorBoundary } from '@/src/components/error-boundary';
import { queryClient } from '@/src/query-client';
import { AppProvider } from '@/src/AppContext';
import { AmbientProvider } from '@/src/ambient';
import { storage } from '@/src/utils/storage';
import { useTheme } from '@/src/theme';

// Push: foreground display behaviour — module scope, before any component.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
  });
}
// Android channel — module scope so it exists before any push arrives.
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', { name: 'Azam', importance: Notifications.AndroidImportance.MAX, sound: 'default' });
}

export default function RootLayout() {
  // Prewarm vector icon fonts before rendering, including Expo Go Android.
  const [ready, error] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'), 'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'), 'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'), 'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    Amiri: require('../assets/fonts/Amiri.ttf'), ...Ionicons.font, ...Feather.font,
  });
  const { colors } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const openUrl = (url?: string) => { if (!url) return; url.startsWith('http') ? Linking.openURL(url).catch(() => {}) : Linking.openURL(Linking.createURL(url)).catch(() => {}); };
    // Warm tap — notification tapped while app is open.
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data: any = response.notification.request.content.data || {};
      openUrl(data.deeplink || data.action_url);
    });
    // Cold-start tap — app was killed when the notification was tapped.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const data: any = response?.notification.request.content.data || {};
      if (data.deeplink || data.action_url) openUrl(data.deeplink || data.action_url);
    }).catch(() => {});
    // Weekly nudge for users who denied notifications (never auto-opens without throttle).
    (async () => {
      try {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        if (status !== 'denied' || canAskAgain) return;
        const last = await storage.getItem<number>('pushNudgeAt', 0);
        const week = 7 * 24 * 60 * 60 * 1000;
        if (last && Date.now() - Number(last) <= week) return;
        await storage.setItem('pushNudgeAt', Date.now());
        Linking.openSettings().catch(() => {});
      } catch { /* ignore */ }
    })();
    return () => { tapSub.remove(); };
  }, []);

  if (!ready && !error) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.pageTop }}><ActivityIndicator color={colors.brandPrimary} /></View>;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><ErrorBoundary><QueryClientProvider client={queryClient}>
    <AppProvider><AmbientProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.pageTop } }} /></AmbientProvider></AppProvider>
  </QueryClientProvider></ErrorBoundary></SafeAreaProvider></GestureHandlerRootView>;
}
