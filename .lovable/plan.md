
# Premium Traveler Dashboard Implementation

## Overview

Transform the ZIVO user profile experience with a 2026-era "Holographic Passport" design featuring:

1. **TravelerPassport** - Glassmorphic ID card with avatar, verified badge, and gamified stats
2. **TripTimeline** - Visual journey flow connecting flight to hotel with live weather widget
3. **AI Concierge Widget** - Context-aware floating chat trigger with alert indicators
4. **Premium Dashboard Page** - New `/dashboard` or enhanced `/profile` view

---

## Current State Analysis

### Existing Profile Components
- `src/pages/Profile.tsx` (482 lines) - Form-based profile with avatar upload, quick links, loyalty integration
- `src/pages/TravelTripsPage.tsx` - Tab-based trips list (upcoming/past/cancelled)
- `src/components/flight/MyTripsDashboard.tsx` (727 lines) - Rich trip management with filters, status, ticketing

### Existing Data Hooks
- `useUserProfile` - Profile data (full_name, avatar_url, phone, status)
- `useLoyaltyPoints` - Points balance, tier (standard/bronze/silver/gold), lifetime points
- `useMyTrips` - Travel orders with items and payments
- `useSavedTravelers` - Saved traveler profiles

### Existing Chat Widget
- `LiveChatWidget.tsx` - Floating chat with quick replies
- Uses primary gradient button with pulsing online indicator

### Design System Patterns
- Glass effects: `backdrop-blur-xl`, `bg-card/95`
- Dark glass: `bg-zinc-900/80 backdrop-blur-3xl`
- Status pulses: existing `animate-pulse` with colored dots

---

## Part 1: TravelerPassport Component

### Component: `TravelerPassport.tsx`

Premium profile header styled as a holographic ID card:

**Visual Features:**
- Ambient glow background: `from-blue-600 via-purple-600 to-emerald-600` with blur
- Dark glass card: `bg-zinc-900/80 backdrop-blur-3xl`
- Grainy noise texture overlay for depth
- Status badge (Verified Traveler/Elite/etc.)
- Avatar with verification checkmark

**Stats Grid (3 columns):**
| Stat | Source |
|------|--------|
| Countries Visited | Calculated from travel_orders destinations |
| Miles Flown | Calculated from flight distances (or mock data) |
| ZIVO Rank | Based on loyalty tier + lifetime points |

**Data Integration:**
```typescript
// Hook: useTravelerStats
- Fetches from travel_orders to count unique destinations
- Gets loyalty tier from useLoyaltyPoints
- Calculates rank percentile from tier
```

**Layout:**
```text
+----------------------------------------------------------------+
|  [AVATAR with verified badge]  |  ALEXANDER KAI                |
|                                |  [Verified Traveler] badge    |
|                                |  📍 Based in New York, USA    |
+--------------------------------+-------------------------------+
|  42 Countries  |  128k Miles  |  Top 1% ZIVO Rank             |
+----------------------------------------------------------------+
|                              [Edit Profile] button             |
+----------------------------------------------------------------+
```

---

## Part 2: TripTimeline Component

### Component: `TripTimeline.tsx`

Visual journey flow with connected items:

**Visual Features:**
- Vertical connecting line: gradient from primary to transparent
- Active item: Large colored icon bubble with glow shadow
- Inactive item: Muted icon bubble
- Weather overlay on hotel card

**Timeline Items:**
1. **Flight Card** (active/upcoming)
   - Large blue icon bubble with glow
   - Departure time, flight info grid (flight number, terminal, gate)
   - "Departing Tomorrow" badge

2. **Hotel Card** (connected)
   - Gray icon bubble
   - Weather widget overlay (temp, condition)
   - "Get Directions" CTA button

**Weather Integration:**
- Mock weather data for destination city
- Cloud/sun icon based on condition
- Temperature display

**Data Flow:**
```typescript
// Uses useMyTrips with filter="upcoming"
// Groups items by trip (flight + hotel together)
// Extracts destination for weather lookup
```

---

## Part 3: AI Concierge Widget

### Component: `AIConciergeTrigger.tsx`

Enhanced floating chat button with context awareness:

**Visual Features:**
- White circular button with inset shadow glow
- Notification badge (red dot with count)
- Hover tooltip showing context ("Flight delay alert")
- Pulse animation on alerts

**Context Awareness:**
- Reads upcoming trips to provide relevant quick actions
- Shows alert count for flight delays, booking issues
- Tooltip displays most urgent alert

**Integration with existing LiveChatWidget:**
- Extends or replaces LiveChatWidget trigger
- Passes trip context to chat initialization

---

