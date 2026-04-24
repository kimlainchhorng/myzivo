## Plan

1. Replace the current inline top-safe-area expressions in the post-detail header and fullscreen close button with a shared fallback that does not rely on `env(safe-area-inset-top)` alone.
   - Introduce a reusable CSS custom property or utility in `src/index.css` that prefers real insets when present but falls back to a larger native-safe value on narrow touch devices.
   - Apply that shared value to the post-detail header in `src/pages/ReelsFeedPage.tsx` and to the close-button positioning used in fullscreen reel/detail overlays.

2. Harden the bottom-sheet primitive so CommentsSheet and ShareSheet also keep their drag/header/close region out of the notch when `env()` resolves to 0.
   - Update `src/components/social/SwipeableSheet.tsx` so `paddingTop` uses the new shared fallback instead of `max(env(...), 0px)`.
   - Keep the existing max-height behavior, but ensure the header region has an actual minimum top clearance for native iPhone layouts.

3. Update automated safe-area coverage so the new behavior is enforced.
   - Extend `src/components/social/__tests__/SwipeableSheet.safeArea.test.tsx` to assert against the new fallback expression/value.
   - Update `scripts/qa/safe-area-check.mjs` to validate the shared safe-area expression for the post-detail header, reel close button, and sheet panel padding.

4. Verify the visual issue against the exact failure mode shown in your screenshot.
   - Confirm the close button, avatar/name row, and sheet headers render below the status bar/Dynamic Island zone rather than only increasing internal padding within an already-overlaid container.
   - If needed, shift from `paddingTop` to `top + paddingTop` on the fixed/sticky overlay container so the entire header block starts below the unsafe region.

## What I believe the problem is

The current fix mostly increases inner `paddingTop`, but your screenshot suggests the whole fullscreen overlay/header is still starting at the very top of the webview while iOS/Capacitor is overlaying the status bar. In that case, larger padding alone may not fully solve it, especially when `env(safe-area-inset-top)` is reported as `0px`. The sheet primitive has the same weakness: it only checks `env()` and has no real fallback.

## Technical details

- Relevant files:
  - `src/pages/ReelsFeedPage.tsx`
  - `src/components/social/SwipeableSheet.tsx`
  - `src/index.css`
  - `src/components/social/__tests__/SwipeableSheet.safeArea.test.tsx`
  - `scripts/qa/safe-area-check.mjs`
- Current risky expressions:
  - `max(env(safe-area-inset-top, 0px), 3.75rem)` in `ReelsFeedPage.tsx`
  - `max(env(safe-area-inset-top, 0px), 0px)` in `SwipeableSheet.tsx`
- External evidence reviewed:
  - Capacitor docs: `StatusBar.overlaysWebView` overlays content beneath the status bar.
  - Capacitor issue reports show `env(safe-area-inset-*)` can return `0px` in webviews/live reload scenarios.
- Likely implementation shape:

```text
:root
  --zivo-safe-top: env(safe-area-inset-top, 0px)
  --zivo-safe-top-overlay: max(var(--zivo-safe-top), 60px)
  --zivo-safe-top-sheet: max(var(--zivo-safe-top), 44px)
```

Then use those shared values instead of repeating raw `env(...)` expressions inline.
