# Profile/Account: remaining mobile polish

Based on the iPhone screenshot you sent, here are the issues still left on the Account page and the proposed fixes.

## Issues observed

1. **Cover photo extends behind the iOS status bar** — the time / battery indicator sits directly on top of the bright cover image, hard to read on light covers and breaks the safe-area contract.
2. **4 round buttons crowd the cover** — reposition, change-photo, bell, and "more" stack horizontally on top of the cover and partly overlap the photo subject. On a 390 px screen they consume ~180 px of cover width.
3. **`Bell` and `More` belong to the sticky header / `/more` page, not the cover** — duplicating them on the cover is redundant now that the sticky header has its own bell, and `/more` is one tap away from the bottom nav.
4. **"Your story" appears as an isolated half-width card** with empty space beside it instead of a horizontal stories rail like Facebook/Instagram.
5. **Tabs row (All / Photos / Reels)** uses oversized full-width pills that waste vertical space; should be a compact segmented control.
6. **Wasted vertical gap** between "0 followers · 0 following · 0 friends" and "Your story" (~40 px of empty space).

## Proposed fixes (`src/pages/Profile.tsx` + small tweaks)

1. **Status-bar safe area on cover**
   - Add `paddingTop: var(--zivo-safe-top)` to the cover container and a subtle top-to-transparent gradient scrim (12 % black → transparent over the first 44 px) so the status bar text always reads cleanly over any cover.

2. **Slim down the cover action cluster**
   - Keep only **Reposition** (when a cover exists) and **Change cover** on the cover itself.
   - Remove the `Bell` button from the cover — it already lives in the sticky header which appears as soon as the user scrolls.
   - Remove the `MoreHorizontal` button from the cover — it duplicates the bottom-nav "Account" tap path to `/more`. Move it into the sticky header on the right side instead (kebab menu → `/more`).
   - Reduce button size from `h-10 w-10` → `h-9 w-9` and tighten the gap.

3. **Tighten vertical rhythm**
   - Collapse the gap between the social counts row and `ProfileStories` from the current default to `mt-3`.
   - Reduce `ParallaxSection` padding around `ProfileStories` on mobile.

4. **Compact tabs**
   - Switch the All / Photos / Reels row to a compact segmented control (height 36 px, equal flex, smaller icons), matching the Feed page style used elsewhere.

5. **Stories rail**
   - Verify `ProfileStories` renders horizontally; if it currently shows a single "Your story" card, wrap it in a horizontal scroller with `snap-x` so future stories sit next to it.

## Out of scope
- No changes to data / queries / RLS.
- No changes to the sticky header logic from the previous fix (only adds a kebab button on its right side).
- Bottom nav tab count is intentional per project memory; not changing it here.

## Files to edit
- `src/pages/Profile.tsx` — cover safe-area, button cluster, sticky-header kebab, vertical spacing, tabs styling.
- `src/components/profile/ProfileStories.tsx` — confirm horizontal scroll/snap layout (read first; only edit if needed).

## Verification
After implementing, re-test on 390×844 in the sandbox: status bar legible over cover, only 2 buttons on cover, sticky header shows back / avatar / name / bell / kebab, stories rail scrolls horizontally, no large empty gaps.
