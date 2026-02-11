

## Phase 12E: Emoji Cleanup Batch 5 -- Pages, Data Files, and Config

This batch covers ~20 files across pages, data configs, admin components, and hooks that still contain raw emojis.

---

### Batch 1: AppHome and Personalized Hook

| File | Change |
|------|--------|
| `src/hooks/usePersonalizedHome.ts` (lines 24, 29-33) | Replace `emoji` property with `iconName` string. Map: `"coffee"`, `"utensils-crossed"`, `"cup-soda"`, `"moon"`, `"bird"`. Update `TimeContext` interface. |
| `src/pages/app/AppHome.tsx` (line 150, 156, 374, 387, 394, 399, 403) | Update `PersonalizedRow` to accept `iconName` instead of `emoji`. Add icon lookup map for time context icons (`Coffee`, `UtensilsCrossed`, `CupSoda`, `Moon`, `Bird`). Remove emoji from ad banner headline (line 374 -- remove sun emoji). |

---

### Batch 2: TrendingNowSection and CuisinePhotoGrid

| File | Change |
|------|--------|
| `src/components/home/TrendingNowSection.tsx` (lines 12, 24, 36, 48) | Replace `image` emoji strings with Lucide icon names. Map: Tokyo `"landmark"`, Maldives `"palmtree"`, Paris `"landmark"`, NYC-London `"plane"`. Render icons in gradient containers instead of `<span className="text-6xl">` (line 108). |
| `src/components/shared/CuisinePhotoGrid.tsx` (lines 18-25) | Remove unused `emoji` property from `cuisineCategories` array -- emojis are never rendered (photos are used instead). |

---

### Batch 3: Data and Config Files

| File | Change |
|------|--------|
| `src/data/affiliatePartners.ts` (lines 60, 177, 187, 198, 208, 219, 229) | Replace `logo` emojis with Lucide icon name strings: `"plane"`, `"bed-double"`, `"globe"`, `"car"`, `"car-front"`, `"shield"`, `"lock"`. |
| `src/lib/revenueAnalytics.ts` (lines 66-73) | Replace `icon` emojis with Lucide icon name strings: `"plane"`, `"building-2"`, `"car"`, `"car-taxi-front"`, `"ticket"`, `"smartphone"`, `"luggage"`, `"scale"`. |
| `src/hooks/useZivoWallet.ts` (lines 222-231) | Replace `icon` emojis with Lucide icon name strings: `"plane"`, `"car"`, `"car-front"`, `"car-taxi-front"`, `"utensils"`, `"package"`, `"building-2"`, `"ticket"`. Default fallback: `"credit-card"`. |

---

### Batch 4: Flight and Insurance Components

| File | Change |
|------|--------|
| `src/components/flight/AirlinePartnersHub.tsx` (lines 37-47) | Replace `logo` flag/emoji strings with Lucide `"plane"` for all airlines. The component already renders airline codes prominently -- the logo is secondary. |
| `src/components/flight/TravelInsuranceSelector.tsx` (lines 151-155) | Replace `icon` emojis with Lucide icon name strings: `"car"`, `"smartphone"`, `"mountain-snow"`, `"dog"`. |
| `src/components/flight/FlightCurrencyConverter.tsx` (lines 5-11) | Keep flag emojis -- standard UI for currency/country selectors (same decision as CountrySelector). |

---

### Batch 5: Page-Level Emojis

| File | Change |
|------|--------|
| `src/pages/HotelsPage.tsx` (line 304) | Remove moon emoji from "Tonight's Deals" heading. |
| `src/pages/Eats.tsx` (line 130) | Replace fire emoji with inline Lucide `Flame` icon. |
| `src/pages/Terms.tsx` (line 112) | Replace warning emoji with Lucide `AlertTriangle` icon inline. |
| `src/pages/lp/ExtrasLP.tsx` (lines 38, 43, 48) | Replace emoji divs with Lucide icons in gradient containers: `Search`, `BarChart3`, `Sparkles`. |

---

### Batch 6: Admin and Social Proof

| File | Change |
|------|--------|
| `src/components/admin/AdminAnalytics.tsx` (line 283) | Replace `★` character with Lucide `Star` icon inline. |
| `src/components/admin/AdminDriverMessaging.tsx` (lines 444-447) | Replace emoji prefixes in SelectItem labels with Lucide icon names rendered inline: `Info`, `Gift`, `AlertTriangle`, `Siren`. |
| `src/components/car/CarSocialProof.tsx` (lines 6-10) | Replace avatar emojis with Lucide `User` icon in colored circle. Update rendering (line 60). |
| `src/components/maps/MapboxMap.tsx` (line 208) | Replace map emoji in empty state with Lucide `Map` icon in gradient container. |

---

### Technical Details

**usePersonalizedHome.ts refactor:**
```text
// Interface change
interface TimeContext {
  period: TimePeriod;
  headline: string;
  iconName: string;  // was: emoji: string
}

// Data change
{ period: "morning", headline: "Breakfast Spots", iconName: "coffee" }
```

**AppHome PersonalizedRow refactor:**
Add a `timeIcons` lookup alongside the existing `rowIcons` map:
```text
const timeIcons: Record<string, { Icon: typeof Plane; color: string }> = {
  coffee: { Icon: Coffee, color: "text-amber-400" },
  "utensils-crossed": { Icon: UtensilsCrossed, color: "text-orange-400" },
  ...
};
```
The component checks `rowIcons[title]` first, then `timeIcons[iconName]`, eliminating the emoji fallback.

**TrendingNowSection refactor:**
Replace `<span className="text-6xl">{item.image}</span>` with:
```text
<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center">
  <IconComponent className="w-8 h-8 text-primary/80" />
</div>
```

**Config files (affiliatePartners, revenueAnalytics, useZivoWallet):**
These use `icon`/`logo` as strings rendered by consuming components. Changed to Lucide icon name strings. Consumer components should use an icon lookup map (same pattern as CarFeaturedVehicles).

### Summary

| Batch | Files Modified |
|-------|---------------|
| 1: AppHome + hook | 2 |
| 2: Trending + Cuisine | 2 |
| 3: Data/config files | 3 |
| 4: Flight/insurance | 2 (1 kept) |
| 5: Page-level | 4 |
| 6: Admin + social proof | 4 |
| **Total** | **~17 files modified** |

No new files. No database changes. No edge function changes.

