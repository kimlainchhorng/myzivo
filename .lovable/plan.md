

# ZIVO Rides - New Brand Design System

## Overview
Create a distinctive ZIVO brand identity for the Rides page that moves away from the current Uber-inspired design. The new design will emphasize ZIVO's premium, modern aesthetic with a unique visual language.

---

## Current State (Uber-like)
- White bottom sheet with gray/zinc accents
- Black/white category pills
- Simple row-based ride selection with inline car SVGs
- Blue pickup dot, black dropoff square (Uber standard)
- Zinc-900 CTA buttons
- Minimal color differentiation

---

## New ZIVO Design Philosophy

### Brand Personality
- **Premium but Approachable**: Not intimidating luxury, but confident quality
- **Vibrant Energy**: Dynamic colors that feel alive
- **Distinct Identity**: Immediately recognizable as ZIVO, not a clone

### Color Palette (ZIVO Rides)
| Element | Current | New ZIVO |
|---------|---------|----------|
| Primary Accent | Black/Zinc-900 | Emerald-500 (#10B981) |
| Background | White | Cream/Off-white (#FFFBF5) with soft gradients |
| Cards | White + gray border | Soft cream with emerald accents |
| CTA Buttons | Black | Gradient emerald-to-teal |
| Pickup Marker | Blue dot | Emerald ring with pulse |
| Dropoff Marker | Black square | Teal location pin |
| Surge | Amber/Red | Coral accent (#FF6B6B) |

---

## Component Updates

### 1. Bottom Sheet Redesign
**File: `src/pages/Rides.tsx`**

Current:
```
bg-white rounded-t-[28px]
```

New ZIVO:
```
bg-gradient-to-b from-[#FFFBF5] to-white 
rounded-t-[32px] 
border-t border-emerald-100/50
```

- Warmer, cream-tinted background
- Subtle emerald accent on border
- Larger corner radius for softer feel

### 2. Address Input Field Styling
**File: `src/pages/Rides.tsx`**

Current:
```
bg-zinc-100 rounded-xl
Blue dot for pickup, Black square for dropoff
```

New ZIVO:
```
bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100
Emerald ring for pickup, Teal filled circle for dropoff
Soft shadow: shadow-[0_4px_20px_rgba(16,185,129,0.08)]
```

### 3. Category Tabs
**File: `src/pages/Rides.tsx` (inline tabs)**

Current:
```
bg-zinc-900 text-white (active)
bg-zinc-100 text-zinc-600 (inactive)
```

New ZIVO:
```
bg-gradient-to-r from-emerald-500 to-teal-500 text-white (active)
bg-white border border-emerald-200 text-emerald-700 (inactive)
```

- Gradient active state for brand recognition
- Emerald-tinted inactive states

### 4. Ride Row Cards
**File: `src/components/ride/UberLikeRideRow.tsx` → Rename to `ZivoRideRow.tsx`**

Current:
```
- White background, black border when selected
- Generic inline car SVG
- Tag pills with colored dots
```

New ZIVO Design:
```
- Cream background (#FFFBF5) with soft border
- Selected: emerald gradient border + soft glow
- ZIVO-branded car silhouette SVG (more stylized, less generic)
- Tag pills: emerald/teal themed badges
- Price: bold emerald color when surge-free
```

Visual Structure:
```text
┌─────────────────────────────────────────────────┐
│  🚗 ──────────── Economy Standard              │
│  [car icon]     1:42 PM · 4 min    👤4   $8.50 │
│                                        ⚡1.2× │
└─────────────────────────────────────────────────┘
```

### 5. CTA Buttons
**File: `src/pages/Rides.tsx`**

Current:
```
bg-zinc-900 hover:bg-zinc-800 text-white
```

New ZIVO:
```
bg-gradient-to-r from-emerald-500 to-teal-500 
hover:from-emerald-600 hover:to-teal-600 
text-white font-bold
shadow-lg shadow-emerald-500/25
```

- Branded gradient buttons
- Glow effect for premium feel

### 6. Surge Banner
**File: `src/components/ride/SurgeBanner.tsx`**

Current:
```
Amber/red gradient with lightning icon
```

New ZIVO:
```
Coral (#FF6B6B) to rose gradient
Custom ZIVO surge icon (stylized wave/pulse)
Text: "High demand pricing" instead of "Busy time pricing"
```

### 7. Location Markers (Map)
**File: `src/components/maps/GoogleMap.tsx` (marker updates)**

Current:
- Blue pulsing circle (pickup)
- Black square with white center (dropoff)

New ZIVO:
- Emerald pulsing ring with white center (pickup)
- Teal filled pin with subtle shadow (dropoff)
- Route line: emerald (#10B981) instead of gray

### 8. Floating Address Cards (Map overlay)
**File: `src/pages/Rides.tsx` (RidesMapView)**

Current:
```
bg-white rounded-lg shadow-lg
Black time badge
```

New ZIVO:
```
bg-[#FFFBF5] rounded-2xl 
border border-emerald-100
Emerald gradient time badge
```

### 9. Success State
**File: `src/pages/Rides.tsx`**

Current:
```
Emerald-100 background with emerald checkmark
```

Keep this (already aligns with new ZIVO emerald theme), but enhance:
```
Add confetti animation
Gradient background pulse
"Ride Confirmed" with ZIVO branding
```

---

## Technical Implementation

### New Files to Create
1. `src/components/ride/ZivoRideRow.tsx` - New branded ride row component
2. Update `src/index.css` - Add ZIVO rides-specific CSS variables

### Files to Modify
1. `src/pages/Rides.tsx` - Main page styling overhaul
2. `src/components/ride/SurgeBanner.tsx` - ZIVO surge styling
3. `src/components/maps/GoogleMap.tsx` - Marker colors
4. `src/components/ride/UberLikeRideRow.tsx` - Deprecate or refactor

### New CSS Variables
```css
/* ZIVO Rides Brand Colors */
--zivo-rides-primary: 160 84% 39%;  /* Emerald-500 */
--zivo-rides-secondary: 174 72% 40%; /* Teal-500 */
--zivo-rides-cream: 35 100% 98%;     /* Warm cream */
--zivo-rides-surge: 0 100% 71%;      /* Coral */
--zivo-rides-glow: 0 0 30px rgba(16, 185, 129, 0.15);
```

---

## Summary of Visual Changes

| Element | Before (Uber-like) | After (ZIVO) |
|---------|-------------------|--------------|
| Bottom sheet | Pure white | Cream gradient |
| Primary color | Black/zinc | Emerald/teal gradient |
| Pickup marker | Blue circle | Emerald ring |
| Dropoff marker | Black square | Teal pin |
| CTA buttons | Solid black | Gradient emerald |
| Category tabs | Black active | Emerald gradient |
| Surge indicator | Amber/orange | Coral/rose |
| Cards | White + shadow | Cream + emerald accent |
| Route line | Gray | Emerald |

---

## Implementation Order
1. Add new CSS variables for ZIVO Rides brand
2. Update bottom sheet and background styling
3. Create new ZivoRideRow component
4. Update CTA buttons with gradient
5. Restyle category tabs
6. Update address input styling
7. Modify map markers and route colors
8. Update surge banner to ZIVO style
9. Polish floating map cards
10. Final QA pass on all states

