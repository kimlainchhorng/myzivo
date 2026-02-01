
# Premium Homepage Redesign for ZIVO

## Overview

This plan redesigns the ZIVO homepage into a **premium, conversion-focused layout** with clear user flows into each service, no clutter or duplicated blocks, and a mobile-first approach using the established PHOTO style.

---

## Current State Analysis

### What Exists Today
1. **Desktop**: Uses `DesktopHomePage` with NavBar → HeroSection → ServicesGrid → ExtrasSection → TrustSection → Footer
2. **Mobile**: Completely different component (`AppHome`) with different structure
3. **Hero**: Center-aligned, full-background image with 3 CTAs (Flights/Hotels/Cars only)
4. **ServicesGrid**: 6 premium photo cards with "Live" badges
5. **ExtrasSection**: 5 icon-based cards for extras
6. **TrustSection**: 4 trust icons + "How ZIVO Works" disclosure

### Issues to Fix
1. Hero is **center-aligned** (spec requires left text + right photo)
2. Hero **missing Rides & Eats CTAs** (only shows travel services)
3. Hero copy doesn't match spec ("Your Travel, Simplified" vs "ZIVO — Travel, Rides & Eats in One Place")
4. **No "How It Works" section** (3-step flow with partner disclosure)
5. **No Popular Destinations section** on homepage
6. ExtrasSection shows only 5 items (spec wants 6)
7. **Different mobile layout** - AppHome is completely separate (needs unification)
8. TrustSection has 4 items (spec wants simpler 3-bullet trust strip)
9. **Missing exact footer disclosure text**

---

## New Section Structure

```text
DESKTOP HOMEPAGE FLOW
=====================
1. NavBar (existing - keep)
2. Hero Section (REDESIGN - split layout)
3. Services Grid (UPDATE - 6 cards with revised CTAs)
4. How It Works (NEW - 3 steps)
5. Popular Destinations (NEW - 8 tiles)
6. ZIVO More / Extras (UPDATE - 6 items)
7. Trust & Support (UPDATE - 3 bullets)
8. Footer (UPDATE - exact disclosure text)
```

---

## Phase 1: Redesign Hero Section

**File: `src/components/home/HeroSection.tsx`**

### New Layout: Split Hero (Text Left, Photo Right)

```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Left Column (50%)           │   Right Column (50%)            │
│                               │                                 │
│   ZIVO — Travel, Rides &      │   [Premium Hero Photo]          │
│   Eats in One Place           │   16:9 with dark overlay        │
│                               │   hero-homepage.jpg             │
│   Search flights, hotels,     │                                 │
│   and car rentals. Request    │                                 │
│   rides and food delivery     │                                 │
│   — all from one platform.    │                                 │
│                               │                                 │
│   [Search Flights] [Hotels]   │                                 │
│   [Rent Car] [Rides] [Eats]   │                                 │
│                               │                                 │
│   Trust: Bookings for travel  │                                 │
│   are completed on partner    │                                 │
│   sites.                      │                                 │
│                               │                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Content Changes

**Headline:** "ZIVO — Travel, Rides & Eats in One Place"

**Subtext:** "Search flights, hotels, and car rentals. Request rides and food delivery — all from one platform."

**Primary CTAs (row 1):**
- "Search Flights" → /flights (bg-flights)
- "Search Hotels" → /hotels (bg-hotels)

**Secondary CTAs (row 2):**
- "Rent a Car" → /rent-car (bg-cars)
- "Request a Ride" → /rides (bg-rides)
- "Order Food" → /eats (bg-eats)

**Trust Line:** "Bookings for travel are completed on partner sites."

### Mobile Layout
- Single column, stacked
- Photo at top (shorter height, 40vh)
- Content below with CTAs stacked vertically
- 2-column CTA grid for secondary buttons

---

## Phase 2: Update Services Grid

**File: `src/components/home/ServicesGrid.tsx`**

### Card Content Updates

| Card | Description | CTA |
|------|-------------|-----|
| Flights | "Compare flight options worldwide" | "Search Flights" |
| Hotels | "Find hotels and compare rates" | "Search Hotels" |
| Car Rental | "Compare rental cars in minutes" | "Rent a Car" |
| Rides | "Request local rides and airport pickup" | "Request Ride" |
| Eats | "Order meals from local restaurants" | "Order Food" |
| Extras | "Transfers, activities, eSIM, and more" | "Explore Extras" |

### Layout Changes
- Keep 4:3 photo cards with icon overlay
- Remove "Live" badges (redundant)
- Update description text to match spec
- Update CTA button text to match spec

### Mobile: 2-column grid (already correct)

---

## Phase 3: Create "How It Works" Section

**File: `src/components/home/HowItWorks.tsx`** (NEW)

### 3-Step Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                    HOW IT WORKS                                 │
│                                                                 │
│   ┌───────────┐     ┌───────────────┐     ┌─────────────────┐  │
│   │     1     │     │      2        │     │       3         │  │
│   │  Search   │ ─── │   Compare     │ ─── │    Book on      │  │
│   │    or     │     │   Options     │     │   Partner Site  │  │
│   │  Request  │     │               │     │  (or Confirm    │  │
│   │           │     │               │     │   with ZIVO)    │  │
│   └───────────┘     └───────────────┘     └─────────────────┘  │
│                                                                 │
│   "ZIVO may earn a commission when users book through          │
│    partner links."                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure
- 3 columns on desktop, 1 column stack on mobile
- Circle icon with step number
- Step title + brief description
- Small disclosure text below

---

## Phase 4: Create Popular Destinations Section

**File: `src/components/home/PopularDestinations.tsx`** (NEW)

### 8 Destination Tiles (1:1)

Use destination photos from `src/config/photos.ts`:
1. New York
2. Los Angeles
3. Miami
4. Las Vegas
5. Paris
6. Tokyo
7. London
8. Dubai

### Layout
- 8-column grid on desktop (lg)
- 4-column grid on tablet (md)
- 2-column grid on mobile (sm)
- Each tile: square image with city name overlay
- Clicking navigates to /hotels (hotel-focused)

### CTA
- "Explore Hotels" → /hotels button below grid

---

## Phase 5: Update Extras Section (ZIVO More)

**File: `src/components/home/ExtrasSection.tsx`**

### Update to 6 Items

| Item | Icon | Description |
|------|------|-------------|
| Activities | Ticket | "Tours and activities" |
| Tickets | Ticket | "Attractions and museums" |
| Transfers | Bus | "Airport transfers" |
| eSIM | Smartphone | "Stay connected abroad" |
| Luggage Storage | Briefcase | "Store bags while exploring" |
| Flight Compensation | Shield | "Claim for delays" |

### Layout Changes
- 6-column grid on desktop (xl)
- 3-column on tablet (lg)
- 2-column on mobile
- Keep simple icon-based cards (no photos needed)

---

## Phase 6: Simplify Trust Section

**File: `src/components/home/TrustSection.tsx`**

### New 3-Bullet Format

Replace 4 trust icons + disclosure box with simpler:

```text
┌─────────────────────────────────────────────────────────────────┐
│                       TRUST & SUPPORT                           │
│                                                                 │
│   ✓ Secure partner checkout                                    │
│   ✓ Mobile-first experience                                    │
│   ✓ Support: info@hizivo.com                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layout
- Single row on desktop
- Stacked on mobile
- Clean, minimal design
- No disclosure box (moved to HowItWorks section)

