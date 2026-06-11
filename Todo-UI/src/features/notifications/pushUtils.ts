import type { PushSubscriptionPayload } from './notificationTypes';

export function isPushNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const normalizedBase64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(normalizedBase64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) {
    return '';
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window.btoa(binary);
}

export async function getServiceWorkerRegistration() {
  return navigator.serviceWorker.ready;
}

export async function getExistingPushSubscription() {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

export async function requestPushSubscription(vapidPublicKey: string) {
  const registration = await getServiceWorkerRegistration();

  return registration.pushManager.subscribe({
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    userVisibleOnly: true,
  });
}

export function serializePushSubscription(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const rawP256dh = subscription.getKey('p256dh');
  const rawAuth = subscription.getKey('auth');

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: {
      auth: arrayBufferToBase64(rawAuth),
      p256dh: arrayBufferToBase64(rawP256dh),
    },
  };
}
