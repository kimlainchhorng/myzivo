

# Upgrade Ride Selection UI -- Premium & Polished Look

## What Changes

### 1. Richer Card Design for All Tiers

**Economy cards** currently look flat with minimal styling. Upgrade to:
- Slightly elevated cards with soft inner shadow and a subtle emerald left-side accent bar
- Better spacing between car icon, text, and price
- Add a small "Pickup at" time label below price for context

**Premium cards** upgrade:
- Add a subtle gold shimmer gradient overlay on hover/selected
- Gold left accent bar instead of border-only approach
- Show the subtitle (e.g., "Leather seats, quiet ride") more prominently with an italic style
- Larger, more prominent star badge

**Elite cards** upgrade:
- Rich purple-to-black gradient with a visible purple left accent bar
- Glowing purple border on selected (brighter than current)
- Crown icon more prominent with gold fill
- Subtitle text in a brighter color (white/gold) so it's actually readable
- Price in bright gold (`text-amber-300`) for strong contrast

### 2. Better Car Icons

- Make car thumbnails slightly larger with a colored background circle/pill behind them
- Economy: light emerald circle background
- Premium: dark charcoal circle with gold ring
- Elite: dark purple circle with gold ring

### 3. Improved Category Tabs

- Make tabs slightly taller with more padding
- Add a subtle bottom indicator line for the active tab (like Uber)
- Economy inactive: lighter, more clickable appearance
- Premium/Elite inactive tabs: remove the dark `bg-zinc-800/900` -- use a lighter semi-transparent approach so they don't look like holes in the UI

### 4. Section Headers for Premium/Elite

- When Premium tab is active, show a small "Premium Collection" header with a star icon and gold text
- When Elite tab is active, show "Elite Collection" header with a crown icon and purple text
- Gives each tier a distinct identity

### 5. Selected State Enhancement

- Add a checkmark icon on the right side of the selected card
- Slightly scale up the selected card (`scale-[1.01]`) for depth
- Animate the selection transition with a brief spring

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/ride/ZivoRideRow.tsx` | Add colored accent bar on left side of card; wrap car SVG in a themed circular background; improve badge size and colors; add checkmark on selected; brighten Elite text to white/gold; improve spacing and padding |
| `src/pages/Rides.tsx` | Add tier section headers ("Premium Collection" / "Elite Collection"); restyle category tabs to be lighter and taller; remove dark backgrounds from inactive Premium/Elite tabs; add selected-state animation |

### Key Style Changes in ZivoRideRow

- **Card structure**: Add a 3px left border accent (emerald/gold/purple per tier)
- **Car thumbnail wrapper**: 44x44px rounded-xl background (emerald-50 / zinc-800 / purple-900/30) behind the SVG
- **Elite text**: name `text-white`, subtitle `text-purple-100`, price `text-amber-300`, meta `text-purple-200`
- **Premium text**: name `text-white`, subtitle `text-amber-100/80`, price `text-amber-300`
- **Selected indicator**: Small emerald/gold/purple checkmark circle on the right
- **Selected card**: Add `ring-2` with tier color + `scale-[1.01]` transform

### Key Style Changes in Rides.tsx

- **Tabs**: Replace `bg-zinc-800`/`bg-zinc-900` on inactive Premium/Elite tabs with `bg-white border border-amber-200 text-amber-600` and `bg-white border border-purple-200 text-purple-600` respectively -- lighter, matching the cream sheet background
- **Section headers**: Conditional render above ride list: `"★ Premium Collection"` in gold or `"♛ Elite Collection"` in purple

