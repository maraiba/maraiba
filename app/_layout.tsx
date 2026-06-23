import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data?.alarmId as string;
      if (alarmId) {
        router.push(`/ring?alarmId=${alarmId}`);
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#e0e0e0',
        contentStyle: { backgroundColor: '#0f0f1e' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Ébresztők' }} />
      <Stack.Screen name="add" options={{ title: 'Ébresztő beállítása' }} />
      <Stack.Screen name="ring" options={{ headerShown: false }} />
    </Stack>
  );
}
