/**
 * ZIVO Service Worker
 * Handles push notifications, caching, and offline support
 */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precache manifest (injected by vite-plugin-pwa)
self.__WB_MANIFEST;

// Configure Workbox
if (workbox) {
  console.log('[SW] Workbox loaded successfully');

  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache Google Fonts stylesheets
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com\/.*/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache Google Fonts webfonts
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com\/.*/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Cache images
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  // Always fetch navigations from the network so published users don't get a stale app shell.
  // Skip OAuth callback routes — must always hit the network.
  const navigationHandler = workbox.precaching.createHandlerBoundToURL('/index.html');
  workbox.routing.registerRoute(
    ({ request, url }) => {
      if (request.mode !== 'navigate') return false;
      if (url.pathname.startsWith('/~oauth')) return false;
      return true;
    },
    async (options) => {
      try {
        return await new workbox.strategies.NetworkOnly().handle(options);
      } catch (error) {
        console.debug('[SW] Navigation request fell back to precache', {
          url: options.request.url,
          error,
        });
        return navigationHandler(options);
      }
    }
  );

  // NetworkFirst for Supabase API calls
  workbox.routing.registerRoute(
    /^https:\/\/.*\.supabase\.co\/.*/i,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
    })
  );
} else {
  console.log('[SW] Workbox failed to load');
}

// =============================================
// PUSH NOTIFICATION HANDLERS
// =============================================

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = { title: 'ZIVO', body: event.data?.text() || 'You have a new notification' };
  }

  const options = {
    body: data.body || '',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ZIVO', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let urlToOpen = '/';

  switch (data?.type) {
    case 'price_drop':
      urlToOpen = data.url || '/flights';
      break;
    case 'booking_update':
      urlToOpen = `/trips/${data.booking_id}`;
      break;
    case 'support_reply':
      urlToOpen = `/support/tickets/${data.ticket_id}`;
      break;
    default:
      urlToOpen = data?.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', () => {});

// =============================================
// SERVICE WORKER LIFECYCLE
// =============================================

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const keepCaches = [
        'google-fonts-stylesheets',
        'google-fonts-webfonts',
        'images-cache',
        'api-cache',
        'local-images',
        'unsplash-images',
      ];

      if (workbox?.core?.cacheNames?.precache) {
        keepCaches.push(workbox.core.cacheNames.precache);
      }

      return Promise.all(
        cacheNames
          .filter((name) => !keepCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
