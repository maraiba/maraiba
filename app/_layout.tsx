import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Handle notification while app is in foreground
    notifListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const alarmId = notification.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        router.push(`/alarm-ringing?alarmId=${alarmId}`);
      }
    });

    // Handle tap on notification (app in background or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const alarmId = response.notification.request.content.data?.alarmId as string | undefined;
      if (alarmId) {
        router.push(`/alarm-ringing?alarmId=${alarmId}`);
      }
    });

    // Handle app launch from killed state via notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const alarmId = response.notification.request.content.data?.alarmId as string | undefined;
        if (alarmId) {
          router.push(`/alarm-ringing?alarmId=${alarmId}`);
        }
      }
    });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A1628' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="add-alarm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="alarm-ringing"
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
      </Stack>
    </>
  );
}
