import app from './app.json';
export default {
  ...app.expo,
  name: 'Azam – App Blocker',
  scheme: 'azam',
  plugins: app.expo.plugins.map(plugin => plugin === 'expo-audio' ? ['expo-audio', { microphonePermission: false, recordAudioAndroid: false }] : plugin),
  extra: { backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL },
  ios: { ...app.expo.ios, infoPlist: { NSLocationWhenInUseUsageDescription: 'Temukan jadwal salat dan arah kiblat Anda.' } },
  android: { ...app.expo.android, permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS'] },
};