## Part 4: Premium Dashboard Layout

### New Page: `TravelerDashboard.tsx` or Update: `Profile.tsx`

Two-column layout with premium components:

**Structure:**
```text
+----------------------------------------------------+
|                TRAVELER PASSPORT                   |
|  (Full-width holographic ID card)                  |
+----------------------------------------------------+
| MAIN COLUMN (lg:col-span-8)  | SIDEBAR (lg:span-4)|
+-----------------------------+----------------------+
|  TRIP TIMELINE              | Saved for Later     |
|  - Upcoming journey         | - Saved hotels      |
|  - Flight → Hotel flow      | - Price alerts      |
|                             +----------------------+
|                             | Quick Actions       |
|                             | - Edit profile      |
|                             | - Saved travelers   |
|                             | - Payment methods   |
+-----------------------------+----------------------+
|                AI CONCIERGE TRIGGER (fixed)        |
+----------------------------------------------------+
```

**Dark Theme Handling:**
- Use existing dark mode variables
- Glass effects work in both themes
- Glow effects more prominent in dark mode

---

## Technical Implementation Details

### CSS Additions for index.css

```css
/* Holographic border animation */
.holographic-border {
  position: relative;
}
.holographic-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    hsl(221 83% 53%),
    hsl(262 83% 58%),
    hsl(142 69% 58%)
  );
  opacity: 0.2;
  filter: blur(20px);
  transition: opacity 0.5s;
}
.holographic-border:hover::before {
  opacity: 0.4;
}

/* Grainy texture overlay */
.grainy-texture {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.15;
}

/* Timeline connector */
.timeline-connector {
  position: absolute;
  left: 2.25rem;
  top: 4rem;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    hsl(var(--primary)),
    hsl(var(--muted) / 0.3),
    transparent
  );
}
```

### New Data Hook: useTravelerStats

```typescript
// Calculates:
// - Unique destination countries from travel_orders
// - Total miles (simplified calculation or mock)
// - ZIVO rank percentile based on loyalty tier
```

### Upcoming Trip Extraction

```typescript
// From useMyTrips("upcoming")
// Get first trip with items
// Extract flight details + hotel details
// Group for timeline display
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/profile/TravelerPassport.tsx` | Holographic ID card header |
| `src/components/profile/TripTimeline.tsx` | Visual journey flow |
| `src/components/profile/AIConciergeTrigger.tsx` | Context-aware chat button |
| `src/components/profile/SavedForLater.tsx` | Sidebar saved items |
| `src/hooks/useTravelerStats.ts` | Aggregated traveler statistics |
| `src/pages/TravelerDashboard.tsx` | Premium dashboard page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add holographic, grainy, timeline CSS |
| `src/components/profile/index.ts` | Export new components |
| `src/App.tsx` | Add /dashboard route |

---

## Implementation Order

### Phase 1: Foundation
1. Add CSS utilities (holographic, grainy, timeline)
2. Create `useTravelerStats` hook
3. Create `TravelerPassport` component

### Phase 2: Timeline
4. Create `TripTimeline` component
5. Create mock weather utility
6. Wire up to `useMyTrips` data

### Phase 3: Concierge & Sidebar
7. Create `AIConciergeTrigger` component
8. Create `SavedForLater` sidebar component
9. Export profile components

### Phase 4: Dashboard Integration
10. Create `TravelerDashboard.tsx` page
11. Add route to `App.tsx`
12. Link from existing navigation

---

## Mock Weather Data Strategy

Since real weather API isn't integrated, use a mock system:
```typescript
const mockWeatherByCity: Record<string, Weather> = {
  'London': { temp: '12°C', condition: 'Rainy', icon: CloudRain },
  'New York': { temp: '18°C', condition: 'Sunny', icon: Sun },
  'Tokyo': { temp: '22°C', condition: 'Cloudy', icon: Cloud },
  // Default fallback
  'default': { temp: '20°C', condition: 'Clear', icon: Sun },
};
```

---

## Files Summary

### New Files (6)
| File | Type |
|------|------|
| `src/components/profile/TravelerPassport.tsx` | Profile Component |
| `src/components/profile/TripTimeline.tsx` | Profile Component |
| `src/components/profile/AIConciergeTrigger.tsx` | Widget Component |
| `src/components/profile/SavedForLater.tsx` | Sidebar Component |
| `src/hooks/useTravelerStats.ts` | Data Hook |
| `src/pages/TravelerDashboard.tsx` | Page Component |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/index.css` | Add holographic/grainy/timeline CSS |
| `src/components/profile/index.ts` | Create exports file |
| `src/App.tsx` | Add /dashboard route |
