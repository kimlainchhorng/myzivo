

## Phase 12G: Emoji Cleanup Batch 7 -- Final Sweep

This batch covers the remaining ~20 files with raw emojis across hero sections, personalization components, config files, payment UI, baggage selectors, legal pages, and HTML templates.

---

### Batch 1: Hero and Floating Decorations

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `HeroSection.tsx` (lines 49-51) | Car, burger, sparkle floating emojis | `Car`, `UtensilsCrossed`, `Sparkles` in gradient containers |
| `TopTierHero.tsx` (lines 19, 29, 39, 91-103) | `decorativeEmoji` arrays for flights/hotels/cars | Replace arrays with Lucide icon component arrays; render icons at 8% opacity instead of emoji spans |
| `CarRentalDashboard.tsx` (lines 166-171) | Fixed car and sparkle emojis | `Car`, `Sparkles` in gradient containers |
| `InsurancePolicy.tsx` (lines 21-35) | Shield and sparkle floating emojis | `Shield`, `Sparkles` in gradient containers |
| `FlightSettings.tsx` (lines 31, 38, 45) | Gear, sparkle, plane floating emojis | `Settings`, `Sparkles`, `Plane` in gradient containers |

---

### Batch 2: Personalization Component (personalization.tsx)

| Location | Emojis | Change |
|----------|--------|--------|
| Line 131 | `item.emoji || "pin_emoji"` fallback | Replace with `MapPin` icon in gradient container |
| Line 210 | `item.emoji || "heart_emoji"` fallback | Replace with `Heart` icon in gradient container |
| Lines 313-318 | `greetingEmoji()` sun/cloud/moon | Replace with `Sun`, `CloudSun`, `Moon` Lucide icons |
| Line 671 | `emoji || "sparkle_emoji"` fallback | Replace with `Sparkles` icon in gradient container |
| Line 761 | `order.emoji || "utensils_emoji"` fallback | Replace with `UtensilsCrossed` icon in gradient container |

For all five locations, replace the emoji rendering with a Lucide icon inside the existing styled container. The `item.emoji` / `order.emoji` prop checks become `item.iconName` / `order.iconName` checks with a lookup map, falling back to a default Lucide icon.

---

### Batch 3: Config and Data Files

| File | Emojis | Lucide Replacements |
|------|--------|---------------------|
| `zivoPoints.ts` (lines 72, 89, 107) | Tier icon emojis (compass, plane, crown) | Replace with Lucide icon name strings: `"compass"`, `"plane"`, `"crown"` |
| `RewardsProgress.tsx` (lines 7-10, 66, 103) | Tier medal/gem emojis | Replace with Lucide icons: `Medal`, `Award`, `Trophy`, `Gem` rendered in gradient circles |

---

### Batch 4: Flight and Payment Components

| File | Emojis | Change |
|------|--------|--------|
| `PayLater.tsx` (lines 51, 62, 72, 82) | `providerLogo` emojis (credit card, blue/green circles) | Replace with Lucide icon names: `"credit-card"`, `"circle"` with brand colors, or simple text initials |
| `BaggageSelector.tsx` (lines 128, 176-177) | Lightbulb tip emoji, package/ruler detail emojis | Replace lightbulb with Lucide `Lightbulb` icon; package/ruler with `Package`, `Ruler` icons inline |
| `FlexibleDatesCalendar.tsx` (lines 301, 305) | Checkmark and lightbulb emojis | Replace `checkmark` with Lucide `Check` icon; `lightbulb` with `Lightbulb` icon |
| `CarTrustIndicators.tsx` (lines 51-56) | Payment method emojis (credit card, apple, P) | Replace with Lucide `CreditCard`, `Smartphone`, `Wallet` icons |

---

### Batch 5: Hotel and Dashboard

| File | Emojis | Change |
|------|--------|--------|
| `HotelRooms.tsx` (lines 9-13, 104) | Room type emojis (bed, couch, star, family, crown) | Replace with Lucide icon names: `"bed-double"`, `"sofa"`, `"sparkles"`, `"users"`, `"crown"` and render via icon lookup |
| `UnifiedDashboard.tsx` (line 75) | Wave hand emoji in greeting | Replace with Lucide `Hand` icon inline (or remove emoji, keep text only) |

---

### Batch 6: HTML Templates (Keep or Replace)

| File | Emojis | Action |
|------|--------|--------|
| `receiptUtils.ts` (line 46) | Service badge emojis in HTML | Replace with text labels only ("Eats", "Rides", "Travel") -- HTML receipts don't support Lucide |
| `LPComplianceFooter.tsx` (line 27) | Checkmark in compliance text | Replace with Lucide `Check` icon inline |
| `TravelExtras.tsx` (lines 79-248) | `logo` emojis for 15 partner entries | Since each partner already has a proper Lucide `icon` component, remove the `logo` emoji property entirely (it's redundant) or replace with icon name strings |

---

### Technical Details

**personalization.tsx refactor pattern:**
The component currently renders `{item.emoji || "fallback_emoji"}` inside a styled div. Change to:
```text
// Before
<div className="... text-2xl">{item.emoji || "emoji"}</div>

// After
const FallbackIcon = MapPin; // or Heart, Sparkles, etc.
<div className="... flex items-center justify-center">
  <FallbackIcon className="w-6 h-6 text-primary/70" />
</div>
```
If `item.emoji` is passed from parent data, the parent must also be updated to pass `iconName` strings instead. The personalization component adds a lookup map for icon resolution.

**TopTierHero.tsx refactor:**
Replace `decorativeEmoji` string arrays with Lucide icon component arrays:
```text
// Before
decorativeEmoji: ["plane_emoji", "globe_emoji", "takeoff_emoji", "globe2_emoji", "landing_emoji"]

// After
decorativeIcons: [Plane, Globe, PlaneTakeoff, Globe2, PlaneLanding]
```
Render loop changes from `<span>{emoji}</span>` to `<Icon className="w-8 h-8 text-current" />`.

**PayLater.tsx pattern:**
Replace `providerLogo` emoji with `providerIcon` Lucide component:
```text
{ provider: 'ZIVO Pay', providerIcon: CreditCard }
{ provider: 'Klarna', providerIcon: Wallet }
{ provider: 'Affirm', providerIcon: BadgeDollarSign }
```

### Summary

| Batch | Files Modified |
|-------|---------------|
| 1: Hero and floating decorations | 5 |
| 2: Personalization component | 1 |
| 3: Config and rewards | 2 |
| 4: Flight and payment | 4 |
| 5: Hotel and dashboard | 2 |
| 6: HTML templates and extras | 3 |
| **Total** | **~17 files modified** |

No new files. No database changes. No edge function changes.

