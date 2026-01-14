import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { setAuthToken } from './services/api';
import { AuthProvider } from './context/AuthContext'; // ✅ ADD THIS

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setAuthToken(); // load token into memory
      setReady(true);
    };
    init();

    const subscription =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        const storyId = data?.storyId;
        if (storyId) {
          router.push(`/stories/${storyId}`);
        }
      });

    return () => subscription.remove();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider> {/* 🔥 THIS IS THE KEY */}
        <StatusBar style="dark" />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />

          <Stack.Screen
            name="(drawer)"
            options={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
