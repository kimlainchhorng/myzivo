

# Marketing & Ads — Responsive Polish Pass

Make every surface in `/admin/stores/:id` Marketing & Ads area look great on mobile (375px), tablet (768–1024px), and desktop (≥1280px).

---

## Scope

Apply consistent responsive behavior across the four tabs and all related modals/components shipped in the previous overhaul:

1. `StoreMarketingAds` page shell + tab bar
2. `AdsStudioWalletGuard` (wallet card, top-up modal, ledger, auto-recharge)
3. `StoreAdsManager` (platform connection tiles)
4. AI Studio wizard (4 steps + live preview)
5. Performance dashboard (charts + breakdown table)
6. Recommendations cards
7. A/B variant compare
8. Audience builder
9. Admin QA + Call-Closures pages (carryover from previous drop)

---

## Responsive Rules

**Breakpoints used**
- Mobile: `<640px` (sm)
- Tablet: `640–1023px` (md)
- Desktop: `≥1024px` (lg+)

**Page shell**
- Container: `px-3 sm:px-4 lg:px-6`, `max-w-[1400px] mx-auto`
- Vertical rhythm: `space-y-3 sm:space-y-4 lg:space-y-6`
- Sticky tab bar: horizontal scroll on mobile (`overflow-x-auto snap-x`), pill tabs with icon-only on `<sm`, icon+label on `≥sm`, count badges always visible

**Tab bar**
- Mobile: `h-11`, icon `16px`, label hidden, badge dot top-right
- Tablet+: `h-12`, icon `18px`, label visible, badge as pill with count

**Wallet card (`AdsStudioWalletGuard`)**
- Balance hero: stacks on mobile (balance → actions), 2-col on tablet, 3-col on desktop (balance | quick top-up | auto-recharge status)
- Top-up modal: full-screen sheet on mobile (`Sheet side="bottom"`), centered dialog on `≥md`
- Amount preset grid: `grid-cols-2 sm:grid-cols-4` (was fixed 4-col → cramped on mobile)
- Ledger list: card layout on mobile (avoid horizontal scroll), table on `≥md`

**Platform tiles (`StoreAdsManager`)**
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Tile padding: `p-3 sm:p-4`
- Connect button: full-width on mobile, inline on `≥sm`
- Status pill + last-sync timestamp wrap cleanly under account name on narrow widths
- "Manage connection" dropdown: bottom sheet on mobile, popover on desktop

**AI Studio wizard**
- Layout: single column on `<lg` (stepper as horizontal progress at top, preview below form), 2-col split on `≥lg` (stepper+form left 60%, live preview right 40% — sticky)
- Step indicator: horizontal pills with line connector on mobile, vertical timeline on desktop
- Goal cards (Step 1): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4`
- Audience builder (Step 2):
  - Geo radius slider: full-width, larger thumb (`h-6 w-6`) for touch
  - Age range double-slider: stacks above gender + interests on mobile
  - Interests multi-select: chip wrap, `gap-1.5`, `text-[12px] sm:text-[13px]`
  - Live "Estimated reach" pill sticks to bottom of form on mobile
- Creative variants (Step 3): horizontal swipe carousel on mobile (`snap-x`), 3-col grid on `≥md`
- Launch (Step 4): budget input + schedule pickers stack on mobile, side-by-side on `≥md`
- Footer nav (Back / Next): sticky bottom bar on mobile (safe-area aware), inline on desktop

**Live preview panel**
- Mobile: collapsible accordion above wizard, defaults closed to save space
- Tablet: full-width strip above form, collapsible
- Desktop: sticky right column, always visible

**Performance dashboard**
- KPI pills (ROAS / CTR / CVR / CPC): `grid-cols-2 sm:grid-cols-4`, smaller font on mobile (`text-lg sm:text-2xl`)
- Date range presets: horizontal scroll on mobile, inline on desktop
- Recharts: responsive container with `aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/5]`
- Per-creative breakdown:
  - Mobile: card list (creative name + 3 KPIs stacked)
  - Tablet+: data table with sticky header, horizontal scroll on tablet
  - CSV export button: icon-only on mobile, label on `≥sm`

**Recommendations cards**
- Stack: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Apply / Dismiss buttons: full-width split row on mobile, inline-end on desktop
- Estimated impact pill wraps under title on narrow widths

**A/B variant compare**
- Mobile: vertical stack with "vs" divider, swipe between variants
- Tablet+: side-by-side (`grid-cols-2`) with synced metric rows

**Modals & sheets — global rule**
- Any `Dialog` on mobile (`<sm`) becomes a bottom `Sheet` (full-width, max-height 90vh, drag handle, safe-area padding)
- Use existing `useIsMobile` hook to swap component
- Confirm/cancel actions stick to bottom with `pb-[env(safe-area-inset-bottom)]`

**Admin QA + Call-Closures pages**
- Filter bar: collapses into a "Filters" button + drawer on mobile, inline row on desktop
- Tables → card list on `<md`
- Realtime checklist (QA page): single column on mobile, 2-col on desktop

**Touch targets**
- Minimum `h-10` (40px) for buttons on mobile
- Switches and sliders use `min-w-[44px] min-h-[44px]` hit areas
- Tab pills `h-11` on mobile

**Typography scale**
- Headings: `text-lg sm:text-xl lg:text-2xl`
- Body: `text-[13px] sm:text-sm`
- Meta/labels: `text-[11px] sm:text-xs`

**Safe areas (mobile web + Capacitor)**
- Sticky bottom bars use `pb-[max(env(safe-area-inset-bottom),0.75rem)]`
- Sticky top tab bar uses `pt-[env(safe-area-inset-top)]` only on standalone PWA

---

## Technical Details

**Updated components**
- `src/pages/admin/stores/StoreMarketingAds.tsx` — shell + tab bar responsive
- `src/components/admin/AdsStudioWalletGuard.tsx` — hero + modal + ledger
- `src/components/admin/StoreAdsManager.tsx` — tile grid + manage menu
- `src/components/admin/ads/AiStudioWizard.tsx` (and step subcomponents) — 2-col → stack
- `src/components/admin/ads/PerformanceChart.tsx` — aspect ratios
- `src/components/admin/ads/PerCreativeBreakdown.tsx` — table → card on mobile
- `src/components/admin/ads/RecommendationCard.tsx`
- `src/components/admin/ads/ABVariantCompare.tsx`
- `src/components/admin/ads/AudienceBuilder.tsx`
- `src/pages/admin/AdminModerationQAPage.tsx`
- `src/pages/admin/AdminCallClosuresPage.tsx`

**New shared helpers**
- `src/components/ui/responsive-dialog.tsx` — wraps `Dialog` on desktop / `Sheet` on mobile via `useIsMobile`, single API
- `src/components/admin/ads/ResponsiveDataTable.tsx` — renders table on `≥md`, card list on `<md` from same column config

**No backend changes** — pure UI/responsive pass.

**No new routes, no new tables, no new edge functions.**

---

## Build Order

1. `responsive-dialog` + `ResponsiveDataTable` shared helpers
2. Page shell + sticky responsive tab bar
3. Wallet card + top-up sheet + ledger
4. Platform tiles grid + manage menu
5. AI Studio wizard layout (stepper, preview, footer nav)
6. Wizard steps (goal, audience, creative, launch)
7. Performance dashboard (KPIs, chart, breakdown)
8. Recommendations + A/B compare
9. Admin QA + Call-Closures pages

Approve to switch to default mode and ship.

