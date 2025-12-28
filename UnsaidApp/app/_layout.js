import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // 🔔 Handle notification tap (app opened from notification)
    const subscription =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data =
          response.notification.request.content.data;

        const storyId = data?.storyId;

        if (storyId) {
          router.push(`/stories/${storyId}`);
        }
      });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Drawer / Tabs */}
        <Stack.Screen
          name="(drawer)"
          options={{
            headerShown: false,
            animation: 'fade_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
