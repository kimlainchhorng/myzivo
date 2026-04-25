## Plan

1. Rework the Profile page scroll container so the sticky header, cover parallax, and pull-to-refresh all listen to the same mobile scroll source.
2. Replace the current sticky-header safe-area math with the shared `--zivo-safe-top-sticky` token from `src/index.css` so the header never sits under the iOS/Android status bar.
3. Prevent the sticky header from capturing taps or feeling “stuck” while hidden by making its interaction state match its visible state during scroll transitions.
4. Tune the top-of-page spacing so returning to the top does not show an awkward duplicated-header feel or jumpy overlap between the hero cover and compact header.
5. Retest the account page on mobile with repeated scroll down/up passes and confirm the notification button, back button, and cover area still behave correctly.

## What I found

- Login now works with the updated password you sent.
- I reproduced the mobile profile flow on `/profile`.
- After scrolling down and back up, the compact sticky header remains mounted over the page and contributes to the “something is stuck” feeling.
- The Profile page currently mixes:
  - `PullToRefresh`, which tracks `window.scrollY`
  - an inner `div` with `overflow-y-auto`
  - Framer Motion `useScroll({ container: scrollRef })`
- That split scroll model is the likely cause of the weird mobile behavior.
- The sticky header also uses raw `--zivo-safe-top` instead of the shared sticky safe-area token required by project memory.

## Technical details

Files to update:
- `src/pages/Profile.tsx`
- possibly `src/components/shared/PullToRefresh.tsx` if the Profile page needs a small compatibility improvement for nested/mobile scroll containers

Implementation details:
- Make the Profile page use a single authoritative scroll container for:
  - sticky header opacity/translate
  - cover parallax
  - pull-to-refresh eligibility
- Update the sticky header styles to use:
  - `paddingTop: var(--zivo-safe-top-sticky)`-compatible spacing
  - height derived from the same sticky token instead of raw `env(safe-area-inset-top)`
- Add pointer-event gating so the sticky header is non-interactive while visually hidden.
- If needed, offset the main content with a header spacer only when the compact header becomes active, avoiding overlap/jumpiness near the top.
- Re-run mobile verification on the preview after the fix.

## Expected result

- Smooth touch scrolling on Account/Profile
- No sticky header “stuck” sensation after scrolling down then back up
- Correct safe-area clearance on notched phones
- Existing notification drawer and cover reposition features remain intact