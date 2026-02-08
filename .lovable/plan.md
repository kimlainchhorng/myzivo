

# ZIVO Mobile Home - New Minimal Design

## Overview
Redesign the mobile home page (`AppHome.tsx`) with a clean, minimal dark aesthetic. The new design removes the complex bento grid and image-heavy cards in favor of a simple, fast-loading interface.

---

## Current State

The existing `AppHome.tsx` features:
- Image-heavy service cards with gradients
- Live activity "island" (Book a Ride promo)
- Premium scroll animations with framer-motion
- Bento grid with uneven sizing
- Light-themed floating cards

---

## New Design Specification

### Visual Style
| Element | Current | New |
|---------|---------|-----|
| Background | `bg-zinc-950` | `bg-black` (pure black) |
| Header | Complex gradient + avatar | Simple greeting + minimal avatar |
| Search | Glass effect + icon stack | Simple rounded input |
| Grid | Bento (uneven) with images | 2x3 uniform grid, no images |
| Cards | Image backgrounds + overlays | Solid `bg-gray-900` with text only |
| Animations | Framer-motion heavy | CSS transitions only |

### Layout
```text
┌─────────────────────────────────────┐
│  Good Morning         [Avatar]      │  ← Header
│  Traveler                           │
├─────────────────────────────────────┤
│  [   Where to?                   ]  │  ← Search Input
├─────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐      │  ← Services Grid
│  │   Rides   │  │   Eats    │      │
│  └───────────┘  └───────────┘      │
│  ┌───────────┐  ┌───────────┐      │
│  │   Move    │  │  Flights  │      │
│  └───────────┘  └───────────┘      │
│  ┌───────────┐  ┌───────────┐      │
│  │  Hotels   │  │   Cars    │      │
│  └───────────┘  └───────────┘      │
└─────────────────────────────────────┘
```

---

## Implementation Details

### File: `src/pages/app/AppHome.tsx`

**Complete Redesign:**

1. **Header Section**
   - Time-based greeting ("Good Morning/Afternoon/Evening")
   - User name display (from email or "Traveler")
   - Circular avatar placeholder (gray-800 background)

2. **Search Bar**
   - Simple input with "Where to?" placeholder
   - Rounded corners (`rounded-xl`)
   - Background: `bg-gray-800`
   - Full width with padding

3. **Services Grid**
   - 2-column, 3-row grid (`grid-cols-2`)
   - Equal-sized cards
   - Services: Rides, Eats, Move, Flights, Hotels, Cars
   - Each card: `bg-gray-900`, `rounded-2xl`, `p-6`
   - Text-only content (service name)

4. **Navigation**
   - Keep existing `ZivoMobileNav` at bottom

---

## Code Structure

```tsx
// Simplified component structure
export default function AppHome() {
  return (
    <div className="bg-black text-white min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400 text-sm">{greeting}</p>
          <h1 className="text-xl font-semibold">{userName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800" />
      </div>

      {/* Search */}
      <input
        placeholder="Where to?"
        className="w-full p-4 rounded-xl bg-gray-800 mb-6"
        onClick={() => navigate("/search")}
        readOnly
      />

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-4">
        {services.map(item => (
          <button 
            key={item.id} 
            onClick={() => navigate(item.path)}
            className="bg-gray-900 p-6 rounded-2xl text-left"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Bottom Nav */}
      <ZivoMobileNav />
    </div>
  );
}
```

---

## Services Configuration

| Service | Route |
|---------|-------|
| Rides | `/rides` |
| Eats | `/eats` |
| Move | `/move` |
| Flights | `/search?tab=flights` |
| Hotels | `/search?tab=hotels` |
| Cars | `/rent-car` |

---

## Dependencies Removed

The new simplified design removes:
- `framer-motion` animations from this page
- Image assets (`flightsHeroImg`, Unsplash URLs)
- Complex ServiceCard/DarkCard components
- Premium/Quick Actions sections

---

## Testing Checklist
- Verify all 6 service cards navigate correctly
- Confirm search bar opens `/search` page
- Check greeting changes based on time of day
- Ensure bottom navigation remains functional
- Test on mobile viewport for proper padding/spacing
- Verify dark theme contrast is readable

