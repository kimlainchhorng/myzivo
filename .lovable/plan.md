

# Bento Grid Features Component Implementation

## Overview

Create a premium "Bento Grid" feature showcase component that highlights ZIVO's core technology and trust signals using an asymmetric grid layout with large hero cards and compact feature tiles.

---

## Current State Analysis

The homepage already has:
- **WhyBookWithZivo**: 3-column equal-width value props
- **PrimaryServicesSection**: 3-column service cards with images
- **HowItWorksSimple**: 3-step horizontal flow
- **SocialProofSection**: 3 trust point cards

The provided Bento Grid design introduces:
1. **Asymmetric Layout**: 2×2 large hero card + 2×1 horizontal feature + 2×1 small tiles
2. **Visual Density**: More compact, magazine-style presentation
3. **Technology Focus**: Direct Hotel Inventory, NDC Flights, Zero-Latency, PCI Level 1

---

## Proposed Design

```text
+----------------------------------+----------------------------------+
|                                  |                                  |
|   DIRECT HOTEL INVENTORY         |        NDC FLIGHTS               |
|   [Large 2x2 card with           |        [Wide blue card           |
|    hotel background image]       |         with plane icon]         |
|                                  |                                  |
|   Hotelbeds + RateHawk           |   300+ Airlines via Duffel       |
|   normalized in real-time        |                                  |
|                                  +------------------+---------------+
|                                  |       ⚡          |      🔒       |
|                                  |  Zero-Latency    |  PCI-Level 1  |
+----------------------------------+------------------+---------------+
```

Grid Configuration: `grid-cols-4 grid-rows-2`
- Hotel card: `col-span-2 row-span-2` (left side)
- NDC Flights: `col-span-2` (top right)
- Zero-Latency: `col-span-1` (bottom right left)
- PCI-Level 1: `col-span-1` (bottom right right)

---

## Implementation Details

### File to Create

**`src/components/home/BentoFeatures.tsx`**

```typescript
// Key features:
// 1. Hotel card with background image and glass overlay
// 2. NDC Flights card with brand blue gradient + hover animation
// 3. Two compact trust badges (Zero-Latency, PCI)
```

### Styling

Following existing patterns from the codebase:
- Border radius: `rounded-[2.5rem]` (40px) for premium feel
- Glass effect: `bg-black/40 backdrop-blur-md border border-white/10`
- Section border: `border border-white/5`
- Dark background: `bg-zinc-900` / `bg-zinc-800`
- Flight brand color: `bg-blue-600` (matches ZIVO flights branding)

### Content Configuration

| Card | Type | Background | Content |
|------|------|------------|---------|
| Hotel Inventory | Large (2×2) | Hotel image | "Direct Hotel Inventory" + "Hotelbeds + RateHawk normalized" |
| NDC Flights | Wide (2×1) | Blue gradient | "NDC Flights" + "300+ Airlines via Duffel" |
| Zero-Latency | Small (1×1) | Dark | ⚡ icon + label |
| PCI Level 1 | Small (1×1) | Dark | 🔒 icon + label |

### Integration Options

The component can be placed in the homepage flow after `WhyBookWithZivo` or replace `SocialProofSection`:

```tsx
// Option A: Add as new section
<WhyBookWithZivo />
<BentoFeatures />
<PrimaryServicesSection />

// Option B: Replace SocialProofSection
<PriceAlertPromo />
<BentoFeatures />  // Instead of SocialProofSection
<AirlineTrustSection />
```

---

## Responsive Behavior

| Viewport | Layout |
|----------|--------|
| Desktop (lg+) | 4-column × 2-row as designed |
| Tablet (md) | 2-column × 4-row (cards stack) |
| Mobile | Single column, full-width cards |

---

## Technical Details

### Image Assets

Use existing hotel imagery from the photo system:
```typescript
import hotelLobbyPremium from "@/assets/hotel-lobby-premium.jpg";
// Or generate a new asset with glass-reflection hotel aesthetic
```

### Icon Integration

```typescript
import { Plane, Zap, ShieldCheck } from "lucide-react";

// For decorative Plane icon with hover scale:
<Plane className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 
  group-hover:scale-110 transition-transform" />
```

### Container Sizing

```typescript
// Fixed height on desktop for grid integrity
className="h-[600px] max-w-7xl mx-auto"

// Responsive: auto-height on mobile
className="h-auto md:h-[600px]"
```

---

## Files Summary

### New File
| File | Purpose |
|------|---------|
| `src/components/home/BentoFeatures.tsx` | Premium asymmetric feature grid |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Import and add `<BentoFeatures />` to homepage flow |

---

## Implementation Order

1. Create `BentoFeatures.tsx` with the asymmetric grid layout
2. Integrate hotel background image from existing assets
3. Add responsive breakpoints for tablet/mobile
4. Insert into `Index.tsx` homepage after `WhyBookWithZivo`
5. Test grid alignment and hover animations

