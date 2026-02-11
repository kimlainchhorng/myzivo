

## Home Screen Enhancement: New Sections

Add four new sections to AppHome.tsx between the Services Grid and the existing scrolling sections, using data from existing hooks.

---

### New Layout Order

```text
Top Bar (greeting + bell)
Promo Banner
Search Bar
Services Grid (3x2)
--- NEW SECTIONS ---
Quick Actions Bar (horizontal: Book Ride, Order Food, Track Order, Book Flight)
Recently Used (horizontal scroll: last rides, restaurants, bookings)
Favorites (horizontal scroll: saved restaurants/hotels/locations)
Smart Recommendations (horizontal scroll: personalized restaurants + deals)
--- EXISTING (kept) ---
Popular Restaurants
Travel Deals
Nearby Rides
Bottom Nav
```

---

### 1. Quick Actions Bar

A horizontal row of 4 large pill-shaped buttons below the services grid:

| Button | Icon | Route |
|--------|------|-------|
| Book Ride | Car | `/rides` |
| Order Food | Utensils | `/eats` |
| Track Order | Package (or MapPin) | `/trips` |
| Book Flight | Plane | `/search?tab=flights` |

**Design**: White card with verdant green icon circle, large rounded corners, horizontal scroll on smaller screens.

Remove the existing auth-gated "Quick Actions" grid at the bottom (lines 382-424) since this replaces it.

---

### 2. Recently Used Section

**Data source**: `useRecentlyViewed()` hook (already exists in `src/hooks/useRecentlyViewed.ts`) which queries `user_recently_viewed` table.

**Cards**: Horizontal scroll of white rounded cards showing:
- Type icon badge (Hotel/Flight/Car/Restaurant) with color coding
- Item name and location/details from `item_data`
- "Viewed X ago" timestamp
- Tap navigates to relevant detail page

**Fallback**: If no items or user not signed in, section is hidden.

---

### 3. Favorites Section

**Data source**: `usePersonalizedHome().favorites` (already fetched -- restaurant favorites from `user_favorites` table) plus `useSavedLocations()` for location favorites.

**Cards**: Horizontal scroll of white rounded cards:
- Restaurant favorites: image, name, cuisine, rating
- Location favorites: icon, label, address
- Tap navigates to restaurant or location detail

**Fallback**: If no favorites, show a small prompt card "Save your favorite spots" with a heart icon.

---

### 4. Smart Recommendations

**Data source**: `usePersonalizedHome().recommended` (already fetched -- cuisine-matched, behavior-scored restaurants) merged with top travel deals from `useRecommendedDeals`.

**Cards**: Horizontal scroll with a "Sparkles" icon header:
- Restaurant recommendations: same RestaurantCard component with a subtle "Recommended" badge
- Travel deal cards interspersed

**Fallback**: Falls back to top-rated restaurants (already handled in the hook).

---

### Technical Details

**File modified**: `src/pages/app/AppHome.tsx`

**New imports needed**:
- `useRecentlyViewed` from `@/hooks/useRecentlyViewed`
- `useSavedLocations` from `@/hooks/useSavedLocations`
- `Heart`, `History` icons from lucide-react

**Hook calls to add** (inside AppHome component):
```
const { items: recentItems } = useRecentlyViewed();
const { data: savedLocations } = useSavedLocations(user?.id);
```

`favorites` and `recommended` are already available from `usePersonalizedHome()` -- just destructure them (they are currently unused in the render).

**Quick Actions Bar** -- inline static array:
```
const quickActionsBar = [
  { label: "Book Ride", icon: Car, href: "/rides", bg: "bg-primary/10", color: "text-primary" },
  { label: "Order Food", icon: Utensils, href: "/eats", bg: "bg-orange-500/10", color: "text-orange-500" },
  { label: "Track Order", icon: Package, href: "/trips", bg: "bg-violet-500/10", color: "text-violet-500" },
  { label: "Book Flight", icon: Plane, href: "/search?tab=flights", bg: "bg-sky-500/10", color: "text-sky-500" },
];
```

Rendered as a horizontal flex row of tap-able pills with icon + label.

**Recently Used cards** -- each card renders based on `item_type` (hotel, flight, car, restaurant) with appropriate icon and color badge, item name from `item_data.name`, and relative time using `date-fns formatDistanceToNow`.

**Sections removed**: The existing auth-gated Quick Actions grid at lines 382-424 (Reorder, Rebook Ride, Upcoming Bookings) will be removed since the new Quick Actions Bar and Recently Used section replace this functionality.

---

### Summary

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/app/AppHome.tsx`) |
| New sections | 4 (Quick Actions Bar, Recently Used, Favorites, Smart Recommendations) |
| Sections removed | 1 (old Quick Actions grid) |
| New hook imports | 2 (`useRecentlyViewed`, `useSavedLocations`) |
| Existing hooks reused | `usePersonalizedHome` (favorites, recommended), `useRecommendedDeals` |
