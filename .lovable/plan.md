

# Marketing & Ads — Phase 3: Big additions

The Ads tab now has stat strip, platforms, checklist, wallet, insights, campaign rows, detail drawer, and a 4-step wizard. The **Marketing** sibling tab is still on the older flat layout, and several high-value workflows are missing from both. This phase brings Marketing to parity and adds the next tier of pro features.

---

## A. Marketing tab full parity (mirrors Ads architecture)

Apply the entire Ads pattern to the Marketing tab (Push / Email / SMS / In-app / Promo codes):

1. **`useStoreMarketingOverview(storeId)` hook** — single parallel fetch returning `{ stats, channels, campaigns, segments, templates }` with realtime on `marketing_campaigns`.
2. **`MarketingStatStrip`** — Sent · Delivered · Opened · Clicked · Conversions · Revenue attributed (6 tiles, scrollable on mobile, 7-day deltas).
3. **`MarketingChannelTile`** — Push / Email / SMS / In-app — each shows status (configured / needs sender ID / disabled), last-sent time, 7d volume sparkline, and quick "Send test" action.
4. **`MarketingCampaignRow`** — same row pattern as Ads with channel icon stack, audience size, open/click rates, status pill, sparkline, and overflow menu.
5. **Filters** — All · Draft · Scheduled · Sending · Sent · Failed · A/B + search + sort.
6. **Sticky FAB** — "+ New Campaign" → opens new wizard.

## B. Marketing campaign wizard (5-step)

Replaces the existing campaign form:

1. **Channel** — Push / Email / SMS / In-app / Multi-channel (sequential)
2. **Audience** — Pick saved segment OR build inline (filters: tags, last-order date, total spend, location, language)
3. **Content** — Channel-specific composer: subject + body for email (rich text), title + body + deep-link for push, 160-char SMS with cost estimator, in-app card builder. Live device preview on the right (iPhone frame on desktop).
4. **Schedule** — Send now / Schedule once / Recurring (cron-like) / Triggered (event-based: cart abandon, first order, birthday, inactivity ≥ N days)
5. **Review & Send** — Audience size, estimated cost (SMS), spam-score check (email), confirmation toggle.

## C. Audience segments manager (shared by Ads + Marketing)

New `Segments` sub-section under both tabs (single source of truth):

- List of saved segments with member count and last-refreshed time
- Builder: AND/OR groups of conditions over `profiles`, `orders`, `events`
- Live count preview as user adds conditions
- "Refresh now" button (re-runs the segment query)
- Used as audience preset in both Ads wizard and Marketing wizard

## D. Template library (shared)

`Templates` sub-section: reusable creatives for Ads + Marketing.

