import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function getPushToken() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    alert('Permission for notifications not granted');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);

  return token;
}
