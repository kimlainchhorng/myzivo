

# Universal Search — Cross-Service Search Hub

## Overview

Replace the current search bar behavior on the mobile home screen with a full-screen Universal Search overlay that searches across all ZIVO services (Eats, Rides, Hotels, Flights, Rentals, Delivery) from a single input, with suggestion sections and result tabs.

## Current State

- The home screen search bar (`AppHome.tsx` line 257) navigates to `/search` (the travel search page with Flights/Hotels/Cars tabs)
- The existing `PremiumSearchOverlay` is a full-screen overlay but only covers Flights, Hotels, and Cars — no Eats, Rides, or Delivery
- Recent searches are stored in localStorage under `zivo_recent_searches`
- Restaurant data is available via `eatsApi.ts` (`getRestaurants`)
- No unified cross-service search exists

## What Changes

### New File: `src/components/search/UniversalSearchOverlay.tsx`

A full-screen overlay triggered from the home screen search bar. Contains:

**Search Input**: Placeholder reads "Search food, rides, hotels, flights..."

**Suggestion Sections** (shown when input is empty):
1. **Recent Searches** — loaded from localStorage (`zivo_recent_searches`), same format as existing, displayed with service-specific icons and colors
2. **Popular Services** — static list of 6 service pills (Ride, Eats, Delivery, Flights, Hotels, Rentals) that navigate directly to each service
3. **Nearby Restaurants** — fetches top 5 active restaurants from Supabase `restaurants` table via `eatsApi.getRestaurants()`, displayed as compact cards with name and cuisine type

**Result Tabs** (shown when input has text):
Tabs: All | Eats | Rides | Hotels | Flights | Rentals

Filtering logic (client-side, lightweight):
- **Eats**: Searches restaurants table by name (case-insensitive `ilike`)
- **Rides**: Matches if query contains ride-related keywords — shows a "Book a ride to [query]" action card
- **Hotels**: Shows "Search hotels in [query]" action card linking to `/search?tab=hotels`
- **Flights**: Shows "Search flights to [query]" action card linking to `/search?tab=flights`
- **Rentals**: Shows "Rent a car in [query]" action card linking to `/rent-car`
- **All tab**: Combines all of the above

This keeps it fast — restaurant results come from a single Supabase query, while other services show smart action cards that deep-link to the appropriate service page.

### Updated File: `src/pages/app/AppHome.tsx`

- Import `UniversalSearchOverlay`
- Add `isSearchOpen` state
- Change the search bar button from `navigate("/search")` to `setIsSearchOpen(true)`
- Render `<UniversalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />`

### Updated File: `src/components/search/index.ts`

- Add export for `UniversalSearchOverlay`

## Technical Detail

### UniversalSearchOverlay structure

```text
Props:
  isOpen: boolean
  onClose: () => void

State:
  query: string (search input)
  activeTab: "all" | "eats" | "rides" | "hotels" | "flights" | "rentals"

Queries:
  1. Restaurant search (React Query)
     - queryKey: ["universal-search-restaurants", debouncedQuery]
     - Calls supabase.from("restaurants").select("id, name, cuisine_type, logo_url")
       .ilike("name", `%${query}%`).eq("status", "active").limit(5)
     - enabled: query.length >= 2
     - staleTime: 30_000

  2. Nearby restaurants (React Query)
     - queryKey: ["nearby-restaurants"]
     - Calls supabase.from("restaurants").select("id, name, cuisine_type, logo_url")
       .eq("status", "active").order("rating", { ascending: false }).limit(5)
     - enabled: query === "" (only when suggestions are shown)
     - staleTime: 60_000
```

### Tab filtering in "All" view

When the user types a query, each service generates result cards:

| Service | Result Card | Action |
|---|---|---|
| Eats | Restaurant name + cuisine from DB | Navigate to `/eats/restaurant/:id` |
| Rides | "Book a ride to [query]" | Navigate to `/rides?dropoff=[query]` |
| Hotels | "Search hotels in [query]" | Navigate to `/search?tab=hotels` |
| Flights | "Search flights to [query]" | Navigate to `/search?tab=flights` |
| Rentals | "Rent a car in [query]" | Navigate to `/rent-car?pickup=[query]` |

The "All" tab shows all of these together. Individual tabs filter to just that service type.

### Visual Design

- Full-screen overlay matching existing dark theme (zinc-950)
- AnimatePresence slide-up animation (consistent with PremiumSearchOverlay)
- Auto-focus on input when opened
- ESC key and back button to close
- Body scroll lock when open
- Tab bar uses horizontal scroll with service-colored active states
- 300ms debounce on search input before querying restaurants

## File Summary

| File | Action | What |
|---|---|---|
| `src/components/search/UniversalSearchOverlay.tsx` | Create | Full-screen universal search with suggestions, restaurant search, action cards, and 6 result tabs |
| `src/pages/app/AppHome.tsx` | Update | Wire search bar to open the overlay instead of navigating to /search |
| `src/components/search/index.ts` | Update | Add UniversalSearchOverlay export |

Three file changes total. Restaurant data comes from existing Supabase table. Other services use smart action cards that deep-link — no new APIs needed.