---

## Phase 7: Update Footer Disclosure

**File: `src/components/Footer.tsx`**

### Update Disclosure Text (Lines 229-234)

Current:
> "ZIVO is a travel search engine. We may earn a commission when you book through our partner links..."

Replace with exact spec text:
> "ZIVO may earn a commission when users book through partner links.
> Bookings are completed on partner websites."

### Ensure Required Links Present
- Privacy ✓
- Terms ✓
- Affiliate Disclosure ✓
- Partners ✓
- Creators ✓
- Contact ✓

---

## Phase 8: Unify Mobile Experience

**File: `src/pages/Index.tsx`**

### Current Issue
Desktop renders `DesktopHomePage`, mobile renders completely different `AppHome`.

### Solution Options

**Option A (Recommended):** Keep separate but align content
- Update `AppHome` to match new desktop structure
- Same sections, mobile-optimized layout
- Consistent messaging and CTAs

**Option B:** Single responsive component
- Merge into one component with responsive breakpoints
- More code complexity but single source of truth

### Mobile Layout Rules
- Hero CTAs stack vertically (2 rows)
- Services grid: 2 columns
- How It Works: vertical stack
- Destinations: 2-column grid, horizontal scroll optional
- No giant blocks repeated
- Sticky search button: optional (not required)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/HowItWorks.tsx` | 3-step how it works section |
| `src/components/home/PopularDestinations.tsx` | 8 destination tiles |

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/components/home/HeroSection.tsx` | Split layout, new copy, 5 CTAs |
| `src/components/home/ServicesGrid.tsx` | Updated descriptions, CTA text, remove badges |
| `src/components/home/ExtrasSection.tsx` | 6 items, updated icons/labels |
| `src/components/home/TrustSection.tsx` | Simplified 3-bullet format |
| `src/components/Footer.tsx` | Exact disclosure text |
| `src/pages/Index.tsx` | Add HowItWorks and PopularDestinations |
| `src/pages/app/AppHome.tsx` | Align with new desktop structure |

---

## Technical Implementation Details

### Hero Split Layout CSS

```text
Desktop (lg+):
- grid grid-cols-2
- Left: text + CTAs
- Right: relative image container with overlay

Tablet (md):
- Same split but smaller text

Mobile (sm):
- Stack: photo on top (40vh), content below
- CTAs in 2-column grid
```

### CTA Button Styles

```text
Primary (row 1):
- h-12 px-6 text-base font-semibold rounded-xl
- bg-flights / bg-hotels

Secondary (row 2):
- h-11 px-5 text-sm font-medium rounded-xl
- bg-cars / bg-rides / bg-eats
```

### Destination Tile Hover Effect
- Scale 1.05 on hover
- Gradient overlay darkens slightly
- City name stays visible

---

## Expected Outcomes

After implementation:
- Clean, premium travel-tech homepage
- Clear user flow into each service (5 CTAs in hero, 6 service cards)
- No clutter or duplicated blocks
- Consistent desktop and mobile experience
- Proper affiliate disclosure in multiple locations
- All required footer links present
- Mobile-first, fast, premium look
