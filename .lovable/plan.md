
# Fix: Remove Nested GoogleMapProvider from RidesMapBackground

## Problem

The Google Maps loader is being initialized twice with **different API keys**:

| Source | Key Used |
|--------|----------|
| Global `App.tsx` | `VITE_GOOGLE_MAPS_API_KEY` or edge function (`GOOGLE_MAPS_API_KEY`) |
| Nested `RidesMapBackground.tsx` | Tries to initialize again with a different key |

The error message shows two different API keys:
- `AIzaSyD3TbqysJh0bBhlRof_2OPyiQeAVuxJRoc`
- `AIzaSyCopQIlsMaRJhK6evC6G5XUMgrRvQFioAE`

This happens because `RidesMapBackground.tsx` still has its own `<GoogleMapProvider>` wrapper, which conflicts with the global provider in `App.tsx`.

## Solution

Remove the `GoogleMapProvider` wrapper from `RidesMapBackground.tsx` - just like we already did for:
- `DriverMapView.tsx`
- `TripMapView.tsx`
- `Rides.tsx`

The global provider in `App.tsx` already wraps the entire app, so all map components should use that single instance.

## File Change

**`src/components/ride/RidesMapBackground.tsx`**

```text
Before:
├─ import { GoogleMapProvider }
├─ RidesMapBackgroundInner component
└─ RidesMapBackground wraps Inner in GoogleMapProvider

After:
├─ Remove GoogleMapProvider import
├─ Rename RidesMapBackgroundInner → RidesMapBackground
└─ Export directly (no wrapper)
```

## Code Changes

```typescript
// Remove this import:
import { GoogleMapProvider } from "@/components/maps/GoogleMapProvider";

// Remove the wrapper function (lines 53-59):
const RidesMapBackground = (props: RidesMapBackgroundProps) => {
  return (
    <GoogleMapProvider>
      <RidesMapBackgroundInner {...props} />
    </GoogleMapProvider>
  );
};

// Rename RidesMapBackgroundInner to RidesMapBackground
```

## Result

After this fix:
- Only one `GoogleMapProvider` exists (in `App.tsx`)
- All map components use the same API key instance
- No more "Loader must not be called again with different options" error
