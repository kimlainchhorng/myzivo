

# Layout & Spacing Fixes for Route Preview

## Issues to Fix

1. **Duplicate back button** — The `MapSection` children include a floating back button (lines 653-657, 735-739) while the page header also has one. Remove the floating ones inside MapSection for `route-preview` and `vehicle` steps.

2. **Bottom card positioning** — The route summary card (line 661) uses `-mt-6` and `rounded-t-[1.5rem]`. Increase the negative margin to `-mt-8` or `-mt-10` and add `shadow-[0_-12px_30px_...]` to pull it higher and feel more like a native bottom sheet.

3. **Map height** — `MapSection` non-compact mode (line 136) uses `max-h-[45vh]`. Reduce to `max-h-[40vh]` to give more room to the bottom card.

4. **Map controls** — Zoom buttons at `bottom-14` (line 150) and locate button at `top-3 right-3` (line 155). Move zoom buttons higher (`bottom-20`) so they clear the bottom sheet. Move locate button to `top-14 right-3` so it clears any header overlap.

5. **Bottom sheet inner spacing** — Tighten padding in route info card: reduce `mb-3` gaps to `mb-2`, adjust stats card padding from `py-2.5` to `py-2`, ensure even flex distribution with `gap-2`.

## Changes (single file)

**`src/components/rides/RideBookingHome.tsx`**:

- **MapSection** (line 136): Change `max-h-[45vh]` → `max-h-[40vh]`
- **Zoom buttons** (line 150): Change `bottom-14` → `bottom-20`
- **Locate button** (line 155): Change `top-3 right-3` → `top-14 right-3`
- **Route preview** (lines 653-657): Remove the floating back button `<div>` inside `<MapSection>` children
- **Route preview bottom card** (line 661): Change `-mt-6` → `-mt-10`, adjust `pt-4 pb-3` → `pt-5 pb-4`
- **Stats cards** (lines 684-707): Change `gap-2.5 mb-3` → `gap-2 mb-2`, stats inner padding `px-3 py-2.5` → `px-2.5 py-2`
- **Vehicle selection** (lines 735-739): Remove the floating back button inside `<MapSection>` children
- **Vehicle bottom sheet** (line 741): Add `-mt-8 rounded-t-[1.5rem]` to pull it up

No structural or flow changes. Only CSS class adjustments and removal of 2 duplicate button blocks.

