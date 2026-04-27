## Goal
Complete the multi-rail payout flow so US hosts use Stripe Connect automatically while Cambodia (and other unsupported countries) get routed to manual ABA / bank wire / PayPal — with clear instructions, verification, and an end-to-end status history.

The DB tables (`customer_payout_methods` with `store_id/country_code/rail`, `lodge_payout_requests`) and the country router (`payoutRails.ts`) are already in place from the previous step. The backend already rejects unsupported Stripe countries with `stripe_unsupported_country`. This plan adds the missing UX, validation, and routing wiring.

---

## 1. Auto-fallback when Stripe is rejected (frontend)
File: `src/components/admin/store/lodging/LodgingPayoutAccountCard.tsx`

- In `startStripe()`, catch the `stripe_unsupported_country` error from `useConnectOnboard`. When it fires:
  - Disable the Stripe tab for this country.
  - Switch `activeRail` to the recommended manual rail (`recommendedRail(country)`).
  - Show a toast: "Stripe Connect isn't available in {country}. Switched to {RAIL_LABELS[fallback]}."
- File: `src/components/admin/store/lodging/LodgingPayoutsSection.tsx` — remove the hard-coded `onboard.mutate("US")` in the "Finish setup" banner. Pass the actual store country and reuse the same fallback path.

## 2. Eligibility + verification UI on each manual rail
File: `LodgingPayoutAccountCard.tsx` → extend `ManualMethodForm`.

- Add a verification step after "Save":
  - For **ABA**: require 8-digit ABA account number format, account holder name match, and a confirmation checkbox "I confirm this ABA account is mine and the name matches my ID".
  - For **bank wire**: require SWIFT/BIC for non-US countries, and IBAN length validation for EU.
  - For **PayPal**: require valid email + a "send a $0 verification" checkbox (deferred — for now just confirmation).
- Mark the saved row as `verification_status: 'pending' | 'verified'` (use existing `is_default` UI pattern, no schema change needed — store in `metadata` jsonb column on `customer_payout_methods` if present, else add migration with one new column `verification_status text default 'pending'`).
- Show a per-method badge: "Verified" / "Pending verification".

## 3. Cambodia (and per-country) instruction panels
File: New `src/components/admin/store/lodging/PayoutInstructionsPanel.tsx`

- Country-aware copy block rendered above the rail tabs.
- For **KH**:
  - Fees: "ZIVO covers ABA transfer fees. Net payout = booking total − 2% platform fee."
  - Processing time: "Manual ABA transfer within 1 business day after host requests payout."
  - Required fields: ABA account number, account holder full name (Khmer/English), phone linked to ABA.
  - Admin contact: "Payouts are processed by the ZIVO finance team via Telegram alert to admins."
- For **US**: Stripe Express auto-payout in 2 business days, 1099-K issued by Stripe.
- Generic fallback for other countries.
- Render in `LodgingPayoutsSection.tsx` directly under the stat grid.

## 4. Payout history table with full status flow
File: New `src/components/admin/store/lodging/LodgingPayoutHistoryTable.tsx`

- Read from `lodge_payout_requests` filtered by `store_id`, ordered desc.
- Columns: Requested at · Amount · Method (rail + last-4 / ABA id / PayPal email) · Status · Reference · Failure reason.
- Status badges using existing color system:
  - `pending` → amber "Requested"
  - `approved` → blue "Processing"
  - `paid` → emerald "Completed"
  - `rejected` → red "Failed" (show `admin_note` as failure reason)
  - `cancelled` → gray "Cancelled"
- Replace the current month-bucket "Payout history" block in `LodgingPayoutsSection.tsx` with this real table. Keep the monthly *revenue* trend chart.

## 5. Request payout sheet (host-initiated)
File: New `src/components/admin/store/lodging/LodgingRequestPayoutSheet.tsx`

- Triggered by "Request payout" button next to "Export CSV".
- Pre-fills available net balance (`stats.netPayout − already requested`).
- Lets host pick from saved verified payout methods (filtered by `store_id`).
- Inserts into `lodge_payout_requests` with `rail = method.rail`, `status='pending'`.
- Shows the Cambodia-specific note for KH ("Admin will process within 1 business day via ABA").
- After success, invalidates `lodge-payout-history` query.

## 6. Backend: notify admin + double-check country on request
File: New edge function `supabase/functions/lodge-payout-request/index.ts`

- Validates: user owns the store, payout_method_id belongs to the same store, requested amount ≤ available net.
- Re-validates rail vs country (defence-in-depth: if rail='stripe' but country not in `STRIPE_COUNTRIES`, reject).
- Inserts the row server-side (RLS already allows this, but we centralize validation).
- Sends Telegram alert to admin chat (reuses existing pattern from cashout flow): "New {rail} payout request: {storeName} · {amount} · {country}".

## 7. Wire it together
File: `LodgingPayoutsSection.tsx`

- Header actions: `[Export CSV] [Request payout]`.
- Order on the page:
  1. Payouts paused banner (if any)
  2. Stat grid (6 cards)
  3. `PayoutInstructionsPanel` (country-aware fees + processing time)
  4. `LodgingPayoutAccountCard` (multi-rail setup with verification)
  5. Monthly revenue chart
  6. `LodgingPayoutHistoryTable` (real `lodge_payout_requests` rows with statuses)
  7. Next actions

---

## Technical details
- New migration: add `verification_status text default 'pending'` and `failure_reason text` to `customer_payout_methods`; add `failure_reason text` to `lodge_payout_requests` (separate from `admin_note` so we can surface it cleanly).
- Frontend uses existing `useConnectOnboard` mutation; we just intercept its `onError` to switch rails.
- Telegram alerts reuse `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ADMIN_CHAT_ID` secrets already present from the cashout flow.
- All new UI follows the v2026 high-density compact standard (`text-[11px/13px]`, `p-2/p-3`, lucide icons only).

## Files to create
- `src/components/admin/store/lodging/PayoutInstructionsPanel.tsx`
- `src/components/admin/store/lodging/LodgingPayoutHistoryTable.tsx`
- `src/components/admin/store/lodging/LodgingRequestPayoutSheet.tsx`
- `supabase/functions/lodge-payout-request/index.ts`
- One new migration for the two extra columns

## Files to edit
- `src/components/admin/store/lodging/LodgingPayoutAccountCard.tsx` (auto-fallback + verification UI)
- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx` (use store country, request button, new history table, instructions panel)
