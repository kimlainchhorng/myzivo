

# Marketing & Ads — Phase 4: Make every flow actually work end-to-end

Looking at the screenshot, the structure is in place (tabs: Overview · Promos · AI Studio · Ads · Audience · Templates · Flows · Performance, wallet card, checklist, connect platform). What's missing: the **flows behind the buttons**. Most CTAs open modals but don't complete a real round-trip to the database, Ads can't actually be created/launched, and the new Marketing sub-tabs (Audience/Templates/Flows/Performance) aren't wired into the wizard or each other. This phase makes every workflow real.

---

## 1. Ads — make "create an ad" actually work end-to-end

Today the wizard exists but submission is partial. Wire the full round-trip:

- **Wizard → DB**: `CreateCampaignWizard` "Submit for review" inserts into `store_ad_campaigns` with `status='pending_review'`, all 4 steps' data persisted (objective, audience, creative, budget, schedule).
- **Save Draft** at any step writes `status='draft'` and closes the modal; reopening from a draft row resumes at the last completed step.
- **Edit / Duplicate / Pause / Resume / Archive / Delete** in `AdsCampaignRow` overflow menu — all wired to mutations that invalidate `["store-ads-overview", storeId]`.
- **Wallet gate**: if `wallet.balance_cents < daily_budget_cents`, "Submit" is disabled with inline "Add funds" link that scrolls to wallet card.
- **Platform gate**: wizard step 2 disables platforms that aren't `connected`; clicking a disabled chip opens `AdsConnectDialog` for that platform, then returns to the wizard with that platform pre-selected.
- **Creative upload**: image goes to `user-posts` bucket under `ads/{store_id}/{uuid}.{ext}`, URL saved to `creative_url`. Validates file size ≤ 8 MB and aspect against the chosen format (1:1 / 9:16 / 1.91:1).
- **Realtime**: when `status` flips (approved / rejected / paused by system), a toast fires and the row updates without refresh (subscription already exists; just add the toast).

## 2. Ads — connect platform flow completes

- `AdsConnectDialog` "Continue with Facebook/Google/TikTok" calls the existing OAuth start edge function, opens the popup, polls for `store_ad_accounts` insert, closes on success, toasts "Connected as XYZ".
- Manual fallback: inserts `status='pending'` with operator-entered ad account ID, surfaces in tile as "Pending review".
- "Reconnect" and "Disconnect" wired (delete row + invalidate). Disconnected state recomputes the checklist immediately.

## 3. Marketing tab — swap flat header for new components & wire wizard

