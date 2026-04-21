

# Marketing & Ads — Polish v3

Five upgrades on top of the v2 responsive pass.

---

## 1. Live Visual Preview Mode (in-page breakpoint switcher)

New floating control on `/admin/stores/:id` Marketing tab: **Preview at**: Desktop / iPad / Mobile.

- New component `src/components/admin/ads/MarketingPreviewSwitcher.tsx`
- New context `src/components/admin/ads/MarketingPreviewContext.tsx` exposing `previewWidth: number | null` (null = native viewport)
- When a preview is active, the entire Marketing section is wrapped in a fixed-width container (`375px` / `820px` / `1280px`) centered with a subtle device frame; the rest of the admin chrome stays fluid
- **No data refetch** — context only changes layout width. React Query cache is untouched, charts re-measure via ResponsiveContainer
- The existing `useIsMobile` hook stays viewport-based; we add a sibling `useResponsiveWidth()` that returns either the forced preview width or `window.innerWidth`. Marketing & Ads components opt-in by reading from context (only the bits that branch on mobile, e.g. ResponsiveBreakdown, ResponsiveModal, MarketingSkeletons)
- Switcher pinned bottom-right on desktop (`fixed bottom-4 right-4 z-40`), tucked into a collapsible chip on mobile, hidden on Capacitor native

## 2. Mobile Chart + Breakdown Performance

`AdsStudioAnalytics` and `AdsStudioDashboard`:
- Memoize totals and per-row derivations with `useMemo` keyed on `stats`
- Wrap `StatCard` in `React.memo`
- Switch Recharts config based on width: drop axis ticks count to 4, disable `animationDuration` on `<sm`, hide cartesian grid, swap `Area` to `Line` when rows > 60
- Use `ResponsiveContainer` with `debounce={150}` so resize doesn't thrash
- ResponsiveBreakdown:
  - Memoize column render functions
  - Virtualize the mobile card list when rows > 30 using `react-window` lite (`FixedSizeList`) — only loaded if needed via dynamic import
- Replace `toLocaleString()` chains with a single `Intl.NumberFormat` instance per file

## 3. Modal Accessibility (focus trap, ARIA, ESC, close)

Upgrade `src/components/ui/responsive-modal.tsx`:
- Radix `Dialog` and `Sheet` already provide focus trap + ESC; verify both paths set `aria-labelledby` from title and `aria-describedby` from description automatically (we already pass them)
- Add explicit `aria-modal="true"`, `role="dialog"` fallback for the bottom sheet wrapper
- Add a visible-on-focus close button (X) in the top-right of mobile sheet (currently only drag handle), with `aria-label="Close dialog"`
- Restore focus to the trigger element on close (Radix default; ensure we don't override with `onCloseAutoFocus`)
- Drag handle gets `role="button"`, `tabIndex={0}`, `aria-label="Drag to dismiss"`, Enter/Space closes
- `ResponsiveModalFooter` primary action gets `autoFocus` opt-in via prop
- All `Button` icon-only triggers across Wallet / Recommendations / Ads Manager get `aria-label`s
- New helper `useFocusReturn(open, triggerRef)` to guarantee focus returns even when sheet → dialog swap happens mid-render

## 4. Visual QA Report Export (screenshots per breakpoint)

Augment `src/pages/admin/AdminMarketingResponsiveQA.tsx`:
- Add **Export Visual Report** button next to existing CSV export
- For each viewport (mobile 375 / iPad 820 / desktop 1440):
  1. Activate preview width via context
  2. `await new Promise(r => requestAnimationFrame(() => setTimeout(r, 250)))` to let layout settle
  3. Capture the preview iframe area using `html-to-image` (`toPng`) — already MIT-licensed, ~12KB gzipped, dynamic-imported on demand
- Bundle the 3 PNGs + checklist results into a single ZIP using `client-zip` (streaming, ~2KB), download as `marketing-qa-{store}-{timestamp}.zip`
- ZIP layout:
  ```text
  /screenshots/mobile-375.png
  /screenshots/ipad-820.png
  /screenshots/desktop-1440.png
  /checklist.csv
  /summary.json   ← metadata: store_id, run_id, viewport pass/fail counts
  ```
- Persist the run row + a pointer note (no binary upload) into existing `marketing_qa_runs` table
- Progress indicator: small `Progress` bar while screenshots are captured

## 5. Remaining Skeletons + Empty States

Audit remaining Marketing & Ads surfaces and wire them up:

**Add to `MarketingSkeletons.tsx`:**
- `AudienceBuilderSkeleton` — radius slider + age range + chip cluster
- `ABVariantCompareSkeleton` — two-column variant cards with metric rows
- `OAuthConnectSkeleton` — provider card with logo + permission rows
- `CampaignDetailsSkeleton` — header + 3 KPI rows + history list
- `LedgerListSkeleton` — already implicitly covered, promote to a dedicated export

**Wire skeletons into `useQuery` `isLoading` branches in:**
- `StoreAdsManager` (campaigns list + platform tiles + connect dialog body)
- `AdsStudioWizard` (initial setup load + variant comparison panel)
- `AdsStudioDashboard` (chart + creatives table)
- `AdminMarketingResponsiveQA` (store list + recent runs)

**Add empty states (using `MarketingEmptyState`):**
- `StoreAdsManager` — no campaigns yet, no platforms connected
- `AdsStudioWizard` — pre-generation state for variants
- `AudienceBuilder` — no saved audiences
- `ABVariantCompare` — fewer than 2 variants
- `AdminMarketingResponsiveQA` — no runs yet

---

## Technical Details

**New files**
- `src/components/admin/ads/MarketingPreviewContext.tsx`
- `src/components/admin/ads/MarketingPreviewSwitcher.tsx`
- `src/components/admin/ads/useResponsiveWidth.ts`
- `src/components/admin/ads/useFocusReturn.ts`

**Edited files**
- `src/components/ui/responsive-modal.tsx` (a11y upgrades)
- `src/components/admin/ads/MarketingSkeletons.tsx` (5 new exports)
- `src/components/admin/AdsStudioAnalytics.tsx` (memo + chart perf)
- `src/components/admin/AdsStudioDashboard.tsx` (memo + chart perf + skeleton + empty)
- `src/components/admin/ads/ResponsiveBreakdown.tsx` (memo, optional virtualization)
- `src/components/admin/StoreAdsManager.tsx` (skeletons + empty states + a11y labels)
- `src/components/admin/AdsStudioWizard.tsx` (skeleton + variant empty state)
- `src/components/admin/StoreMarketingSection.tsx` (mount preview switcher + provider)
- `src/pages/admin/AdminMarketingResponsiveQA.tsx` (visual report export, skeleton, empty)

**Dependencies (added)**
- `html-to-image` (~12KB gzipped) — screenshot capture
- `client-zip` (~2KB) — streaming ZIP build
- `react-window` (~6KB gzipped) — only dynamic-imported when card list > 30 rows

**No backend changes** — pure UI / a11y / perf pass.

**Performance budget**
- Preview switcher mount: <2KB
- Memoization should cut Analytics re-renders ~60% on resize
- Screenshot export is on-demand only, not in bundle until clicked

---

## Build Order

1. `MarketingPreviewContext` + `useResponsiveWidth` + `MarketingPreviewSwitcher`, mount in `StoreMarketingSection`
2. ResponsiveModal a11y upgrades + `useFocusReturn`
3. Chart + breakdown memoization, Recharts mobile config
4. Remaining skeleton exports + wiring across StoreAdsManager / Wizard / Dashboard
5. Visual QA report export (html-to-image + client-zip + progress UI)

Approve to switch to default mode and ship.

