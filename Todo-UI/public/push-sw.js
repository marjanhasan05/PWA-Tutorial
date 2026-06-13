self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const defaultPayload = {
    body: 'You have a new TaskFlow notification.',
    title: 'TaskFlow',
    url: '/app',
  };

  const normalizePayload = (payload) => {
    if (!payload) {
      return {};
    }

    if (payload.payload) {
      return normalizePayload({ ...payload, ...payload.payload, payload: undefined });
    }

    if (payload.notification) {
      return normalizePayload({
        ...payload,
        ...payload.notification,
        notification: undefined,
      });
    }

    return payload;
  };

  const payload = (() => {
    try {
      return normalizePayload(event.data ? event.data.json() : {});
    } catch {
      const text = event.data ? event.data.text() : '';
      return {
        body: text || defaultPayload.body,
      };
    }
  })();

  const title = payload.title || defaultPayload.title;
  const notificationTag =
    payload.tag ||
    `taskflow-${payload.type || 'push'}-${payload.serverTime || Date.now()}`;
  const options = {
    badge: payload.badge || '/pwa-192x192.png',
    body: payload.body || defaultPayload.body,
    data: {
      ...(payload.data || {}),
      url: payload.url || defaultPayload.url,
      },
      icon: payload.icon || '/pwa-192x192.png',
      renotify: true,
      tag: notificationTag,
    };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || '/app';

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      const matchingClient = clients.find((client) => {
        try {
          return new URL(client.url).pathname === new URL(url, self.location.origin).pathname;
        } catch {
          return false;
        }
      });

      if (matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(url);
    }),
  );
});
