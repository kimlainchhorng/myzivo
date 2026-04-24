# Bottom-sheet polish: safe-area headers + swipe-down-to-close

The screenshot shows the post Options sheet over a post-detail view. Two issues to fix across every bottom sheet in the social feed:

1. The sheet's top controls (X, profile preview, drag handle) collide with the iOS notch / Android status bar — they sit inside the safe zone.
2. Sheets only close on backdrop tap. Users expect to **drag the sheet down** to dismiss, like Instagram / Facebook.

## What changes

### A. New shared primitive `SwipeableSheet`

Create `src/components/social/SwipeableSheet.tsx` — a thin wrapper around the existing `motion.div` bottom-sheet pattern that:

- Renders the backdrop + animated sheet container exactly like the current sheets (so visuals stay identical).
- Uses framer-motion `drag="y"` with `dragConstraints={{ top: 0, bottom: 0 }}` and `dragElastic={{ top: 0, bottom: 0.5 }}`. On `onDragEnd`, if `offset.y > 100` OR `velocity.y > 500`, calls `onClose()`.
- Drag handle (the gray pill) sits in a dedicated `cursor-grab` zone with `touch-action: none` so the drag is reliably captured even when the body scrolls.
- The whole header strip (drag handle + optional title row) is the drag region; the scrollable content below uses `touch-action: pan-y` so list scrolling still works without hijacking the close gesture.
- Accepts a `safeAreaTop` boolean (default true) that adds `paddingTop: max(env(safe-area-inset-top), 0.5rem)` so headers never hide behind the notch when the sheet is full-height.
- Accepts `maxHeightVh` (default 85) to cap height; sheet uses `pb-[env(safe-area-inset-bottom)]` for bottom inset.

Props: `{ open, onClose, children, title?, ariaLabel, maxHeightVh?, safeAreaTop? }`.

### B. Adopt `SwipeableSheet` across the social sheets

Replace the hand-rolled motion-div sheets in these spots — same content, just wrapped:

- `src/pages/ReelsFeedPage.tsx`
  - Post Options menu (`showPostMenu`, ~L2722)
  - Report Sheet (`showReportSheet`, ~L2834)
  - Comment Settings (`showCommentSettings`)
  - Edit Caption (`showEditCaption`)
  - Reaction picker is inline (not a sheet) — leave alone.
- `src/components/social/CommentsSheet.tsx` — wrap the existing sheet body. Keep the input bar pinned to the bottom; the drag-region is just the header (handle + title). The comment list keeps `touch-action: pan-y` so vertical scrolling never triggers close.
- `src/components/shared/ShareSheet.tsx` — wrap so it gets the same drag-down + safe-area treatment.
- `src/components/profile/ProfileFeedCard.tsx` — its menu also routes through the shared share-sheet, so it inherits automatically.

### C. Header / safe-area fix on the Post Detail viewer

The screenshot's top strip ("X · avatar · name · ⋮") is the **fullscreen Post Detail** viewer (`fullscreenIndex`, ReelsFeedPage L946). It already has `paddingTop: max(env(safe-area-inset-top) + 0.5rem, 0.5rem)` but the close icon is `ChevronLeft` and small. Update to:

- Replace `ChevronLeft` with `X` (matches screenshot expectation).
- Wrap header in a row with `min-h-[56px]` and ensure the X button is `h-10 w-10 rounded-full bg-background/60 backdrop-blur` so it's visible over media.
- Add a thin downward drag handle below the header that mirrors the sheet pattern: dragging the entire viewer down >120px closes it (`setFullscreenIndex(null)`). Same framer-motion drag logic as `SwipeableSheet`.

### D. Reels fullscreen viewer (`ReelSlide`) — top-left close button

The vertical reels viewer's close button (`L1278`) uses `marginTop: max(env(safe-area-inset-top) + 0.75rem, 1rem)` but its `top-0 left-4` parent doesn't account for safe area on Android with display cutouts. Switch to `style={{ top: 'max(env(safe-area-inset-top, 0px) + 12px, 16px)' }}` and remove `top-0` to make it more reliable.

## Technical notes

- No new dependencies — `framer-motion` already provides `drag`, `dragConstraints`, `onDragEnd` with `info.offset.y` and `info.velocity.y`.
- Keep the existing `AnimatePresence` + `initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}` so opening animations are unchanged.
- `touch-action` is the key to stopping iOS Safari from scrolling the page while dragging the sheet handle.
- All sheets keep their current backdrop `onClick={onClose}` so tap-outside still works.
- `CommentsSheet` already has an `<input>` inside it — keep `dragListener={false}` on the framer drag and only enable drag on the header strip via a manual `dragControls.start(e)` so typing never triggers a drag.

## Files changed

```text
NEW   src/components/social/SwipeableSheet.tsx
EDIT  src/pages/ReelsFeedPage.tsx               (4 sheets + post detail header + ReelSlide close)
EDIT  src/components/social/CommentsSheet.tsx   (wrap with SwipeableSheet)
EDIT  src/components/shared/ShareSheet.tsx      (wrap with SwipeableSheet)
```
