

# Upgrade Customer Home Screen and Booking Flow (2026 UX)

Redesign the mobile `AppHome.tsx` to feel like a premium 2026 travel super-app with richer content sections, smarter previews, and a cleaner visual hierarchy.

## What Changes

### 1. Saved Places Row (below search bar)
Add a horizontal row of saved locations (Home, Work, plus any user-saved places) directly under the search bar. Each is a compact pill with an icon and label that navigates to the Rides page with the destination pre-selected. Shows "Add" pill if user has fewer than 2 saved places.

### 2. Upgraded Quick Actions Grid
Enlarge the 3x2 service grid cards with slightly bigger icons and subtle shadow depth. Add a thin accent line at the top of each card matching the service color for visual pop.

### 3. Popular Services Section (new)
Add a new horizontal scroll section titled "Popular Near You" with three card types:
- **Popular Restaurants** -- pull top-rated from the `restaurants` table, show image + name + rating + cuisine
- **Popular Destinations** -- use destination photos from `config/photos`, show city image + name + "from $X" label
- **Trending Rides** -- show popular ride routes (static data: "Airport Transfer", "Downtown", "Beach") with estimated price and ETA preview

Each card is a large (160px wide) rounded card with image, gradient overlay, and info at the bottom.

### 4. Smart ETA and Price Preview
Add a "Quick Estimate" card near the top (below saved places) that shows:
- Estimated pickup time based on time of day (e.g., "~4 min pickup" during normal hours, "~8 min" during peak)
- A price preview for a standard ride ("~$12-18 to Downtown")
- Tapping opens the Rides booking flow

This uses simple time-of-day logic (no API call needed) to give users a feel for pricing before they commit.

### 5. Visual Polish
- Larger card corner radius (rounded-3xl on featured cards)
- Verdant/emerald theme accents on section headers
- Smoother spacing between sections (gap-6 instead of mb-5)
- Section dividers using subtle gradient lines
- Cards use `shadow-sm hover:shadow-md` for depth

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/pages/app/AppHome.tsx` | Add saved places row, popular services section, quick estimate card, visual polish upgrades |

### Data Sources
- **Saved places**: Already fetched via `useSavedLocations(user?.id)` (line 110)
- **Popular restaurants**: Already fetched via `usePersonalizedHome()` `recommended` array (line 106)
- **Destinations**: Import `destinationPhotos` from `@/config/photos`
- **ETA/Price preview**: Simple time-of-day calculation (no new hooks needed)

### New Section Order (top to bottom)
1. Header (greeting + avatar + bell)
2. Search bar
3. Saved places pills (Home, Work, +Add)
4. Quick Estimate card (ETA + price preview)
5. Quick Actions grid (3x2)
6. Popular Near You (horizontal scroll: restaurants, destinations, rides)
7. Promo carousel
8. Rewards card
9. Referral card
10. Scheduled bookings
11. Wallet summary
12. Recently Used
13. Favorites
14. Recommendations

### No New Dependencies
All data hooks and components already exist. The upgrade is purely layout and UI restructuring within `AppHome.tsx`.

