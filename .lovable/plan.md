
## Finish lodging trip UI reliability fixes

I will update the existing guest lodging trip page pieces that are already partially implemented so they behave reliably after checkout/download actions and show clearer status details.

### 1. Add-on status timeline reliability

Update:

```text
src/components/lodging/guest/AddOnStatusTimeline.tsx
src/components/lodging/guest/AddOnsSheet.tsx
src/pages/MyLodgingTripPage.tsx
```

Changes:
- Add proper loading/refresh state after add-on checkout so the timeline does not look stale while `lodge-change-requests` is refetching.
- Pass the change-request query loading/fetching state from `MyLodgingTripPage` into `AddOnStatusTimeline`.
- Show a compact skeleton/“Updating add-on status…” state after checkout.
- Normalize add-on payload parsing so both formats work:
  - `addon_payload.selections`
  - direct array payload
  - `addon_payload.items`
- For each add-on attempt, show:
  - item name
  - quantity
  - line amount when available
  - total charged/attempted amount
  - payment status
  - failure reason
  - Stripe payment reference suffix
- Treat these as successful:
  - `auto_approved`
  - `approved`
- Treat these as failed:
  - `failed`
  - failed payment status
  - payload failure reason present
- After `AddOnsSheet` finishes, invalidate:
  - `["lodge-change-requests", reservationId]`
  - `["lodge-reservation-full", reservationId]`
  - `["lodging-notification-audit", reservationId]`
- Keep the automatic scroll to `#addon-status`, but also briefly highlight that section.

### 2. Finalize refund/dispute timeline UI

Update:

```text
src/components/lodging/guest/RefundDisputeCard.tsx
```

Changes:
- Keep the card ID as:

```text
#refund-disputes
```

- Improve the latest-update panel to show:
  - current status
  - requested amount
  - resolution amount, when available
  - difference between requested and resolved amount
  - reason category
  - admin response
  - last updated timestamp
- Make the timeline stages clearer:
  - Request submitted
  - Under review
  - Resolution
  - Paid / closed
- Use declined-specific styling when the dispute is declined.
- Keep all previous dispute rows below the latest update.
- Ensure the three jump buttons target the correct existing anchors:
  - Reservation details → `#stay-summary`
  - Payment summary → `#payment-summary`
  - Request history → `#request-history`
- Add the same highlight behavior after each jump so the target section is obvious.

### 3. Improve help drawer deep-link feedback

Update:

```text
src/components/lodging/guest/LodgingTripHelpDrawer.tsx
```

Changes:
- Centralize the smooth-scroll/highlight behavior in a small helper.
- After tapping a help item:
  - close the drawer
  - smooth-scroll to the target
  - focus the target when possible
  - add a temporary ring highlight
  - remove the highlight after a short delay
- Make the highlight more reliable by adding transition classes and using `requestAnimationFrame` after the drawer closes.
- Keep current sections and anchors:
  - `#stay-summary`
  - `#manage-stay`
  - `#cancellation-policy`
  - `#payment-summary`
  - `#addon-status`
  - `#receipt-history`
  - `#trip-notifications`
  - `#refund-disputes`
  - `#message-property`

### 4. Fix notification audit filtering server-side

Update:

```text
src/hooks/lodging/useLodgingNotificationAudit.ts
src/hooks/lodging/useLodgingTripToasts.ts
```

Add migration if needed:

```text
supabase/migrations/<timestamp>_lodging_notification_audit_reservation_filter.sql
```

Changes in the hook:
- Replace client-side filtering:

```text
.filter(row => row.metadata?.reservation_id === reservationId)
```

with a server-side JSON filter:

```text
.eq("channel", channel)
.filter("metadata->>reservation_id", "eq", reservationId)
```

- Keep the result limit and descending sort.
- Handle RLS/permission errors gracefully:
  - return an empty list
  - expose a non-fatal state to the UI
  - avoid breaking the whole lodging trip page
- Add `retry: false` for permission errors so the page does not repeatedly fail in the background.
- Keep the query enabled only when `reservationId` exists.

Optional migration:
- Add an expression index for performance:

```sql
create index if not exists idx_notification_audit_reservation_channel_created
on public.notification_audit ((metadata->>'reservation_id'), channel, created_at desc);
```

- If the table has RLS enabled and guests cannot read their own reservation audit rows, add a secure SELECT policy using existing `public.is_lodge_reservation_guest(...)` without exposing other users’ audit data.

Changes in realtime:
- Keep realtime validation by checking `metadata.reservation_id`, because realtime payloads are received client-side.
- Invalidate the same query key including channel when an SMS audit event arrives:

```text
["lodging-notification-audit", reservationId, "sms"]
```

### 5. Guard Email receipt button until receipt ID is confirmed

Update:

```text
src/components/lodging/guest/ReceiptActions.tsx
src/components/lodging/guest/ReceiptHistoryCard.tsx
src/pages/MyLodgingTripPage.tsx
```

Changes:
- Pass receipt history loading/fetching state into `ReceiptActions`.
- Add a receipt-history refresh callback that returns a promise, not just a fire-and-forget invalidate.
- Disable the Email button when:
  - no `latestReceiptId`
  - receipt history is loading/fetching
  - a receipt download just completed and the receipt row is still being created
  - another receipt action is running
- Button labels:
  - `Saving receipt…`
  - `Email`
  - `Preparing email…`
- If the user taps Email before `latestReceiptId` exists:
  - automatically refetch receipt history
  - show a toast: “Receipt history is updating”
  - enable the button once the latest receipt row is available
- After receipt download:
  - call `refetch`/invalidate receipt history
  - keep the follow-up panel visible
  - only enable Email once `receipts[0]?.id` is confirmed
- Keep Share available from the local downloaded blob, but keep Email tied to the stored receipt snapshot ID.
- In `ReceiptHistoryCard`, ensure email/share actions disable only their own active row action and show clear loading icons.

### Verification checklist

After implementation I will verify:

1. Add-on checkout success updates the timeline with quantity, amount, payment status, and latest badge.
2. Add-on checkout failure updates the timeline with failure reason and does not imply the reservation total changed.
3. The add-on timeline shows a loading/updating state immediately after checkout.
4. Refund dispute card shows requested amount, resolution amount, current stage, admin response, and correct jump links.
5. Help drawer links scroll and briefly highlight the correct section.
6. Notification audit query filters `reservation_id` server-side and does not crash the page on RLS/permission errors.
7. Email receipt is disabled until `latestReceiptId` exists and receipt history refresh completes.
8. Receipt download still shows the follow-up share/email/history state and receipt history updates automatically.
