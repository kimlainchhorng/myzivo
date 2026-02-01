

# Photo Style Upgrade Plan for ZIVO

## Overview

This plan implements a consistent **high-quality travel photography** style across the entire ZIVO platform, replacing any mixed styles and ensuring images appear only in correct locations (heroes, cards, tiles) with proper optimization and alt text.

---

## Current State Analysis

### What Already Works Well
1. **ImageHero.tsx** - Already uses real photos with dark overlays for Flights/Hotels/Cars
2. **ServiceHero.tsx** - Uses photos for Rides/Eats with proper gradient overlays
3. **ServicesGrid.tsx** - Service cards already use hero photos as thumbnails
4. **DestinationCardsGrid.tsx** - Uses Unsplash URLs for destination images
5. **HotelImageShowcase.tsx** - Uses local hotel photography assets
6. **Existing assets** - 23+ JPG/PNG images already in src/assets/

### What Needs Improvement
1. **Missing hero images** - Extras page has no hero photo
2. **Missing destination images** - No local dest-*.jpg files for offline use
3. **Missing car category images** - No cat-*.jpg files for car types
4. **No centralized photo config** - Images scattered without consistent naming
5. **Inconsistent alt text** - Some images have empty or generic alt text
6. **No restaurant/food images** - Eats uses emojis only

---

## Implementation Plan

### Phase 1: Create Centralized Photo Configuration

Create a single source of truth for all photo assets:

```text
File: src/config/photos.ts
```

This will contain:
- Hero image mappings for all services
- Service card image mappings
- Destination image URLs (Unsplash, optimized)
- Car category image URLs
- Alt text configurations
- Aspect ratio constants

### Phase 2: Create Photo Asset Index

Reorganize the existing asset structure:

```text
File: src/assets/photos/index.ts

Exports:
- heroPhotos: Record<ServiceType, { src: string; alt: string }>
- servicePhotos: Record<ServiceType, { src: string; alt: string }>
- destinationPhotos: Record<City, { src: string; alt: string }>
- carCategoryPhotos: Record<Category, { src: string; alt: string }>
```

### Phase 3: Update ImageHero Component

Enhance the existing ImageHero.tsx:
- Add proper alt text patterns (not empty strings)
- Ensure consistent overlay gradient (cool/neutral blue tint)
- Add loading="eager" for above-fold heroes
- Enforce 16:9 aspect ratio containment

**Changes to `src/components/shared/ImageHero.tsx`:**
- Line 72-74: Update alt attribute to descriptive text
- Add aria-hidden to decorative overlay divs

### Phase 4: Update ServiceHero Component

Ensure rides/eats heroes match the same quality:

**Changes to `src/components/shared/ServiceHero.tsx`:**
- Line 85-86: Update alt attribute with descriptive text
- Verify overlay gradient consistency with ImageHero

### Phase 5: Update ServicesGrid with Consistent Photos

Ensure all 6 service cards use proper photos:

**Changes to `src/components/home/ServicesGrid.tsx`:**
- Lines 137-139: Update alt text pattern to: "ZIVO {Service} - {description}"
- Ensure 4:3 aspect ratio on image container (currently correct at h-32)
- Verify lazy loading is applied (already using loading="lazy")

### Phase 6: Update DestinationCardsGrid

The component already uses Unsplash photos. Improvements:

**Changes to `src/components/shared/DestinationCardsGrid.tsx`:**
- Lines 285-288: Update alt text to: "{City}, {Country} - Travel destination"
- Verify 4:3 aspect ratio (currently correct at aspect-[4/3])
- Ensure cool/neutral tone consistency across all destination images

### Phase 7: Add Car Category Photo Tiles

The CarRentalBooking.tsx currently shows text-only car categories. Add photo tiles:

**Create new component: `src/components/car/CarCategoryTiles.tsx`**

This will display 6 car categories with photos:
- Economy (compact hatchback)
- Compact (small sedan)
- Midsize (standard sedan)
- SUV (crossover)
- Luxury (premium vehicle)
- Van (minivan)

Using Unsplash images with:
- 4:3 or 1:1 aspect ratio
- Dark gradient overlay
- Category label overlay
- Lazy loading

### Phase 8: Add Hero to Extras Page

The TravelExtras.tsx currently has no hero photo.

