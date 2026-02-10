

## Fix Blank Flights and Delivery Cards on Mobile Home

### Problem
The **Flights** and **Delivery** service cards on the mobile app home screen (`/app`) show blank/white backgrounds -- the images fail to load. This is visible in the screenshot where Row 2 of the service grid is empty.

### Root Cause
- **Flights card**: Uses `import flightsHeroImg from "@/assets/flights-hero.png"` -- this `.png` file may be corrupted, too large, or not rendering properly
- **Delivery card**: Uses an external Unsplash URL (`photo-1580674285054-bed31e145f59`) which can be blocked or slow in the preview environment

### Fix
Replace both problematic image sources with reliable local assets that already exist in `src/assets/`:
- **Flights**: Use `hero-flights.jpg` or `service-flights.jpg` (both confirmed present)
- **Delivery**: Use `hero-move.jpg` or `service-move.jpg` (both confirmed present)

This eliminates the dependency on a potentially broken `.png` file and external Unsplash URLs for critical above-the-fold content.

### Changes

**File: `src/pages/app/AppHome.tsx`**
1. Replace the `flights-hero.png` import with `hero-flights.jpg` import
2. Update the `assets.move` URL to use the local `hero-move.jpg` asset instead of the Unsplash URL
3. Both replacement images are already confirmed to exist in `src/assets/`

### Technical Detail
- Line 18: Change `import flightsHeroImg from "@/assets/flights-hero.png"` to `import flightsHeroImg from "@/assets/hero-flights.jpg"`
- Line 29: Change the `move` URL to use `import heroMoveImg from "@/assets/hero-move.jpg"` and reference it in the assets object
