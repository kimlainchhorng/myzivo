

## Phase 12C: Emoji Cleanup Batch 3 -- High-Traffic Components

This update targets the most visible remaining emoji files: floating decorations on marketing sections, data-driven partner/trending components, car flash deals, cross-sell hooks, and the Index.tsx ad banner text emoji.

---

### Batch 1: Floating Decoration Emojis (Marketing Sections)

Replace floating emoji decorations with styled Lucide icon containers across 5 section components:

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `StatsSection.tsx` (lines 165-170) | chart emoji, rocket emoji | `BarChart3`, `Rocket` in gradient containers |
| `FeaturesSection.tsx` (lines 65-67) | lightning, target, sparkle | `Zap`, `Target`, `Sparkles` in gradient containers |
| `AppDownloadSection.tsx` (lines 29-34) | phone, download arrow | `Smartphone`, `Download` in gradient containers |
| `CarRentalSettings.tsx` (lines 33-38) | gear, sparkle | `Settings`, `Sparkles` in gradient containers |
| `Index.tsx` (line 115) | wave emoji in text string | Remove emoji from ad headline text |

Pattern for each floating decoration:
```text
Before: <div class="absolute ... text-4xl opacity-40">emoji_char</div>
After:  <div class="absolute ... opacity-30">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
            <Icon class="w-6 h-6 text-primary/50" />
          </div>
        </div>
```

---

### Batch 2: Data-Driven Emoji Props

Replace emoji properties in data arrays/objects with Lucide icon references:

| File | Data Structure | Change |
|------|---------------|--------|
| `TrendingSection.tsx` | `defaultTrendingServices[].emoji` + floating emojis | Replace with Lucide icon components (`Plane`, `Flame`, `Palmtree`) |
| `CarFlashDeals.tsx` | `deals[].image` (car emojis) | Replace with Lucide `Car`, `Zap`, `Truck`, `Crown` in emerald gradient |
| `CarPartnerTrustStrip.tsx` | `carPartners[].emoji` | Replace with Lucide `Car`, `Key`, `Truck`, `Crown`, `Compass` icons |
| `useCrossSellSuggestions.ts` | `icon` property (car, hotel, burger, taxi emojis) | Replace with Lucide icon name strings rendered by consumer |
| `CarResultsPage.tsx` (line 515) | Empty state car emoji | Replace with Lucide `Car` in gradient circle |

---

### Batch 3: Flight Components

| File | Emojis | Change |
|------|--------|--------|
| `FlightTicketCard.tsx` (line 149) | Plane emoji fallback for airline logo | Lucide `Plane` icon in sky gradient |
| `FlightTicketCard.tsx` (line 339) | Fire emoji for "seats left" urgency | Lucide `Flame` icon inline |
| `AirportAutocomplete.tsx` (lines 79-85) | Flag/globe emojis for regions | Lucide `Globe`, `MapPin` variants |

---

### Batch 4: Other Components

| File | Emojis | Change |
|------|--------|--------|
| `UnifiedSearchHub.tsx` (lines 39-40) | Flag emojis for trending destinations | Lucide `MapPin` in colored circles |
| `MapboxMap.tsx` (lines 116-118) | Car and pin emojis for map markers | Styled div markers with Lucide icons |
| `RideCard.tsx` (line 69) | Fire emoji for surge pricing | Lucide `Flame` icon |

---

### Technical Details

**TrendingSection.tsx refactor:**
The component currently accepts an `emoji` prop as a string. This will be changed to accept a Lucide icon component reference (e.g., `icon: Plane`). The `TrendingServiceCard` sub-component renders the icon in a gradient circle instead of a raw text span.

**useCrossSellSuggestions.ts refactor:**
The `icon` property changes from emoji strings to Lucide icon name strings (e.g., `"car"`, `"hotel"`, `"utensils"`). The consuming component maps these to Lucide components.

**MapboxMap.tsx markers:**
Replace `el.innerHTML = "emoji"` with a small styled div containing an SVG icon element, maintaining the same absolute positioning on the map.

### Summary

| Batch | Files Modified |
|-------|---------------|
| 1: Floating decorations | 5 |
| 2: Data-driven props | 5 |
| 3: Flight components | 2 |
| 4: Other components | 3 |
| **Total** | **15 files** |

No new files. No database changes. No edge function changes.
