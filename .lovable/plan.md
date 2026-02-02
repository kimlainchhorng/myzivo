
## What’s happening (root cause)
The back button itself is fine (`onClick={() => navigate("/")}`), but it can’t be clicked because an invisible overlay is sitting on top of it and intercepting pointer/touch events.

In `src/pages/Profile.tsx`, several `Card` sections include a child like:

- `<div className="absolute inset-0 ..."/>`

However, the shared `Card` component (`src/components/ui/card.tsx`) renders a plain `<div>` with **no `relative` positioning**. That means the absolutely positioned overlay is **not scoped to the Card**—instead it positions itself relative to the nearest positioned ancestor (the page root container: `div` with `relative` in Profile), expanding to cover a large portion (often the entire screen). Since those overlay divs do not have `pointer-events: none`, they block clicks on elements above/below visually, including the back button.

This matches the symptom: the UI renders normally, but the back arrow doesn’t respond to taps/clicks.

## How we’ll confirm quickly
1. Inspect `src/pages/Profile.tsx` and identify all `absolute inset-0` overlay/background layers inside Cards.
2. Confirm `Card` is not `relative` by checking `src/components/ui/card.tsx` (it is not).
3. (Optional sanity) Temporarily add a border or background to the overlay div to visually confirm it’s spanning too large, but we can fix safely without this.

## Fix approach (safe and targeted)
We will scope and “de-click” the overlays so they can never block UI:

### A) Make each Card that contains an absolute overlay `relative`
In `src/pages/Profile.tsx`, add `relative` to the `className` of each `Card` that contains an absolutely positioned child overlay, e.g.
- Profile Card (the big one near the top)
- Account Status Card
- Any other card blocks where we have `absolute inset-0 ...` backgrounds

This ensures `absolute inset-0` backgrounds are constrained to the Card bounds only.

### B) Add `pointer-events-none` to each decorative overlay layer
Also update each overlay div like:
- `<div className="absolute inset-0 ..."/>`
to:
- `<div className="pointer-events-none absolute inset-0 ..."/>`

This guarantees that even if another layout change accidentally expands the overlay, it will not break interactions.

### C) (Optional hardening) Add `pointer-events-none` to the page background effects
At the top of `Profile.tsx`, there are 3 “Background effects” divs with `absolute ...`. These *should* be behind the content due to z-index ordering, but adding `pointer-events-none` is cheap insurance and improves robustness on mobile browsers.

## Files we will change
- `src/pages/Profile.tsx`
  - Add `relative` to Card containers that have absolute overlays
  - Add `pointer-events-none` to decorative overlay divs (both the page background effects and the card overlays)

## Testing checklist (end-to-end)
1. Open `/profile` on mobile and desktop.
2. Tap/click the back arrow:
   - It should navigate immediately to `/` (Index).
3. Verify the “camera” avatar edit button is still clickable.
4. Verify quick links still work.
5. Scroll and ensure no other buttons feel “dead” (especially inside cards with overlay backgrounds).

## Notes / why we’re not changing global Card
We could add `relative` to the global `Card` component, but that affects every Card everywhere and may create unintended stacking/z-index side effects. The targeted fix in `Profile.tsx` is safer and aligns with the actual usage pattern (only Cards with absolute children need `relative`).

## Expected outcome
The back button becomes clickable immediately, and the Profile page maintains the same visual design without interaction-blocking overlays.
