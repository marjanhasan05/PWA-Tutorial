import type { PushSubscriptionPayload } from './notificationTypes';

export function isPushNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

const PUSH_SERVICE_WORKER_URL = '/push-sw.js';
const PUSH_SERVICE_WORKER_SCOPE = '/push-notifications/';

async function ensureServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  const existingRegistration = await navigator.serviceWorker.getRegistration(
    PUSH_SERVICE_WORKER_SCOPE,
  );
  if (existingRegistration) {
    return existingRegistration;
  }

  const registration = await navigator.serviceWorker.register(
    PUSH_SERVICE_WORKER_URL,
    {
      scope: PUSH_SERVICE_WORKER_SCOPE,
    },
  );

  if (registration.active) {
    return registration;
  }

  return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const serviceWorker =
      registration.installing ?? registration.waiting ?? registration.active;
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          'Service worker registration did not become ready in time. Reload the app and try again.',
        ),
      );
    }, 10000);

    if (!serviceWorker) {
      window.clearTimeout(timeoutId);
      reject(
        new Error(
          'Push service worker could not be initialized. Reload the app and try again.',
        ),
      );
      return;
    }

    const handleStateChange = () => {
      if (serviceWorker.state === 'activated') {
        window.clearTimeout(timeoutId);
        resolve(registration);
        serviceWorker.removeEventListener('statechange', handleStateChange);
      }
    };

    serviceWorker.addEventListener('statechange', handleStateChange);
    handleStateChange();
  });
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
  return ensureServiceWorkerRegistration();
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
