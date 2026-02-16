

# Fix Broken Car Illustrations with User-Provided Images

## Problem
The current car illustration PNGs (`fleet-economy.png`, `ride-premium.png`, `ride-xl.png`, etc.) are broken/corrupted, showing a "no image" icon as seen in your screenshot. These files were AI-generated and are not valid images.

## Solution
Replace all broken PNG assets with the 3 high-quality car illustrations you provided, and create inline SVG fallbacks for the remaining categories.

## Steps

### 1. Copy Your Uploaded Images into the Project
Use your 3 uploaded illustrations as the primary car assets:

| Your Upload | Saved As | Used For |
|-------------|----------|----------|
| Economy hatchback (green circle) | `src/assets/fleet-economy.png` | Economy, Compact, Standard, Wait & Save, Priority rides |
| Premium sedan (gold circle) | `src/assets/ride-premium.png` | Premium, Comfort rides |
| XL SUV (purple/pink bg) | `src/assets/ride-xl.png` | Elite, XL rides |

### 2. Map Remaining Fleet Categories
Since we have 3 distinct illustrations but 5 fleet categories, map them logically:

| Fleet Category | Image Source |
|----------------|-------------|
| Economy | Economy hatchback (green) |
| Compact | Economy hatchback (green) |
| SUV | XL SUV (purple) |
| Luxury | Premium sedan (gold) |
| Electric | Economy hatchback (green) |

Copy the appropriate uploaded file to each asset path: `fleet-compact.png`, `fleet-suv.png`, `fleet-luxury.png`, `fleet-electric.png`.

### 3. Components Fixed (no code changes needed)
Since all components already import from these asset paths, replacing the files fixes everything:
- **ZivoRideRow.tsx** -- ride selection thumbnails
- **CarFleetShowcase.tsx** -- fleet category grid
- **RideCard.tsx** via **rideData.ts** -- ride option cards
- **CarElectricVehicles.tsx** -- EV showcase section

### 4. Restore SVG Fallbacks in ZivoRideRow
Keep the inline SVG car functions (`EconomyCarSvg`, `PremiumCarSvg`, `EliteCarSvg`) as fallbacks in case PNG loading fails, by adding an `onError` handler on the `<img>` tag that swaps to the SVG.

## Files Changed

| File | Change |
|------|--------|
| `src/assets/fleet-economy.png` | Replace with uploaded economy hatchback |
| `src/assets/fleet-compact.png` | Replace with uploaded economy hatchback |
| `src/assets/fleet-suv.png` | Replace with uploaded XL SUV |
| `src/assets/fleet-luxury.png` | Replace with uploaded premium sedan |
| `src/assets/fleet-electric.png` | Replace with uploaded economy hatchback |
| `src/assets/ride-premium.png` | Replace with uploaded premium sedan |
| `src/assets/ride-xl.png` | Replace with uploaded XL SUV |

No code logic changes -- purely asset file replacements using the real images you provided.
