
# Add Google Cloud Map ID Support

## Overview
This update adds support for Google Cloud Map ID styling, which allows you to use custom map styles created in the Google Cloud Console. It also adds the `clickableIcons: false` option to prevent POI clicks from interfering with the ride experience.

---

## Changes

### 1. Add Map ID Prop to GoogleMap Component

**File: `src/components/maps/GoogleMap.tsx`**

Add a new `mapId` prop that accepts either:
- A string value passed directly
- Falls back to `VITE_GOOGLE_MAP_ID` environment variable

```typescript
export interface GoogleMapProps {
  // ... existing props
  mapId?: string;  // Google Cloud Map ID for custom styling
}
```

### 2. Update Map Initialization

**File: `src/components/maps/GoogleMap.tsx`** (lines 108-122)

Update the Map constructor to use `mapId` when available:

```typescript
mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
  center,
  zoom,
  mapId: mapId || import.meta.env.VITE_GOOGLE_MAP_ID,  // Cloud-based styling
  styles: !mapId ? (darkMode ? darkMapStyles : undefined) : undefined,  // Fallback to local styles
  disableDefaultUI: !showControls,
  clickableIcons: false,  // Prevent POI popups
  // ... rest of options
});
```

**Note:** When `mapId` is set, the `styles` property is ignored by Google Maps API (cloud styling takes precedence).

### 3. Add Environment Variable

**File: `.env`**

Add the Map ID variable (you'll need to create a Map ID in Google Cloud Console):

```env
VITE_GOOGLE_MAP_ID=""
```

---

## How Map ID Works

| Scenario | Styling Used |
|----------|-------------|
| `mapId` prop provided | Cloud Map ID styling |
| `VITE_GOOGLE_MAP_ID` set | Cloud Map ID styling |
| Neither set + `darkMode=true` | Local dark mode styles |
| Neither set + `darkMode=false` | Default Google Maps style |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/maps/GoogleMap.tsx` | Add `mapId` prop, add `clickableIcons: false`, update initialization logic |
| `.env` | Add `VITE_GOOGLE_MAP_ID` placeholder |

---

## Setup Instructions

After implementation, to use cloud styling:

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. Create a new Map ID with your desired style
3. Copy the Map ID and add it to `.env` as `VITE_GOOGLE_MAP_ID="your-map-id"`

---

## Benefits

- **Cloud-based styling**: Edit map appearance in Google Cloud Console without code changes
- **No POI interference**: `clickableIcons: false` prevents accidental business info popups
- **Flexible fallback**: Works with or without Map ID configured
