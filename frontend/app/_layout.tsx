import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ErrorBoundary } from '@/src/components/error-boundary';
import { queryClient } from '@/src/query-client';
import { AppProvider } from '@/src/AppContext';
import { AmbientProvider } from '@/src/ambient';
import { useTheme } from '@/src/theme';

export default function RootLayout() {
  // Prewarm vector icon fonts before rendering, including Expo Go Android.
  const [ready, error] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'), 'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'), 'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'), 'PlusJakartaSans-ExtraBold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    Amiri: require('../assets/fonts/Amiri.ttf'), ...Ionicons.font, ...Feather.font,
  });
  const { colors } = useTheme();
  if (!ready && !error) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.pageTop }}><ActivityIndicator color={colors.brandPrimary} /></View>;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><ErrorBoundary><QueryClientProvider client={queryClient}>
    <AppProvider><AmbientProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.pageTop } }} /></AmbientProvider></AppProvider>
  </QueryClientProvider></ErrorBoundary></SafeAreaProvider></GestureHandlerRootView>;
}
