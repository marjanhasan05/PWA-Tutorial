/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

type PushPayload = {
  badge?: string;
  body?: string;
  data?: Record<string, unknown>;
  icon?: string;
  notification?: PushPayload;
  payload?: PushPayload;
  requireInteraction?: boolean;
  serverTime?: string;
  tag?: string;
  title?: string;
  type?: string;
  url?: string;
};

const defaultPushPayload: Required<
  Pick<PushPayload, 'body' | 'icon' | 'badge' | 'title' | 'url'>
> = {
  badge: '/pwa-192x192.png',
  body: 'You have a new TaskFlow notification.',
  icon: '/pwa-192x192.png',
  title: 'TaskFlow',
  url: '/app',
};

self.skipWaiting();
clientsClaim();

const precacheManifest = self.__WB_MANIFEST;
const precachedUrls = new Set(
  precacheManifest.map((entry) =>
    typeof entry === 'string' ? entry : entry.url,
  ),
);

precacheAndRoute(precacheManifest);
cleanupOutdatedCaches();

registerRoute(
  ({ request, sameOrigin }) =>
    sameOrigin && ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'app-shell-resources',
  }),
);

registerRoute(
  ({ request, sameOrigin }) =>
    sameOrigin && request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'app-image-assets',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 32,
      }),
    ],
  }),
);

if (precachedUrls.has('index.html') || precachedUrls.has('/index.html')) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL('index.html'), {
      denylist: [/^\/(auth|tasks|users|sync|notifications)(\/|$)/],
    }),
  );
}

function normalizePushPayload(payload: unknown): Partial<PushPayload> {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const candidate = payload as PushPayload;

  if (candidate.payload) {
    return normalizePushPayload({
      ...candidate,
      ...candidate.payload,
      payload: undefined,
    });
  }

  if (candidate.notification) {
    return normalizePushPayload({
      ...candidate,
      ...candidate.notification,
      notification: undefined,
    });
  }

  return candidate;
}

function getPushPayload(event: PushEvent): Partial<PushPayload> {
  try {
    return normalizePushPayload(event.data ? event.data.json() : {});
  } catch {
    const text = event.data ? event.data.text() : '';

    return text
      ? {
          body: text,
        }
      : {};
  }
}

self.addEventListener('push', (event) => {
  const payload = getPushPayload(event);
  const title = payload.title || defaultPushPayload.title;
  const notificationTag =
    payload.tag ||
    `taskflow-${payload.type || 'push'}-${payload.serverTime || Date.now()}`;

  const options: NotificationOptions & { renotify?: boolean } = {
    badge: payload.badge || defaultPushPayload.badge,
    body: payload.body || defaultPushPayload.body,
    data: {
      ...(payload.data || {}),
      url: payload.url || defaultPushPayload.url,
    },
    icon: payload.icon || defaultPushPayload.icon,
    renotify: true,
    requireInteraction: payload.requireInteraction ?? false,
    tag: notificationTag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl =
    (event.notification.data &&
      typeof event.notification.data === 'object' &&
      'url' in event.notification.data &&
      typeof event.notification.data.url === 'string' &&
      event.notification.data.url) ||
    defaultPushPayload.url;
  const destinationUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(
      (clients) => {
        const matchingClient = clients.find((client) => client.url === destinationUrl);

        if (matchingClient) {
          return matchingClient.focus();
        }

        return self.clients.openWindow(destinationUrl);
      },
    ),
  );
});

export {};
