

# Fix: Google Maps Provider Blocking Entire App (White Screen)

## Root Cause

The `GoogleMapProviderInner` component in `GoogleMapProvider.tsx` has a fatal architectural flaw: when the Google Maps JavaScript API is loading or fails to load, it **replaces all children with a spinner or error message**. Since this provider wraps the **entire application** (line 646 in `App.tsx`), any Maps API issue causes a white/blank screen for every page -- including non-map pages like the homepage, login, flights, and eats.

```text
Current behavior:

GoogleMapProvider wraps entire app
  --> GoogleMapProviderInner
    --> if loading: shows ONLY a spinner (no children rendered)
    --> if error: shows ONLY "Failed to load Google Maps" (no children rendered)
    --> if loaded: renders children normally

Result: Maps API slow/failing = entire app blocked
```

## The Fix

Change `GoogleMapProviderInner` to **always render children** and pass the loading/error state through React context instead of blocking the render tree. Map components already check `isLoaded` via `useGoogleMaps()` and show their own fallback.

### Changes to `src/components/maps/GoogleMapProvider.tsx`

Remove the early-return blocks in `GoogleMapProviderInner` that replace children with loading/error UI. Instead, always render children inside the context provider and let individual map components handle the not-loaded state (which `GoogleMap.tsx` already does at line 211).

Before (broken):
```
function GoogleMapProviderInner({ children, apiKey }) {
  const { isLoaded, loadError } = useJsApiLoader(...);

  if (loadError) {
    return <div>Failed to load Google Maps</div>;  // BLOCKS ENTIRE APP
  }
  if (!isLoaded) {
    return <div><Loader2 /></div>;  // BLOCKS ENTIRE APP
  }

  return <Provider value={{ isLoaded, loadError }}>{children}</Provider>;
}
```

After (fixed):
```
function GoogleMapProviderInner({ children, apiKey }) {
  const { isLoaded, loadError } = useJsApiLoader(...);

  // Always render children -- map components check isLoaded themselves
  return (
    <Provider value={{ isLoaded, loadError }}>
      {children}
    </Provider>
  );
}
```

This is a ~10-line change in a single file. The `GoogleMap.tsx` component already has the proper guard at line 211 (`if (!isLoaded) return spinner`), so no other files need changes.

After this fix, publish the app to push it live.

