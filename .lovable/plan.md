## Goal
Remove the wide empty gap on the left side of the **Feed page header** (NavBar.tsx) — the same `justify-between` issue we fixed on the marketing Header, but on a different file.

## Root Cause
`src/components/home/NavBar.tsx` line 198 uses `justify-between` on a row containing: Logo | Nav pills | Search | Actions. With small pills in the middle, the browser pushes the logo to the far left edge and the nav pills float in the middle, creating the wide blank zone visible between [ZIVO] and [Feed][Reel][Chat].

Header is also `h-[72px]` tall, which adds extra vertical space.

## Changes — `src/components/home/NavBar.tsx`

1. **Line 198** — replace `justify-between h-[72px]` with `gap-3 h-[60px]` so children sit naturally next to each other and the bar is shorter.

2. **Line 207** — change `<ZivoLogo size="md" />` to `<ZivoLogo size="sm" />` to match the slimmer bar.

3. **Line 212** — nav `<nav>` keeps its `gap-3` but no longer needs to be a center island; it now sits right next to the logo.

4. **Line 265** — search bar: change `flex-1 max-w-xs mx-4` → `flex-1 max-w-md ml-auto mr-3` so it expands to fill remaining space and pushes the language/EN cluster to the far right (instead of the search being a tiny island in the middle).

## Result
```text
[ZIVO] [Feed][Reel][Chat]  [🔍 Search people..............] [🌐 EN ▾]
```
No empty zone between the logo and the nav pills; search now spans the available middle space.

## Out of Scope
- Mobile layout (< lg) untouched — already compact
- No color/icon/font changes
- The marketing Header.tsx already fixed in previous turn

## Files Modified
- `src/components/home/NavBar.tsx`
