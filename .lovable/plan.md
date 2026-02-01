

# Consistent Photo Style Implementation for ZIVO

## Overview

This plan replaces all existing images with a cohesive **high-quality travel photography** style using a consistent **cool/neutral tone with slight blue tint**. All photos will be placed only in correct locations (heroes, cards, tiles) with proper aspect ratios and optimization.

---

## Style Specifications

### Visual Consistency Rules
- **Color tone**: Cool/neutral with subtle blue tint (no warm/saturated styles)
- **Lighting**: Clean, soft, professional lighting
- **Subject focus**: Travel products and scenes (minimal faces)
- **Overlays**: Soft dark gradient on all hero images for text readability
- **No mixing**: Pure photography only (no illustrations)

### Aspect Ratios
| Element Type | Aspect Ratio | Typical Size |
|--------------|--------------|--------------|
| Hero images | 16:9 | 1920x1080 |
| Service cards | 4:3 | 600x450 |
| Destination tiles | 1:1 | 400x400 |
| Restaurant thumbnails | 1:1 | 300x300 |
| Car category tiles | 4:3 | 600x450 |

---

## Page-by-Page Implementation

### HOME PAGE (/)

**Hero Image (16:9)** - Generate new image:
- Prompt: "modern airport terminal wide angle, clean, minimal, cool tone, blue tint, professional travel photography, no people in focus"
- Replace: `src/assets/hero-homepage.jpg`

**6 Service Cards (4:3)** - Generate dedicated card images:

| Service | Current | New Prompt |
|---------|---------|------------|
| Flights | Uses hero-flights.jpg | "airplane taking off runway, minimal, cool tone, clean sky, professional" |
| Hotels | Uses hero-hotels.jpg | "modern hotel lobby interior, premium, clean lighting, cool neutral" |
| Cars | Uses hero-cars.jpg | "rental car parked near airport terminal, clean, modern, cool blue" |
| Rides | Uses hero-rides.jpg | "car pickup in city street, modern, evening twilight, cool tone" |
| Eats | Uses hero-eats.jpg | "food delivery bag on modern car hood, clean, professional" |
| Extras | Uses hero-homepage.jpg | "travel essentials flat lay passport luggage phone, clean white background" |

**Files to create:**
- `src/assets/service-flights.jpg`
- `src/assets/service-hotels.jpg`
- `src/assets/service-cars.jpg`
- `src/assets/service-rides.jpg`
- `src/assets/service-eats.jpg`
- `src/assets/service-extras.jpg`

**Files to modify:**
- `src/components/home/ServicesGrid.tsx` - Update to use dedicated service card images

---

### FLIGHTS PAGE (/flights)

**Hero Image (16:9)** - Generate new image:
- Prompt: "airplane wing sunrise clouds wide angle, premium, calm, cool blue tones, professional travel photography"
- Replace: `src/assets/hero-flights.jpg`

**Changes to `src/components/shared/ImageHero.tsx`:**
- Verify overlay gradient is `from-slate-950/90 via-blue-950/80 to-slate-950/70` ✓ (already correct)
- Ensure alt text follows pattern ✓ (already implemented)

---

### HOTELS PAGE (/hotels)

**Hero Image (16:9)** - Generate new image:
- Prompt: "luxury hotel lobby modern design wide angle, warm-neutral tones, premium, clean lighting, professional"
- Replace: `src/assets/hero-hotels.jpg`

**Destination Tiles (1:1)** - Update aspect ratio from 4:3 to 1:1:

**Changes to `src/components/shared/DestinationCardsGrid.tsx`:**
- Line 282: Change `aspect-[4/3]` to `aspect-square`
- Update Unsplash URLs to use `w=400&h=400&fit=crop`

**New destination image URLs (1:1, cool/neutral tone):**
```text
NYC: https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=400&fit=crop&q=80
LA: https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=400&fit=crop&q=80
Miami: https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400&h=400&fit=crop&q=80
Las Vegas: https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=400&h=400&fit=crop&q=80
Paris: https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400&h=400&fit=crop&q=80
Tokyo: https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=400&fit=crop&q=80
London: https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=400&h=400&fit=crop&q=80
Dubai: https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&h=400&fit=crop&q=80
```

---

### CAR RENTAL PAGE (/rent-car)

**Hero Image (16:9)** - Generate new image:
- Prompt: "modern car at airport terminal wide angle, clean, cool neutral tones, professional automotive photography"
- Replace: `src/assets/hero-cars.jpg`

**Car Category Tiles** - Update aspect ratio and images in `src/config/photos.ts`:

| Category | New Unsplash URL (4:3, cool tone) |
|----------|-----------------------------------|
| Economy | Compact city car, clean, urban background |
| Compact | Small sedan, urban street, clean |
| Midsize | Standard sedan, professional, clean |
| SUV | SUV near mountains, clean, adventure |
| Luxury | Luxury sedan, clean, modern, premium |
| Van | Van/minivan, family travel, clean |

**Changes to `src/config/photos.ts`:**
- Lines 86-129: Update all car category URLs with consistent cool-tone Unsplash images

**Add Electric category:**
```typescript
electric: {
  src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop&q=80",
  alt: "Electric car at charging station - Modern EV rental",
  label: "Electric",
  passengers: 5,
  bags: 2,
},
```

