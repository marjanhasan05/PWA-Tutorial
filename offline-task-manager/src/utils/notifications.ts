import { apiFetch } from './api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function checkNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush(token: string): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const vapidKey = (import.meta as any).env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn('VITE_VAPID_PUBLIC_KEY is missing, using a fallback key for presentation.');
      }
      
      // Standard demo/presentation VAPID key to ensure standard PWA structures build cleanly.
      const decodedKey = urlBase64ToUint8Array(
        vapidKey || 'BEl62iS_6AAU68SgZ9KCZ_8Aup3I87L8Z96BAtK89KCS_86AUB68SgZ9KCZ_8Aup3I87L8Z96BA'
      );

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodedKey,
      });
    }

    // Send subscription to backend API
    const subJSON = subscription.toJSON();
    await apiFetch('/notifications/subscriptions', {
      method: 'POST',
      token,
      body: JSON.stringify({
        endpoint: subJSON.endpoint,
        expirationTime: subJSON.expirationTime,
        keys: {
          p256dh: subJSON.keys?.p256dh || '',
          auth: subJSON.keys?.auth || '',
        },
      }),
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe user to push notifications:', error);
    throw error;
  }
}

export async function unsubscribeFromPush(token: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      
      // Opt-out from backend
      await apiFetch('/notifications/subscriptions', {
        method: 'DELETE',
        token,
        body: JSON.stringify({ endpoint }),
      });

      // Unsubscribe locally
      const successful = await subscription.unsubscribe();
      return successful;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

export async function triggerTestNotification(token: string, title: string, body: string): Promise<void> {
  await apiFetch('/notifications/test', {
    method: 'POST',
    token,
    body: JSON.stringify({ title, body }),
  });
}
