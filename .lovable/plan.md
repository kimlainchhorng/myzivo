## Goal

Enable ZIVO (a US company) to pay out hotel/lodge hosts in **multiple countries**, including markets that **Stripe Connect does not support** (Cambodia, Laos, Myanmar, Vietnam). Today the Payouts page only offers Stripe Connect Express, which silently fails for those hosts.

## The Stripe Reality (important)

Stripe Connect Express **only accepts connected accounts in supported countries**. In Asia that's: Singapore, Hong Kong, Japan, Malaysia, Thailand, Indonesia, Philippines, India, UAE. **Cambodia, Laos, Myanmar, Vietnam are not supported by Stripe at all** — there's no way to send money directly into a Cambodian bank from a Stripe Connect account today.

So the solution must be **multi-rail**: route each host to whichever rail actually works for their country.

## Architecture: Multi-Rail Payout Router

```text
                 Host's country
                       │
        ┌──────────────┼──────────────┬─────────────┐
        ▼              ▼              ▼             ▼
   Stripe Connect   Manual ABA    Manual Bank     PayPal
   (US, EU, SG,    Wire (KH)    Wire (any)     (where avail.)
    HK, JP, MY,    via Telegram   reviewed by
    TH, ID, PH,    confirmation   admin
    IN, AE...)
```

Reuse infrastructure that **already exists** in the consumer wallet:
- `payout_methods` table (bank_transfer, aba, paypal types) — already used by `WalletPage`.
- `cashout_requests` table + admin review flow — already wired.
- `connect-onboard` / `connect-status` edge functions — already working.

We just need to surface this on the **lodge admin** side and add a country-aware router.

## Plan

### 1. Country-aware rail picker (`src/lib/payouts/payoutRails.ts` — new)
Single source of truth that maps an ISO country code to available rails:
- `STRIPE_CONNECT_COUNTRIES`: full Stripe-supported list (~46 countries) — gets Stripe Express.
- `MANUAL_ABA_COUNTRIES`: `["KH"]` — gets ABA / KHQR rail.
- All others fall back to `manual_bank_wire` + `paypal` if eligible.
- Exposes `getAvailableRails(country)` → `{ stripe?: true, aba?: true, bank_wire?: true, paypal?: true }` and `recommendedRail(country)`.

### 2. Replace single-rail UI with `LodgingPayoutAccountCard` (`src/components/admin/store/lodging/LodgingPayoutAccountCard.tsx` — new)
Replaces the "Payout account" card we just added in `LodgingPayoutsSection`. Behaviour:
1. Reads the store's `country_code` (from `store_profiles`, fallback to user profile / "US").
2. Calls `getAvailableRails(country)`.
3. Shows tabs/segments for each available rail:
   - **Stripe Connect** → existing `useConnectOnboard()` flow (passes the host's country, not hardcoded "US").
   - **ABA / KHQR** → form to add an ABA payout method (`payout_methods` insert with `method_type: "aba"`).
   - **Bank wire** → form for IBAN/SWIFT/account-holder + country.
   - **PayPal** → email entry.
4. Shows "Active" badge on the rail currently configured for this store.

### 3. Fix `connect-onboard` to honor the host's country
Today the edge function defaults `country = "US"`. The frontend now passes the actual store country. Add a guard: if country isn't in `STRIPE_CONNECT_COUNTRIES`, return `{ error: "stripe_unsupported_country", supported: false }` so the UI can fall through to manual rails instead of failing inside Stripe.

### 4. Lodging-scoped payout methods
The existing `payout_methods` table is keyed by `user_id`. Add an optional `store_id uuid` column (nullable, FK to `store_profiles`) so a host who manages multiple properties can have **different bank accounts per property**. Migration:
```sql
ALTER TABLE public.payout_methods
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.store_profiles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payout_methods_store ON public.payout_methods(store_id);
```
RLS update so store owners can manage their store's methods.

### 5. Cashout request flow for lodges
Add a "Request payout" button on the Payouts & Finance section that opens a sheet (`LodgingCashoutSheet`):
- Pre-fills net payout balance.
- Choose configured payout method.
- Inserts a `cashout_requests` row tagged with `store_id` and `source: "lodge"` for admin review.
- Cambodia hosts see a note: *"ABA transfer is processed manually within 1 business day; you'll be notified on Telegram."*

### 6. Admin-side approval surface
Reuse the existing admin cashout review page (already exists for consumer wallet). Add a `source` filter so ops can see lodge payout requests separately.

### 7. UI polish in `LodgingPayoutsSection.tsx`
- Replace inline Stripe-only card with new `LodgingPayoutAccountCard`.
- Update warning banner copy: *"Set up a payout method to receive funds"* (rail-agnostic).
- Add a "Payout method" line to the Payout History table showing how each batch was/will be paid.

## Files Changed / Added

**New**
- `src/lib/payouts/payoutRails.ts` — country → rail map.
- `src/components/admin/store/lodging/LodgingPayoutAccountCard.tsx` — multi-rail UI.
- `src/components/admin/store/lodging/LodgingCashoutSheet.tsx` — request payout sheet.
- One migration adding `store_id` to `payout_methods` + RLS.

**Modified**
- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx` — swap card, add request-payout button, payout-method column.
- `supabase/functions/connect-onboard/index.ts` — accept dynamic country, reject unsupported countries cleanly.

## Out of Scope (follow-ups)

- Wise / Payoneer API integration (would let us automate KH/LA/MM payouts instead of manual ABA). Plumbing in `payoutRails.ts` makes this a drop-in addition later.
- Multi-currency display (still USD; FX handled at manual transfer time).
- Tax form collection for non-Stripe rails (today admins collect W-8BEN out-of-band).