- Replace the current Overview header with `MarketingStatStrip` (already built) + `MarketingChannelTile` row (Push / Email / SMS / In-app).
- "+ New Campaign" FAB (mobile) and button (desktop) → opens `CreateMarketingCampaignWizard`.
- Wizard "Send now" / "Schedule" / "Save draft":
  - Inserts into `marketing_campaigns` with `status` + `scheduled_at`
  - On "Send now" calls existing `send-marketing-campaign` edge function (or creates a stub if missing — see #9 below)
  - On "Schedule": writes `scheduled_at`, server cron picks it up
- `MarketingCampaignRow` overflow menu: Pause/Resume scheduled, Edit draft, Duplicate, View report, Delete.
- "Send test" on each channel tile sends a one-off to the operator's own account so they can preview without creating a campaign.

## 4. Audience sub-tab — make segments usable

- `SegmentsManager` list reads `marketing_segments`; "+ New Segment" opens `SegmentBuilder`.
- Live count: as conditions change, debounced query to `profiles` + `orders` returns matching count → shown as "≈ 1,247 customers".
- "Refresh now" recomputes `member_count` and `last_refreshed_at`.
- Segments appear as audience presets in **both** wizards (Marketing step 2, Ads step 2).
- Saved segments can be set "Sync to ad platforms" toggle — pushes a Custom Audience to Meta/Google when those platforms are connected (via existing edge functions; stubbed if not yet built).

## 5. Templates sub-tab — actually reusable

- `TemplatesLibrary` lists from `marketing_templates`, filterable by channel.
- `TemplateEditor` channel-aware: email = subject + rich body with `{{variables}}` chip picker; push = title/body/deep-link; SMS = body + char counter + cost; ad creative = image + headline + CTA.
- "Use template" button in wizard step 3 opens picker → fills the form with template content; usage_count++ on send.
- "Save as template" button at wizard step 3 saves current creative as a new template.

## 6. Flows sub-tab — automation enrollment runs

- `AutomationsBuilder` canvas saves `trigger_json` + `steps_json` to `marketing_automations`.
- Toggle to `status='active'` triggers a server-side enrollment cron that:
  - Queries customers matching the trigger (cart abandon ≥ N min, first order, no order in N days, birthday, loyalty change)
  - Enrolls them into `marketing_automation_enrollments` (new table)
  - Walks `steps_json` honoring "Wait N hours" delays
  - Calls send-* edge functions for each action node
- Live counter "37 customers in this flow" reads enrollment count.
- Pause stops new enrollments + holds existing ones; Resume continues.

## 7. Promos sub-tab — generate, attach, redeem

- `PromoCodesManager` list with code, redemptions, revenue, status.
- `PromoCodeBuilder`: type (% / flat / free shipping), value, min order, expiry, max redemptions, per-customer limit, product/category restrictions.
- Bulk generator creates N unique codes (e.g., 500) attached to one campaign.
- "Attach to campaign" picker on each code → adds promo to that Marketing campaign's content automatically.
- Redemption tracking: checkout writes to `marketing_promo_redemptions`, drives the analytics chart in the detail drawer.

## 8. Performance sub-tab — real cross-channel analytics

- `UnifiedPerformancePanel` gets a date range picker (7d / 30d / 90d / custom).
- Stacked area chart: Ads vs Marketing vs Organic revenue (already built — wire to real `marketing_campaign_events` + `store_ad_campaigns` data).
- Funnel: Impression → Click → Add to cart → Purchase from `ads_studio_events` + `marketing_campaign_events`.
- Top campaigns table: sortable by ROAS / revenue / CTR / conversions, filterable by channel.
- "Export CSV" downloads the current view's data.

## 9. Backend pieces (edge functions + cron)

- `send-marketing-campaign` — fan-out to push/email/SMS providers; writes `marketing_campaign_events` (sent → delivered → opened → clicked).
- `marketing-automations-tick` — pg_cron every 5 min, advances enrolled customers through `steps_json`.
- `marketing-segments-refresh` — pg_cron nightly, recomputes `member_count` for all segments.
- `sync-segment-to-meta` / `sync-segment-to-google` — push Custom Audiences when toggle is on.
- `track-promo-redemption` — called by checkout; updates `redemption_count` and writes attribution.

## 10. Polish & glue

- **Pulsing badge** on Ads/Marketing tab when: `pending_review` campaign exists, wallet < $10, automation has failures, or scheduled send is overdue.
- **Realtime toasts** for: campaign approved/rejected, send completed, automation enrollment milestones (every 100 customers).
- **Empty-state CTAs** that open the right modal preselected (e.g., "Try a Welcome push" → wizard step 1 with Push + Welcome template chosen).
- **Skeleton → content cross-fade** for all panels (currently snaps).
- **A11y sweep**: wizard step `aria-live`, segment builder keyboard nav, charts `role="img"` with alt summary, FAB `safe-area-bottom`.
- **Mobile**: every wizard runs as a `Drawer` on `<md`, `Dialog` on `≥md` (already established pattern); sticky footer with Back/Next/Save Draft.

---

## Database additions

- `marketing_automation_enrollments` — `id, automation_id, user_id, current_step, next_run_at, status (active/paused/completed/failed), enrolled_at`
- `marketing_promo_redemptions` — `id, promo_code_id, user_id, order_id, discount_cents, redeemed_at`
- `marketing_test_sends` — `id, store_id, channel, payload_jsonb, sent_at` (audit for "Send test")
- Index on `marketing_campaigns(store_id, status, scheduled_at)`, `store_ad_campaigns(store_id, status)`, `marketing_campaign_events(campaign_id, event_type, created_at)`

All RLS-scoped to store owner + admin.

---

## Files

**Edge functions (new)**
- `supabase/functions/send-marketing-campaign/index.ts`
- `supabase/functions/marketing-automations-tick/index.ts`
- `supabase/functions/marketing-segments-refresh/index.ts`
- `supabase/functions/sync-segment-to-meta/index.ts`
- `supabase/functions/sync-segment-to-google/index.ts`
- `supabase/functions/track-promo-redemption/index.ts`

**Hooks (new / edited)**
- Edit `useStoreAdsOverview.ts` — add mutations: pause/resume/duplicate/archive/delete + draft resume helper
- Edit `useStoreMarketingOverview.ts` — add send/schedule mutations + test-send
- New `useMarketingAutomationEnrollments.ts`
- New `useSegmentLiveCount.ts` (debounced count for builder)
- Edit `useMarketingPromoCodes.ts` — bulk generate + attach-to-campaign

**Components (edited)**
- `CreateCampaignWizard.tsx` — wire submit/draft, wallet & platform gates, image upload to bucket
- `AdsCampaignRow.tsx` — overflow menu mutations + realtime toast
- `AdsConnectDialog.tsx` — OAuth popup polling, disconnect/reconnect
- `StoreMarketingSection.tsx` Overview tab → swap header for `MarketingStatStrip` + channel tiles + FAB
- `CreateMarketingCampaignWizard.tsx` — wire send/schedule/draft + use-template/save-template
- `SegmentBuilder.tsx` — live count via `useSegmentLiveCount`
- `AutomationsBuilder.tsx` — activate toggle + enrollment counter
- `PromoCodesManager.tsx` + `PromoCodeBuilder.tsx` — bulk generate + attach
- `UnifiedPerformancePanel.tsx` — date range + CSV export

**Components (new)**
- `src/components/admin/marketing/SendTestDialog.tsx`
- `src/components/admin/marketing/UseTemplatePicker.tsx`
- `src/components/admin/marketing/AttachPromoToCampaign.tsx`
- `src/components/admin/ads/AdsCampaignRowMenu.tsx` (extracted overflow menu)

**Migration**
- `supabase/migrations/<ts>_marketing_phase4.sql` — 3 new tables, indexes, RLS, pg_cron schedules for the two tick functions.

---

## Build order

1. Migration (3 new tables, indexes, RLS, cron).
2. Wire **Ads create/edit/draft/submit/pause/resume/duplicate/delete** end-to-end (the user's primary ask: "make sure can ads").
3. Wire **AdsConnectDialog OAuth + manual + reconnect/disconnect**.
4. Swap **Marketing Overview header** to stat strip + channel tiles + FAB.
5. Wire **CreateMarketingCampaignWizard** send/schedule/draft + send-test.
6. **Segments live count** + use-as-audience in both wizards.
7. **Templates** use/save flow in both wizards.
8. **Promos** generator + attach-to-campaign.
9. **Automations** activate + enrollment cron + counter.
10. **Performance** date range + CSV export.
11. Realtime toasts, pulsing tab badges, cross-fade skeletons, a11y, mobile FAB safe-area.

---

## Recommendation

Phase 4 is large — if you want to ship in chunks:
- **Chunk A (most user-visible):** steps 1–4 (Ads fully working + Marketing header + wizard send) — this alone makes "create an ad" and "send a campaign" functional.
- **Chunk B:** steps 5–8 (Segments, Templates, Promos cross-wired into wizards).
- **Chunk C:** steps 9–11 (Automations cron + Performance + polish).

Reply "all", "Chunk A", "Chunk A + B", or any specific step numbers and I'll switch to default mode and ship.