- Email templates (HTML + variables: `{{first_name}}`, `{{order_total}}`)
- Push templates (title/body/deep-link)
- SMS templates with character counter and cost
- Ad creatives (already in plan #5 from previous round — unify here)
- Each template tracks usage count and last-used campaign
- Stored in new `marketing_templates` table

## E. Promo code engine

Promo codes are mentioned but not deeply built. Add:

- Promo code list with code, type (% / flat / free shipping), redemptions, revenue, status
- Bulk generator (e.g. 500 unique codes for a campaign)
- Per-customer limits, min order value, expiry, product/category restrictions
- Auto-attach to a Marketing campaign (push/email includes the code)
- Redemption analytics chart on the detail drawer

## F. Automations / triggered flows (the big one)

A simple visual flow builder for "if X then send Y":

- Trigger nodes: Cart abandoned (Nm), First order, No order in N days, Birthday, Loyalty tier change, Wishlist price drop
- Action nodes: Send push / Send email / Send SMS / Apply promo / Add to segment / Wait N hours
- Linear left-to-right canvas (no full graph editor — keep it simple)
- Live counter: "37 customers in this flow right now"
- Pause / resume / archive per automation
- Stored in new `marketing_automations` table with `trigger_json` + `steps_json`

## G. Cross-tab unified analytics

A new `Performance` sub-tab visible from both Ads and Marketing:

- Date range picker (7d / 30d / 90d / custom)
- Revenue attribution: Ads vs Marketing vs Organic, stacked area chart
- Funnel: Impression → Click → Add to cart → Purchase
- Top campaigns table (cross-channel, sortable by ROAS / revenue / CTR)
- Channel mix pie chart
- Export to CSV button

## H. Polish across both tabs

- **Realtime status toasts** — campaign approved/rejected/sent
- **Pulsing badge** on tab when something needs attention (pending review, low wallet, failed send)
- **Skeleton → content cross-fade** (currently snaps)
- **Empty-state suggestions** — "Try a Welcome push to new customers" with one-tap create
- **Mobile FAB safe-area** respected throughout
- **A11y** — wizard steps `aria-live`, segment builder keyboard nav, charts `role="img"` with alt summary

---

## Database additions (new tables)

- `marketing_segments` — `id, store_id, name, conditions_jsonb, member_count, last_refreshed_at`
- `marketing_templates` — `id, store_id, channel, name, subject, body, variables_jsonb, usage_count`
- `marketing_automations` — `id, store_id, name, trigger_json, steps_json, status, enrolled_count`
- `marketing_promo_codes` — `id, store_id, code, type, value, min_order_cents, max_redemptions, redemption_count, expires_at, campaign_id`
- `marketing_campaign_events` — `id, campaign_id, user_id, event_type (sent/delivered/opened/clicked/converted), revenue_cents, created_at` (for attribution)

All RLS-scoped to store owners + admins. No changes to existing tables.

---

## Files

**Create — hooks**
- `src/hooks/useStoreMarketingOverview.ts`
- `src/hooks/useMarketingSegments.ts`
- `src/hooks/useMarketingTemplates.ts`
- `src/hooks/useMarketingAutomations.ts`
- `src/hooks/useMarketingPromoCodes.ts`
- `src/hooks/useUnifiedPerformance.ts`

**Create — components (`src/components/admin/marketing/`)**
- `MarketingStatStrip.tsx`
- `MarketingChannelTile.tsx`
- `MarketingCampaignRow.tsx`
- `MarketingCampaignDetailDrawer.tsx`
- `CreateMarketingCampaignWizard.tsx` (5-step)
- `SegmentsManager.tsx` + `SegmentBuilder.tsx`
- `TemplatesLibrary.tsx` + `TemplateEditor.tsx`
- `PromoCodesManager.tsx` + `PromoCodeBuilder.tsx`
- `AutomationsBuilder.tsx` + `AutomationCanvas.tsx` + `AutomationNode.tsx`
- `UnifiedPerformancePanel.tsx`

**Edit**
- `src/components/admin/StoreMarketingManager.tsx` — full restructure, mirror StoreAdsManager
- `src/components/admin/StoreAdsManager.tsx` — add Segments/Templates entry points + Performance link
- `src/lib/marketing.ts` — replace stubs with real Supabase calls
- `src/hooks/useMarketing.ts` — point to new tables, add segment/template/automation queries

---

## Build order

1. Database migration (5 new tables + RLS + indexes)
2. `useStoreMarketingOverview` + flesh out `src/lib/marketing.ts`
3. `MarketingStatStrip` + channel tiles + campaign rows + filters/FAB → restructure `StoreMarketingManager`
4. `CreateMarketingCampaignWizard` (5-step with live preview)
5. `MarketingCampaignDetailDrawer` (mirrors Ads drawer)
6. `SegmentsManager` + builder (shared, mounted in both tabs)
7. `TemplatesLibrary` + editor (shared)
8. `PromoCodesManager` + bulk generator
9. `AutomationsBuilder` (canvas + nodes + enrollment counter)
10. `UnifiedPerformancePanel` (cross-tab analytics with CSV export)
11. Realtime toasts, pulsing badges, cross-fade skeletons, a11y sweep

---

## Recommendation

Biggest perceived jump for least effort: **A + B + C** (Marketing parity + wizard + segments). That alone makes Marketing feel like a real product. **F (Automations)** is the "wow" feature — operators will remember this one. **G (Unified Performance)** is what closes deals with bigger merchants.

Reply with which letters to build (e.g. "A B C", "all of them", "A B C F", or "everything except F").

