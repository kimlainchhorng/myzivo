

# 2026 Spatial UI - Glass Command Center Implementation

## Overview

Transform the ZIVO flight search experience with three premium 2026-era components:

1. **Glass Command Center** - Translucent search widget with spatial UI effects
2. **Holographic Ticket** - Premium flight result cards styled as digital assets
3. **Smart Pre-Loader** - Trust-building search state with supplier messaging

---

## Current State Analysis

### Existing Components
- `FlightSearchFormPro.tsx` (615 lines): Full-featured form with autocomplete, dates, passengers
- `BigSearchCard.tsx`: Container wrapper with accent bars and disclosure
- `FlightResultCard.tsx` (407 lines): Card-style results with amenities, pricing
- `FlightResultsSkeleton.tsx`: Basic skeleton loader

### Styling Patterns
The codebase already uses:
- `backdrop-blur-xl` for glass effects
- `bg-card/95`, `bg-muted/30` for transparency
- Gradient accents (`from-sky-500 to-blue-600`)
- Framer Motion for animations

---

## Part 1: Glass Command Center Search Widget

### Component: `GlassSearchWidget.tsx`

A new premium alternative to `BigSearchCard` + `FlightSearchFormPro`:

**Visual Features:**
- Translucent dark glass: `bg-zinc-900/60 backdrop-blur-2xl`
- Glow effect behind the widget: `bg-blue-600/20 blur-[100px]`
- Unified From/To input section with merged visual design
- Active state highlighting: input backgrounds light up on focus
- Tab selector for Round Trip / One Way / Multi-City

**Layout (12-column grid on desktop):**
```text
+----------------------------------------------------------------------+
|  [Round Trip]  [One Way]  [Multi-City]                               |
+----------------------------------------------------------------------+
| [From ←→ To merged section]  | [Dates]  | [Travelers] | [SEARCH]    |
|  5 cols                      | 3 cols   | 2 cols      | 2 cols      |
+----------------------------------------------------------------------+
```

**Interaction States:**
- Focused field: `bg-white/5 rounded-xl` with smooth transition
- Hover on groups: `hover:border-white/20` for subtle feedback
- Search button: `whileHover={{ scale: 1.02 }}` with glow shadow

### Integration with Existing Logic

The widget will wrap the existing autocomplete, date picker, and passenger logic from `FlightSearchFormPro`:
- Reuses `useAirportSearch` hook for location autocomplete
- Reuses `MobileDatePickerSheet` for mobile dates
- Maintains all validation and navigation logic

---

## Part 2: Holographic Ticket Result Card

### Component: `HolographicFlightCard.tsx`

Premium flight result presentation styled as "digital assets":

**Visual Features:**
- Dark glass: `bg-zinc-900/40 backdrop-blur-md`
- Hover glow gradient: `via-blue-500/10` edge glow
- 3-column layout: Airline/Route | Benefits | Price

**Structure:**
```text
+-----------------------------------------------------------------------------------+
| [AIRLINE LOGO] | JFK -------- 7h 20m · Direct -------- LHR | [WiFi][Meal][USB]   |
|   Airline Name | 08:30 AM — 09:10 PM • British Airways    |                     |
+-----------------------------------------------------------------------------------+
|                                                           | Total Price          |
|                                                           | $4,250               |
|                                                           | [Select Button]      |
+-----------------------------------------------------------------------------------+
```

**Animation:**
- `whileInView` fade-up animation
- Hover transitions for glow effect

### Props Interface

```typescript
interface HolographicFlightCardProps {
  flight: FlightCardData; // Existing type from results system
  onSelect: (flight: FlightCardData) => void;
  variant?: 'default' | 'compact';
}
```

---

## Part 3: Smart Pre-Loader

### Component: `SmartSearchLoader.tsx`

Trust-building loading state that communicates the normalization layer:

**Visual Features:**
- Dual spinning rings (counter-rotating) with gradient borders
- Progress message cycling through stages
- Smooth text transitions

