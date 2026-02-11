

## Phase 12F: Emoji Cleanup Batch 6 -- Cars, Hotels, Flights, and Config

This batch targets ~20 high-visibility files across car rental pages, hotel components, flight UI, ride forms, and config files.

---

### Batch 1: Car Components (Data-Driven Emojis)

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `CarCategoryGrid.tsx` (lines 18-80) | `icon` emojis for 6 car categories | Replace with Lucide icon name strings: `"car"`, `"car-front"`, `"truck"`, `"crown"`, `"bus"` and render via icon lookup map |
| `CarPopularLocations.tsx` (lines 9-16) | `image` city emojis (palm tree, beach, etc.) | Replace with Lucide icon names: `"palmtree"`, `"umbrella"`, `"landmark"`, `"mountain"`, `"coffee"` in gradient containers |
| `CarRoadTripPlanner.tsx` (lines 14-47) | `image` trip emojis (wave, island, mountain) | Replace with Lucide icon names: `"waves"`, `"route"`, `"palmtree"`, `"mountain"` in emerald gradient containers |
| `CarCustomerStories.tsx` (lines 12-36) | `avatar` people emojis | Replace with Lucide `User` icon in colored circles (same pattern as CarSocialProof) |
| `CarResultCard.tsx` (line 129) | Fallback car emoji | Replace with Lucide `Car` icon in gradient container |

---

### Batch 2: Hotel Components

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `HotelDestinationGuides.tsx` (lines 11-55) | `image` city emojis (Eiffel Tower, temple, etc.) | Replace with Lucide icon names: `"landmark"`, `"building-2"`, `"palmtree"`, `"mountain"` in amber gradient containers |
| `HotelSocialProof.tsx` (lines 6-10) | `avatar` people emojis | Replace with Lucide `User` icon in colored circles |
| `HotelOverview.tsx` (lines 204-224) | Floating hotel/bed/sparkle emojis | Replace with Lucide `Building2`, `BedDouble`, `Sparkles` in gradient containers |

---

### Batch 3: Flight Components

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `FlightHeroSection.tsx` (line 44-48) | Airline `logo` flag emojis | Keep -- flag emojis are standard for country identification |
| `FlightHeroSection.tsx` (lines 303-306) | Cabin class select item emojis | Replace with inline Lucide icons: `Plane`, `Gem`, `Briefcase`, `Crown` |
| `FlightMobileAppPromo.tsx` (line 27) | Large plane emoji in phone mockup | Replace with Lucide `Plane` icon in sky gradient circle |
| `FlightLoyaltyIntegration.tsx` (lines 41-44) | Alliance logo emojis | Replace with Lucide icons: `Star`, `Globe`, `Plane`, `Target` |
| `InFlightServices.tsx` (lines 207-210) | Extra services icon emojis | Replace with Lucide icon names: `"bed-double"`, `"sparkles"`, `"wine"`, `"flower-2"` |
| `FlightTicketCard.tsx` (line 391) | Leaf/plant emoji for CO2 | Replace with Lucide `Leaf` icon inline |
| `FlightReviewsWidget.tsx` (lines 10-34) | `avatar` people emojis | Replace with Lucide `User` icon in colored circles |
| `GroundTransportBooking.tsx` (lines 72-145) | Transport `icon` emojis | Replace with Lucide icon names: `"car"`, `"car-front"`, `"crown"`, `"bus"`, `"truck"` |

---

### Batch 4: Ride, AI, and Shared Components

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `RideRequestForm.tsx` (lines 46-58) | Ride type `icon` emojis | Replace with Lucide icon names: `"car"`, `"car-front"`, `"sparkles"` |
| `SmartRecommendationCard.tsx` (lines 20-27) | `SERVICE_ICONS` emoji map | Replace with Lucide icon name strings: `"plane"`, `"building-2"`, `"car"`, `"car-taxi-front"`, `"utensils"`, `"package"` |
| `NearbyCitySuggestions.tsx` (lines 74-79) | Transit icon emojis | Replace with Lucide icons: `Train`, `Bus`, `Car` |
| `UberLikeRideRow.tsx` (line 160) | Person emoji for seats | Replace with Lucide `User` icon inline |

---

### Batch 5: Config and Data Files

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `loyaltyTiers.ts` (lines 28-79) | Tier medal/gem emojis | Replace with Lucide icon name strings: `"medal"`, `"award"`, `"trophy"`, `"gem"` |
| `HizovoHome.tsx` (lines 25-28) | Destination `image` emojis | Replace with Lucide icon names: `"landmark"`, `"umbrella"`, `"palmtree"`, `"sparkles"` |
| `CarSearch.tsx` (lines 73-93) | Car result `image` emojis | Replace with Lucide icon names: `"car"`, `"zap"`, `"car-front"` |
| `DriverCTASection.tsx` (lines 57-91) | Floating emojis (rocket, star, car, money, trophy) | Replace with Lucide `Rocket`, `Star`, `Car`, `DollarSign`, `Trophy` in gradient containers |
| `CustomerFlights.tsx` (lines 80-88) | Floating cloud/sparkle emojis | Replace with Lucide `Cloud`, `Sparkles` in gradient containers |

---

### Technical Details

**Avatar replacement pattern (reused across CarCustomerStories, HotelSocialProof, FlightReviewsWidget):**
Replace emoji avatars with a deterministic colored `User` icon circle based on the person's name:
```text
const colors = ["bg-sky-500/20 text-sky-400", "bg-violet-500/20 text-violet-400", ...];
const colorIndex = name.charCodeAt(0) % colors.length;
// Render: <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[colorIndex]}`}><User className="w-5 h-5" /></div>
```

**Car/transport icon lookup pattern (reused across CarCategoryGrid, GroundTransportBooking, RideRequestForm):**
Consumer components use a shared icon map:
```text
const transportIcons: Record<string, typeof Car> = {
  car: Car, "car-front": CarFront, bus: Bus, crown: Crown, truck: Truck, ...
};
const IconComp = transportIcons[item.icon] || Car;
```

**Floating emoji replacement pattern:**
```text
Before: <div class="absolute ... text-5xl opacity-40">emoji</div>
After:  <div class="absolute ... opacity-30">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
            <Icon class="w-6 h-6 text-primary/50" />
          </div>
        </div>
```

### Summary

| Batch | Files Modified |
|-------|---------------|
| 1: Car components | 5 |
| 2: Hotel components | 3 |
| 3: Flight components | 7 (1 kept) |
| 4: Ride/AI/Shared | 4 |
| 5: Config and data | 5 |
| **Total** | **~24 files modified** |

No new files. No database changes. No edge function changes.
