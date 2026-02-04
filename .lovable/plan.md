

# Immersive Premium Search Overlay Implementation

## Overview

Create a premium, full-screen search overlay component using **framer-motion** for smooth animations. This overlay provides a unified search entry point that normalizes across Flights, Hotels, and Car Rentals — matching ZIVO's "Light Premium" design philosophy with glassmorphism effects.

---

## Current State

The project has:
- **Existing search forms**: `FlightSearchFormPro`, `HotelSearchFormPro`, `CarSearchFormPro` in `src/components/search/`
- **Header search overlay**: Simple inline search in `Header.tsx` (lines 183-199)
- **Location autocomplete**: `LocationAutocomplete` with airport/city data
- **framer-motion installed**: Version `^12.29.2` (already available)
- **Mobile components**: Bottom sheets, date pickers in `src/components/mobile/`

---

## Implementation Plan

### 1. Create PremiumSearchOverlay Component

**File**: `src/components/search/PremiumSearchOverlay.tsx`

```text
┌─────────────────────────────────────────────────────────┐
│  [X]                                                    │
│                                                         │
│           ✨ Where to next? ✨                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Flights] [Hotels] [Cars]  ← Tab selector       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────────┐ ┌───────────────┐ ┌────────────┐    │
│  │ Destination   │ │ Dates         │ │ Travelers  │    │
│  │ City/Airport  │ │ Flexible?     │ │ 2 guests   │    │
│  └───────────────┘ └───────────────┘ └────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │               🔍 Search ZIVO                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Recent: NYC → LAX  |  Miami Hotels  |  ...     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Full-screen backdrop with `blur(20px)` effect
- Animated entry/exit with scale and fade
- Service type tabs (Flights/Hotels/Cars)
- Unified input that adapts based on selected tab
- Recent searches from localStorage
- Premium glassmorphism card styling

### 2. Component Props Interface

```typescript
interface PremiumSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "flights" | "hotels" | "cars";
  onSearch?: (params: URLSearchParams) => void;
}
```

### 3. Animation Specifications

Using framer-motion `AnimatePresence`:
- **Backdrop**: Fade in with blur effect (0ms → 300ms)
- **Card**: Scale from 0.9 → 1.0, slide up 50px
- **Tabs**: Stagger children animation
- **Exit**: Reverse animations for smooth dismissal

### 4. Integration Points

**A. Header Integration**
Modify `src/components/Header.tsx` to open overlay instead of inline search:
- Replace current search overlay (lines 183-199)
- Add overlay state and trigger

**B. Mobile App Home**
Add "Where to?" search trigger in `src/pages/app/AppHome.tsx`:
- Floating search button or hero tap area
- Opens overlay in full-screen mode

**C. Hero Section Option**
Can optionally add trigger in `HeroSection.tsx` for desktop users

### 5. Form Behavior by Tab

| Tab | Input Fields | Autocomplete Data |
|-----|-------------|-------------------|
| Flights | From, To, Dates, Passengers | IATA airports |
| Hotels | Destination, Check-in/out, Guests | City slugs |
| Cars | Pickup Location, Dates | IATA airports |

### 6. Styling Approach

Following ZIVO's design system:
- `bg-white/90 dark:bg-zinc-900/90` - Glassmorphism
- `backdrop-blur-xl` - Heavy blur
- `rounded-3xl` - Premium rounded corners
- `shadow-2xl` - Deep shadow
- `border border-white/20` - Subtle border

### 7. Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/search/PremiumSearchOverlay.tsx` | **Create** - Main overlay component |
| `src/components/search/index.ts` | **Modify** - Export new component |
| `src/components/Header.tsx` | **Modify** - Integrate overlay trigger |
| `src/pages/app/AppHome.tsx` | **Modify** - Add mobile search trigger |

---

## Technical Details

### Framer Motion Animation Config

```typescript
const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(20px)" },
};

const cardVariants = {
  hidden: { y: 50, scale: 0.9, opacity: 0 },
  visible: { y: 0, scale: 1, opacity: 1 },
};
```

### Recent Searches Storage

Store in localStorage with structure:
```typescript
interface RecentSearch {
  type: "flights" | "hotels" | "cars";
  query: string; // Display text
  params: Record<string, string>; // URL params
  timestamp: number;
}
```

### Accessibility

- Focus trap within overlay
- ESC key closes overlay
- Proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- Screen reader announcements

---

## Implementation Order

1. Create `PremiumSearchOverlay.tsx` with basic structure and animations
2. Add tab switching logic and service-specific inputs
3. Integrate existing autocomplete components (`LocationAutocomplete`)
4. Connect to existing search form validation logic
5. Add recent searches functionality
6. Update Header.tsx to use overlay
7. Add mobile trigger in AppHome.tsx
8. Test across desktop and mobile viewports

