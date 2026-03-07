

# Create RideOptionsSheet Component

## What

Create `src/components/rides/RideOptionsSheet.tsx` — a standalone, Uber-inspired ride options sheet matching the reference screenshot. The user pasted partial code that was cut off mid-render. I will complete it with the full component.

## Design (from reference image)

- **Header**: Back arrow + "Choose a ride" title + green "15% promo applied" badge
- **Category tabs**: Popular / Premium / More — pill-style, active tab has dark fill
- **Vehicle rows**: Car image (left) → name + passenger count + ETA + description (center) → price with optional strikethrough old price (right). Selected row gets green checkmark.
- **Bottom**: Payment method row (Visa •••• 4242) + "Confirm [vehicle] · $XX.XX" button
- Clean white background, no map visible behind

## Structure

The component will be self-contained with:
- Internal state for `activeCategory` and `selectedRideId`
- Vehicle data array with all 8 ride types across 3 categories
- SVG vehicle images from `public/vehicles/*.svg` (economy, xl, share, comfort, black)
- `formatPrice` helper
- Props: `onConfirm(rideId)`, `onBack()`, optional `promoPercent`

## Key details

- Vehicle images: Use existing SVGs (`economy-car.svg`, `xl-car.svg`, `share-car.svg`, `comfort-car.svg`, `black-car.svg`)
- Discount display: Show green dot + discounted price with strikethrough original (like ZIVO Share in reference)
- Selected state: Green checkmark circle on right side
- Tabs: Rounded pills, dark fill when active
- Confirm button: Full-width, dark, rounded, shows selected vehicle name + price

## Files

1. **Create** `src/components/rides/RideOptionsSheet.tsx` — complete component from the user's partial code, finished with proper JSX for tabs, vehicle list, payment row, and confirm button.

No integration into `RideBookingHome.tsx` yet — this is the standalone component file the user requested.

