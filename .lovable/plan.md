# Safe-Area Hardening: Docs, Audit, Tests, Debug Overlay & QA

Five deliverables to lock in the recent safe-area fix and prevent the double-padding gap from coming back.

## 1. Developer Doc — Capacitor Safe-Area Behavior

Create `docs/dev/capacitor-safe-area.md` covering:
- Why `StatusBar.overlaysWebView: false` (in `capacitor.config.ts`) means the native shell already insets the WebView below the status bar.
- Therefore `env(safe-area-inset-top)` returns `0` on iOS Capacitor (no notch reported to CSS).
- The forbidden anti-pattern: `max(env(safe-area-inset-top), 44px)` — this re-adds 44px on top of the already-inset WebView, producing the white gap shown in the user's "Picture 1".
- Correct pattern: rely strictly on `env()` values, no minimum floors.
- When you DO want a floor (true browser PWAs only): use the existing `--zivo-safe-top-overlay` token, never inline `max()`.
- Quick decision table: Capacitor iOS / Capacitor Android / iOS Safari PWA / Mobile web → expected `env()` value and recommended class.
- Link to memory `mem://style/mobile-native-ux-standards`.

## 2. Bottom-Nav Padding Audit

Two custom inline `paddingBottom` usages remain — replace with the shared utility:
- `src/components/app/ZivoMobileNav.tsx` line 74 → remove inline style, add `pb-safe` class.
- `src/components/navigation/MobileNavMenu.tsx` line 225 → replace inline `calc(env(...) + 1rem)` with `className="pb-safe pb-4"` (Tailwind composition handles the +1rem).
- Grep all `pages/*` for any `style={{ paddingBottom: "env(...)` or `pb-[env(...)]` patterns and convert each to `pb-safe`.
- Verify `MobileBottomNav.tsx` (already uses utility — confirm only).

## 3. Visual Regression Tests

Add Playwright-based screenshot tests in `tests/visual/safe-area.spec.ts`:
- Devices: iPhone SE (375x667), iPhone 13 (390x844), iPhone 14 Pro Max (430x932).
- Routes: `/account`, `/profile`, `/chat`, `/` (Home).
- Capture full-page screenshots, store baselines under `tests/visual/__screenshots__/`.
- Assert top 100px region pixel-diff < 0.1% vs. baseline (catches white-gap regressions specifically).
- Add `bun run test:visual` script to `package.json`.
- CI-ready but runnable locally; baselines committed.

## 4. In-App Safe-Area Debug Overlay

Create `src/components/dev/SafeAreaDebugOverlay.tsx`:
- Fixed full-screen overlay with translucent colored bands at each inset edge (top = red, bottom = blue, left/right = green).
- Floating HUD card showing live numeric values for all four `env(safe-area-inset-*)` plus viewport size and `devicePixelRatio`.
- Toggle persisted in `localStorage` under `zivo:debug:safe-area`.
- Exposed in **Account → Developer Settings** (gated behind existing dev-mode check) as a Switch row "Show safe-area overlay".
- Also bind keyboard shortcut `Ctrl+Shift+S` on web for fast toggling.
- Mounted globally in `AppLayout.tsx` so it overlays every route.

## 5. QA Checklist Page

Create `src/pages/dev/SafeAreaQAPage.tsx` at route `/dev/qa/safe-area`:
- Interactive checklist (state in localStorage) with rows for: Profile top gap, Account top gap, Chat header flush, Home status-bar flush, bottom nav home-indicator clearance, MobileNavMenu sheet bottom — each on iPhone SE / 13 / 15 Pro Max.
- "Open page" button next to each row that navigates to the target route.
- "Toggle debug overlay" button wired to deliverable #4.
- Auto-detects platform (Capacitor vs web) and shows expected `env()` values to compare against.
- Export results as Markdown via a copy-to-clipboard button (for sharing QA reports).
- Linked from Account → Developer Settings.

## Technical Details

**Files created**
- `docs/dev/capacitor-safe-area.md`
- `tests/visual/safe-area.spec.ts` (+ `playwright.config.ts` if not present)
- `src/components/dev/SafeAreaDebugOverlay.tsx`
- `src/pages/dev/SafeAreaQAPage.tsx`

**Files modified**
- `src/components/app/ZivoMobileNav.tsx` — remove inline padding
- `src/components/navigation/MobileNavMenu.tsx` — remove inline padding
- `src/components/app/AppLayout.tsx` — mount `<SafeAreaDebugOverlay />`
- `src/App.tsx` — add `/dev/qa/safe-area` route
- `src/pages/account/...` (Developer Settings) — add overlay toggle + QA page link
- `package.json` — add `test:visual` script + `@playwright/test` devDep

**Memory updates**
- Append safe-area rule to `mem://style/mobile-native-ux-standards`: "Never use `max(env(safe-area-inset-*), Npx)`. Use `pb-safe`/`pt-safe` only. See `docs/dev/capacitor-safe-area.md`."

**Out of scope**
- Android edge-to-edge changes (current config keeps WebView inset).
- Reworking the design tokens in `index.css` (already correct after last fix).
