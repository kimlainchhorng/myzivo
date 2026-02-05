

# Immersive Premium Visual Assets Update (2026 Edition)

## Overview

Update ZIVO's image assets to follow the "Minimalist Luxury" design trend for 2026. This involves replacing or supplementing current imagery with high-contrast, moody visuals across three key sections: Hero backgrounds, Hotel city pages, and Flight route pages.

---

## Current State Analysis

The project has a well-organized image asset system:

| Category | Current Assets | Current Style |
|----------|---------------|---------------|
| **Hero Backgrounds** | 10 images (`hero-*.jpg`) | Mixed travel scenes |
| **Flight-Specific** | 7 images (`flight-*.jpg`, `cabin-*.jpg`) | Cabin interiors, clouds |
| **Destination Photos** | 24 city images (`dest-*.jpg`) | City skylines, landmarks |
| **Hotel Imagery** | 10 images (`hotel-*.jpg`) | Pool, resort, room interiors |

All assets are centralized through:
- `src/assets/index.ts` - ES6 exports
- `src/config/photos.ts` - Configuration with alt text and metadata

---

## Proposed Image Updates

### 1. Hero Background (Homepage)

| Current | Proposed Replacement |
|---------|---------------------|
| `hero-homepage.jpg` - Airport terminal | **Aerial airplane wing over lit-up city at night** |
| | High-contrast, moody, global tone |

**Search terms for Unsplash/Pexels:**
- "airplane wing city night aerial"
- "plane wing lights cityscape dark"
- "aircraft window night city view"

**File to create:** `hero-homepage-premium.jpg`

### 2. Hotel City Pages

| Current | Proposed Replacement |
|---------|---------------------|
| `dest-*.jpg` - City landmarks | **Modern glass skyscraper reflecting sunset** |
| Various city-specific imagery | Architecture-focused, clean, modern |

**New asset category:** Premium City Backdrops

**Search terms:**
- "glass skyscraper sunset reflection"
- "modern architecture golden hour"
- "minimalist building facade dusk"

**Files to create:**
- `city-hero-glass-sunset.jpg` - Generic premium city backdrop
- `city-hero-modern-skyline.jpg` - Alternate option

### 3. Flight Route Pages

| Current | Proposed Replacement |
|---------|---------------------|
| `flight-hero-premium.jpg` | **Close-up of first-class cabin seat** |
| `cabin-first.jpg` | OR **Minimalist cockpit view** |
| Various cabin interiors | Implies premium service, NDC access |

**Search terms:**
- "first class seat close up luxury"
- "airplane cockpit minimalist"
- "business class cabin modern"
- "premium airline seat leather"

**Files to create:**
- `flight-hero-luxury.jpg` - First-class seat detail
- `flight-cockpit-minimal.jpg` - Cockpit view (optional)

---

## Technical Implementation

### Phase 1: Add New Image Assets

```text
src/assets/
├── hero-homepage-premium.jpg     ← NEW: Airplane wing over night city
├── city-hero-glass-sunset.jpg    ← NEW: Glass skyscraper sunset
├── city-hero-modern-skyline.jpg  ← NEW: Modern architecture backup
├── flight-hero-luxury.jpg        ← NEW: First-class seat close-up
└── flight-cockpit-minimal.jpg    ← NEW: Minimalist cockpit (optional)
```

### Phase 2: Update Asset Exports

**File:** `src/assets/index.ts`

Add new exports:
```typescript
// PREMIUM 2026 HERO IMAGES
export { default as heroHomepagePremium } from "./hero-homepage-premium.jpg";
export { default as cityHeroGlassSunset } from "./city-hero-glass-sunset.jpg";
export { default as cityHeroModernSkyline } from "./city-hero-modern-skyline.jpg";
export { default as flightHeroLuxury } from "./flight-hero-luxury.jpg";
export { default as flightCockpitMinimal } from "./flight-cockpit-minimal.jpg";
```

### Phase 3: Update Photo Configuration

**File:** `src/config/photos.ts`

Add premium alternatives:

