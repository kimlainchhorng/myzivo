## Issues found while testing the live preview

I logged in as klainkonkat@gmail.com and walked the full flow on `/profile`, `/feed`, and `/reels` at 390×844. Three real bugs surfaced:

### 1. Duplicate header inside the Feed post-detail viewer (worst offender)
On `/feed`, tapping a post image opens `PostDetailOverlay` (the swipe-down viewer in `ReelsFeedPage.tsx`). The overlay header (X + grab handle + author row) renders correctly, but the inner `<FeedCard ... detailMode />` ALSO renders its own author row + "More" menu + caption, so the user sees the author/avatar/timestamp twice and the action bar appears clipped. Same component path that the Profile and Public viewers go through is fine because they use a different inner renderer.

### 2. Reels feed: caption boxes (□□□) and stuck "Loading video…"
On `/reels`:
- Caption text for non-Latin scripts (the Khmer post by "Mommy Seafood") renders as missing-glyph boxes. The font stack on the reels caption layer doesn't include a Khmer/Unicode fallback (the rest of the app renders Khmer fine — only the reels caption uses a font-family that drops it).
- The video shows the spinner + "Loading video…" indefinitely on the first card. Likely because `preload="metadata"` + autoplay-blocked Safari path never triggers a `canplay` state-clear, or the loading flag isn't reset on `onLoadedData`.

### 3. `/feed` layout has a right-edge gutter at 390px
The page leaves ~12-15px of empty background on the right side of every section (header, story rail, suggested carousel, post). The bottom nav is full-width, so the gutter is in a `max-w-*`/`mx-auto` wrapper inside the feed shell that isn't sized to the mobile viewport. Profile and Reels don't have this issue.

---

## Fix plan

**A. Suppress FeedCard's internal chrome in `detailMode`** (`src/pages/ReelsFeedPage.tsx`)
- Wrap the FeedCard's "Author header" block (lines ~2400-2450, both shared and normal variants) in `{!detailMode && (...)}` so it only renders in the inline feed.
- Also suppress the duplicate caption block (lines ~2452-2461) when `detailMode` is true — the overlay already shows the caption in the body.
- Keep the media + actions row (like/comment/share/save) so the viewer is still interactive.
- Verification: open a feed post → only one author row visible at the top, full-bleed media below, action bar pinned at bottom.

**B. Reels caption + video fixes** (`src/pages/ReelsFeedPage.tsx` + relevant Reels view)
- Add a Unicode-safe fallback to the caption font stack: `font-family: ..., "Noto Sans Khmer", "Noto Sans", system-ui, sans-serif` (or apply `font-family: inherit` on the caption span instead of the custom font that's stripping glyphs). Apply the same fix to comments rendering on reels if affected.
- Fix the stuck loader: ensure the loading state clears on `onLoadedData` / `onCanPlay` (not just `onPlaying`), and on autoplay-block fall back to showing the poster + Play button instead of the spinner. Also gate the spinner on `!videoEl.readyState >= 2`.

**C. /feed right-edge gutter** (`src/pages/ReelsFeedPage.tsx` shell, or feed page wrapper)
- Find the `max-w-[XYZ] mx-auto` (or a `pr-*` / `container`) wrapper that's clamping width below the viewport on small screens and switch it to full-width below `lg` (e.g. `w-full lg:max-w-[XYZ] lg:mx-auto`).
- Verification: at 390px the feed cards, header, and "Suggested for you" carousel touch the right edge cleanly; carousel no longer shows a stray horizontal scrollbar.

---

## Out of scope (already working)
- Profile post viewer (single header, fills screen, X close works).
- Swipe-down-to-close gesture on all three viewers (already tuned + portaled at z-9999).
- Bottom nav covering — overlays correctly cover the nav now.

## Technical details
- Files touched: `src/pages/ReelsFeedPage.tsx` (primary), possibly `src/pages/ReelsPage.tsx` or the reels caption component for B, and a small layout class change for C.
- No schema, RLS, or routing changes.
- After fixes, I'll re-walk /profile → /feed → /reels with the browser tool to confirm visually.