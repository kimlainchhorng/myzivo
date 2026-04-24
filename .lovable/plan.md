# Polish swipe-down-to-close across post viewers

## 1. Per-platform threshold tuning (`src/components/social/useSwipeDownClose.ts`)

Replace fixed `CLOSE_OFFSET_PX = 120` / `CLOSE_VELOCITY = 600` with a small platform detector and tuned constants so iOS rubber-band doesn't accidentally trigger and Android's stiffer scrollers still feel responsive.

```text
iOS:     offset >= 110px  OR  velocity >= 750 px/s
Android: offset >= 90px   OR  velocity >= 550 px/s
Default: offset >= 100px  OR  velocity >= 650 px/s
```

- Detect via `navigator.userAgent` + `Capacitor.getPlatform()` when available, exported as a pure helper `getSwipeThresholds()` so it's unit-testable.
- Add a small `minDragDistance` (8px) so micro-taps on the grab handle never start a drag.
- Keep `dragListener: false` and `dragConstraints={ top: 0, bottom: 0 }` with `dragElastic={ top: 0, bottom: 0.4 }` to preserve the visual "rubber-band down" feedback.
- Accept an optional `onProgress` callback so headers can fade/translate the indicator while dragging.

## 2. Visible grab handle/indicator

Create `src/components/social/SwipeGrabHandle.tsx` — a 36×4px rounded white pill (`bg-white/40`, hover `bg-white/60`) centered at the very top of each viewer header, sitting inside the safe-area zone (uses `--zivo-safe-top-overlay`). It:

- Has `data-swipe-grab="true"` and `touch-action: none`.
- Calls `startDrag(e)` on `onPointerDown`.
- Has `aria-label="Drag down to close"` and `role="button"`.

Wire it into the three overlay components, and ensure surrounding header buttons (close X, more, etc.) call `e.stopPropagation()` so taps don't initiate a drag:

- `src/pages/ReelsFeedPage.tsx` → `PostDetailOverlay` header
- `src/components/profile/ProfileContentTabs.tsx` → `ProfilePostViewerOverlay` header
- `src/pages/PublicProfilePage.tsx` → `PublicPostOverlay` header

The full header strip stays draggable (existing `data-profile-post-drag-handle` / `onPointerDown` paths) — the pill is just the visible affordance. Content scroll regions keep `touch-action: pan-y`.

## 3. Automated swipe-close E2E QA

Add `tests/e2e/swipe-close.spec.ts` (Playwright) covering all three viewers:

```text
For each viewer (profile post, public profile post, reel post-detail):
  test "drags below threshold → stays open"
    drag grab handle down 60px → expect overlay still visible
  test "drags past offset threshold → dismisses"
    drag grab handle down 200px slowly → expect overlay gone
  test "fast flick dismisses"
    drag handle down 50px in <100ms → expect overlay gone
  test "scroll inside content does not dismiss"
    swipe inside scrollable body 300px down → expect overlay still visible
```

Uses `page.mouse.down/move/up` with timed steps to control velocity. Runs against the dev server using a seeded test account (reuses fixture login from `lodging-deeplinks.spec.ts` if available, otherwise hits a public profile + public reel route that doesn't require auth).

Update `.github/workflows/safe-area-qa.yml` (rename step group to "Mobile UX QA") to also run `npx playwright test tests/e2e/swipe-close.spec.ts`. CI fails if any case behaves wrong.

Add a Vitest unit test `useSwipeDownClose.test.ts` that mocks `PanInfo` for each platform's thresholds and confirms `onClose` fires/doesn't fire at the right boundaries.

## 4. /profile useNavigate runtime error

Status: route is registered in `src/App.tsx` line 842 inside `<BrowserRouter>`, and no `useNavigate` runtime error currently appears in the latest console/runtime logs. The earlier error was triggered by a stale chunk after the previous edits. Action:

- Re-confirm by loading `/profile` after the new build and checking `read_runtime_errors` / `read_console_logs`.
- Bump the chunk by adding a no-op comment header to `ProfileContentTabs.tsx` so Vite invalidates the cached module on next deploy.
- If the error returns, wrap the consumer in a defensive `useInRouterContext()` check and log a single warning instead of throwing.

## 5. Manual verification matrix

After implementation, verify on the preview at 390×844 (iPhone) and 360×800 (Android):

| Viewer | Slow short drag (60px) | Slow long drag (200px) | Fast flick | Scroll inside |
|---|---|---|---|---|
| /profile post | stay | close | close | scroll, stay |
| Public profile post | stay | close | close | scroll, stay |
| Reel post-detail | stay | close | close | scroll, stay |

Document results inline in the final response.

## Technical details

- Files created: `src/components/social/SwipeGrabHandle.tsx`, `tests/e2e/swipe-close.spec.ts`, `src/components/social/__tests__/useSwipeDownClose.test.ts`.
- Files edited: `src/components/social/useSwipeDownClose.ts`, `src/pages/ReelsFeedPage.tsx`, `src/components/profile/ProfileContentTabs.tsx`, `src/pages/PublicProfilePage.tsx`, `.github/workflows/safe-area-qa.yml`.
- Memory update: append swipe-close threshold rules to `mem://style/mobile-native-ux-standards`.
- No DB / edge-function changes.
