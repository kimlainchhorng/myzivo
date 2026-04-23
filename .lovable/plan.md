
## Lodging Trip Page Completion: Receipts, SMS, Disputes, Add-ons, and Help Links

I will complete the guest-facing lodging trip workflow on `/my-trips/lodging/:reservationId` so the page gives clear visible feedback after actions, not just background updates.

### 1. Receipt download follow-up state

Update `ReceiptActions.tsx` and `ReceiptHistoryCard.tsx`.

After a receipt downloads:
- Show a success toast: “Receipt downloaded”
- Show a visible follow-up state on the page:
  - “Receipt saved to history”
  - quick buttons for “Share”, “Email”, and “View history”
- Automatically refresh receipt history immediately after download.
- Make share/email buttons show clear loading, success, and failure states:
  - “Preparing PDF…”
  - “Opening share sheet…”
  - “Receipt email queued”
  - “Could not email receipt”
- If native file share is not supported, fall back to re-download + copy receipt summary.

### 2. Dispute/refund status timeline

Replace the current simple refund dispute card with a more useful timeline.

Update `RefundDisputeCard.tsx` or add:

```text
src/components/lodging/guest/RefundDisputeTimeline.tsx
```

Timeline will show:
- Request submitted
- Under review
- Approved / declined
- Paid / closed
- Admin response
- Requested amount
- Resolution amount
- Last updated timestamp
- Link buttons to:
  - reservation details: `#stay-summary`
  - payment summary: `#payment-summary`
  - cancellation/request history: `#request-history`

It will highlight the latest update at the top so guests immediately understand what changed.

### 3. SMS notification toggle and delivery status

Add an in-page lodging notification section:

```text
src/components/lodging/guest/LodgingTripNotificationSettings.tsx
```

It will appear on the lodging trip page as:

```text
Trip updates
[ SMS updates toggle ]
Latest delivery: sent / queued / skipped / failed
```

Behavior:
- Use the existing `notification_preferences` table and `useNotificationPreferences`.
- Toggle `sms_enabled` on/off for lodging trip updates.
- Show phone number status:
  - SMS enabled
  - SMS disabled
  - phone missing
  - phone not verified, if available
- Query recent `notification_audit` rows for this reservation and channel `sms` to display delivery status:
  - sent
  - queued
  - skipped
  - failed
- If needed, add a small migration/RLS policy so authenticated users can read their own notification audit rows for their reservation without exposing other users’ notifications.

Also update the server notification helper:

```text
supabase/functions/_shared/lodging-notifications.ts
```

So SMS sends only when:
- `notification_preferences.sms_enabled = true`
- operational notifications are enabled
- the guest has a phone number
- SMS provider secrets are configured

Skipped SMS attempts will still be logged with a clear `skip_reason`.

### 4. Immediate add-on success/failure timeline refresh

Update `AddOnsSheet.tsx`, `AddOnStatusTimeline.tsx`, and `MyLodgingTripPage.tsx`.

After the add-ons sheet finishes:
- Close the sheet.
- Scroll to `#addon-status`.
- Refresh:
  - reservation details
  - change request history
  - add-on status timeline
- Show immediate toast:
  - success: “Add-on charge successful”
  - failure: “Add-on charge failed”
- If the edge function returns a failed charge row, display it in the timeline immediately.
- Improve the timeline empty state:
  - when no purchases: explain that successful and failed add-on attempts will appear there.
- Improve timeline rows with:
  - item names
  - quantity
  - amount
  - payment status
  - failure reason
  - saved-card note
  - latest badge for the newest attempt

### 5. Contextual help drawer sections and deep links

Upgrade `LodgingTripHelpDrawer.tsx`.

Add clearer sections:
- Reservation details
- Cancellation and refunds
- Reschedules
- Add-ons and saved-card charges
- Receipt downloads, sharing, and email
- SMS/email trip updates
- Refund/dispute requests
- Message property

Add/standardize deep links on the page:

```text
#stay-summary
#manage-stay
#reschedules
#cancellation-policy
#addon-status
#receipt-history
#trip-notifications
#refund-disputes
#payment-summary
#request-history
#message-property
```

When a help item is tapped:
- Close the drawer.
- Smooth-scroll to the exact section.
- Briefly highlight the target section if practical.

### 6. Realtime toast and query refresh improvements

Update `useLodgingTripToasts.ts`.

Add stronger realtime behavior for:
- receipt ready
- receipt shared/email queued
- add-on charge success/failure
- cancellation/refund updates
- reschedule approved/declined
- dispute updates
- SMS delivery status changes, if audit rows are available through RLS

Each realtime event will invalidate the matching query so the visible cards update without a manual refresh.

### Files to edit

```text
src/pages/MyLodgingTripPage.tsx
src/components/lodging/guest/ReceiptActions.tsx
src/components/lodging/guest/ReceiptHistoryCard.tsx
src/components/lodging/guest/RefundDisputeCard.tsx
src/components/lodging/guest/AddOnStatusTimeline.tsx
src/components/lodging/guest/AddOnsSheet.tsx
src/components/lodging/guest/LodgingTripHelpDrawer.tsx
src/hooks/lodging/useLodgingTripToasts.ts
src/hooks/useNotificationPreferences.ts
supabase/functions/_shared/lodging-notifications.ts
```

### Files to add

```text
src/components/lodging/guest/LodgingTripNotificationSettings.tsx
src/hooks/lodging/useLodgingNotificationAudit.ts
```

Optional, if needed for audit visibility:

```text
supabase/migrations/<timestamp>_lodging_notification_audit_visibility.sql
```

### Verification

After implementation:
1. Download a receipt and confirm the page shows share/email follow-up actions plus success toast.
2. Email a receipt and confirm the queued/success/error state appears clearly.
3. Submit or update a refund dispute and confirm the dispute timeline highlights the latest status.
4. Toggle SMS updates on/off and confirm the page shows the current preference and latest delivery status.
5. Purchase add-ons and confirm the add-on timeline updates immediately after the sheet closes.
6. Force an add-on failure and confirm the timeline and toast show the failure reason.
7. Open the help drawer and confirm each deep link scrolls to the correct lodging trip section.