```typescript
// Premium 2026 hero variants
export const premiumHeroPhotos = {
  homepage: {
    src: heroHomepagePremium,
    alt: "Aerial view of airplane wing over illuminated city at night",
  },
  flightsLuxury: {
    src: flightHeroLuxury,
    alt: "Premium first-class cabin seat with leather finish",
  },
  cityGeneric: {
    src: cityHeroGlassSunset,
    alt: "Modern glass skyscraper reflecting golden sunset",
  },
};
```

### Phase 4: Update Components to Use New Assets

**Files to modify:**

| Component | Current Image | New Image |
|-----------|--------------|-----------|
| `src/pages/Index.tsx` → `HeroSection.tsx` | `hero-homepage.jpg` | `hero-homepage-premium.jpg` |
| `src/pages/seo/CityLandingPage.tsx` | `destinationPhotos[city]` | Fallback to `city-hero-glass-sunset.jpg` |
| `src/pages/seo/HotelCityLandingPage.tsx` | `destinationPhotos[city]` | Fallback to `city-hero-glass-sunset.jpg` |
| `src/components/seo/AnimatedCityHero.tsx` | City-specific photo | Premium fallback |
| `src/pages/seo/FlightRoutePage.tsx` | No hero image | Add `flight-hero-luxury.jpg` |
| `src/components/flight/FlightHeroSection.tsx` | `flight-hero-premium.jpg` | `flight-hero-luxury.jpg` |

### Phase 5: Create Premium Hero Variant Component

**New file:** `src/components/seo/PremiumCityHero.tsx`

A variant of `AnimatedCityHero` that uses the new glass-sunset imagery for cities without dedicated photos:

```typescript
// Uses premium generic backdrop when city-specific image unavailable
const heroSrc = cityPhoto?.src || premiumHeroPhotos.cityGeneric.src;
```

---

## Image Specifications

Following existing project standards from `imageSizes` config:

| Image Type | Dimensions | Max File Size | Aspect Ratio |
|------------|-----------|--------------|--------------|
| Hero backgrounds | 1920×1080 | 250KB | 16:9 |
| City backdrops | 1920×1080 | 250KB | 16:9 |
| Flight heroes | 1920×1080 | 250KB | 16:9 |

**Image processing requirements:**
- WebP format with JPEG fallback
- Color grading: High contrast, deep blacks, moody tones
- LCP optimization: `fetchPriority="high"`, preload hints

---

## Visual Style Guidelines

### "Minimalist Luxury" Characteristics

1. **High Contrast**: Deep blacks, bright highlights
2. **Moody Tones**: Cool color palette (slate, navy, charcoal)
3. **Clean Lines**: Architecture-focused, geometric
4. **Subtle Warmth**: Golden hour accents, warm light reflections
5. **Premium Materials**: Leather, glass, polished metal

### Photography Requirements

- **NO**: Busy backgrounds, cluttered scenes, stock-photo smiles
- **YES**: Empty space, single focal points, editorial quality

---

## Implementation Order

1. Source and download premium images from Unsplash/Pexels
2. Process images (resize, compress, color grade)
3. Add new files to `src/assets/`
4. Update `src/assets/index.ts` with new exports
5. Update `src/config/photos.ts` with premium variants
6. Modify `HeroSection.tsx` to use new homepage hero
7. Update `AnimatedCityHero.tsx` with fallback logic
8. Add hero image to `FlightRoutePage.tsx`
9. Test across all affected pages
10. Verify LCP performance metrics

---

## Files Summary

### New Files to Create
| File | Description |
|------|-------------|
| `src/assets/hero-homepage-premium.jpg` | Airplane wing over night city |
| `src/assets/city-hero-glass-sunset.jpg` | Glass skyscraper at sunset |
| `src/assets/flight-hero-luxury.jpg` | First-class seat close-up |

### Files to Modify
| File | Changes |
|------|---------|
| `src/assets/index.ts` | Add new premium image exports |
| `src/config/photos.ts` | Add `premiumHeroPhotos` configuration |
| `src/components/home/HeroSection.tsx` | Use new homepage hero |
| `src/components/seo/AnimatedCityHero.tsx` | Add premium fallback logic |
| `src/pages/seo/FlightRoutePage.tsx` | Add hero image section |
| `src/components/flight/FlightHeroSection.tsx` | Update to luxury variant |

