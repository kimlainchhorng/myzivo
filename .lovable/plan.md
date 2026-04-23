
## Host lodging reservations workflow upgrade

The current Reservations screen works, but it still looks like an early list: guest names repeat, request context is missing, add-ons are not visible enough, and hosts do not get a clear “what do I need to do next?” workflow. I will upgrade this area into a proper hotel-ops dashboard for reservations, pending requests, add-ons, payment/refund status, and guest names.

### 1. Improve guest and reservation naming

Update the reservation list so the host can identify each booking quickly.

Changes:
- Show a better primary title:
  - guest name if available
  - fallback to `Guest · RES-xxxxx`
  - avoid rows all looking identical when the same guest has multiple bookings
- Add secondary identity details:
  - reservation number
  - phone
  - email when available
  - room name
  - assigned room number/unit if available
- Improve search to include:
  - guest name
  - phone
  - email
  - reservation number
  - room name
  - room number
  - payment status

Files:
```text
src/components/admin/store/lodging/LodgingReservationsSection.tsx
src/hooks/lodging/useLodgeReservations.ts
```

### 2. Add an operations summary bar above Reservations

Add a compact “Today / Needs attention” section before the list.

Cards/chips:
- Pending guest requests
- Arrivals today
- Departures today
- Payment issues
- Refund disputes
- Add-on failures
- Cancelled/refund pending

Each chip will help the host understand what needs action immediately.

New file:
```text
src/components/lodging/host/HostReservationOpsSummary.tsx
```

### 3. Make reservation cards more useful

Each reservation row will become a richer operations card.

Add:
- Room name and room number/unit
- Check-in/check-out date line
- Nights and guest count
- Payment state:
  - paid
  - pending
  - balance due
  - failed
  - refund pending
  - refunded
- Workflow chips:
  - pending reschedule
  - add-on charged
  - add-on failed
  - cancellation submitted
  - refund dispute pending
- Clear amount display:
  - total
  - paid
  - balance due/refund state
- Better visual hierarchy with compact ZIVO-style spacing.

Files:
```text
src/components/admin/store/lodging/LodgingReservationsSection.tsx
src/hooks/lodging/useLodgeReservations.ts
```

### 4. Upgrade “Pending requests” inbox

The pending requests area should explain exactly what the guest is asking for.

Current problem:
- It only says “No pending requests” or shows minimal request data.
- The host cannot see enough context to approve confidently.

Add for each pending request:
- Guest name
- Reservation number
- Room name / room number
- Current dates
- Requested dates for reschedules
- Price delta:
  - extra charge
  - credit/refund
  - no price change
- Add-on purchase details:
  - add-on names
  - quantities
  - charge amount
  - saved-card status
- Cancellation request details:
  - reason
  - estimated refund
  - non-refundable amount
- Host warnings:
  - “Room availability will be rechecked”
  - “Saved card will be charged on approval”
  - “Guest will receive a refund/credit update”
- “Open reservation” button.

Files:
```text
src/components/lodging/host/ChangeRequestsInbox.tsx
src/hooks/lodging/useReservationChangeRequests.ts
```

### 5. Improve add-on setup in Rooms & Rates

The add-on editor should support the rules already used by the guest add-on flow.

Add fields per add-on:
- Internal ID/slug generated from name
- Display name
- Category
- Icon
- Active/disabled toggle
- Price
- Pricing unit:
  - per stay
  - per night
  - per guest
  - per guest/night
- Max quantity
- Eligibility rules:
  - minimum guests
  - maximum guests
  - minimum nights
  - maximum nights
  - available from date
  - available until date
  - allowed reservation statuses
- Optional host note:
  - “Pickup time required”
  - “Subject to weather”
  - “Confirm at front desk”

Also add better resort presets for this property type:
- Breakfast
- Airport/boat pickup
- Airport/boat drop-off
- Round-trip transfer
- Scooter rental
- Snorkeling tour
- Island hopping tour
- Sunset cruise
- Early check-in
- Late check-out
- Extra bed
- Baby crib
- Laundry
- Beach towel rental
- Private dinner
- Birthday cake / celebration setup

