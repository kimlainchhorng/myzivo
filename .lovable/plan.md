# Safe-Area Hardening — Round 2

Five additions that build directly on the existing safe-area infrastructure.

## 1. Expand visual regression routes

Update `tests/visual/safe-area.spec.ts` to cover the screens where bottom-padding issues are most likely to reappear (the ones with sheets, footers, and long scrollers).

New routes added to the existing matrix:
- `/more` (MorePage — sticky bottom CTA region)
- `/settings` (AppSettingsPage)
- `/account/settings` (AccountSettingsPage)
- `/wallet` (AccountWalletPage — fixed bottom action bar)
- `/menu` synthetic case — opens `MobileNavMenu` sheet on `/account` via a `?openMenu=1` query param then screenshots the bottom 120px

For each route, capture **two** clips per viewport:
- Top 120px (status-bar region)
- Bottom 140px (home-indicator region — catches `pb-safe` regressions)

Authenticated routes use a shared Playwright `storageState` fixture (`tests/visual/auth.setup.ts`) seeded from a `QA_TEST_EMAIL`/`QA_TEST_PASSWORD` secret pair. Devices unchanged: iPhone SE / 13 / 14 Pro Max.

## 2. Quick-reference table in the developer doc

Append a "Decision Cheatsheet" section to `docs/dev/capacitor-safe-area.md`:

```text
┌─────────────────────────┬───────────────────────────────────────────┐
│ Use this                │ When                                       │
├─────────────────────────┼───────────────────────────────────────────┤
│ .safe-area-top          │ Header is the FIRST child of the page     │
│                         │ AND no AppLayout wrapper handles it       │
│ .pt-safe                │ Adding top inset to a non-header element  │
│                         │ (e.g. fullscreen overlay starting at top) │
│ .pb-safe                │ Fixed/sticky bottom navs, action bars,    │
│                         │ bottom sheets, FABs                       │
│ var(--zivo-safe-top-*)  │ Browser-PWA only, when you need a         │
│                         │ minimum floor (Dynamic Island bug)        │
│ Nothing                 │ Inside <AppLayout> — it already pads main │
└─────────────────────────┴───────────────────────────────────────────┘
```

Plus a "Common mistakes" subsection with three before/after code samples (double-padding, stacked classes, raw `max(env(...), 44px)`).

## 3. CI workflow with PR comments

Create `.github/workflows/safe-area-visual.yml` (separate from the existing `safe-area-qa.yml` so failures stay attributable):

- Triggers: `pull_request` on changes to `src/**`, `tests/visual/**`, `index.html`, `capacitor.config.ts`, the workflow file itself.
- Steps: checkout → Node 20 → `npm ci` → `npx playwright install --with-deps chromium` → `npx playwright test tests/visual/safe-area.spec.ts --reporter=html,json`.
- On failure: upload `playwright-report/` and `test-results/` as artifacts.
- PR comment (using `actions/github-script`) posts:
  - Pass/fail summary line
  - Per-route table (status × device)
  - Direct link to the uploaded HTML report artifact
  - Link to the diff images for any failing snapshots
  - Sticky-update behavior (one comment per PR, edited in place via marker `<!-- safe-area-visual -->`)

No external services — uses GitHub Actions artifacts only.

## 4. QA checklist run history (JSON + CSV export)

Extend `src/pages/dev/SafeAreaQAPage.tsx`:

- Add a "Save run" button that snapshots current checklist results into `localStorage` under `zivo:debug:safe-area-qa-runs` (capped at 20 runs, FIFO).
- Each run record stores: timestamp, platform info, live `env()` insets, viewport, per-row × per-device results, and a derived `passRate`.
- New "Run history" section lists saved runs with download buttons:
  - **JSON** — full structured payload via `Blob` download
  - **CSV** — flattened row-per-check (run_id, timestamp, page, route, device, passed)
  - **Delete** — removes a single run
- Existing "Export" button kept; renamed to "Copy current as Markdown" for clarity.
- File names use ISO timestamp: `safe-area-qa-2026-04-25T22-15-00.json`.

No backend — all client-side, survives across sessions, works offline.

## 5. iPhone-notch emulator in the debug overlay

Extend `src/components/dev/SafeAreaDebugOverlay.tsx` with a "Simulate device" picker in the HUD:

- Presets: `Off (real device)`, `iPhone SE (0/0)`, `iPhone 13 (47/34)`, `iPhone 14 Pro (59/34)`, `iPhone 15 Pro Max (59/34)`, `Custom…` (numeric inputs for top/bottom/left/right).
- When a preset is active:
  - Inject a `<style id="zivo-safe-area-emu">` block that overrides the design tokens AND patches the `env()` consumers via custom properties (`--zivo-emu-top` etc. applied as `padding-top` overrides on `.safe-area-top`, `.pt-safe`, `.pb-safe`, `.safe-area-bottom`).
  - Render a notch silhouette (rounded black pill) and home-indicator bar at the simulated positions so the visual matches the device.
  - Show a yellow "EMULATING <preset>" banner so the mode can never be left on accidentally.
- Selection persisted under `zivo:debug:safe-area-emu`; auto-clears on hard reload of production builds (only active in dev mode or when the overlay is enabled).
- HUD shows both **Reported** (real `env()` value) and **Effective** (after emulation) so you can confirm the override is working.

## Technical Details

**Files created**
- `tests/visual/auth.setup.ts` — Playwright auth fixture
- `.github/workflows/safe-area-visual.yml` — CI pipeline + PR comment
- (no other new files; everything else extends existing ones)

**Files modified**
- `tests/visual/safe-area.spec.ts` — new routes + bottom clips + auth state
- `docs/dev/capacitor-safe-area.md` — Decision Cheatsheet + Common Mistakes
- `src/pages/dev/SafeAreaQAPage.tsx` — run history, JSON/CSV export
- `src/components/dev/SafeAreaDebugOverlay.tsx` — device emulator + HUD
- `playwright.config.ts` — register `tests/visual` as a second project so unit/e2e configs stay separate
- `package.json` — add `test:visual` script wired to the new project

**Memory updates**
- Append to `mem://style/mobile-native-ux-standards`: emulator mode usage + new CI workflow name + extended route coverage.

**Out of scope**
- Device emulator does NOT change `window.innerWidth` (would require iframe-based simulation; not needed for safe-area verification).
- No cloud sync of QA runs (kept local per "no backend churn" preference).
