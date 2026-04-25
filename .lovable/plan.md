# Fix: Sticky header missing on mobile Profile scroll

## What I tested
Logged in as `klainkonkat@gmail.com` and opened `/profile` at 390×844 (iPhone). Scrolled the page down past the cover/avatar.

## Bug found
**The mobile sticky header (back button + name + bell) does not appear after scrolling past the cover.** Screenshots at 30% and 50% scroll show the cover scrolled away with no compact header pinned to the top — the area behind the status bar stays empty.

## Root cause
The `<motion.header>` for the sticky header lives inside `<PullToRefresh>`. PullToRefresh's inner wrapper uses `style={{ y: ... }}` (a CSS `transform`). Per the CSS spec, **a `position: fixed` element inside a transformed ancestor is positioned relative to that ancestor, not the viewport**. Combined with the header's own `y: stickyTranslate` transform, the header is effectively translated out of the visible region and never becomes visible.

Secondary issue: even if it were visible, putting the sticky header inside the pull-to-refresh transformed container means it would jiggle with pull-to-refresh gestures.

## Fix

1. **Lift the sticky header out of the transformed ancestor.** Render it via `createPortal(stickyHeaderJSX, document.body)` so it attaches directly to `<body>` and behaves as a true viewport-fixed element. (`createPortal` is already imported in `Profile.tsx`.)

2. **Keep `useScroll()` window-bound** (no change) — it already tracks window scroll correctly.

3. **Verify after fix**: re-test mobile scroll at 0%, 30%, 50%, 100%, then back to top, confirming:
   - Header fades in past ~150px scroll
   - Header has correct safe-area top padding
   - Header is non-interactive when hidden (pointer-events gating preserved)
   - No jitter during pull-to-refresh

## Files to edit
- `src/pages/Profile.tsx` — wrap the existing `<motion.header>` block in `createPortal(..., document.body)`, guarded for SSR (`typeof document !== 'undefined'`).

## Out of scope
No changes to PullToRefresh, scroll math, thresholds, or styling — only the DOM mount point of the sticky header.
