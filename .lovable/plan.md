

# Update Car Illustrations to Premium Style

## What Changes

Replace the current basic green car icons with premium, detailed car illustrations matching the reference style: **white/silver car bodies with ZIVO brand-colored accents** (emerald green instead of purple, matching the ZIVO brand).

## Components to Update

### 1. ZivoRideRow SVG Car Illustrations
The inline SVG cars in `ZivoRideRow.tsx` will be completely redrawn with the reference style:

- **EconomyCarSvg**: Compact sedan silhouette -- white/silver body, emerald-tinted windows, clean lines
- **PremiumCarSvg**: Sleek sport sedan -- white body with gold window tint, subtle gold accents, sportier proportions  
- **EliteCarSvg**: Long luxury sedan -- white body with purple/magenta window tint, chrome details, sparkle effects (matching the reference's sparkle icon for premium tiers)

Each car will feature:
- White/light silver body panels with subtle shading
- Colored window tints per tier (emerald / gold / purple)
- Dark wheels with realistic spoke details
- Proper proportions to differentiate vehicle types

### 2. Fleet Showcase PNG Assets
Regenerate the 5 fleet category images (`fleet-economy.png`, `fleet-compact.png`, `fleet-suv.png`, `fleet-luxury.png`, `fleet-electric.png`) used in `CarFleetShowcase.tsx` and `rideData.ts` with matching white-body style illustrations on soft circular backgrounds.

### 3. Ride Card PNG Assets
Update `ride-premium.png` and `ride-xl.png` to match the new style (white body cars with appropriate accents).

## Files Modified

| File | Change |
|------|--------|
| `src/components/ride/ZivoRideRow.tsx` | Redraw all 3 SVG car functions with white-body + colored-accent style |
| `src/assets/fleet-economy.png` | Regenerate -- white compact car, emerald accent |
| `src/assets/fleet-compact.png` | Regenerate -- white compact sedan |
| `src/assets/fleet-suv.png` | Regenerate -- white SUV silhouette |
| `src/assets/fleet-luxury.png` | Regenerate -- white luxury sedan |
| `src/assets/fleet-electric.png` | Regenerate -- white EV with green leaf accent |
| `src/assets/ride-premium.png` | Regenerate -- white sport sedan |
| `src/assets/ride-xl.png` | Regenerate -- white large SUV |

## Visual Style Summary

```text
Current:  Green body cars on green circles (monotone, hard to distinguish)
Updated:  White/silver body cars with tier-specific colored windows/accents
          Economy  = white + emerald windows
          Premium  = white + gold windows  
          Elite    = white + purple windows + sparkle effects
```

No logic, routing, or data changes -- purely visual asset and SVG updates.

