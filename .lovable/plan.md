
## Lodging Trip Flow Enhancements

Add the missing “smarter post-booking” pieces to the lodging trip page: timed calendar exports, server-validated add-on availability, richer cancellation policy preview, receipt download history, and realtime toast alerts.

### 1. Timed `.ics` calendar export with device timezone

Update `ReceiptActions.tsx` to stop using its simple all-day ICS builder and use the richer existing helper in `src/lib/lodging/ics.ts`.

What changes:
- Fetch/pass room `check_in_time` and `check_out_time` from `lodge_rooms`.
- Default to:
  - check-in: `15:00`
  - check-out: `11:00`
- Detect the guest device timezone with:
  - `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Generate two calendar events:
  - “Check-in”
  - “Check-out”
- Include reservation number, property name, room label, and payment/cancellation summary where available.

Files:
- `src/pages/MyLodgingTripPage.tsx`
- `src/components/lodging/guest/ReceiptActions.tsx`
- reuse `src/lib/lodging/ics.ts`

---

### 2. Server-side add-on eligibility checks

Add a new Edge Function:

```text
supabase/functions/lodging-addon-eligibility/index.ts
```

It will:
- Validate the JWT in code.
- Verify the reservation belongs to the current guest.
- Load reservation room, dates, nights, adults/children, status, and room add-on catalog.
- Evaluate each add-on server-side using fields already possible in the room `addons` JSON, such as:
  - `disabled`
  - `min_guests`
  - `max_guests`
  - `min_nights`
  - `max_nights`
  - `available_from`
  - `available_until`
  - `exclude_blocked_dates`
  - `max_quantity`
  - `requires_status`
- Return:

```ts
{
  id: string;
  eligible: boolean;
  reason?: string;
  max_quantity?: number;
}
```

Update `purchase-lodging-addons` to re-run the same eligibility rules before charging, so disabled UI cannot be bypassed.

Update `AddOnsSheet.tsx`:
- Call the eligibility function when the sheet opens.
- Disable quantity buttons for unavailable add-ons.
- Show the server reason under the add-on, for example:
  - “Only available for 2+ nights”
  - “Not available for your guest count”
  - “Unavailable for these stay dates”
- Prevent checkout if any selected add-on becomes unavailable.

Files:
- `src/components/lodging/guest/AddOnsSheet.tsx`
- `supabase/functions/lodging-addon-eligibility/index.ts`
- `supabase/functions/purchase-lodging-addons/index.ts`

---

### 3. Interactive cancellation policy breakdown

Upgrade `CancelReservationSheet.tsx` so the refund preview is server-authoritative, not only client-estimated.

Update `cancel-lodging-reservation`:
- Support a preview mode:

```json
{ "reservation_id": "...", "preview": true }
```

- Preview mode does not cancel anything.
- It returns:
  - policy label
  - hours/days until check-in
  - refund percentage
  - refundable cents
  - non-refundable cents
  - total paid
  - Stripe/payment-method outcome:
    - captured card payment → refund to saved card
    - manual authorization → authorization will be cancelled
    - no refundable payment → no charge/refund action
    - no Stripe payment intent → no saved-card action available

Update the sheet UI:
- Add a visual split bar showing refundable vs non-refundable amount.
- Highlight the active policy window:
  - 7+ days: full refund
  - 2–6 days: 50% refund
  - less than 48h: no refund
- Add a “What happens to my saved payment method” section.
- Keep the final confirmation modal; actual cancellation still re-computes everything server-side.

Files:
- `src/components/lodging/guest/CancelReservationSheet.tsx`
- `supabase/functions/cancel-lodging-reservation/index.ts`

---

### 4. Receipt download history and re-download

Add a new table for receipt download records:

```text
public.lodge_reservation_receipts
```

Columns:
- `id uuid primary key`
- `reservation_id uuid not null`
- `store_id uuid not null`
- `generated_by uuid`
- `reservation_number text`
- `filename text`
- `snapshot jsonb not null`
- `pdf_sha256 text`
- `created_at timestamptz default now()`

RLS:
- Guests can view receipts for their own reservations.
- Store owners/admins can view receipts for their store reservations.
- Inserts are done by the receipt Edge Function using the service role after it validates the caller.

Update `lodging-reservation-receipt`:
- Existing behavior: generate a new receipt PDF and insert a receipt history row with a frozen snapshot.
- New behavior: if called with `receipt_id`, validate access and regenerate the PDF from the stored snapshot so the re-download matches the original receipt content/timestamp.
- Return the same PDF filename.

Add UI section on `MyLodgingTripPage.tsx`:
- “Receipt history”
- List previous downloads with timestamps.
- Button: “Re-download”
- Empty state: “No receipts downloaded yet.”

Files:
- new migration: `supabase/migrations/<timestamp>_lodging_receipt_history_and_notifications.sql`
- `supabase/functions/lodging-reservation-receipt/index.ts`
- `src/pages/MyLodgingTripPage.tsx`
- `src/components/lodging/guest/ReceiptActions.tsx`
- new component: `src/components/lodging/guest/ReceiptHistoryCard.tsx`

---

### 5. Realtime toast notifications on the lodging trip page

Add a focused hook:

```text
src/hooks/lodging/useLodgingTripToasts.ts
```

It will subscribe to relevant realtime changes for the current reservation:
- `lodge_reservation_receipts`
  - new row → “Receipt ready”
- `lodge_reservation_change_requests`
  - add-on `auto_approved` + captured → “Add-on charge successful”
  - add-on `failed` or payment failed → “Add-on charge failed”
  - reschedule `approved` → “Date change approved”
  - reschedule `declined` → “Date change declined”
  - cancel `auto_approved` / refund pending / refunded → cancellation/refund toast
- `lodge_reservations`
  - payment status changes like `refund_pending`, `refunded`, `captured`, `failed`

To support add-on failure events, update the change request enum/table:
- Add `failed` to `lodge_change_status`.
- On payment failure in `purchase-lodging-addons`, insert a failed change request with:
  - `type = 'addon'`
  - `status = 'failed'`
  - `payment_status = failed Stripe/payment status`
  - `addon_payload` including selected items and failure reason
- Do not update reservation totals on failure.

Toast behavior:
- Do not toast for the initial page load.
- Only toast new realtime events after the page is open.
- Use `sonner` for consistency.

Files:
- `src/hooks/lodging/useLodgingTripToasts.ts`
- `src/pages/MyLodgingTripPage.tsx`
- `supabase/functions/purchase-lodging-addons/index.ts`
- migration to add `failed` enum value and receipt table

---

### 6. Data fetched by the trip page

Update the trip page reservation/room queries to include:
- room `check_in_time`
- room `check_out_time`
- room `addons`
- room `cancellation_policy`
- store name/logo
- receipt history rows
- latest change requests

No manual edits to generated Supabase types; use safe local interfaces/casts until types are regenerated by the platform.

---

### Verification

After implementation, verify:

1. Add-to-calendar downloads an `.ics` with:
   - check-in and check-out times
   - the device timezone
   - reservation/property details

2. Add-ons sheet:
   - disables unavailable add-ons
   - shows the server-provided reason
   - refuses unavailable add-ons server-side even if tampered

3. Cancellation:
   - shows exact refundable and non-refundable amounts
   - explains saved-card/refund behavior
   - actual cancellation recalculates on the server before applying

4. Receipts:
   - first download creates a receipt history row
   - past downloads show timestamps
   - re-download returns the stored receipt snapshot

5. Realtime toasts:
   - receipt ready
   - add-on success/failure
   - cancellation/refund status
   - reschedule approved/declined
