import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response:', response);
      }
    );

    return () => {
      notificationListener.current && 
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && 
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const scheduleNotification = async (reminder: any) => {
    if (Platform.OS === 'web') {
      // Web notifications fallback
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(reminder.title, {
            body: reminder.description || 'Reminder notification',
            icon: reminder.media_attachments?.[0]?.url,
          });
        }
      }
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description || 'Reminder notification',
        data: { reminderId: reminder.id },
        attachments: reminder.media_attachments?.map((attachment: any) => ({
          url: attachment.url,
          typeHint: attachment.type,
        })) || [],
      },
      trigger: {
        date: new Date(reminder.scheduled_at),
      },
    });
  };

  return {
    scheduleNotification,
  };
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}