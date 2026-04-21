

# Marketing & Ads — Flow, Density & Data Upgrade

The Ads tab today shows: an "integration in progress" banner, a 2-column platform grid with bare "Connect" pills, then an empty campaigns area below. From the screenshot at 428×703 the layout is sparse, the platform tiles are tall and information-poor, and there's no sense of *what the operator should do next*. This pass turns it into a guided, data-rich workspace.

---

## What changes (Ads tab, mobile-first, scales to desktop)

### 1. Hero: "Ads at a glance" stat strip
Replace the standalone yellow integration banner with a compact 4-tile stat strip at the top:

```
┌──────────┬──────────┬──────────┬──────────┐
│  Spend   │ Impress. │  Clicks  │ Conv.    │
│  $0.00   │   0      │    0     │    0     │
│  7d ▲ 0% │  7d ▲ 0% │  7d ▲ 0% │  7d ▲ 0% │
└──────────┴──────────┴──────────┴──────────┘
```
- Pulls aggregate `spend_cents / impressions / clicks / conversions` from `store_ad_campaigns` for this store.
- 7-day delta vs prior 7 days, color-coded (emerald up / muted flat / red down).
- 2×2 on mobile, 4×1 on iPad+, with skeletons during load.
- The integration banner moves below as a slim 1-line dismissible chip ("API approvals pending — drafts allowed").

### 2. Platform tiles: denser, status-aware, action-clear
Today each tile is a tall card with a centered icon and a small "Connect" pill — wastes height and tells the operator nothing.

New tile (compact, ~96px tall, 2-col mobile, 3-col iPad, 5-col desktop):
- Brand icon + name on one row
- Status dot + label (`Connected · ad acct ****1234` / `Pending review` / `Not connected`)
- Right-aligned action: **Connect** (OAuth where supported) / **Manage** / **Reconnect**
- Tiles for Meta/IG/Google show a tiny "Last sync 2h ago" line when connected
- Disconnected tiles are slightly muted; connected tiles get an emerald left border

### 3. Onboarding checklist (collapsible, top of campaigns area)
A dismissible "Get your first ad live" 4-step checklist that auto-checks as the operator progresses:
1. Connect at least one ad platform
2. Add billing / wallet balance (links to existing AdsStudioWalletGuard)
3. Create your first campaign draft
4. Submit for review

Each step shows ✓ / current / locked state, and tapping the active step jumps to the right action. Auto-hidden once all 4 are done; restorable via "Show setup guide" link.

### 4. Campaigns list: real list with filters, not a void
Add above the (currently empty) campaigns area:
- Segmented filter: **All · Draft · Pending · Active · Paused · Ended** (counts in pills)
- Search input (campaign name)
- Sort: Newest / Spend / Performance
- Sticky "+ New Campaign" button on mobile (FAB style, bottom-right above tab bar)

Campaign rows (mobile card / desktop table):
- Name + objective tag + platform icon stack
- Status pill (existing colors)
- Mini sparkline: last-7-day clicks
- Budget bar: spend vs total budget with % consumed
- Quick actions: Pause/Resume, Edit, Duplicate, Delete (overflow menu)
- Tap row → details drawer (ResponsiveModal) with full metrics + creative preview

Empty filter state uses `MarketingEmptyState` with a relevant illustration + primary CTA.

### 5. Create Campaign: stepped flow (replaces single long form)
Convert the existing single-form ResponsiveModal into a 4-step wizard inside the same modal:

1. **Goal** — Objective grid (Traffic / Conversions / Awareness / Leads / App installs) with icons + 1-line rationale
2. **Audience & Platforms** — Multi-select platform chips (only enabled if connected; disabled ones show "Connect first" link); audience preset (Local / Lookalike / Retarget / Custom)
3. **Creative** — Headline, body (char counters: 40 / 125), CTA dropdown, destination URL with live validation, optional image upload preview at 1:1 / 9:16 / 1.91:1
4. **Budget & Schedule** — Daily / total budget sliders + USD input, date range, estimated reach pill ("~2.4k–6.8k people / day")

Sticky footer: **Back / Next / Save Draft**. Final step button: **Submit for review**. Progress bar + step labels at top. All existing fields preserved; data shape unchanged.

