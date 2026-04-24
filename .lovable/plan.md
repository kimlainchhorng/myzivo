# Cross-platform swipe-close E2E + /profile walkthrough

Three small follow-ups on top of the already-shipped swipe-close work.

## 1. Add missing `data-testid` to PublicPostOverlay

`tests/e2e/swipe-close.spec.ts` references `public-post-overlay-body`, but `PublicPostOverlay` in `src/pages/PublicProfilePage.tsx` doesn't expose it — those tests would skip. Add `data-testid="public-post-overlay-body"` to the motion container so all 3 viewers are actually exercised.

## 2. Parametrize swipe-close E2E across iPhone + Android

Rewrite `tests/e2e/swipe-close.spec.ts` to loop over Playwright's built-in device descriptors:

- `devices["iPhone 13"]` — Mobile Safari, hasTouch, iOS UA
- `devices["Pixel 7"]` — Chrome Android, hasTouch, Android UA

For each device × each viewer (profile / public profile / reel post-detail), run the four cases:

```text
- short slow drag (60px)         → stays open
- long drag (220px)              → dismisses
- fast flick (60px in ~80ms)     → dismisses
- inner vertical scroll (300px)  → stays open (scroll only, never dismiss)
```

Switch the gesture helper from `page.mouse.*` to dispatched `TouchEvent`s when `hasTouch` is true so framer-motion sees real finger drags and the platform-specific UA-based threshold detection in `useSwipeDownClose.detectPlatform()` actually kicks in. Keep mouse fallback for non-touch contexts.

This gives 2 platforms × 3 viewers × 4 cases = 24 CI assertions, with the inner-scroll case proving scrolling never triggers dismiss on either OS.

## 3. Browser walkthrough on /profile

After the edits land, use the browser tool to:

1. Navigate to `/profile`
2. Open a post (click first thumbnail)
3. Verify grab handle is visible (screenshot)
4. Perform swipe-down via `browser--act` and confirm the overlay closes
5. Read console + runtime errors to confirm no `useNavigate`/router issues

Report results inline.

## Files

- Edit: `src/pages/PublicProfilePage.tsx` — add `data-testid="public-post-overlay-body"` to the `PublicPostOverlay` motion container.
- Rewrite: `tests/e2e/swipe-close.spec.ts` — device loop + touch-event helper.
- No changes to CI workflow — it already runs `tests/e2e/swipe-close.spec.ts` and will pick up the expanded matrix automatically.

## Out of scope

No changes to `useSwipeDownClose.ts`, `SwipeGrabHandle.tsx`, or the three overlay components beyond the one `data-testid` addition. Per-platform thresholds and the grab handle UX from the previous turn stay as-is.
