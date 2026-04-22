

# Hotels & Resort — Final booking-flow polish

Five focused upgrades to the lodging booking drawer, reservation history, and post-booking experience.

## 1. Real house-rules & cancellation text + scroll-to-confirm

In `LodgingBookingDrawer.tsx` Step 4 (Review):

- Pull `house_rules` (quiet hours, party policy, smoking, min age, ID-at-checkin, security deposit) and `cancellationPolicy` text **directly from `lodge_property_profile`** via a new `useLodgePropertyProfile(storeId)` call inside the drawer.
- Render a scrollable policy panel (`max-h-44 overflow-y-auto`) listing each rule as a bullet, plus the cancellation policy formatted in plain English (`flexible` → "Free cancellation up to 24h before check-in", `moderate`, `strict`, `non_refundable`).
- Track scroll-to-bottom with an `onScroll` handler; the two consent checkboxes stay **disabled** until the user has scrolled to the end (or the panel fits on screen with no overflow). A small hint reads "Scroll to read all rules" until cleared.
- The Confirm button stays disabled until both checkboxes are ticked.

## 2. Required guest validation

- Add `zod` schema for guest step: `name` (≥2 chars trimmed), `phone` (E.164 via existing `normalizePhoneE164`, ≥7 digits), `email` (valid format, **required** — was optional).
- Per-field inline error messages shown on blur.
- `Continue` from Guest step and final `Confirm` are both disabled until `schema.safeParse` passes.
- Country dropdown stays optional; ETA / notes stay optional.

## 3. Booking status timeline

New `ReservationStatusTimeline.tsx` component rendering a horizontal stepper:

```text
[●] Hold ──── [○] Confirmed ──── [○] Checked-in ──── [○] Checked-out
                                       ╲
                                        [✕] Cancelled / No-show (if applicable)
```

- Steps highlight based on `reservation.status` (hold/confirmed/checked_in/checked_out/cancelled/no_show).
- Shown on the **success screen** of the booking drawer (after submit) and in **`TripDetailPage.tsx`** / **`MyTripsPage.tsx`** for any lodging-type trip item.
- Adds a `useLodgeReservation(reservationId)` lookup so the public trip page can display the live status timeline pulled from `lodge_reservations`.

## 4. Richer .ics calendar

Replace the all-day `VALUE=DATE` event in `downloadIcs()` with two timed events using the property timezone:

- Event 1 — **Check-in**: `DTSTART` = check-in date + property `check_in_from` time, `DTEND` = +1h. `LOCATION` = full `store.address`. `DESCRIPTION` includes reference, total, room, contact phone, and "Cancellation: …".
- Event 2 — **Check-out**: same pattern with `check_out_until`.
- Use `DTSTART;TZID=<property tz>` and embed a minimal `VTIMEZONE` block. Property timezone falls back to `Asia/Phnom_Penh` (existing project default) when unset on the store.
- Both events get `ORGANIZER:CN=<storeName>:mailto:noreply@hizivo.com`, `URL:` link back to the store page, and an `ATTENDEE` line for the guest email.

## 5. Stripe deposit / hold integration

For the **"Card on arrival"** payment method, replace today's pure-record flow with an actual Stripe charge so the host can secure or capture a deposit.

- New edge function **`create-lodging-deposit`** (`supabase/functions/create-lodging-deposit/index.ts`):
  - Auth via Supabase JWT + Stripe SDK (`STRIPE_SECRET_KEY` already present, see `supabase/functions/create-grocery-checkout/index.ts` for the pattern).
  - Input: `{ reservation_id, store_id, deposit_cents, mode: "deposit" | "full" }`.
  - Creates a Stripe Checkout Session in `mode: "payment"` with `payment_intent_data.capture_method = "manual"` for **hold** (auth only) or `automatic` for **full charge**.
  - Stores `stripe_session_id` + `stripe_payment_intent_id` back on `lodge_reservations` and bumps `payment_status` to `authorized` or `paid`.
  - Success URL → drawer success step with `?paid=1`; cancel URL → review step.
- Drawer (`LodgingBookingDrawer.tsx`):
  - When `payMethod === "card_on_arrival"`, after the `lodge_reservations` insert succeeds, call `supabase.functions.invoke("create-lodging-deposit", { body: { reservation_id, deposit_cents: securityDeposit || 0, mode: securityDeposit > 0 ? "deposit" : "full" } })` and `window.open(url, "_blank")`.
  - "Pay at property" and "Bank transfer" keep current behaviour (no Stripe call).
- DB: migration adds `stripe_session_id text`, `stripe_payment_intent_id text`, and a `payment_status` value of `authorized` to `lodge_reservations`.

## File map

**Created**
- `src/components/lodging/ReservationStatusTimeline.tsx`
- `src/lib/lodging/ics.ts` (timezone-aware .ics builder)
- `src/lib/lodging/cancellationCopy.ts` (policy → human text)
- `src/lib/lodging/guestSchema.ts` (zod)
- `supabase/functions/create-lodging-deposit/index.ts`
- `supabase/migrations/<ts>_lodge_reservations_stripe.sql`

**Modified**
- `src/components/lodging/LodgingBookingDrawer.tsx` — pulls property profile, scroll-gated consent, zod guest validation, Stripe invoke for card-on-arrival, status timeline on success, new `.ics` builder.
- `src/hooks/lodging/useLodgePropertyProfile.ts` — add `cancellation_policy_text` field if missing in HouseRules typing.
- `src/pages/trips/TripDetailPage.tsx` — render `ReservationStatusTimeline` for lodging items.
- `src/pages/app/MyTripsPage.tsx` — show small status pill (driven by same component compact mode) per lodging trip card.

## Technical notes

- No new npm dependencies — `zod` and `@stripe/stripe-js` are already installed; the edge function uses the same `Stripe` import pattern as existing functions.
- RLS: insert/update `lodge_reservations` already permitted for owner + guest's own row. The edge function uses the service role to write Stripe IDs back.
- `.ics` file remains client-generated (no server email yet); a follow-up could mail it via the existing transactional email scaffold.
- All UI follows v2026 high-density tokens (`text-[11px]`, `rounded-xl`, Lucide icons only) per project memory.

