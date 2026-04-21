

# Marketing & Ads — Responsive Polish v2

Five focused upgrades to make every Marketing & Ads surface feel native on desktop, iPad, and mobile.

---

## 1. Skeletons + Empty States (per breakpoint)

New file `src/components/admin/ads/MarketingSkeletons.tsx` exports:
- `WalletSkeleton`, `WizardSkeleton`, `RecommendationsSkeleton`, `CampaignListSkeleton`, `PlatformTilesSkeleton`, `PerformanceChartSkeleton`, `BreakdownTableSkeleton`
- Each renders bone shapes that mirror the real component's layout at the active breakpoint (uses `useIsMobile`)

New file `src/components/admin/ads/MarketingEmptyState.tsx`:
- Reusable component: `<MarketingEmptyState icon title body action />`
- Compact on mobile (`p-4`, `h-32` icon area), spacious on desktop (`p-8`, `h-48`)
- Wired into: Recommendations (no recs), Campaigns (no campaigns), Performance (no spend yet), Wizard (before first generate)

Wire skeletons into the existing `useQuery` `isLoading` branches across:
- `AdsStudioWalletGuard`, `AdsStudioRecommendations`, `StoreAdsManager`, `AdsStudioDashboard`, `AdsStudioAnalytics`

---

## 2. Mobile-First Modal Refactor

New shared helper `src/components/ui/responsive-modal.tsx`:
- Single `<ResponsiveModal>` API that renders `<Sheet side="bottom">` on `<sm` and `<Dialog>` on `≥sm`
- Built-in: drag handle on mobile, sticky footer with safe-area padding, scrollable body, `max-h-[90dvh]`
- `<ResponsiveModalFooter>` auto-stacks on mobile (cancel below, primary above), inline on desktop

Refactor these to use it:
- Wallet top-up modal (`AdsStudioWalletGuard`)
- Wallet ledger details modal (new — currently inline; promote to a dedicated modal showing full ledger row with Stripe ref + receipt link)
- OAuth connect dialog (`StoreAdsManager` Connect platform dialog)
- Create / Edit Campaign dialog (`StoreAdsManager`)

Behavior improvements:
- Body uses `overscroll-contain` so iOS doesn't bounce the page underneath
- Primary action button always visible (sticky footer, never scrolls off)
- Close affordance: drag handle + X on mobile, ESC + X on desktop

---

## 3. Performance Chart + Breakdown Mobile Optimization

`AdsStudioAnalytics` and `AdsStudioDashboard`:
- KPI strip: `grid-cols-2 sm:grid-cols-4`, smaller numerals on mobile (`text-lg sm:text-2xl`)
- Recharts wrapper: `aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/5]`, hide grid lines on `<sm`, larger touch tooltip
- Date range presets: horizontal-scroll pill row on mobile

Spend breakdown table:
- New `src/components/admin/ads/ResponsiveBreakdown.tsx`
- `<md`: stacked card list — each row is a card with creative name + 3 KPI rows + action menu
- `≥md`: data table with sticky header, horizontal scroll wrapper for narrow tablet widths
- CSV export: icon-only on mobile, "Export CSV" label on `≥sm`
- Sort indicators: tap-friendly chevrons on mobile

---

## 4. Responsive Typography + Spacing System

New file `src/components/admin/ads/marketing-tokens.ts` exports utility class strings used everywhere:
- `mkHeading` = `"text-base sm:text-lg lg:text-xl font-semibold tracking-tight"`
- `mkSubheading` = `"text-sm sm:text-[15px] font-medium"`
- `mkBody` = `"text-[13px] sm:text-sm leading-relaxed"`
- `mkMeta` = `"text-[11px] sm:text-xs text-muted-foreground"`
- `mkCardPad` = `"p-3 sm:p-4 lg:p-5"`
- `mkSection` = `"space-y-3 sm:space-y-4 lg:space-y-5"`
- `mkRow` = `"py-2.5 sm:py-3"`

