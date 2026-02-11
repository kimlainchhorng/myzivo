

## Home Screen Redesign

Restructure AppHome.tsx to follow the requested layout: a large promotion banner at the top, a clean 6-service grid, and three horizontal scrolling sections.

---

### New Layout Order

```text
+----------------------------------+
| Top Bar (greeting + bell)        |
+----------------------------------+
| Large Promo Banner               |
| (gradient, CTA, full-width)     |
+----------------------------------+
| Services Grid (3x2)             |
| Ride    | Eats                   |
| Delivery| Flights                |
| Hotels  | Rentals                |
+----------------------------------+
| Popular Restaurants  [scroll ->] |
+----------------------------------+
| Travel Deals         [scroll ->] |
+----------------------------------+
| Nearby Rides         [scroll ->] |
+----------------------------------+
| Bottom Nav                       |
+----------------------------------+
```

---

### Changes (single file: `src/pages/app/AppHome.tsx`)

**1. Large Promo Banner** -- Replace the current search bar + "Explore the World" heading with a large, full-width promotional banner:
- Verdant green gradient background (`from-primary to-emerald-400`)
- Large bold headline: "Travel smarter. Save more."
- Subtitle: "Get up to 50% off flights, hotels, and rides"
- CTA button: "Explore Deals" linking to `/search`
- Search bar moved below the banner as a secondary element

**2. Services Grid** -- Keep the existing 6-card grid (Ride, Eats, Delivery, Flights, Hotels, Rentals) but move it directly after the promo banner. Remove the "border-t" divider above it for a cleaner flow.

**3. Remove or relocate existing sections:**
- Remove: Trending Destinations horizontal scroll (replaced by Travel Deals)
- Remove: WinBackBanner (consolidated into promo banner)
- Remove: HomepageAdBanner (consolidated into promo banner)
- Keep: Personalized restaurant rows but rename/restructure into the 3 scrolling sections

**4. Three scrolling sections:**

| Section | Data Source | Content |
|---------|-----------|---------|
| Popular Restaurants | `recommended` from `usePersonalizedHome` + `timeSuggestions` merged | Restaurant cards (existing `RestaurantCard`) |
| Travel Deals | `SmartOffersSection` (signed-in) or `RecommendedDealsSection` (signed-out), rendered inline | Deal cards in horizontal scroll |
| Nearby Rides | Static quick-action cards showing ride options (Economy, Comfort, Premium) with estimated prices, linking to `/rides` | New simple horizontal scroll row |

**5. Quick Actions** -- Move below the three scrolling sections, keep existing grid for auth-gated users.

---

### Technical Details

**Promo Banner component (inline in AppHome):**
```text
<div className="mx-4 mt-2 mb-4 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 p-6 text-white">
  <h2 className="text-2xl font-bold mb-1">Travel smarter. Save more.</h2>
  <p className="text-sm opacity-90 mb-4">Get up to 50% off flights, hotels, and rides</p>
  <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl text-sm">
    Explore Deals
  </button>
</div>
```

**Nearby Rides row** -- New static data array with 3 ride types rendered as horizontal scroll cards:
```text
const rideOptions = [
  { type: "Economy", eta: "3 min", price: "~$8", icon: Car },
  { type: "Comfort", eta: "5 min", price: "~$14", icon: Car },
  { type: "Premium", eta: "7 min", price: "~$22", icon: Car },
];
```
Each rendered as a white card with border, icon, type name, ETA, and estimated price.

**Section headers** -- Each scrolling section gets a consistent header with icon + title + "See all" link:
```text
<div className="flex items-center justify-between mb-2">
  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
    <Icon /> Title
  </h2>
  <button className="text-xs text-primary font-semibold">See all</button>
</div>
```

---

### Summary

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/app/AppHome.tsx`) |
| Sections removed | Trending Destinations, WinBackBanner, HomepageAdBanner |
| Sections added | Large Promo Banner, Nearby Rides scroll row |
| Sections restructured | Personalized rows consolidated, Smart/Recommended Deals made inline horizontal |