**Changes to `src/pages/TravelExtras.tsx`:**
- Add ServiceHero or ImageHero at the top
- Use travel accessories/essentials photography
- Create hero-extras.jpg asset

### Phase 9: Create OptimizedHeroImage Component

Enhance the existing OptimizedImage component for heroes specifically:

**Enhancements to `src/components/shared/OptimizedImage.tsx`:**
- Add srcSet support for responsive images
- Add WebP detection and fallback
- Ensure proper sizing constraints
- Add blur placeholder while loading

### Phase 10: Generate Missing Photo Assets

Create/source the following optimized images:

**Hero Images (1920x1080, <200KB):**
- hero-extras.jpg - Travel accessories, passport, luggage

**Car Category Images (600x400, <50KB each):**
Using Unsplash URLs:
- car-economy.jpg
- car-compact.jpg  
- car-midsize.jpg
- car-suv.jpg
- car-luxury.jpg
- car-van.jpg

**Destination Images (Already using Unsplash - verify consistency):**
- Ensure all have consistent cool/neutral tone
- Add proper ?w=400&h=300&fit=crop parameters

### Phase 11: Alt Text Standardization

Update all image alt text across the codebase:

| Image Type | Alt Text Pattern |
|------------|------------------|
| Hero | "ZIVO {Service} - {descriptive scene}" |
| Service card | "ZIVO {Service} - {one-line description}" |
| Destination | "{City}, {Country} - Travel destination" |
| Car category | "{Category} rental car - {vehicle type}" |
| Hotel property | "{Hotel name} - {location}" |
| Empty state | "" (with aria-hidden="true") |

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/config/photos.ts` | Centralized photo configuration |
| `src/assets/photos/index.ts` | Photo asset exports |
| `src/components/car/CarCategoryTiles.tsx` | Car category photo grid |
| `src/assets/hero-extras.jpg` | Extras page hero (AI generated) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/shared/ImageHero.tsx` | Add proper alt text |
| `src/components/shared/ServiceHero.tsx` | Add proper alt text |
| `src/components/home/ServicesGrid.tsx` | Update alt text pattern |
| `src/components/shared/DestinationCardsGrid.tsx` | Update alt text, verify consistency |
| `src/pages/TravelExtras.tsx` | Add hero photo section |
| `src/pages/CarRentalBooking.tsx` | Integrate CarCategoryTiles |
| `src/components/shared/OptimizedImage.tsx` | Add srcSet/WebP support |

---

## Photo Specifications

### Aspect Ratios
- Heroes: 16:9 (1920x1080 or 1600x900)
- Service cards: 4:3 (400x300)
- Destination tiles: 4:3 (400x300) or 1:1 (300x300)
- Car categories: 4:3 (400x300)
- Restaurant thumbnails: 1:1 (200x200)

### File Size Targets
- Heroes: < 200KB (WebP) / < 300KB (JPEG)
- Cards/tiles: < 50KB each
- Thumbnails: < 25KB each

### Color Tone
- Cool/neutral with slight blue tint
- Consistent across all pages
- Dark overlays: from-slate-950/90 via-{service-color}/70 to-slate-950/60

### Overlay Gradients
```text
Flights: from-slate-950/90 via-blue-950/80 to-slate-950/70
Hotels: from-slate-950/90 via-amber-950/70 to-slate-950/60
Cars: from-slate-950/90 via-violet-950/70 to-slate-950/60
Rides: from-slate-950/90 via-emerald-950/70 to-slate-950/60
Eats: from-slate-950/90 via-orange-950/70 to-slate-950/60
Extras: from-slate-950/90 via-pink-950/70 to-slate-950/60
```

---

## No-Photo Zones (Important)

Photos will NOT be placed in:
- Inside search forms
- Between form fields
- In dropdowns/selects
- In loading states (use skeletons)
- In error messages
- In modals/dialogs
- In navigation menus

---

## Expected Outcomes

After implementation:
- Consistent high-quality travel photography across all pages
- All images have descriptive alt text for SEO/accessibility
- Heroes use 16:9, cards use 4:3, tiles use 1:1 aspect ratios
- No stretched or distorted images
- All images optimized (<200KB for heroes, <50KB for tiles)
- Lazy loading for below-fold content
- Cool/neutral color tone consistency
- Dark overlays ensure text readability
- Mobile layout maintains clean, professional appearance

