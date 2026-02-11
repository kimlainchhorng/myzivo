

## Fix: Maps Authentication Blocking Entire App

### Problem
`GoogleMapProvider` wraps the entire application in `App.tsx`. When a user is not logged in, it shows "Authentication required for maps" instead of rendering the page content. This blocks the homepage, login page, and all public routes.

### Solution
Change `GoogleMapProvider` so that when the API key is unavailable (no auth, no env key, any error), it still renders children normally -- just with `isLoaded: false` in the context. Map-dependent components (like `DeliveryMap`, `DispatchLiveMap`, `Rides`) already check `isLoaded` from `useGoogleMaps()` and handle the unloaded state gracefully.

### Changes

**File: `src/components/maps/GoogleMapProvider.tsx`**

- Remove the error/fallback UI that blocks children from rendering
- When no API key is available (unauthenticated, missing config, error), render children inside the context with `isLoaded: false` instead of showing an error div
- Keep the loading spinner only during the brief fetch attempt
- Keep the `GoogleMapProviderInner` behavior unchanged (it handles the actual Google Maps script loading)

This is a single-file change. No other files need modification since all map consumers already handle `isLoaded: false`.

