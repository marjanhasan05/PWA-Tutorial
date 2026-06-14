import type { PushSubscriptionPayload } from './notificationTypes';
import {
  getPwaServiceWorkerRegistration,
  initializePwaRegistration,
  waitForPwaServiceWorkerRegistration,
} from '../../pwa/pwaRegistration';

const LEGACY_PUSH_SERVICE_WORKER_SCOPE = '/push-notifications/';
const ROOT_SERVICE_WORKER_SCOPE = '/';

function isStandaloneDisplayMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isAppleMobileDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const touchPoints = window.navigator.maxTouchPoints ?? 0;

  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes('macintosh') && touchPoints > 1)
  );
}

export function getPushUnsupportedReason() {
  if (typeof window === 'undefined') {
    return 'Push notifications are not available during server rendering.';
  }

  if (!('serviceWorker' in navigator)) {
    return 'This browser does not support service workers.';
  }

  if (!('Notification' in window)) {
    return 'This browser does not support the Notification API.';
  }

  if (!('PushManager' in window)) {
    return 'This browser does not support the Push API.';
  }

  if (isAppleMobileDevice() && !isStandaloneDisplayMode()) {
    return 'On iPhone and iPad, install TaskFlow to the Home Screen and open it from there before subscribing to push notifications.';
  }

  return null;
}

export function isPushNotificationSupported() {
  return getPushUnsupportedReason() === null;
}

async function getLegacyServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) {
    return undefined;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const legacyScopeUrl = new URL(
    LEGACY_PUSH_SERVICE_WORKER_SCOPE,
    window.location.origin,
  ).href;
  const rootScopeUrl = new URL(ROOT_SERVICE_WORKER_SCOPE, window.location.origin)
    .href;
  const registration = registrations.find(
    (candidate) =>
      candidate.scope === legacyScopeUrl && candidate.scope !== rootScopeUrl,
  );
  return registration;
}

async function waitForServiceWorkerReady() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  initializePwaRegistration();

  const existingRegistration =
    getPwaServiceWorkerRegistration() ||
    (await navigator.serviceWorker.getRegistration());
  if (existingRegistration?.active) {
    return existingRegistration;
  }

  return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          'Service worker registration did not become ready in time. Reload the app and try again.',
        ),
      );
    }, 10000);

    waitForPwaServiceWorkerRegistration()
      .then((registration) => {
        if (registration.active) {
          window.clearTimeout(timeoutId);
          resolve(registration);
          return;
        }

        const serviceWorker =
          registration.installing ?? registration.waiting ?? registration.active;

        if (!serviceWorker) {
          throw new Error(
            'Service worker registration exists, but no worker instance is available yet.',
          );
        }

        const handleStateChange = () => {
          if (serviceWorker.state === 'activated') {
            window.clearTimeout(timeoutId);
            serviceWorker.removeEventListener('statechange', handleStateChange);
            resolve(registration);
          }
        };

        serviceWorker.addEventListener('statechange', handleStateChange);
        handleStateChange();
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
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
  return waitForServiceWorkerReady();
}

export async function getExistingPushSubscription() {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

export async function cleanupLegacyPushRegistration() {
  const legacyRegistration = await getLegacyServiceWorkerRegistration();
  const legacySubscription = await legacyRegistration?.pushManager.getSubscription();

  await legacySubscription?.unsubscribe();
  if (legacyRegistration) {
    await legacyRegistration.unregister();
  }
}

export async function requestPushSubscription(vapidPublicKey: string) {
  await cleanupLegacyPushRegistration();

  const registration = await getServiceWorkerRegistration();
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

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
