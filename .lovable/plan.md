

# Next-up: Marketing & Ads — recommended follow-ups

The Ads tab now has a stat strip, dense platform tiles, onboarding checklist, campaign rows with sparklines, unified connect dialog, and a 4-step wizard. Here are the highest-leverage things still missing — pick any combination.

## 1. Campaign detail drawer (highest impact)
Tapping a campaign row currently does nothing useful. Add a `ResponsiveModal` drawer that shows:
- Full creative preview (headline / body / CTA / image at 1:1, 9:16, 1.91:1 toggle)
- KPI grid: Spend, Impressions, Clicks, CTR, CPC, Conversions, CPA, ROAS
- 14-day line chart (clicks + spend dual-axis) using existing Recharts
- Delivery breakdown by platform (mini bar chart)
- Audit log: status changes, edits, who/when
- Actions: Pause/Resume, Edit (re-opens wizard pre-filled), Duplicate, Archive, Delete

## 2. Wallet & billing surface
The checklist has a "billing" step but there's no in-tab wallet view. Add:
- Compact wallet card above the checklist: balance, pending charges, low-balance warning, "Add funds" CTA
- Auto-reload toggle (recharge $X when balance < $Y)
- Last 5 transactions inline, "View all" → existing `AdsStudioWalletGuard` page
- Spend pacing indicator: "You'll run out in ~6 days at current pace"

## 3. Marketing tab parity
The sibling **Marketing** tab (campaigns, push, email, promo codes) is still on the older flat layout. Apply the same treatment:
- Aggregate stat strip (sent, opened, clicked, conversions, revenue attributed)
- Per-channel tiles (Push / Email / SMS / In-app) with status + last-sent
- Unified campaign list with the same filter / search / sort / sparkline pattern
- Reuse `useStoreAdsOverview` pattern → new `useStoreMarketingOverview` hook

## 4. Insights & recommendations panel
A small AI-style recommendations strip below the stat strip:
- "Your Meta CTR is 2.3× higher than Google — shift budget?"
- "Campaign 'Spring Sale' has spent 80% with 3 days left"
- "No active campaigns — your competitors run an average of 2.4"
- Each card has a one-tap action (Boost budget / Extend / Create campaign)
- Powered by simple client-side rules over the overview data (no backend)

## 5. Creative library
Most operators reuse images. Add a `Creatives` sub-tab inside Ads:
- Grid of previously uploaded ad images with usage count
- Upload / delete / rename
- Wizard "Creative" step gets a "Pick from library" button alongside upload
- Stored in existing `user-posts` bucket under `ads/{store_id}/`

## 6. Audience presets manager
The wizard has Local / Lookalike / Retarget / Custom but no way to save a custom audience. Add:
- "Saved audiences" list in a small section under platforms grid
- Create/edit audience: name, geo radius, age range, interests (chips), exclusions
- Reusable across campaigns; appears as a chip in wizard step 2

## 7. Schedule & dayparting
Wizard step 4 currently has only date range. Add:
- Dayparting grid (7×24 cells, click-drag to enable hours)
- Timezone selector (defaults to store TZ)
- "Always on" / "Custom schedule" toggle
- Stored as `schedule_json` on the campaign row

## 8. A/B test harness
- New "Variants" toggle in wizard step 3 → splits creative into A/B
- Campaign row shows variant winner badge once statistical significance is reached
- Detail drawer adds Variants tab with side-by-side performance

## 9. Realtime polish
- Toast when a campaign status flips (approved / rejected / paused by system)
- Pulsing dot on the Ads tab badge while a campaign is in `pending_review`
- Skeleton → content cross-fade (currently snaps)

## 10. Empty-state and first-run polish
- When zero platforms connected, the platform grid gets a subtle "Start with Meta" suggestion card (most common first connect)
- When zero campaigns, the wizard auto-opens on first tab visit (one-time, dismissible)
- Onboarding checklist step 4 ("Submit for review") shows a sample campaign preview if user is stuck

---

## Recommendation
If you only want one: **#1 Campaign detail drawer** — it unlocks the value of every other improvement (no point in better stats if you can't drill in). After that, **#2 Wallet surface** + **#4 Insights panel** give the biggest perceived "smart product" jump for the smallest build.

Tell me which to build (any combination, or "all of them") and I'll switch to default mode and ship.

