
# Add Smooth Loading Transitions for Car Illustrations

## Overview
Add a reusable image loading hook and apply fade-in skeleton transitions to all car/vehicle illustrations across three components: `ZivoRideRow`, `RideCard`, and `CarFleetShowcase`. Images will show a pulsing skeleton placeholder, then smoothly fade in once loaded.

## Approach
Create a small custom hook (`useImageLoaded`) that tracks the `onLoad` event of an `<img>` tag, then apply it consistently across all vehicle image locations.

## Changes

### 1. New Hook: `src/hooks/useImageLoaded.ts`
A tiny hook returning `{ loaded, onLoad, ref }`:
- `loaded` starts as `false`, flips to `true` on the image's `onLoad` event
- Resets when the `src` changes
- Used to toggle between skeleton placeholder and the actual image with a CSS fade transition

### 2. Update `src/components/ride/ZivoRideRow.tsx` (ZivoCarThumbnail)
**Lines ~264-278** -- the circular thumbnail in ride rows:
- Import and use `useImageLoaded`
- Show an `animate-pulse` circular skeleton when `!loaded`
- Apply `opacity-0 -> opacity-100` transition on the `<img>` with `transition-opacity duration-300`

### 3. Update `src/components/ride/RideCard.tsx` (Vehicle Image)
**Lines ~58-63** -- the card image area:
- Import and use `useImageLoaded`
- Show a pulsing skeleton rectangle behind the image
- Fade the `<img>` in once loaded using `transition-opacity duration-300`

### 4. Update `src/components/car/CarFleetShowcase.tsx` (Fleet Grid)
**Lines ~96-102** -- the fleet category thumbnail:
- Import and use `useImageLoaded`
- Show a circular skeleton placeholder while loading
- Fade the image in smoothly

### 5. Update `src/components/car-search/CarInventoryCard.tsx` (Search Results)
**Lines ~66-77** -- the vehicle search result image:
- Import and use `useImageLoaded`
- Show a pulsing skeleton behind the image
- Fade in on load; keeps existing hover scale effect

## Technical Detail

The hook:
```typescript
// src/hooks/useImageLoaded.ts
import { useState, useCallback, useEffect } from "react";

export function useImageLoaded(src?: string) {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => { setLoaded(false); }, [src]);
  
  const onLoad = useCallback(() => setLoaded(true), []);
  
  return { loaded, onLoad };
}
```

Image pattern applied everywhere:
```
<div className="relative ...">
  {!loaded && <div className="absolute inset-0 animate-pulse bg-muted/50 rounded-..." />}
  <img
    src={imageSrc}
    onLoad={onLoad}
    className={cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
  />
</div>
```

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useImageLoaded.ts` | New -- tiny loading state hook |
| `src/components/ride/ZivoRideRow.tsx` | Add skeleton + fade to ZivoCarThumbnail |
| `src/components/ride/RideCard.tsx` | Add skeleton + fade to vehicle image |
| `src/components/car/CarFleetShowcase.tsx` | Add skeleton + fade to fleet thumbnails |
| `src/components/car-search/CarInventoryCard.tsx` | Add skeleton + fade to search result images |
