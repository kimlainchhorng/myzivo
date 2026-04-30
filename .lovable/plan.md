## Problem

Two issues visible in your screenshots:

1. **IMG_2328 (top of feed):** The composer card ("What's on your mind?" + Photo/Video / Feeling / Check In / Live) is hidden BEHIND the sticky header instead of sitting below it. It looks like a huge empty white space because the translucent header covers the avatar + input row.

2. **IMG_2329 (scrolled down):** The iOS status bar clock ("2:06") overlaps the "Feed" title and Search bar — the safe-area top padding is collapsing to zero in this state.

## Root Cause

The sticky header is wrapped inside `<PullToRefresh>`, whose inner `motion.div` applies a `transform: translateY(...)` to the entire feed content. On iOS WebKit, when a `position: sticky` element ALSO has its own `transform` (from our show/hide animation `-translate-y-full` / `translate-y-0`) AND lives inside a transformed parent AND has `will-change: transform`, the sticky element gets promoted to its own compositor layer. This breaks sticky positioning — the element no longer reserves flow space (so following content slides under it) and the safe-area padding inset is computed against the wrong containing block (so it collapses).

In short: stacking `transform` on the sticky header inside a transformed `PullToRefresh` parent is breaking iOS sticky behavior.

## Fix

Stop animating the header with a CSS `transform`. Use top offset instead, which doesn't promote the element to its own layer and is compatible with `position: sticky` on iOS.

### Changes in `src/pages/ReelsFeedPage.tsx`

1. **Replace transform-based hide/show with a `top` offset** on the sticky Feed header:
   - Remove `transition-transform`, `will-change-transform`, `-translate-y-full`, `translate-y-0`.
   - Keep `sticky top-0 z-40`.
   - When `headerHidden` is true, animate `transform: translateY(-100%)` via inline style with `transform-origin` set so it doesn't conflict — OR, simpler and safer: use a `marginTop` negative value via state (e.g. `marginTop: hidden ? '-120px' : '0'` with a CSS transition on `margin-top`). This keeps the element in flow and preserves sticky + safe-area behavior on iOS.

2. **Move `paddingTop` (safe area) to a dedicated wrapper inside the sticky box** so it can't be collapsed by transform layer promotion:
   ```tsx
   <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30">
     <div style={{ paddingTop: 'var(--zivo-safe-top-sticky, 0px)' }}>
       <div className="px-3 py-1 flex items-center gap-1.5"> ... </div>
     </div>
   </div>
   ```

3. **Add a small spacer above the composer** so the first row of "What's on your mind?" never visually touches the sticky header bottom border. (`mt-1` on the composer card.)

4. **Auto-hide animation:** keep the scroll listener but apply the visibility via a wrapper `<div>` that uses `max-height` + `opacity` transitions (collapses smoothly without breaking sticky). The outer sticky box itself stays in place; only its inner content collapses to 0 height.

### Expected Result

- At scroll=0: composer ("What's on your mind?" / Photo-Video row / story ring) visibly sits BELOW the Feed header — no more giant white gap.
- When scrolling down: header content collapses smoothly (Facebook-style) without leaving an empty stuck bar.
- When scrolled (IMG_2329 case): the iOS status bar no longer overlaps the "Feed" title — safe-area padding stays applied.

### Files Touched

- `src/pages/ReelsFeedPage.tsx` (header markup around lines 984–1047)

No CSS token changes needed; `--zivo-safe-top-sticky` is already correctly defined.
