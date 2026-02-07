
# Uber-Style Ride Cards Update

## Overview
Transform the ride selection UI from the current grid with scenic photos to clean, Uber-style horizontal list cards featuring 3D rendered white car images.

---

## What Changes

### Visual Style
- **Current**: Grid cards with full scenic car photos and dark overlays
- **New**: Horizontal list cards with clean white/3D car images on transparent background (matching reference)

### Card Layout (Per Reference Image)
Each ride card will have:
1. **Left**: Clean 3D car image (white car, minimal/transparent background)
2. **Middle**: 
   - Ride name + passenger count icon (e.g., "Standard :4")
   - Pickup time and ETA (e.g., "4:51 PM · 11 min")
   - Description subtitle in gray
3. **Right**: Price in bold black (e.g., "$25.94")
4. **Selection indicator**: Border highlight for selected card

---

## Technical Implementation

### 1. Add Clean Car Image URLs
Update each ride option in `rideCategories` to use transparent/white background car images:

```text
Economy rides:
- Wait & Save: Simple white sedan
- Standard: White Toyota/Honda style
- Green: White electric vehicle (Tesla-like)
- Priority: Same as Standard

Premium rides:
- Extra Comfort: White luxury sedan
- ZIVO Black: Black/dark luxury sedan
- Black SUV: White/black SUV
- XXL: Large SUV/Van

Elite rides:
- ZIVO Lux: Luxury vehicle (Bentley-style)
- Executive Sprinter: White Mercedes Sprinter
- Secure Transit: Black SUV
- Pet Premium: White sedan
```

### 2. Update Card Component Structure

**Step "request" - Grid view updates:**
- Keep 2-column grid but change card internals
- White/light background for image area
- Horizontal layout within each card
- Remove dark gradient overlay

**Step "options" - List view updates:**
- Already horizontal, refine to match reference
- Add time display (e.g., "4:51 PM · 11 min")
- Passenger count next to name

### 3. Styling Changes

```text
Card container:
- bg-white (light mode look) or bg-zinc-900/80
- rounded-xl border border-zinc-200/20
- Horizontal flex layout

Image section:
- Fixed width: w-24 or w-28
- bg-zinc-100 or transparent
- object-contain (not cover) for clean car display

Text section:
- Dark text on cards (if light bg) or white (if dark bg)
- Maintain dark theme consistency with app
```

---

## Files to Modify

### `src/pages/Rides.tsx`
1. Update `rideCategories` image URLs to use clean car images
2. Modify grid card structure (lines ~664-714) for horizontal layout
3. Update list card structure (lines ~767-784)
4. Add ETA time calculation (current time + wait time)

---

## Image Strategy
Use high-quality PNG/WebP images of white cars on transparent or white backgrounds. Options:
- Find royalty-free 3D car renders
- Use existing car assets that have clean backgrounds
- Source from Unsplash/Pexels with transparent car images

The key visual change is moving from scenic photos to clean isolated car images, giving a professional rideshare app appearance.
