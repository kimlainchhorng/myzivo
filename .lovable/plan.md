## Goal

Eliminate the remaining "still in safe zone" overlap by:
1. Sweeping the codebase for stale safe-area expressions in **post viewers** and pointing them at the shared `--zivo-safe-top-*` tokens.
2. Adding a real **Playwright screenshot QA** that loads key screens at iPhone/Android viewports (with simulated `safe-area-inset-top`) and **fails CI** if the close button / header overlaps the status-bar zone.
3. Adding a **Dynamic Island regression test** that pins `safe-area-inset-top: 0` (the broken iOS case the user is hitting) and proves the close button is still ≥60px from the top.

---

## 1. Unify post viewers on shared tokens

Replace ad-hoc `max(calc(env(safe-area-inset-top, 0px) + …), …)` expressions with `var(--zivo-safe-top-overlay)` (full-screen viewers / close buttons) or `var(--zivo-safe-top-sticky)` (sticky in-page headers).

Files to update:

| File | Line | Current | New |
|------|------|---------|-----|
| `src/pages/FeedPage.tsx` | 1256 | sticky header `paddingTop: 'max(calc(env(...) + 0.75rem), 0.75rem)'` | `var(--zivo-safe-top-sticky)` |
| `src/pages/FeedPage.tsx` | 1563 | floating Discover/Live buttons `top: 'calc(env(...) + 12px)'` | `var(--zivo-safe-top-overlay)` |
| `src/components/profile/ProfileContentTabs.tsx` | ~4391 | Camera viewer `fixed inset-0 z-[9999]` (no paddingTop) | add `paddingTop: 'var(--zivo-safe-top-overlay)'` so the camera close X clears the island |

Other files using raw expressions (`GoLivePage`, `LiveStreamPage`, `StoreProfilePage`, `CallScreen`, `ChatStories`, `ChatMessageBubble`) are **out of scope** for this task — they are not "post viewers". Will leave a follow-up note in `mem://style/mobile-native-ux-standards`.

## 2. Playwright screenshot QA + overlap detection

New file `tests/e2e/safe-area.spec.ts`:

- Loops through device profiles: **iPhone 15 Pro (top=59), iPhone SE (20), Pixel 8 (32), Galaxy S24 (36), Dynamic Island broken (top=0)**.
- For each profile, navigates to:
  - `/feed` → asserts `[data-testid="feed-sticky-header"]` top edge ≥ inset.
  - `/reels` → opens a reel, asserts the close button (`[data-testid="reel-close-button"]`) `getBoundingClientRect().top ≥ 60`.
  - `/reels` → opens post-detail (`[data-testid="post-detail-header"]`), asserts header top ≥ 60.
  - `/profile` → opens a post in the profile post viewer, asserts close button top ≥ 60.
- Injects safe-area insets via `page.addInitScript` that sets a `<meta>` viewport-fit and overrides `CSS.supports('env(safe-area-inset-top)')` by setting `--zivo-safe-top` directly (mirrors the broken native case).
- On failure, attaches the screenshot + computed bounds to the Playwright report.
- Adds `data-testid="reel-close-button"` to the existing close button in `ReelsFeedPage.tsx` (currently has no testid).
- Adds `data-testid="profile-post-close"` to the profile post viewer close button in `ProfileContentTabs.tsx`.

Add npm scripts:
```jsonc
"qa:safe-area:e2e": "playwright test tests/e2e/safe-area.spec.ts",
"qa:safe-area:all": "node scripts/qa/safe-area-check.mjs && playwright test tests/e2e/safe-area.spec.ts"
```

Add CI workflow `.github/workflows/safe-area-qa.yml`:
- Runs `npm run qa:safe-area:all` on PRs.
- Uploads `test-results/` (screenshots) as an artifact when it fails.
- Fails the workflow if either the static check or the Playwright run exits non-zero.

## 3. Dynamic Island regression test (`safe-area-inset-top: 0`)

Add a Vitest spec `src/components/social/__tests__/DynamicIslandFallback.test.tsx`:
- Mounts `ReelsFeedPage` post-detail header and the `ProfileContentTabs` post viewer with `--zivo-safe-top` forced to `0px` (simulating the iOS WKWebView bug).
- Asserts computed `paddingTop` resolves to **≥ 60px** via `evaluateCssExpression` from `safeAreaEval.ts`.
- Asserts the Playwright screenshot baseline at 0-inset shows the close button visually below y=60.

This guarantees that even when iOS reports `0px` for the inset, the floor in `--zivo-safe-top-overlay` (`max(env(...), 60px)`) still protects the UI.

---

## Files to create / edit

**Create**
- `tests/e2e/safe-area.spec.ts`
- `.github/workflows/safe-area-qa.yml`
- `src/components/social/__tests__/DynamicIslandFallback.test.tsx`

**Edit**
- `src/pages/FeedPage.tsx` — swap 2 inline expressions to `var(--zivo-safe-top-*)`
- `src/components/profile/ProfileContentTabs.tsx` — add `paddingTop` to camera viewer (~L4391) + `data-testid` on close button
- `src/pages/ReelsFeedPage.tsx` — add `data-testid="reel-close-button"` on the reel close X
- `package.json` — add 2 QA scripts
- `playwright.config.ts` — add device projects (iPhone 15 Pro, Pixel 8, Galaxy S24)
- `scripts/qa/safe-area-check.mjs` — extend TARGETS with the new FeedPage tokens
- `mem://style/mobile-native-ux-standards` — note that all post viewers must use shared tokens; raw `env()` is forbidden in viewer headers

## How success is verified

After implementation I will run:
1. `node scripts/qa/safe-area-check.mjs` — expects 100% pass across all profiles incl. broken-island.
2. `npx vitest run` — DynamicIslandFallback passes.
3. `npx playwright test tests/e2e/safe-area.spec.ts` — captures screenshots; asserts no overlap; uploads artifacts.
4. Visually inspect the Dynamic Island screenshot to confirm the close X sits clearly below the status bar.
