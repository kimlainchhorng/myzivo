

## Complete Lodging Trip Management Flow

Build the missing “after booking” flow directly on `/my-trips/lodging/:reservationId`: receipt downloads, calendar export, add-ons, message property with pinned reservation context, cancellation/refunds, and date changes with payment + host approval where needed.

### Current state to extend

Some foundations already exist:
- `MyLodgingTripPage.tsx` exists.
- `ReceiptActions.tsx` exists but currently only prints the page for “Receipt”; it does not generate a real PDF receipt.
- `RescheduleSheet.tsx` and `CancelReservationSheet.tsx` exist but need stronger server validation, live refresh, payment/refund completion, and UX polish.
- `lodge_reservation_change_requests` exists for reschedule/cancel/addon history.
- `request-lodging-change`, `approve-lodging-change`, and `cancel-lodging-reservation` exist but need completion for add-ons, refunds, blocked dates, and paid deltas.
- Store chat exists via `store_chats` / `store_chat_messages`, but the lodging trip page only links to `/chat?store=...`; it does not open a reservation-aware chat or pin context.

---

## 1. Trip page: make it the full management hub

Update `src/pages/MyLodgingTripPage.tsx` to:
- Use the live reservation result from `useReservationLive(reservationId)` as the active display source so status/payment changes appear immediately.
- Fetch richer reservation data:
  - `adults`, `children`, `guest_email`, `guest_phone`
  - `addons`, `addon_selections`, `fee_breakdown`
  - `deposit_cents`, `stripe_payment_intent_id`, `last_payment_error`
  - room data including `lodge_rooms.addons`, `base_rate_cents`, `cancellation_policy`
  - store data including `name`, `logo_url`, and owner/store profile details where available.
- Replace the simple action grid with a full “Manage your stay” card:
  - Change dates
  - Add services
  - Message property
  - Cancel reservation
  - Download receipt
  - Add to calendar
- Add visible live status panels:
  - “Confirmed / Hold / Cancelled”
  - “Payment authorized / paid / refund pending / refunded / failed”
  - Latest change request outcome.

---

## 2. Receipt download and calendar export

### PDF receipt

Replace the current `window.print()` receipt action with a real downloadable PDF.

Add edge function:

```text
supabase/functions/lodging-reservation-receipt/index.ts
```

Function behavior:
- Validate the caller’s JWT in code.
- Load the reservation only if:
  - guest owns the reservation, or
  - caller is store owner/admin.
- Return a PDF response with:
  - ZIVO / property name
  - reservation number
  - guest name
  - check-in/check-out/nights
  - room number/type
  - payment status
  - total, paid, balance, refund if cancelled
  - add-ons and charges
  - cancellation policy summary
- Use Deno-compatible imports only; keep Supabase SDK imported through `_shared/deps.ts`.

Update `ReceiptActions.tsx`:
- “Receipt” button invokes `lodging-reservation-receipt`.
- Downloads `ZIVO-reservation-<number>.pdf`.
- Shows loading/error states.

### Calendar export

Keep the client-side `.ics` generation, but improve it:
- Add location/property name.
- Include reservation number.
- Escape ICS text safely.
- Use `DTSTART;VALUE=DATE` and `DTEND;VALUE=DATE` correctly.
- Download as `<reservationNumber>.ics`.

---

## 3. Add-ons after booking

Add a new guest sheet:

```text
src/components/lodging/guest/AddOnsSheet.tsx
```

UI:
- Pull available add-ons from the booked room’s `lodge_rooms.addons`.
- Show each service with:
  - name
  - price
  - pricing unit: per stay / per night / per guest / per person-night
  - quantity selector where relevant.
- Calculate total live:
  - per stay: price
  - per night: price × reservation nights
  - per guest: price × guests
  - per person-night: price × guests × nights
- Show selected saved payment method:
  - default Stripe card if available
  - clear error if no saved card exists
  - link/button to add/manage cards via existing wallet/payment-method flow.
