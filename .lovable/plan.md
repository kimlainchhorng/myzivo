## Goal
Eliminate the large empty gaps in the desktop header (visible between logo↔nav pills and nav pills↔language selector) so the header feels compact, like a real app bar.

## Root Cause
`Header.tsx` uses `justify-between` on a 3-child flex row (Logo | Nav | Actions). With only 3 small pills in the middle and small clusters on each side, the browser pushes them to the far edges of a `container mx-auto` (max ~1280px) — leaving hundreds of px of empty space on each side of the nav.

## Changes (single file: `src/components/Header.tsx`)

1. **Restructure flex layout** at line 106:
   - Change `justify-between` → `justify-start gap-4`
   - Group Logo + Nav together on the left
   - Push Actions cluster to the right with `ml-auto`

   Result:
   ```text
   [ZIVO] [Flights][Hotels][Car Rental] ………………… [EN] [USD] [🔔] [Account]
   ```
   Logo and nav pills sit naturally next to each other (no big gap between them); only the actions float right.

2. **Compact the Account button** (lines 205-214):
   - Remove the two-line "Account / Menu" stacked label
   - Replace with a single compact "Account" label + chevron, matching the height of the other pills
   - Keeps the avatar circle but reduces overall width by ~40px

3. **Tighten action cluster gap** (line 130): `gap-1.5` → `gap-1` so EN / USD / bell / account sit closer.

## Out of Scope
- No changes to mobile header (already compact)
- No color, icon, or font changes
- No changes to FlightLanding hero spacing (already adjusted)

## Files Modified
- `src/components/Header.tsx`
