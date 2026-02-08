/**
 * hiZIVO Service Worker
 * Handles push notifications and caching
 */

// Import Workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precache manifest (injected by vite-plugin-pwa)
self.__WB_MANIFEST;

// Configure Workbox
if (workbox) {
  console.log('[SW] Workbox loaded successfully');
  
  // Use workbox for precaching
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
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
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
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
      ],
    })
  );
  
  // Cache Mapbox tiles
  workbox.routing.registerRoute(
    /^https:\/\/api\.mapbox\.com\/.*/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'mapbox-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
      ],
    })
  );
} else {
  console.log('[SW] Workbox failed to load');
}

// =============================================
// PUSH NOTIFICATION HANDLERS
// =============================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {};
  
  try {
    data = event.data?.json() || {};
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
    data = { title: 'hiZIVO', body: event.data?.text() || 'You have a new notification' };
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
    self.registration.showNotification(data.title || 'hiZIVO', options)
  );
});

// Notification click handler - route to appropriate page
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const data = event.notification.data;
  let urlToOpen = '/';
  
  // Route based on notification type
  switch (data?.type) {
    case 'order_status':
      urlToOpen = `/eats/orders/${data.order_id}`;
      break;
    case 'chat_message':
      urlToOpen = `/support/tickets/${data.ticket_id}`;
      break;
    case 'driver_assigned':
      urlToOpen = `/eats/orders/${data.order_id}`;
      break;
    case 'price_drop':
      urlToOpen = data.url || '/flights';
      break;
    case 'booking_update':
      urlToOpen = `/trips/${data.booking_id}`;
      break;
    default:
      urlToOpen = data?.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // No matching window, try to find any app window and navigate
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }
      // No windows open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// =============================================
// SERVICE WORKER LIFECYCLE
// =============================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
