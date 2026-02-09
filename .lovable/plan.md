
# Fix: PWA Not Auto-Updating on Mobile (Requires Reinstall)

## Root Cause

There are **two conflicting problems** preventing your installed PWA from updating on phones:

### 1. Service Worker Navigation Not Handled
The service worker uses `CacheFirst` for assets but has **no navigation route handler**. When the app is opened from the home screen, the browser serves the old cached `index.html` forever. Without a network-first strategy for navigation (HTML pages), the new service worker installs in the background but the user never sees the new content.

### 2. Aggressive CacheFirst Without Versioned Cleanup
All assets (JS, CSS, images) use `CacheFirst`, meaning once cached they are never re-fetched from the network. The activate event's cache cleanup only targets "unknown" caches but keeps all workbox-managed precache entries. Old precached files persist indefinitely.

### 3. Missing `clients.claim()` on First Activation
While `skipWaiting()` runs on install, the `clients.claim()` in the activate handler is buried after cache cleanup. If cleanup takes time, the new service worker may not control the page quickly enough.

## Fix (3 Changes)

### Change 1: Add Navigation Route to `public/sw.js`
Add a `NetworkFirst` strategy for navigation requests (HTML pages) so the app always tries to fetch the latest `index.html` from the network first, falling back to cache only when offline.

```javascript
// After the existing routing rules, add:
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'navigation-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
```

### Change 2: Add API/Supabase NetworkFirst Route in `public/sw.js`
Ensure API calls are never stale-cached:

```javascript
workbox.routing.registerRoute(
  /^https:\/\/.*\.supabase\.co\/.*/i,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
  })
);
```

### Change 3: Force Cache Bust on SW Activation in `public/sw.js`
Update the activate handler to also purge old precache entries so stale JS/CSS bundles are replaced:

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Keep only current workbox precache revision; delete everything else stale
            const keepCaches = [
              'google-fonts-stylesheets',
              'google-fonts-webfonts',
              'navigation-cache',
              'api-cache',
            ];
            return !keepCaches.some((keep) => name === keep);
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});
```

### Change 4: Add Version Header to `index.html`
Add a cache-control meta tag to discourage browser HTTP cache from holding stale HTML:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
```

## How It Works After the Fix

1. User opens PWA from home screen
2. Service worker fetches fresh `index.html` from network (NetworkFirst, 3s timeout)
3. New `index.html` references new JS/CSS bundles with new hashes
4. If a new service worker is detected, `skipWaiting()` + `clients.claim()` activate it immediately
5. The `PWAUpdatePrompt` toast shows, and auto-refreshes after 10 seconds
6. Old caches are purged on activation so no stale assets linger

Users will no longer need to delete and reinstall -- the app will update automatically within seconds of opening it.