Replace ad-hoc class strings across all 8 Marketing & Ads files for visual consistency. Touch targets standardized: buttons `h-10 sm:h-9`, icon buttons `h-9 w-9 sm:h-8 sm:w-8`, inputs `h-10 sm:h-9`.

Tables:
- Cell padding: `px-2.5 py-2 sm:px-3 sm:py-2.5`
- Header text: `text-[11px] uppercase tracking-wide`
- Number cells: `tabular-nums`

---

## 5. Responsive QA Checklist + Live Preview Page

New admin route `/admin/qa/marketing-responsive` (added to `App.tsx`, admin-guarded).

Page layout (`src/pages/admin/AdminMarketingResponsiveQA.tsx`):
- **Left rail (desktop) / top bar (mobile)**: viewport switcher chips — Mobile 375, iPad 820, Desktop 1440 — plus "Test all" button
- **Main area**: an `<iframe>` of `/admin/stores/:id?tab=studio` sized to the chosen viewport, centered with device frame
- **Below preview**: interactive checklist auto-grouped by component, each item has a Pass/Fail/Skip toggle
  - Tab bar scrolls without overflow
  - Wallet card shows balance + actions without horizontal scroll
  - Top-up modal opens as bottom sheet on mobile, dialog on desktop
  - Wizard stepper labels visible
  - Goal cards stack 1-col mobile, 2-col tablet+
  - Targeting form readable at 375px
  - Generated images grid 2/2/3 cols
  - Recommendations buttons reachable with thumb
  - Platform tiles 2/3/5 col grid
  - Campaign rows: actions wrap below title on mobile
  - Connect dialog: full-width buttons mobile
  - Performance KPIs stack 2-col mobile
  - Breakdown table → cards on mobile
  - Empty states render at all breakpoints
  - Skeletons match real layouts
- **Store picker** at top: dropdown to pick which store to QA against
- **Save run**: stores results into a new `marketing_qa_runs` table (id, admin_id, store_id, viewport, results jsonb, created_at) so you can compare runs over time
- **Export report**: downloads CSV of last run

Link added under Admin sidebar: "Marketing QA".

---

## Technical Details

**New files**
- `src/components/ui/responsive-modal.tsx`
- `src/components/admin/ads/MarketingSkeletons.tsx`
- `src/components/admin/ads/MarketingEmptyState.tsx`
- `src/components/admin/ads/ResponsiveBreakdown.tsx`
- `src/components/admin/ads/marketing-tokens.ts`
- `src/pages/admin/AdminMarketingResponsiveQA.tsx`

**Edited files**
- `src/components/admin/StoreMarketingSection.tsx` (skeletons in tab content, token usage)
- `src/components/admin/AdsStudioWalletGuard.tsx` (ResponsiveModal, ledger modal, skeleton, tokens)
- `src/components/admin/AdsStudioWizard.tsx` (skeleton, empty state, tokens)
- `src/components/admin/AdsStudioRecommendations.tsx` (skeleton, empty state, tokens)
- `src/components/admin/AdsStudioDashboard.tsx` (KPI grid, chart aspect, ResponsiveBreakdown)
- `src/components/admin/AdsStudioAnalytics.tsx` (chart aspect, tokens)
- `src/components/admin/StoreAdsManager.tsx` (ResponsiveModal for Connect + Create dialogs, skeletons, tokens)
- `src/App.tsx` (route)

**Backend**
- One migration: `marketing_qa_runs` table + RLS (admins only)

**No new edge functions, no new secrets.**

---

## Build Order

1. `marketing-tokens.ts` + `responsive-modal.tsx` + `MarketingEmptyState.tsx` + `MarketingSkeletons.tsx` + `ResponsiveBreakdown.tsx` (foundations)
2. Apply tokens + skeletons + empty states across all 8 Marketing & Ads files
3. Refactor 4 modals to ResponsiveModal
4. Performance chart + breakdown mobile pass
5. Migration: `marketing_qa_runs`
6. QA page + route + sidebar link

Approve to switch to default mode and ship.