Files:
```text
src/components/admin/store/lodging/LodgingRoomsSection.tsx
src/hooks/lodging/useLodgeRooms.ts
```

### 6. Add host-side add-on purchase timeline

The guest page already has an add-on status timeline. Hosts need the same operational visibility.

Add a “Charges & add-ons” section in the reservation detail page showing:
- Add-on name
- Quantity
- Amount charged
- Success/failed/pending status
- Failure reason
- Stripe payment reference short ID
- Timestamp
- Whether reservation total was updated

New file:
```text
src/components/lodging/host/HostAddOnTimeline.tsx
```

Edit:
```text
src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx
```

### 7. Add refund dispute visibility for host

Guest refund disputes exist, but the host/admin reservation detail needs a visible card.

Add:
- Refund dispute status
- Requested amount
- Reason category
- Guest explanation
- Admin response
- Resolution amount
- Submitted/resolved timestamps

Also show a small dispute chip on the reservation list.

New file:
```text
src/components/lodging/host/HostRefundDisputeCard.tsx
```

Edit:
```text
src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx
src/components/admin/store/lodging/LodgingReservationsSection.tsx
```

### 8. Strengthen status workflow

The current quick actions are useful, but cancellation and no-show need stronger confirmation.

Update:
- Require structured reason for:
  - cancel
  - no-show
  - payment issue
  - room unavailable
- Add confirmation panel before destructive changes.
- Add better note templates:
  - Guest requested cancellation
  - Payment could not be captured
  - Room unavailable / maintenance
  - Late arrival beyond cut-off
  - Refund handled outside Stripe
  - Guest moved to another room
- Keep writing audit records to `lodge_reservation_audit`.

File:
```text
src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx
```

### 9. Add realtime host console updates

Add a host-side realtime hook so the screen updates without refreshing.

Subscribe to:
- `lodge_reservations`
- `lodge_reservation_change_requests`
- `lodge_refund_disputes`

Toasts:
- New pending request
- Reschedule approved/declined/applied
- Add-on charge succeeded
- Add-on charge failed
- New refund dispute
- Refund status changed
- Payment failed
- Reservation cancelled

New file:
```text
src/hooks/lodging/useHostLodgingOpsToasts.ts
```

Edit:
```text
src/components/admin/store/lodging/LodgingReservationsSection.tsx
```

### 10. Backend/data support

Most changes can use existing tables. I will only add a small migration if needed to support stronger add-on metadata consistently.

Potential migration:
- Normalize existing `lodge_rooms.addons` JSON to include:
  - `id`
  - `name`
  - `category`
  - `disabled`
  - `max_quantity`
  - `min_guests`
  - `max_guests`
  - `min_nights`
  - `max_nights`
  - `available_from`
  - `available_until`
  - `requires_status`

No roles will be stored on profiles/users. Existing secure role patterns remain unchanged.

### 11. Final workflow after update

The host flow will become:

```text
Reservations page
  → See pending requests / today’s actions / payment issues
  → Search guest, phone, room, reservation number
  → Open reservation
      → Review stay + guest + payment
      → See add-on charges/failures
      → See refund disputes
      → Update status with reason + audit note
      → Review full audit history
```

Add-on flow:

```text
Rooms & Rates
  → Configure add-ons
  → Set prices, categories, limits, eligibility rules
  → Guest purchases add-on
  → Host sees success/failure in timeline
  → Reservation totals update only on successful charge
```

Request flow:

```text
Guest requests date change / cancellation / add-on
  → Host sees full request context
  → Host approves/declines
  → System rechecks availability/payment
  → Guest gets live update
  → Host list refreshes automatically
```

### Verification

After implementation:
1. Reservations list shows better names, room details, payment state, and workflow chips.
2. Search works by guest, phone, email, room, reservation number, and payment state.
3. Pending requests show full context for reschedule, cancellation, and add-ons.
4. Add-ons can be configured with names, categories, quantity limits, and eligibility rules.
5. Reservation detail shows add-on success/failure timeline.
6. Refund disputes appear in list and detail.
7. Cancel/no-show requires structured reason and audit note.
8. Realtime host toasts appear for new requests, add-on failures, payment/refund changes, and disputes.
