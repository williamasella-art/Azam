import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { storage } from './utils/storage';

export const openSettings = () => Linking.openSettings();
export async function requestLocation() {
  let permission = await Location.getForegroundPermissionsAsync();
  if (permission.granted) return permission;
  const count = (await storage.getItem('location-denials', 0)) || 0;
  if (!permission.canAskAgain || count >= 2) return { ...permission, canAskAgain: false };
  permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) await storage.setItem('location-denials', count + 1);
  return { ...permission, canAskAgain: permission.canAskAgain && (permission.granted || count + 1 < 2) };
}
export async function requestNotifications() {
  if (Platform.OS === 'web') return { granted: false, canAskAgain: false, unsupported: true };
  const Notifications = await import('expo-notifications');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('prayers', { name: 'Pengingat salat', importance: Notifications.AndroidImportance.HIGH });
  let permission = await Notifications.getPermissionsAsync();
  if (permission.granted) return permission;
  const count = (await storage.getItem('notification-denials', 0)) || 0;
  if (!permission.canAskAgain || count >= 2) return { ...permission, canAskAgain: false };
  permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) await storage.setItem('notification-denials', count + 1);
  return { ...permission, canAskAgain: permission.canAskAgain && (permission.granted || count + 1 < 2) };
}