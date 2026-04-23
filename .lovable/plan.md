

## Post-Booking Lodging Management — Full Guest Flow

Right now a guest can book a stay, but after that there's no way to **change dates, cancel, contact the host, or see the live status of their reservation**. This plan adds the complete post-booking lifecycle, end-to-end, on both the trip detail page and the host's reservations console.

### What you'll get (guest side)

1. **Trip detail page for lodging** — `/my-trips/lodging/:reservationId`
   - Hero: property name, photo, room type, status badge (Hold / Confirmed / Checked-in / Cancelled).
   - Stay summary: check-in / check-out dates, nights, guests, room number.
   - Payment summary: total, deposit captured, balance due, last 4 of card.
   - Live status timeline (uses existing `useReservationLive`): every status change streams in via realtime.

2. **Move dates (reschedule)** — inline on the trip detail page
   - "Change dates" button opens a date-range picker.
   - Server-side availability check against `lodge_blocks` + other reservations on the same room (reuses `useRoomConflictCheck`).
   - Recomputes nights × nightly rate, shows price delta (+$X / -$X / no change).
   - If price increases → prompts for additional payment via the same inline Stripe card we just polished.
   - If price decreases → records a credit / refund request on the reservation.
   - Host approval rule: **auto-approved** if the new dates are within the same room's free window AND ≤ 14 days from original; otherwise marked `pending_host_approval` and the host gets notified.

3. **Cancel reservation** — clear policy preview before confirming
   - Modal shows: refund amount based on policy (full / partial / none), nights forfeited, fee breakdown.
   - On confirm: status → `cancelled`, Stripe refund triggered (full or partial via existing `process-refund` pattern), audit row written.
   - Cancellation reason dropdown (plans changed / found alternative / property issue / other + free text).

4. **Message host** — lightweight thread tied to the reservation
   - "Message property" button opens an existing chat thread or creates one with the store owner.
   - Reservation context auto-attached as a pinned card at top of thread.

5. **Add-ons after booking** — late check-in, early check-out, extra guest, breakfast, airport pickup
   - Pulls from store's add-on catalog; charges go through the same inline Stripe card.

6. **Documents & receipt**
   - Download PDF receipt (server-rendered via existing `generate-trip-receipt` pattern, extended for lodging).
   - Calendar export (.ics) so guest can drop the stay into Apple/Google Calendar.
   - QR check-in code displayed 24h before check-in for fast front-desk scan.

### What you'll get (host side)

7. **Reservations console — request inbox**
   - New "Pending requests" tab on `/admin/stores/:id` → Reservations: shows date-change and cancellation-with-policy-exception requests.
   - One-click Approve / Decline with reason; guest gets push + email.

8. **Calendar view sync**
   - The existing Calendar & Availability grid (your screenshot) gains color states: green=booked, amber=pending change request, red=blocked, grey=checked-out.
   - Click a booked cell → quick popover with guest name, nights, contact, "Open reservation" link.

### Backend

```text
New tables
├── lodge_reservation_change_requests
│   ├── id, reservation_id, type (reschedule|cancel|addon)
│   ├── proposed_check_in, proposed_check_out, proposed_total_cents
│   ├── price_delta_cents, status (pending|approved|declined|auto_approved)
│   ├── reason, host_response, requested_by, decided_by, decided_at
└── lodge_reservation_messages_link  (thin join: reservation_id ↔ chat_thread_id)

New edge functions
├── request-lodging-change      → validates availability, computes delta, writes request, auto-approves when eligible
├── approve-lodging-change      → host-only; applies the change atomically, charges/refunds via Stripe
├── cancel-lodging-reservation  → computes refund per policy, calls Stripe refund, sets status, writes audit
├── lodging-reservation-receipt → renders PDF receipt (mirrors generate-trip-receipt)
└── lodging-reservation-ics     → returns .ics file
```

All edge functions use the pinned `_shared/deps.ts` we just standardized. RLS: guest can read/write only their own reservations; host can read/write only their store's reservations; both gated by existing `has_role` + `store_owner` checks.

### New UI files

- `src/pages/MyLodgingTripPage.tsx` — trip detail page (route added to `App.tsx`).
- `src/components/lodging/guest/StayHeroCard.tsx`
- `src/components/lodging/guest/RescheduleSheet.tsx`
- `src/components/lodging/guest/CancelReservationSheet.tsx` (with policy preview)
- `src/components/lodging/guest/AddOnsSheet.tsx`
- `src/components/lodging/guest/CheckInQrCard.tsx`
- `src/components/lodging/guest/ReceiptActions.tsx`
- `src/components/lodging/host/ChangeRequestsInbox.tsx`
- `src/hooks/lodging/useReservationChangeRequests.ts`
- `src/hooks/lodging/useLodgingReschedulePreview.ts`

### Edits to existing files

- `src/components/travel/TripCard.tsx` — when item type is `lodging`, link to `/my-trips/lodging/:reservationId` instead of generic order page.
- `src/components/admin/store/lodging/LodgingCalendarSection.tsx` — color states + click-to-popover.
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx` (existing reservations tab) — add "Requests" sub-tab.
- `src/hooks/lodging/useLodgeReservations.ts` — expose `cancel`, `requestChange` mutations.
- `App.tsx` — register new route.

### Out of scope (ask if you want them)

- Multi-room / split-stay rescheduling (current flow keeps the same room).
- Loyalty point earn/burn on lodging changes.
- Channel-manager sync to Booking.com / Airbnb when host approves a change.

### Verification after build

- Book a 2-night stay → open trip detail → reschedule to new dates with +$30 delta → pay delta inline → status updates live for both guest and host.
- Cancel within free-cancel window → see full refund issued, status flips on host calendar.
- Cancel after policy cutoff → see partial refund preview, confirm, refund matches policy.

