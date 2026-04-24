# SwipeableSheet — A11y, Snap-Points, Hint, Rubber-Band & Notch QA

Polish the shared bottom-sheet primitive with proper accessibility, consistent sizing on small screens, a discoverable drag affordance, a more natural dismiss feel, and an automated checklist that proves headers never enter the unsafe zone on notched / cutout / tablet devices.

## 1. Accessibility (focus trap, ARIA, Escape)

Edit `src/components/social/SwipeableSheet.tsx`:

- Add `useEffect` while `open` that:
  - Stores `document.activeElement` in a ref and restores it on close.
  - Focuses the first focusable element inside the panel (defer ~80ms for the slide-in animation). Falls back to the panel itself (`tabIndex={-1}`).
  - Listens (capture phase) for `keydown`:
    - `Escape` → `onClose()`
    - `Tab` / `Shift+Tab` → cycle focus between the first and last visible focusable element inside the panel (focus trap).
- Add `role="dialog"` (already present), `aria-modal="true"` (present), and:
  - When `title` is a string, generate an `id` via `useId()` and set `aria-labelledby` on the dialog + `id` on the `<h3>`.
  - Otherwise keep `aria-label={ariaLabel}`.
- Strengthen the close-button label:
  - `aria-label={isStringTitle ? \`Close ${title}\` : "Close dialog"}`
  - Add `<span className="sr-only">Close</span>` and `aria-hidden` on the icon.
  - Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary` ring.
- Make the panel itself focusable via `tabIndex={-1}` so the trap has a fallback.

No changes needed in `CommentsSheet` or `ShareSheet` — they inherit all of this through the primitive. The CommentsSheet "Cancel reply" X already has its own `aria-label`.

## 2. Consistent max-height + snap points

In `SwipeableSheet`, replace the static `maxHeight: \`${maxHeightVh}vh\`` with a viewport-safe snap formula:

```
maxHeight: `min(${maxHeightVh}dvh, calc(100dvh - env(safe-area-inset-top, 0px) - 24px))`
```

- `dvh` shrinks with the mobile URL bar (won't render too tall on small screens).
- The `min(...)` cap guarantees a 24 px buffer below the notch/status bar, so the header strip is always visible.
- Apply standard snap heights at the call sites for visual consistency:
  - `CommentsSheet`: keep `maxHeightVh={70}` (already set).
  - `ShareSheet`: lower from 85 → `maxHeightVh={75}` so the "More options" row stays comfortable on 360×640 screens.
  - Other existing wrappers in `ReelsFeedPage` (Post Options, Report, Comment Settings, Edit Caption) keep their current values; the new viewport cap protects them automatically.

## 3. Drag-hint grabber pill

Replace the static `<div className="w-10 h-1.5 ...">` grabber with a Framer-Motion element that gently pulses once on mount:

- Width animates `28 → 44 → 40` and opacity `0.5 → 0.9 → 0.6` over ~1.4s, ease-out.
- `role="presentation"` + `aria-hidden="true"` (decorative).
- Adds a `title="Drag down to close"` tooltip so desktop users get a hint on hover.

## 4. Rubber-band + haptic on dismiss

- Replace the symmetric `dragElastic={{ top: 0, bottom: 0.6 }}` with tuned values:
  - `dragElastic={{ top: 0, bottom: 0.45 }}` — a touch firmer (less mushy).
  - Add a `dragTransition={{ bounceStiffness: 380, bounceDamping: 28, power: 0.18, timeConstant: 220 }}` so the spring back feels snappy when the user lets go above the threshold.
- In `handleDragEnd`, when the close threshold is met, fire a light haptic via the existing `useHaptics` hook (`impact("light")`) before calling `onClose()`. Native iOS/Android only — no-op on web/PWA.

## 5. Automated safe-area QA checklist

Create `scripts/qa/safe-area-check.mjs` (Node + Puppeteer/Playwright is heavy — use a lightweight CSS-math approach instead):

- Define a fixture array of device profiles with their safe-area insets:
  - iPhone 15 Pro (notch+Dynamic Island): top 59, bottom 34
  - iPhone SE (no notch): top 20, bottom 0
  - Pixel 8 (cutout): top 32, bottom 24
  - Galaxy S24 (cutout): top 36, bottom 18
  - iPad Pro 11" portrait: top 24, bottom 20
  - iPad Pro 11" landscape: top 24, bottom 20, left 20, right 20
- The script statically parses (with regex) every `style={{ ... }}` block in:
  - `src/components/social/SwipeableSheet.tsx`
  - `src/pages/ReelsFeedPage.tsx` (post-detail headers + ReelSlide close button)
- For each `top`, `paddingTop`, `marginTop` value containing `env(safe-area-inset-top...)`, it evaluates the resulting CSS pixel value at each device profile (substituting the inset) and asserts it is ≥ the device's top inset (i.e. the element clears the unsafe zone).
- Outputs a table:

  ```text
  Device              Element                            Top px   Inset   Pass
  iPhone 15 Pro       SwipeableSheet header              59       59      ✓
  iPhone 15 Pro       Reel close button                  59       59      ✓
  iPhone 15 Pro       Post-detail header                 71       59      ✓
  ...
  ```

- Exits non-zero on any failure so it can run in CI.
- Add an npm script: `"qa:safe-area": "node scripts/qa/safe-area-check.mjs"`.
- Document the script briefly at the top: which files it scans, how to add new device profiles, and how to add new selectors.

## 6. Type-check

Run `bunx tsc --noEmit` to verify no TS regressions from the primitive's new props/effects.

## Files

- `src/components/social/SwipeableSheet.tsx` — accessibility, snap formula, animated grabber, rubber-band + haptic.
- `src/components/shared/ShareSheet.tsx` — set `maxHeightVh={75}`.
- `scripts/qa/safe-area-check.mjs` — new automated checklist.
- `package.json` — add `qa:safe-area` script.

## Out of scope

- No changes to share / comment business logic.
- No new visual styling beyond the grabber animation.
- No browser-automation tests (the static checklist is faster and covers the failure mode requested).
