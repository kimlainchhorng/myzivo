

# Generate Unique Car Illustrations for Each Fleet Category

## Current Problem
Right now there are only 3 unique car images being reused across 7+ asset files:
- The same green hatchback is used for Economy, Compact, Electric, Standard, Wait & Save, and Priority rides
- The same gold sedan is used for Premium, Comfort, and Luxury
- The same purple SUV is used for Elite, XL, and SUV

This makes it hard for users to distinguish between ride types visually.

## Solution
Use AI image generation (Gemini Flash Image model) to create 5 new unique car illustrations that match the existing ZIVO style (clean vehicle on a subtle colored circular background). Combined with the 3 existing images, each ride type and fleet category will have its own distinct visual.

## New Images to Generate

| Asset File | Vehicle Type | Style Description |
|------------|-------------|-------------------|
| `fleet-compact.png` | Compact sedan (e.g., VW Golf shape) | Clean white/silver compact car on a soft blue circular background |
| `fleet-electric.png` | Modern EV hatchback (e.g., Nissan Leaf shape) | Sleek white/silver EV with green leaf accent on a teal circular background |
| `fleet-luxury.png` | Executive sedan (e.g., Mercedes E-Class shape) | Elegant dark sedan on a warm gold circular background |
| `fleet-suv.png` | Crossover SUV (e.g., Toyota RAV4 shape) | Rugged white/silver SUV on an orange circular background |
| `ride-green.png` (new) | Eco/hybrid compact (e.g., Toyota Prius shape) | White hybrid car with green eco badge on a mint green background |

## Existing Images (Keep As-Is)
- `fleet-economy.png` -- green hatchback (for Wait & Save + Standard)
- `ride-premium.png` -- gold sedan (for Comfort + Premium rides)
- `ride-xl.png` -- purple SUV (for Elite + XL rides)

## Updated Ride-to-Image Mapping

After generation, update `rideData.ts` to assign unique images:

| Ride Type | Image Asset |
|-----------|------------|
| Wait & Save | `fleet-economy.png` (existing green hatchback) |
| Standard | `fleet-compact.png` (new compact sedan) |
| Green | `ride-green.png` (new eco/hybrid) |
| Priority | `fleet-compact.png` (new compact sedan) |
| Comfort | `ride-premium.png` (existing gold sedan) |
| Premium | `fleet-luxury.png` (new executive sedan) |
| Elite | `fleet-luxury.png` (new executive sedan) |
| XL | `ride-xl.png` (existing purple SUV) |

## Updated Fleet Showcase Mapping

| Fleet Category | Image Asset |
|---------------|------------|
| Economy | `fleet-economy.png` (existing) |
| Compact | `fleet-compact.png` (new) |
| SUV | `fleet-suv.png` (new) |
| Luxury | `fleet-luxury.png` (new) |
| Electric | `fleet-electric.png` (new) |

## Files Changed

| File | Change |
|------|--------|
| `src/assets/fleet-compact.png` | Replace with AI-generated compact sedan |
| `src/assets/fleet-electric.png` | Replace with AI-generated EV |
| `src/assets/fleet-luxury.png` | Replace with AI-generated executive sedan |
| `src/assets/fleet-suv.png` | Replace with AI-generated crossover SUV |
| `src/assets/ride-green.png` | New file -- eco/hybrid illustration |
| `src/components/ride/rideData.ts` | Update image imports to use new unique assets per ride type |
| `src/components/ride/ZivoRideRow.tsx` | Add `ride-green.png` import and map "green" ride type to its own illustration |

## Generation Style Prompt
Each image will be generated with a consistent prompt style to match the existing ZIVO aesthetic: "Clean side-profile illustration of a [vehicle type], white/silver body, on a soft [color] circular gradient background, minimal flat design, no text, high quality product shot style, transparent or clean background"
