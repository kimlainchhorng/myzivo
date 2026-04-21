

# Marketing & Ads — Polish v3 Gap Closure

The v3 pass shipped most foundations (preview switcher, ResponsiveModal a11y, QA page, visual report), but several wiring items are still incomplete. This pass finishes them.

---

## What's missing

1. **Skeletons not wired into 3 components**
   - `StoreAdsManager`: campaigns list still uses a bare `Loader2` spinner; platform tiles + connect dialog have no skeletons; no empty state for "no campaigns yet" / "no platforms connected"
   - `AdsStudioWizard`: no skeleton during initial load, no empty state for pre-generation variants panel
   - `AdsStudioDashboard`: still uses raw `Skeleton className="h-[200px]"` blocks, doesn't use `PerformanceChartSkeleton` / `BreakdownTableSkeleton`; chart aspect ratios not switched to mobile-friendly values; not memoized

2. **Chart performance work not applied to `AdsStudioDashboard`**
   - No `useMemo` on aggregations
   - Recharts not switched to mobile-aware config (no `debounce`, animation not disabled on mobile, grid not hidden on `<sm`)
   - Aspect ratio still fixed `h-[200px]` instead of responsive `aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/5]`

3. **`StoreAdsManager` modals not migrated to `ResponsiveModal`**
   - Create/Edit Campaign dialog still uses raw `Dialog`
   - Connect platform dialog still uses raw `Dialog`
   - Means mobile users get a centered dialog instead of a bottom sheet — inconsistent with Wallet modals

4. **Icon-only buttons without `aria-label`** in `StoreAdsManager` (pause/play/edit/delete row actions)

5. **Empty states missing**
   - `StoreAdsManager`: no campaigns / no platforms connected (currently plain text)
   - `AdsStudioWizard`: pre-generation variants panel
   - `AdminMarketingResponsiveQA`: already wired ✓

---

## Fixes

### 1. `StoreAdsManager.tsx`
- Replace campaigns `Loader2` block with `<CampaignListSkeleton />`
- Add `<PlatformTilesSkeleton />` for accounts query loading state
- Wrap empty campaign list with `<MarketingEmptyState icon={Megaphone} title="No campaigns yet" body="Launch your first paid campaign to start reaching new customers." action={<Button onClick={...}>New Campaign</Button>} />`
- Wrap empty platforms with `<MarketingEmptyState icon={Plug} title="No platforms connected" body="Connect Meta, Google, TikTok or X to start running ads." />`
- Migrate Create/Edit Campaign dialog → `<ResponsiveModal>` with `<ResponsiveModalFooter>` (cancel + submit auto-stack on mobile)
- Migrate Connect platform dialog → `<ResponsiveModal>` with `<OAuthConnectSkeleton />` while resolving
- Add `aria-label` to every icon-only row action button (Pause campaign, Resume campaign, Edit campaign, Delete campaign)

### 2. `AdsStudioDashboard.tsx`
- Replace raw `<Skeleton className="h-[200px]" />` with `<PerformanceChartSkeleton />` + `<BreakdownTableSkeleton />`
- Memoize: wrap `trendData`, `platformData`, `winners` derivations in `useMemo`
- Wrap `StatCard`-style cells in `React.memo`
- Recharts:
  - Container: `<div className="aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/5]">` instead of fixed `h-[200px]`
  - `<ResponsiveContainer debounce={150}>` 
  - Use `useIsMobilePreview()` (from preview hook) to:
    - Drop `<CartesianGrid />` on mobile
    - Drop `animationDuration` to 0 on mobile
    - Set `<XAxis tickCount={4} />` on mobile, default elsewhere
- Replace winner empty text with `<MarketingEmptyState icon={Trophy} title="No winners yet" body="Schedule auto-winner from the Publish tab." />`
- Single `Intl.NumberFormat` instance for `fmtUsd`

### 3. `AdsStudioWizard.tsx`
- Add `<WizardSkeleton />` for the brief moment between step transitions when async (e.g. while exporting)
- Pre-generation state: when `result === null` and not `loading`, show `<MarketingEmptyState icon={Sparkles} title="Ready to generate" body="Pick a goal, audience, and budget — then tap Generate to see AI-crafted ad variants." />` in the variants panel area (Step 4 placeholder)

### 4. Memoization helper — none new, just `React.memo` + `useMemo` inline

---

## Technical Details

**Edited files**
- `src/components/admin/StoreAdsManager.tsx` — skeletons, empty states, ResponsiveModal migration (×2 dialogs), aria-labels
- `src/components/admin/AdsStudioDashboard.tsx` — proper skeletons, memo, mobile-aware Recharts, empty state
- `src/components/admin/AdsStudioWizard.tsx` — skeleton + pre-gen empty state

**No new files. No backend changes. No new dependencies.**

---

## Build Order

1. `StoreAdsManager` skeletons + empty states + aria-labels
2. `StoreAdsManager` ResponsiveModal migration (Create + Connect)
3. `AdsStudioDashboard` skeletons + memo + responsive Recharts + empty state
4. `AdsStudioWizard` skeleton + pre-generation empty state

Approve to switch to default mode and ship.