**Message Sequence:**
1. "Connecting to Duffel..." (0-1s)
2. "Scanning NDC Inventory..." (1-3s)
3. "Checking 300+ Airlines..." (3-5s)
4. "Found X Options." (when complete)

**Animation Details:**
- Outer ring: `rotate: 360` over 1s
- Inner ring: `rotate: -360` over 1.5s
- Text: `animate-pulse` with smooth transitions

### Integration Points

Used in `FlightResults.tsx` during `isLoading` state:
```tsx
{isLoading && <SmartSearchLoader />}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/search/GlassSearchWidget.tsx` | Premium glass search form |
| `src/components/flight/HolographicFlightCard.tsx` | Digital asset result card |
| `src/components/flight/SmartSearchLoader.tsx` | Trust-building loader |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/search/index.ts` | Export new components |
| `src/components/flight/index.ts` | Export new components |
| `src/pages/FlightSearch.tsx` | Option to use GlassSearchWidget |
| `src/pages/FlightResults.tsx` | Use SmartSearchLoader + HolographicFlightCard |

---

## Technical Implementation Details

### Glass Effect CSS Variables

New utility classes to add to `index.css`:
```css
.glass-dark {
  background: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glow-blue {
  box-shadow: 0 0 100px 20px rgba(59, 130, 246, 0.2);
}
```

### Tab Button Styling

```typescript
const tabClasses = cn(
  "text-sm font-bold uppercase tracking-wider transition-all",
  isActive
    ? "text-white border-b-2 border-blue-500 pb-4 -mb-4"
    : "text-zinc-500 hover:text-zinc-300"
);
```

### Input Focus State Hook

Create custom hook for tracking focused field:
```typescript
const [focusedField, setFocusedField] = useState<string | null>(null);

// Usage on inputs
onFocus={() => setFocusedField('from')}
onBlur={() => setFocusedField(null)}
```

### Loader Animation Keyframes

Framer Motion config for spinning rings:
```typescript
<motion.span 
  className="border-4 border-t-blue-500 border-r-transparent ..."
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
/>
```

---

## Dark Mode Considerations

The glass effect is designed for dark backgrounds. On light mode:
- Glass cards will use `bg-card/80` instead of `bg-zinc-900/60`
- Glow effects will be more subtle
- Border colors will use `border-border/50` pattern

---

## Implementation Order

### Phase 1: Core Components
1. Create `SmartSearchLoader.tsx` (simplest, immediate impact)
2. Create `HolographicFlightCard.tsx` (new result card design)
3. Update exports in index files

### Phase 2: Glass Widget
4. Create `GlassSearchWidget.tsx` with tab navigation
5. Integrate existing autocomplete and date logic
6. Add focus state highlighting

### Phase 3: Integration
7. Update `FlightResults.tsx` to use new loader
8. Add option to use `HolographicFlightCard` for results
9. Update `FlightSearch.tsx` to offer glass widget

### Phase 4: Polish
10. Add glow CSS utilities
11. Test dark/light mode compatibility
12. Verify mobile responsiveness

---

## Mobile Responsiveness

All components maintain mobile-first design:
- **Glass Widget**: Stacks vertically on mobile, full-width inputs
- **Holographic Card**: Single-column layout, touch-optimized buttons
- **Loader**: Centered, scales appropriately

Touch targets remain 44px+ per existing ZIVO standards.

---

## Files Summary

### New Files (3)
| File | Type |
|------|------|
| `src/components/search/GlassSearchWidget.tsx` | Search Component |
| `src/components/flight/HolographicFlightCard.tsx` | Result Card |
| `src/components/flight/SmartSearchLoader.tsx` | Loading State |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/components/search/index.ts` | Add GlassSearchWidget export |
| `src/components/flight/index.ts` | Add HolographicFlightCard, SmartSearchLoader |
| `src/pages/FlightResults.tsx` | Integrate SmartSearchLoader |
| `src/index.css` | Add glass utility classes |