- Confirm button says “Charge saved card”.

Add edge function:

```text
supabase/functions/purchase-lodging-addons/index.ts
```

Function behavior:
- Validate JWT.
- Validate request body; never trust add-on prices from the client.
- Load reservation and verify caller is the guest.
- Load booked room’s `addons`.
- Match requested add-ons against the server-side room add-on catalog.
- Recalculate total server-side.
- Find the Stripe customer by authenticated user email.
- Use the customer’s default saved payment method.
- Create and confirm a Stripe PaymentIntent off-session for the add-on total.
- On success:
  - Insert a `lodge_reservation_change_requests` row with `type = 'addon'`, `status = 'auto_approved'`, `addon_payload`, and `price_delta_cents`.
  - Insert rows into `lodge_reservation_charges`.
  - Update `lodge_reservations.extras_cents`, `total_cents`, `paid_cents`, `addons` / `addon_selections`.
- On payment failure:
  - Return a clear error and do not modify reservation totals.

This keeps add-ons inline and charges the same saved payment method.

---

## 4. Message property with pinned reservation context

Add a lodging-specific message launcher instead of a plain `/chat?store=...` link.

Add component:

```text
src/components/lodging/guest/MessagePropertyButton.tsx
```

Behavior:
- On click:
  - Get or create `store_chats` row for this guest + store.
  - Upsert `lodge_reservation_messages_link` with `reservation_id`, `store_id`, `thread_id`.
  - Insert a first system-style customer message only once, containing pinned reservation context:
    - Reservation number
    - dates
    - room
    - status
    - link back to trip page
  - Open the existing `StoreLiveChat` drawer inline on the lodging trip page.
- Avoid duplicate pinned messages by checking the link row first.
- Button text: “Message property”.

Update `StoreLiveChat.tsx` minimally:
- Accept optional `reservationContext` prop.
- Render a compact pinned card at the top of the message list when provided:
  - reservation number
  - dates
  - status
  - “View reservation” link for host/guest context.
- Keep existing realtime chat behavior unchanged.

---

## 5. Full cancel reservation flow

Upgrade the existing `CancelReservationSheet.tsx`.

UI additions:
- Policy breakdown card:
  - total paid
  - cancellation window
  - refund percent
  - refund amount
  - forfeited amount
  - payment/refund status after submission.
- Confirmation modal:
  - user must explicitly confirm cancellation
  - destructive action only enabled after reason selected.
- Post-submit state:
  - “Cancellation submitted”
  - “Refund pending”
  - “Refunded”
  - “No refund due”
- Use `aria-live` for refund result and errors.

Upgrade edge function:

```text
supabase/functions/cancel-lodging-reservation/index.ts
```

Function behavior:
- Validate JWT.
- Verify guest owns reservation.
- Recalculate refund server-side.
- If there is a refundable captured/paid Stripe payment:
  - Call `stripe.refunds.create({ payment_intent, amount })`.
  - Set `payment_status = 'refund_pending'`.
  - Webhook later updates to `refunded`.
- If payment was only authorized/manual capture and not captured:
  - Cancel the PaymentIntent instead of refunding.
  - Set `payment_status = 'refunded'` or `unpaid` depending Stripe status.
- If no refund:
  - Set `payment_status` to a clear final state.
- Update reservation:
  - `status = 'cancelled'`
  - preserve audit fields.
- Insert `lodge_reservation_change_requests` audit row with refund amount and reason.
- Insert `lodge_reservation_audit` row for status history.
- Return refund/payment status for immediate UI display.

---

## 6. Change dates / reschedule flow

Improve existing `RescheduleSheet.tsx` and server logic.

### UI

Keep the current date range picker, but enhance it:
- Exclude the current reservation from client-side conflict checks.
- Show room blocked dates and unavailable ranges where possible.
- Show:
  - current dates
  - new dates
  - old total
  - new total
  - price difference
  - whether it can be instant-approved or needs host approval.
