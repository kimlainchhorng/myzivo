## Goal
Fix the broken post-detail viewer on `/feed`. Today, clicking a reel opens a "fullscreen" overlay that is actually trapped inside a transformed `<PullToRefresh>` ancestor — so it doesn't cover the NavBar or sidebars, and the close button is hidden behind the header.

## Root cause
`PostDetailOverlay` uses `position: fixed` + `createPortal`, but it's rendered as a child of `<PullToRefresh>`, which applies a CSS `transform`. A transformed ancestor becomes the containing block for `position: fixed`, so the overlay collapses into the middle column. The same gotcha is already documented in the file for `ZivoMobileNav` (line 1068) — we need to apply the same fix to the overlay.

## Changes

### 1. `src/pages/ReelsFeedPage.tsx` — move overlay outside `<PullToRefresh>`
- Move the entire `<AnimatePresence>{fullscreenIndex !== null && …}</AnimatePresence>` block out of `<PullToRefresh>` and place it as a sibling of `<ZivoMobileNav />` (which is already outside for the same reason).
- Bump overlay z-index from `z-[9999]` to `z-[1500]` (above NavBar `z-[1200]` and chat hub `z-[1401]`).

### 2. Desktop layout for the detail viewer (Instagram-style)
Inside `PostDetailOverlay`, branch on `lg:` breakpoint:

```text
Mobile (<lg)                  Desktop (lg+)
┌─────────────┐               ┌──────────────────────────────────┐
│  [X]  user  │               │   dark backdrop (click to close) │
│             │               │     ┌────────┐  ┌─────────────┐  │
│   video     │               │     │        │  │ user header │  │
│             │               │     │ video  │  │ caption     │  │
│  ❤ 💬 👁 ↗  │               │     │ 9:16   │  │ comments    │  │
│  caption    │               │     │ max-h  │  │ actions     │  │
│  comments   │               │     │ 90vh   │  │             │  │
│             │               │     └────────┘  └─────────────┘  │
└─────────────┘               │                       [X] top-right│
                              └──────────────────────────────────┘
```

- Mobile: keep current swipe-down behavior, full-bleed.
- Desktop: dark backdrop (`bg-black/85`), click-outside-to-close, video card centered (max 90vh, 9:16), big always-visible Close button in viewport top-right corner (`fixed top-4 right-4`).

### 3. `src/components/social/FeedCard.tsx` — action button positioning in `detailMode`
- When `detailMode` is true on desktop, render the heart/comment/eye/share rail **inside** the video container as an overlay (Reels-style), not floating in the page gutter.
- Mobile detailMode unchanged.

### 4. Body scroll lock
- While the overlay is open, set `document.body.style.overflow = 'hidden'` and restore on close (prevents page scroll behind the modal on desktop).

## Acceptance checks (manual)
- Click a reel on desktop: NavBar, left sidebar, and right rail are all covered by a dark backdrop. Close (X) is visible top-right and always works. Clicking outside the video card closes the overlay.
- Click a reel on mobile: behavior is unchanged — full-bleed, swipe-down to close still works.
- Action buttons (❤ 💬 👁 ↗) appear over the video, not in the gutter.
- No regression to the NavBar top-gap fix from the previous turn.

## Files modified
- `src/pages/ReelsFeedPage.tsx` (move overlay out of PullToRefresh, bump z-index, desktop branch, body scroll lock)
- `src/components/social/FeedCard.tsx` (detailMode action-rail positioning)

## Files unchanged
- NavBar, sidebars, PullToRefresh, useSwipeDownClose, data layer.
