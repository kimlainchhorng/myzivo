

# Offline Mode — Implementation Plan

## Overview
Enable customers to browse restaurants, menus, and past orders when offline by caching Supabase API responses in localStorage, showing a non-intrusive offline banner, and automatically retrying failed actions when connectivity returns.

---

## Current State

| What Exists | Details |
|-------------|---------|
| `useNetworkStatus` hook | Full offline queue with retry (max 3), Capacitor + web support |
| PWA service worker (`sw.js`) | Workbox precaching, image/font/map caching already working |
| `Offline.tsx` page | Full-page fallback for uncached routes |
| TanStack Query | All data fetching uses `useQuery` with queryKeys |
| `AppLayout` | Global shell with `SystemStatusBanner` slot |

### What's Missing
- No Supabase API response caching (restaurants/menus/orders lost when offline)
- No offline banner in the main app layout
- `useNetworkStatus` hook exists but is not wired into any consumer components
- TanStack Query has no `gcTime`/`staleTime` or `placeholderData` from localStorage

---

## Implementation Plan

### 1) Create `useOfflineCache` Hook

**New file:** `src/hooks/useOfflineCache.ts`

A lightweight localStorage cache layer for TanStack Query data. Provides two functions:

- `cacheData(key, data)` -- Saves data + timestamp to localStorage under a `zivo-cache-` prefix
- `getCachedData<T>(key)` -- Retrieves cached data if it exists (returns `{ data, cachedAt }` or `null`)

Cache keys map to TanStack Query keys (e.g., `zivo-cache-restaurants`, `zivo-cache-menu-{id}`, `zivo-cache-my-orders`). Entries expire after 24 hours to avoid stale data buildup.

### 2) Add localStorage Caching to Key Queries

**File to modify:** `src/hooks/useEatsOrders.ts`

Update these three hooks to read/write the offline cache:

| Hook | Cache Key | What's Cached |
|------|-----------|---------------|
| `useRestaurants` | `restaurants-{city}` | Full restaurant list |
| `useMenuItems` | `menu-{restaurantId}` | Menu items for a restaurant |
| `useMyOrders` (or equivalent) | `my-orders` | User's recent orders |

For each hook:
- On successful fetch: save to localStorage via `cacheData()`
- Set `placeholderData` to the cached version so it renders instantly while refetching
- Set `staleTime: 5 * 60 * 1000` (5 min) to reduce unnecessary refetches
- Set `gcTime: 30 * 60 * 1000` (30 min) so TanStack Query keeps data in memory longer

This means: if offline, TanStack Query shows the last-fetched data from localStorage instead of a loading spinner or error state.

### 3) Create `OfflineBanner` Component

**New file:** `src/components/shared/OfflineBanner.tsx`

A slim, non-intrusive banner that appears at the top of the app when offline:

```text
+--------------------------------------------------------------+
|  [WifiOff icon]  You are offline. Some features may be limited.  |
+--------------------------------------------------------------+
```

Design:
- Amber/yellow background (consistent with `SystemStatusBanner` style)
- Fixed below the header, auto-hides when back online
- Uses `useNetworkStatus` to detect connectivity
- Animated entrance/exit with framer-motion

### 4) Wire `OfflineBanner` into `AppLayout`

**File to modify:** `src/components/app/AppLayout.tsx`

Add `OfflineBanner` right after `SystemStatusBanner`. It only renders when `isOnline === false`.

### 5) Add Action Queue Integration

**File to modify:** `src/components/app/AppLayout.tsx`

Import `useNetworkStatus` at the layout level so the offline queue (pending actions, auto-retry on reconnect) is active globally. This means:
- Toast notifications for "Back online" / "No internet" are app-wide
- Any component can use `useNetworkStatus().queueAction()` to queue writes

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useOfflineCache.ts` | localStorage read/write for Supabase query results |
| `src/components/shared/OfflineBanner.tsx` | Offline connectivity banner |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/hooks/useEatsOrders.ts` | Add cache read/write to `useRestaurants`, `useMenuItems`, and order queries |
| `src/components/app/AppLayout.tsx` | Add `OfflineBanner` and wire `useNetworkStatus` globally |

---

## Offline Behavior

```text
App loads online:
  -> Restaurants fetched from Supabase
  -> Saved to localStorage (zivo-cache-restaurants-{city})
  -> Menu items cached per restaurant visit
  -> Orders cached on orders page visit

Connection drops:
  -> OfflineBanner appears: "You are offline. Some features may be limited."
  -> Restaurant list renders from localStorage cache
  -> Menu pages render from localStorage cache
  -> Past orders render from localStorage cache
  -> New order attempts show toast: "Action queued, will sync when online"

Connection restored:
  -> OfflineBanner hides
  -> Toast: "Back online"
  -> Queued actions auto-retry (up to 3 attempts)
  -> TanStack Query refetches stale data in background
```

---

## Technical Details

### Cache Structure in localStorage
```text
Key: zivo-cache-restaurants-null       -> { data: [...], cachedAt: "2026-02-09T..." }
Key: zivo-cache-restaurants-Miami      -> { data: [...], cachedAt: "2026-02-09T..." }
Key: zivo-cache-menu-abc123            -> { data: [...], cachedAt: "2026-02-09T..." }
Key: zivo-cache-my-orders              -> { data: [...], cachedAt: "2026-02-09T..." }
```

### TanStack Query Config per Cached Hook
```text
staleTime: 5 minutes   (don't refetch if data is fresh)
gcTime: 30 minutes      (keep in memory for offline use)
placeholderData: cached localStorage data (instant render)
```

### Why localStorage Over IndexedDB
- Restaurant lists and menus are small (< 100KB typically)
- Simpler implementation, no extra dependencies
- Consistent with existing patterns (`googleMaps.ts` already caches to localStorage)
- The 24-hour expiry prevents storage bloat

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| First visit (no cache) | Normal loading state; no offline data available |
| Cache expired (> 24h) | Treated as no cache; loading state shown |
| Offline + no cache | Shows standard TanStack Query error/empty state |
| Very large restaurant list | Cache capped; oldest entries pruned if localStorage nears quota |
| User logs out | Cache persists (anonymous data); cleared on explicit cache clear |
| Multiple cities cached | Each city has its own cache key |

