

## Phase 12D: Emoji Cleanup Batch 4 -- Deep Components, Config Files, and Data Hooks

This batch targets the remaining ~20 files still using raw emojis: ride/driver sections, customer pages, config registries, data hooks, rating modals, AI trip planner, restaurant menus, and miscellaneous UI components.

---

### Batch 1: Ride and Driver Sections (Floating Emojis)

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `RideOptionsSection.tsx` (lines 76-81) | car emoji, lightning emoji floating | `Car`, `Zap` in gradient containers |
| `DriverCTASection.tsx` (lines 84-92) | car, money bag, trophy emojis floating | `Car`, `DollarSign`, `Trophy` in gradient containers |
| `CustomerRides.tsx` (lines 53-72) | car, sparkle, map pin floating emojis | `Car`, `Sparkles`, `MapPin` in gradient containers |
| `CarRentalDashboard.tsx` (lines 166-171) | car, sparkle fixed-position emojis | `Car`, `Sparkles` in gradient containers |

---

### Batch 2: Data-Driven Emoji Props in Hooks and Config

| File | Data Structure | Change |
|------|---------------|--------|
| `useRealCarSearch.ts` (lines 76-83) | `categories[].icon` car emojis | Replace with Lucide icon name strings (`"car"`, `"car-front"`, `"truck"`) |
| `useUnifiedTrips.ts` (lines 68, 116, 166, 191) | `icon` emoji assignments for trip types | Replace with Lucide icon name strings |
| `affiliateRegistry.ts` (lines 67-95) | `logo` emojis for all partner arrays | Replace with Lucide icon name strings (`"plane"`, `"building-2"`, `"car"`, etc.) |
| `platformMoat.ts` (lines 112-120) | `verticals[].icon` emojis | Replace with Lucide icon name strings |

---

### Batch 3: Interactive Components

| File | Emojis | Change |
|------|--------|--------|
| `RatingModal.tsx` (lines 77, 82-87, 97) | Rating face emojis, service icon emojis, confetti emojis | Replace faces with Lucide mood icons (`Frown`, `Meh`, `Smile`, `SmilePlus`, `PartyPopper`); service icons with `Car`, `Pizza`, `Building2`, `CarFront`, `Plane`; confetti with `PartyPopper`, `Star`, `Sparkles`, `Trophy` |
| `RideRequestForm.tsx` (lines 41-59) | Ride type icon emojis | Lucide `Car`, `Truck`, `Crown` icons |
| `AirportTransferBridge.tsx` (lines 25-52) | Transfer option icon emojis | Lucide `Bus`, `Car`, `Crown` icons |
| `RestaurantMenu.tsx` (lines 12-18) | Menu item emojis | Lucide food icons (`Pizza`, `Soup`, `Cake`, `Salad`, `Croissant`) in orange gradients |

---

### Batch 4: Remaining Miscellaneous

| File | Emojis | Change |
|------|--------|--------|
| `FloatingServiceIcons.tsx` (lines 73-80) | `defaultFloatingIcons` emoji array + `FloatingIcon` component | Refactor to accept Lucide icon components; update defaults to `Car`, `UtensilsCrossed`, `Plane`, `Building2`, `CarTaxiFront`, `Pizza` |
| `SpatialCursor.tsx` (lines 88-90) | Flight, hotel, car emojis in cursor | Lucide `Plane`, `Building2`, `Car` icons (small inline) |
| `FlightDetailsModal.tsx` (line 70) | Plane emoji fallback | Lucide `Plane` icon |
| `FlightSchedules.tsx` (lines 46-60) | Plane, sparkle, takeoff emojis floating | Lucide `Plane`, `Sparkles`, `PlaneTakeoff` in gradient containers |
| `AITripPlanner.tsx` (lines 38-47) | Interest option emojis | Lucide icons: `Umbrella`, `Landmark`, `Mountain`, `UtensilsCrossed`, `PartyPopper`, `TreePine`, `ShoppingBag`, `Heart` |
| `RestaurantOverview.tsx` (lines 190-204) | Floating pizza/burger emojis | Lucide `Pizza`, `UtensilsCrossed` in orange gradient containers |
| `CarFeaturedVehicles.tsx` (lines 30-64) | Car image emojis | Lucide `Crown`, `Truck`, `Car`, `CarFront` in emerald gradients |
| `HizovoHome.tsx` (line 64) | Plane emoji in greeting text | Remove emoji from greeting string |

---

### Batch 5: Backend/Email/Config (Keep or Replace)

| File | Emojis | Action |
|------|--------|--------|
| `useInvoicePdfExport.ts` (line 177) | Plane emoji in HTML invoice logo | Replace with SVG plane icon in HTML string |
| `send-travel-email/index.ts` | Plane emojis in email HTML | Replace with HTML entity or simple text -- emails don't support Lucide |
| `useLaunchSettings.ts` (line 76) | Rocket emoji in toast | Keep -- toast is ephemeral |
| `useAutoRewards.ts` | Party emoji in toast | Keep -- toast is ephemeral |
| `useEatsArrivalAlert.ts` | Car emoji in toast | Keep -- toast is ephemeral |
| `referralProgram.ts` (line 75) | Party emoji in share text | Keep -- social share message |
| `LaunchAnnouncements.tsx` (lines 50-52) | Emojis in social share text | Keep -- social share messages |
| `CountrySelector.tsx` | `flag_emoji` property | Keep -- flag emojis are standard UI for country selectors |

---

### Technical Details

**FloatingServiceIcons.tsx refactor:**
Change `FloatingIcon` to accept a Lucide icon component instead of an emoji string. The `defaultFloatingIcons` array changes from `{ emoji: "car_emoji" }` to `{ icon: Car, iconColor: "text-emerald-400", iconBg: "from-emerald-500/20 to-teal-500/20" }`.

**Config file pattern (affiliateRegistry, platformMoat):**
These files use `logo`/`icon` as strings that may be rendered elsewhere. Replace emoji strings with Lucide icon name strings (e.g., `"plane"`, `"building-2"`). Consumer components will map these to Lucide icons via a lookup.

**RatingModal refactor:**
Replace `ratingEmojis` array with Lucide icon components:
```text
Before: ['', 'sad_face', 'neutral_face', 'slight_smile', 'smile', 'star_struck']
After:  [null, Frown, Meh, Smile, SmilePlus, PartyPopper]
```
Replace `confettiEmojis` with icon components rendered in small colored circles.

**Email HTML (send-travel-email):**
Since Lucide icons cannot be used in email HTML, replace emoji characters with plain text markers or inline SVG paths.

### Summary

| Batch | Files Modified |
|-------|---------------|
| 1: Ride/Driver floating emojis | 4 |
| 2: Data hooks and config | 4 |
| 3: Interactive components | 4 |
| 4: Miscellaneous UI | 8 |
| 5: Backend/email (selective) | 2 modified, 5 kept |
| **Total** | **~22 files modified** |

No new files. No database changes. No edge function changes.