### 6. Connect dialog: unified OAuth + manual fallback
Today the manual-entry dialog and OAuth start are two separate paths. Unify into one ResponsiveModal per platform:
- Header: brand icon + "Connect Facebook"
- Primary CTA: "Continue with Facebook" (calls `meta-oauth-start`) — green button
- Divider: "or enter manually"
- Manual fields: External Ad Account ID, Display Name (saved as `pending` until reviewed)
- Help link: "Where do I find my ad account ID?" → opens platform docs in new tab
- Status footer if already connected: "Connected as XYZ · Disconnect"

### 7. Density & sizing pass (matches v2026 high-density standard)
- Heading sizes: tab-page H1 → `text-lg md:text-xl` (was `text-xl`)
- Card padding: `p-3 md:p-4` everywhere in Ads section
- Icon pills: 32×32 mobile, 36×36 desktop
- Stat tile numbers: `text-xl md:text-2xl font-semibold`, labels `text-[11px]`
- Platform tile collapses to 2-line layout on mobile (icon+name row, status+action row)
- Removes wasted vertical whitespace between stat strip → platforms → checklist → campaigns

### 8. Data flow + reliability
- Add a single `useStoreAdsOverview(storeId)` hook that returns `{ stats, accounts, campaigns, checklistState }` with one parallelized fetch + React Query caching (2-min stale)
- Realtime subscription on `store_ad_campaigns` for this store so status changes (e.g. when a campaign is approved) update the list without refresh
- All mutations call `qc.invalidateQueries(["store-ads-overview", storeId])` once instead of three separate keys
- Skeletons (`MarketingSkeletons`) wired into stat strip, platform tiles, checklist, and campaign list — already partially present, finish wiring

### 9. Accessibility & native polish
- Stat tiles get `role="group" aria-label="<metric> last 7 days"`
- Platform tiles use `<button>` with `aria-pressed` for connected state
- Wizard steps announce via `aria-live="polite"`
- Campaign overflow menu uses existing `DropdownMenu` (focus-trapped)
- Sticky FAB respects `safe-area-bottom`

---

## Files

**Edit**
- `src/components/admin/StoreAdsManager.tsx` — restructure into: stat strip → platform grid → checklist → campaigns list; integrate new hook + realtime; FAB
- `src/components/admin/ads/MarketingSkeletons.tsx` — add `AdsStatStripSkeleton`, `OnboardingChecklistSkeleton`, `CampaignRowSkeleton`
- `src/components/admin/ads/MarketingEmptyState.tsx` — add `variant="campaigns"` preset

**Create**
- `src/components/admin/ads/AdsStatStrip.tsx` — 4-tile stat strip with 7-day deltas
- `src/components/admin/ads/AdsPlatformTile.tsx` — single dense, status-aware platform tile
- `src/components/admin/ads/AdsOnboardingChecklist.tsx` — collapsible 4-step guide
- `src/components/admin/ads/AdsCampaignRow.tsx` — card/row with sparkline + budget bar
- `src/components/admin/ads/AdsConnectDialog.tsx` — unified OAuth + manual fallback
- `src/components/admin/ads/CreateCampaignWizard.tsx` — 4-step wizard inside ResponsiveModal
- `src/hooks/useStoreAdsOverview.ts` — single source of truth for the Ads tab

**No backend changes, no new tables, no new dependencies.** Sparkline uses existing Recharts; all reads/writes hit the existing `store_ad_accounts` and `store_ad_campaigns` tables already used by `StoreAdsManager`.

---

## Build order

1. `useStoreAdsOverview` hook (parallel queries + realtime channel)
2. `AdsStatStrip` + skeleton + wire into StoreAdsManager
3. `AdsPlatformTile` (replaces inline grid) + density pass
4. `AdsOnboardingChecklist` + auto-derived state from overview hook
5. `AdsCampaignRow` + filters/search/sort + sticky FAB + empty state
6. `AdsConnectDialog` (unified) — replaces existing connect modal
7. `CreateCampaignWizard` — replaces single-form modal
8. Final density/spacing sweep + a11y attributes + skeleton wiring QA