**Changes to `src/components/car/CarCategoryTiles.tsx`:**
- Update `CarCategory` type to include "electric"
- Add electric to categoryOrder array

---

### RIDES PAGE (/rides)

**Hero Image (16:9)** - Generate new image:
- Prompt: "city rideshare pickup at curb modern evening clean, cool blue tones, urban, no driver visible, professional"
- Replace: `src/assets/hero-rides.jpg`

---

### EATS PAGE (/eats)

**Hero Image (16:9)** - Generate new image:
- Prompt: "food delivery package modern clean, appetizing meal, cool neutral background, professional food photography"
- Replace: `src/assets/hero-eats.jpg`

**Restaurant Thumbnails (1:1)** - Create consistent food images:

Currently using emojis in `src/pages/app/AppEats.tsx`. Update to use proper photos:

**Create new file: `src/config/restaurantPhotos.ts`**
```typescript
export const restaurantPhotos = {
  burger: { src: "https://images.unsplash.com/...", alt: "Gourmet burger - American cuisine" },
  sushi: { src: "https://images.unsplash.com/...", alt: "Fresh sushi platter - Japanese cuisine" },
  pizza: { src: "https://images.unsplash.com/...", alt: "Artisan pizza - Italian cuisine" },
  taco: { src: "https://images.unsplash.com/...", alt: "Fresh tacos - Mexican cuisine" },
  noodles: { src: "https://images.unsplash.com/...", alt: "Thai noodles - Asian cuisine" },
  salad: { src: "https://images.unsplash.com/...", alt: "Fresh salad bowl - Healthy cuisine" },
};
```

**Changes to `src/pages/app/AppEats.tsx`:**
- Lines 37-43: Add photo URLs to restaurant data
- Lines 296-298: Replace emoji div with proper 1:1 image

---

### EXTRAS PAGE (/extras)

**Hero Image (16:9)** - Current hero-extras.jpg is good but verify consistency:
- If needed, regenerate with: "travel essentials luggage passport phone flat lay clean, cool neutral, minimal, white/gray background"

**Category Cards** - Keep using Lucide icons (no random images needed)
- The current implementation with icons is clean and consistent

---

## Centralized Photo Configuration Updates

**File: `src/config/photos.ts`**

Update all photo definitions:

```text
Changes:
1. Add heroHomepage to imports and heroPhotos
2. Update all Unsplash URLs with consistent parameters (?w=WIDTH&h=HEIGHT&fit=crop&q=80)
3. Add electric car category
4. Update destinationPhotos to use 1:1 aspect ratio URLs
5. Add restaurantPhotos export
6. Update aspectRatios.destinationTile to "1:1"
```

---

## Asset Generation List

**Hero Images to Generate (1920x1080, <250KB):**
1. `hero-homepage.jpg` - Modern airport terminal, cool tone
2. `hero-flights.jpg` - Airplane wing sunrise, cool blue
3. `hero-hotels.jpg` - Luxury hotel lobby, warm-neutral
4. `hero-cars.jpg` - Car at airport, cool neutral
5. `hero-rides.jpg` - City pickup, evening, cool blue
6. `hero-eats.jpg` - Food delivery, clean, cool neutral

**Service Card Images to Generate (600x450, <100KB):**
7. `service-flights.jpg` - Airplane takeoff, cool tone
8. `service-hotels.jpg` - Hotel lobby interior
9. `service-cars.jpg` - Rental car at terminal
10. `service-rides.jpg` - City car pickup
11. `service-eats.jpg` - Food delivery bag
12. `service-extras.jpg` - Travel essentials flat lay

---

## Technical Implementation

### Overlay Gradients (Consistent Across All Heroes)
```css
/* Base overlay for all heroes */
.hero-overlay {
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.9),    /* slate-950/90 */
    rgba(30, 41, 59, 0.7),    /* slate-800/70 */
    rgba(15, 23, 42, 0.6)     /* slate-950/60 */
  );
}
```

### Performance Requirements
- All images: WebP format where possible
- Heroes: `loading="eager"`, max 250KB
- Cards/Tiles: `loading="lazy"`, max 100KB
- Responsive srcSet for different viewport sizes
- Alt text on every image for SEO

### Files to Modify Summary

| File | Changes |
|------|---------|
| `src/config/photos.ts` | Update all URLs, add electric category, add restaurant photos |
| `src/components/home/ServicesGrid.tsx` | Use dedicated service card images |
| `src/components/shared/DestinationCardsGrid.tsx` | Change to 1:1 aspect ratio |
| `src/components/car/CarCategoryTiles.tsx` | Add electric category |
| `src/pages/app/AppEats.tsx` | Replace emoji thumbnails with photos |

### Files to Create

| File | Purpose |
|------|---------|
| `src/config/restaurantPhotos.ts` | Restaurant thumbnail photo config |
| 6 hero assets | AI-generated hero images |
| 6 service card assets | AI-generated service thumbnails |

---

## Expected Outcomes

After implementation:
- All pages use consistent cool/neutral tone photography
- Heroes are 16:9 with proper dark overlays
- Service cards are 4:3 with lazy loading
- Destination tiles are 1:1 (square)
- Restaurant thumbnails are 1:1 (square)
- No illustrations or mixed styles anywhere
- No photos inside forms, modals, or navigation
- All images have descriptive alt text
- All images optimized for performance (<250KB)
- Mobile layout maintains clean professional appearance

