const CACHE_NAME = 'offline-task-manager-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/public/manifest.json',
  '/public/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((allCaches) => {
      return Promise.all(
        allCaches.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache falling back to network for assets, let API requests go directly to network (handled by app)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If request is to API, skip service worker caching to avoid dynamic caching issues.
  // Instead, let the frontend's IndexedDB and RTK Query offline support handle dynamic state.
  if (url.pathname.includes('/auth') || url.pathname.includes('/tasks') || url.pathname.includes('/sync') || url.pathname.includes('/users')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Return index.html as a fallback for SPA navigation when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Listen to push notification event
self.addEventListener('push', (event) => {
  let data = { title: 'Offline Task Manager', body: 'New update received!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Offline Task Manager', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/public/icon.svg',
    badge: '/public/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click to open the application
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing open window if possible
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Or open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