- If price increases:
  - explain that the saved payment method may be charged after approval.
- If price decreases:
  - explain credit/refund handling.
- After submit:
  - show “Dates updated” for auto-approved changes
  - show “Sent to host” for pending approval.
- Live request history refreshes after realtime updates.

### Server

Upgrade `request-lodging-change`:
- Validate date inputs.
- Verify guest owns reservation.
- Check overlapping active reservations excluding the current reservation.
- Check `lodge_room_blocks` for blocked dates in the proposed range.
- Recalculate nights and price server-side from reservation/room data.
- Auto-approve only when:
  - room is available
  - date shift is within policy
  - no price increase requiring capture/charge.
- If auto-approved:
  - update reservation dates, nights, total.
  - insert audit row.
- If pending:
  - insert change request with proposed dates, total, delta, and reason.

Upgrade `approve-lodging-change`:
- Re-check availability before approval.
- For reschedule approvals:
  - If price delta is positive:
    - charge guest’s saved default Stripe payment method off-session before applying dates.
    - insert a `lodge_reservation_charges` row.
    - update `paid_cents` and `total_cents`.
  - If price delta is negative:
    - record refund/credit amount in the change request.
    - optionally issue a partial Stripe refund if there is a captured payment.
  - Apply new dates and nights only after payment/refund step is handled.
- If host declines:
  - preserve original reservation unchanged.
  - save host response.

---

## 7. Database migration

Add a small migration for tracking payment outcomes and pinned context cleanly.

Proposed additions:
- Add to `lodge_reservation_change_requests`:
  - `stripe_payment_intent_id text`
  - `payment_status text default 'not_required'`
  - `applied_at timestamptz`
- Add to `lodge_reservation_messages_link`:
  - `pinned_message_id uuid`
- Add indexes:
  - `idx_lrcr_payment_status`
  - `idx_lrml_thread`
- Add guest read policy for `lodge_reservation_charges` so the guest can see add-on/payment line items on their own reservation.

No roles will be stored on profiles/users. Existing role checks remain through `user_roles` / `has_role`.

---

## 8. Files to add/edit

### New files

```text
src/components/lodging/guest/AddOnsSheet.tsx
src/components/lodging/guest/MessagePropertyButton.tsx
supabase/functions/lodging-reservation-receipt/index.ts
supabase/functions/purchase-lodging-addons/index.ts
supabase/migrations/<timestamp>_lodging_trip_management_completion.sql
```

### Edited files

```text
src/pages/MyLodgingTripPage.tsx
src/components/lodging/guest/ReceiptActions.tsx
src/components/lodging/guest/CancelReservationSheet.tsx
src/components/lodging/guest/RescheduleSheet.tsx
src/components/grocery/StoreLiveChat.tsx
src/hooks/lodging/useReservationChangeRequests.ts
src/hooks/lodging/useRoomConflictCheck.ts
src/hooks/lodging/useReservationLive.ts
supabase/functions/request-lodging-change/index.ts
supabase/functions/approve-lodging-change/index.ts
supabase/functions/cancel-lodging-reservation/index.ts
```

---

## 9. Verification

After implementation:
- Open a confirmed lodging trip.
- Download PDF receipt and confirm it includes reservation/payment/add-on details.
- Download `.ics` and confirm dates import correctly.
- Add an add-on with a saved card and confirm:
  - Stripe charge succeeds
  - reservation total/paid amount updates
  - request history shows add-on.
- Message property and confirm:
  - chat opens inline
  - pinned reservation context is visible
  - host sees same context.
- Cancel a reservation in:
  - full refund window
  - partial refund window
  - no refund window.
- Reschedule to:
  - available auto-approved dates
  - blocked dates
  - dates needing host approval
  - dates with positive price delta requiring saved-card charge.

