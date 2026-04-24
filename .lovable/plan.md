# Finish Swipeable Sheet Rollout & Safe-Area Hardening

Wrap up the bottom-sheet unification by porting the two remaining sheets onto the shared `SwipeableSheet` primitive, fix the notched-device overlap on the Reel close button, and verify everything across viewports with a clean type-check.

## 1. Refactor `CommentsSheet.tsx` onto `SwipeableSheet`

- Replace the hand-rolled overlay/backdrop/handle/header in `src/components/social/CommentsSheet.tsx` with `<SwipeableSheet>`:
  - Pass `open`, `onClose`, `maxHeightVh={70}`, `safeAreaTop`, `ariaLabel="Comments"`.
  - Use `title={`Comments${totalComments > 0 ? ` (${totalComments})` : ""}`}` so the X close button comes from the primitive (drop the local handle + header markup).
  - For `dark` mode, pass a `className` so the panel keeps `bg-black/95 text-white` styling and the input/list keep their existing dark variants. (We'll override the panel bg via `className` since `SwipeableSheet` already forwards it.)
- Keep all inner behavior unchanged: comments list, reply indicator, input row with safe-area-aware bottom padding, real-time updates, reactions, deletion.
- Remove the now-redundant `AnimatePresence`, `motion.div` wrappers, and outer `if (!open) return null;` guard — `SwipeableSheet` handles open/close animation.
- Keep auto-focus of the input on open (existing `useEffect`).

## 2. Refactor `ShareSheet.tsx` onto `SwipeableSheet`

- In `src/components/shared/ShareSheet.tsx`, replace the outer `motion.div` overlay + sheet panel with `<SwipeableSheet>`:
  - `title="Share to"`, `ariaLabel="Share options"`, `maxHeightVh={85}`, `zIndex` from prop (default 60).
  - Honor the `positioning` prop: `SwipeableSheet` is `fixed` by default. When callers pass `positioning="absolute"` (Reels overlay context), wrap the sheet in a positioned container or extend `SwipeableSheet` with an optional `positioning` prop forwarded to its outer `motion.div`. Simplest: add a `positioning?: "fixed" | "absolute"` prop to `SwipeableSheet` (default `"fixed"`).
- Keep all share logic intact: `handleCopyLink`, `handleShareToChat`, `handleShareToProfile`, `handleShareAuthorProfile`, `handleOptionClick`, in-app row, external row, "More options" toggle.
- Remove the local handle bar and X header (provided by primitive).

## 3. Extend `SwipeableSheet` with `positioning` prop

- Add `positioning?: "fixed" | "absolute"` (default `"fixed"`).
- Apply it to the outer overlay `motion.div`'s class (`fixed inset-0` vs `absolute inset-0`). No other changes.

## 4. Fix `ReelSlide` close button safe-area

In `src/pages/ReelsFeedPage.tsx` around line 1291:
- Change icon from `ChevronLeft` to `X` to match the "X close" pattern requested earlier.
- Replace `top-0 ... marginTop: max(env(safe-area-inset-top) + 0.75rem, 1rem)` with a direct `top` value that always clears the notch on Android + iOS:
  - `style={{ top: 'max(env(safe-area-inset-top, 0px), 12px)', left: 'max(env(safe-area-inset-left, 0px), 16px)' }}`
  - Drop the `marginTop` hack and `left-4` class to avoid the double-offset that pushes the button into the notch on some devices.
- Keep tap target ≥40×40.

## 5. Verify post-detail header & sheets across breakpoints

Read-only verification (no code changes if all clear):
- Confirm the post-detail header (lines ~675 and ~704 in `ReelsFeedPage.tsx`) uses `paddingTop: max(env(safe-area-inset-top) + N, N)` — already correct.
- Confirm `SwipeableSheet`'s top padding is sufficient when sheets render at `maxHeightVh={100}` (e.g., comment-settings full-height sheet) so the header strip never sits under the notch.
- Spot-check the four sheets (Post Options, Report, Comment Settings, Edit Caption, Comments, Share) at 360×800, 390×844, 768×1024 by reading their JSX configuration only — adjust paddings if any sheet uses `safeAreaTop={false}` while exposing a header.

## 6. Type-check & runtime fixes

- Run `bunx tsc --noEmit` (or project's `tsc -p`) and fix any errors surfaced by:
  - The new `positioning` prop on `SwipeableSheet`
  - Removed local props/types in `CommentsSheet` / `ShareSheet`
  - Any lingering imports (`X`, `motion`, `AnimatePresence`) that become unused after the refactor.
- Open `/reels` and `/profile` mentally (via the existing flow) to confirm no runtime regressions: drag-to-close, backdrop tap, X tap, focus-on-open for comments input, share buttons all firing.

## Files to edit

- `src/components/social/SwipeableSheet.tsx` — add `positioning` prop.
- `src/components/social/CommentsSheet.tsx` — refactor onto `SwipeableSheet`.
- `src/components/shared/ShareSheet.tsx` — refactor onto `SwipeableSheet`, forward `positioning`.
- `src/pages/ReelsFeedPage.tsx` — fix `ReelSlide` close button (X + safe-area inset).

## Out of scope

- No changes to the comment/share business logic or APIs.
- No changes to engagement skeletons, caption truncation, or the previously-shipped a11y labels.
- No changes to the global `AppLayout` safe-area system.
