

# SEO City Landing Page Template Implementation

## Overview

Create a premium, animated SEO landing page template for city destinations that showcases real-time supplier data from the ZivoProperty normalization layer. This template serves as a reusable pattern for generating SEO-optimized pages for Flights and Hotels with immersive hero sections and live pricing displays.

---

## Current State Analysis

The project has:
- **Existing SEO Pages**: `FlightToCity.tsx`, `DestinationHotelsPage.tsx`, `FlightRoutePage.tsx` with static content
- **Destination Photos**: 20+ cities with local AI-generated imagery in `src/config/photos.ts`
- **Hero Component**: `DestinationHero.tsx` for service-specific hero sections (no animations)
- **ZivoProperty Schema**: Unified property format with multi-supplier comparison logic
- **framer-motion**: Already installed (`^12.29.2`)

The provided template adds:
1. **Ken Burns Animation** - Slow zoom effect on hero background image
2. **60vh Hero Height** - More immersive viewport takeover
3. **Dynamic Year Tag** - "2026" styling for freshness signals
4. **Real-time Rates Grid** - Live supplier data display

---

## Implementation Approach

### Phase 1: Create Animated Hero Component

**File**: `src/components/seo/AnimatedCityHero.tsx`

```text
+------------------------------------------------------------------+
|  [City Photo - Ken Burns zoom animation]                         |
|                                                                   |
|                                                                   |
|                    PARIS  2026                                   |
|          Book the best NDC flights and hand-picked              |
|          hotels in Paris via ZIVO.                              |
|                                                                   |
|  [Trust badges: Secure Booking | 500+ Airlines | 24/7 Support]  |
+------------------------------------------------------------------+
```

Features:
- `motion.img` with `scale: 1.2 → 1.0` over 10 seconds for Ken Burns
- 60vh height with `flex items-end` for bottom-aligned content
- Dynamic year from `new Date().getFullYear() + 1` (for forward-looking SEO)
- Gradient overlay optimized for text legibility
- Configurable for flights, hotels, or combined

### Phase 2: Create Unified SEO Page Template

**File**: `src/pages/seo/CityLandingPage.tsx`

Template structure:
1. **AnimatedCityHero** - Immersive photo header
2. **Trust Bar** - Existing `GlobalTrustBar`
3. **Real-time Rates Grid** - Multi-supplier comparison
4. **Search Form** - Service-specific form (Flight/Hotel/Unified)
5. **Popular Routes** - Internal linking for SEO
6. **FAQ Section** - Structured data
7. **Compliance Footer** - OTA disclaimers

### Phase 3: Live Supplier Data Component

**File**: `src/components/seo/LiveRatesGrid.tsx`

Displays normalized ZivoProperty data:
- Source badges (Hotelbeds/RateHawk)
- "Best Price" indicators
- Availability status
- Starting prices with disclaimers

```text
+---------------------------+---------------------------+
|  [Hotel A - Hotelbeds]    |  [Hotel A - RateHawk]     |
|  ★★★★☆  4.5 rating        |  ★★★★☆  4.5 rating        |
|  From $189/night          |  From $175/night ✓ Best   |
|  [Available] [Book Now]   |  [Available] [Book Now]   |
+---------------------------+---------------------------+
```

### Phase 4: Service-Specific Variants

Create specialized variants:

| File | Service | Data Source |
|------|---------|-------------|
| `FlightCityLandingPage.tsx` | Flights | Flight routes from city |
| `HotelCityLandingPage.tsx` | Hotels | ZivoPropertyExtended |
| `CombinedCityLandingPage.tsx` | Both | Unified city hub |

---

## Technical Implementation

### AnimatedCityHero Props

```typescript
interface AnimatedCityHeroProps {
  city: string;
  citySlug: string;
  serviceType: "flights" | "hotels" | "combined";
  subtitle?: string;
  children?: React.ReactNode; // For search form overlay
}
```

### Animation Configuration

```typescript
const kenBurnsVariants = {
  initial: { scale: 1.2 },
  animate: { 
    scale: 1,
    transition: { duration: 10, ease: "easeOut" }
  }
};
```

### Photo Resolution

The template expects city photos at `/assets/cities/{city}.jpg`. However, ZIVO already uses:
- `destinationPhotos` from `src/config/photos.ts`
- Local imports like `destParis`, `destNewYork`, etc.

Modify to use existing photo system:
```typescript
const cityPhoto = destinationPhotos[citySlug as DestinationCity];
const heroSrc = cityPhoto?.src || `/assets/dest-${citySlug}.jpg`;
```

### Real-time Data Integration

Connect to multi-provider search:
```typescript
const { properties, isLoading } = useMultiProviderHotelSearch({
  destination: citySlug,
  checkIn: defaultCheckIn,
  checkOut: defaultCheckOut,
  occupancy: { adults: 2 }
});
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/seo/AnimatedCityHero.tsx` | Immersive Ken Burns hero |
| `src/components/seo/LiveRatesGrid.tsx` | Multi-supplier comparison grid |
| `src/pages/seo/CityLandingPage.tsx` | Unified template with slots |
| `src/pages/seo/HotelCityLandingPage.tsx` | Hotels-specific variant |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/seo/index.ts` | Export new components |
| `src/pages/seo/index.ts` | Export new pages |
| `src/App.tsx` | Add route `/city/:citySlug` |

---

## SEO Compliance Considerations

1. **No Hardcoded Prices**: Display "From $X" only from live API, or show "Search for rates"
2. **Dynamic Content**: Year badge updates automatically
3. **Canonical URLs**: Follow pattern `https://hizivo.com/hotels/{city}` or `/flights/to-{city}`
4. **Structured Data**: Extend existing `BreadcrumbSchema`, add `TravelAction` schema
5. **Accessibility**: Proper alt text, focus management for animations

---

## Route Structure

| URL Pattern | Component | Purpose |
|-------------|-----------|---------|
| `/city/:citySlug` | `CityLandingPage` | Combined hub |
| `/hotels/:city` | `HotelCityLandingPage` | Hotels focus |
| `/flights/to-:city` | Existing `FlightToCity` | Flights focus |

---

## Implementation Order

1. Create `AnimatedCityHero.tsx` with Ken Burns effect
2. Create `LiveRatesGrid.tsx` for supplier comparison
3. Build `CityLandingPage.tsx` template using slots pattern
4. Create hotel-specific `HotelCityLandingPage.tsx`
5. Update existing `DestinationHotelsPage.tsx` to use new hero
6. Add routes to `App.tsx`
7. Test across all destination cities

