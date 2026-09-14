import app from './app.json';
export default {
  ...app.expo,
  name: 'Azam – App Blocker',
  scheme: 'azam',
  plugins: [...app.expo.plugins.map(plugin => plugin === 'expo-audio' ? ['expo-audio', { microphonePermission: false, recordAudioAndroid: false }] : plugin), 'expo-sharing',
    // Native home/lock-screen widgets (only in development/store builds, not Expo Go).
    ['react-native-android-widget', { fonts: ['./assets/fonts/PlusJakartaSans-Bold.ttf', './assets/fonts/PlusJakartaSans-ExtraBold.ttf', './assets/fonts/PlusJakartaSans-Medium.ttf', './assets/fonts/Amiri.ttf'], widgets: [
      { name: 'AzamAzan', label: 'Azam · Hitung mundur azan', description: 'Salat berikutnya dan sisa waktunya.', minWidth: '250dp', minHeight: '110dp', targetCellWidth: 4, targetCellHeight: 2, resizeMode: 'horizontal|vertical', updatePeriodMillis: 1800000 },
      { name: 'AzamAyat', label: 'Azam · Seayat hari ini', description: 'Ayat harian dengan terjemahan Indonesia.', minWidth: '250dp', minHeight: '140dp', targetCellWidth: 4, targetCellHeight: 2, resizeMode: 'horizontal|vertical', updatePeriodMillis: 3600000 },
    ] }],
    ['expo-image-picker', { photosPermission: 'Pilih foto untuk kartu story salatmu', cameraPermission: 'Ambil selfie untuk kartu story salatmu' }],
    // Alarm & prayer reminders: exact, sound + vibration, default channel for scheduled alarms.
    ['expo-notifications', { color: '#0B7FC4', defaultChannel: 'alarms', enableBackgroundRemoteNotifications: false }],
    '@bacons/apple-targets'],
  extra: { backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL },
  ios: { ...app.expo.ios, infoPlist: { NSLocationWhenInUseUsageDescription: 'Temukan jadwal salat dan arah kiblat Anda.', NSCameraUsageDescription: 'Ambil selfie untuk kartu story salatmu', NSPhotoLibraryUsageDescription: 'Pilih foto untuk kartu story salatmu' }, entitlements: { 'com.apple.security.application-groups': ['group.com.emergent.qurandaily.fst79v'] } },
  android: { ...app.expo.android, permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS', 'CAMERA', 'READ_MEDIA_IMAGES', 'QUERY_ALL_PACKAGES', 'SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'VIBRATE', 'com.android.alarm.permission.SET_ALARM'] },
};