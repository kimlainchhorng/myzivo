

## Fix: Blank Flights and Delivery Cards (Third Attempt)

### Root Cause Identified

The working cards (Ride, Eats, Hotels, Rentals) all use **external Unsplash URLs** as their image source. The broken cards (Flights, Delivery) use **local imported `.jpg` files** (`hero-flights.jpg` and `hero-move.jpg`) that appear to be corrupted or empty -- they import without error but render as blank.

Previous attempts replaced one broken local file with another local file, which didn't fix it because the underlying files may be damaged.

### Fix Strategy

Switch Flights and Delivery to use **external Unsplash URLs** (the same reliable pattern as the 4 working cards), eliminating the dependency on potentially broken local assets.

### Changes

**File: `src/pages/app/AppHome.tsx`**

1. Remove the two broken imports:
   - `import flightsHeroImg from "@/assets/hero-flights.jpg"`
   - `import heroMoveImg from "@/assets/hero-move.jpg"`

2. Update the `assets` object to use Unsplash URLs:
   - `flights`: Use an airplane/travel Unsplash image URL
   - `move`: Use a delivery/package Unsplash image URL

This matches the exact pattern used by the 4 cards that are already working correctly.
