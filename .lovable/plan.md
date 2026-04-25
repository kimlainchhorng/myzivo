# Plan — Fix Notifications Popover Position & Look

## Problem (from screenshot)
The Account notifications dropdown opens but visually breaks on mobile:
- The panel anchors to the bell's tiny `relative` wrapper with `absolute right-0`, so a 380px panel extends ~344px to the LEFT of the bell, slipping off the left edge of the screen.
- The caret no longer sits under the bell.
- The empty "You're all caught up" state looks oversized for a popover.
- The dropdown sits above the rest of the page with no visual separation, so it's hard to tell what's the panel vs. the page underneath.

## Fix (all in `src/pages/Profile.tsx`)

### 1. Switch panel to viewport-fixed positioning
- Replace `absolute right-0 top-full` with `fixed` positioning.
- Anchor with `top: calc(var(--zivo-safe-top-sticky) + 3rem + 6px)` so it sits 6px below the sticky header.
- Mobile: `right-2 left-2 mx-auto max-w-[420px]` — full-bleed minus 8px gutter, capped at 420px.
- Desktop (lg+): `lg:left-auto lg:right-4 lg:w-[400px]` — classic Facebook-style right-aligned dropdown.
- Move caret to `right-12` on mobile / `right-6` on desktop so it visually points at the bell.

### 2. Add a soft mobile backdrop
- Render a `lg:hidden fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px]` behind the panel (top offset to start below header) so the dropdown clearly stands out from the page below.
- Tap on backdrop closes the popover.

### 3. Tighten empty state
- Reduce empty-state padding to `py-7` and shrink illustration to `h-10 w-10` so the popover doesn't look cavernous when there's nothing to show.
- Constrain panel `maxHeight` to `calc(100vh - var(--zivo-safe-top-sticky) - 3rem - 24px)`.

### 4. Header polish
- Slightly smaller title (`text-[15px]`) and add `tracking-tight` for a Facebook-like compact header.
- Keep sticky behavior so "Mark all read" stays visible while scrolling long lists.

### 5. Cleanup
- Remove the now-redundant `relative` wrapper around the bell (the panel no longer needs an offset parent). The bell stays in the header flex row unchanged.

## Files to edit
- `src/pages/Profile.tsx` — only file touched.

## Out of scope
- No changes to data hooks, routing, or notification rendering logic.
