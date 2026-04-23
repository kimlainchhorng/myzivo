
## Lodging Trip Support, Disputes, Receipt Sharing, Timelines, and Notifications

Build the next layer of the lodging trip page so guests can understand the flow, share receipts from stored snapshots, dispute post-cancellation refund outcomes, see add-on status history, and receive email/SMS updates for reservation events.

### 1. Contextual help drawer on lodging trip page

Add a new guest component:

```text
src/components/lodging/guest/LodgingTripHelpDrawer.tsx
```

It will open from a “Help with this stay” button on `MyLodgingTripPage.tsx` and explain:

- Cancellation policy and refund windows
- Date changes / host approval rules
- Add-ons and saved-card charging
- Receipt downloads, receipt history, and re-downloads
- Messaging the property
- Post-cancellation disputes / refund requests

It will include contextual links/buttons that scroll to the relevant sections on the same reservation page:

```text
#stay-summary
#payment-summary
#manage-stay
#request-history
#addon-status
#receipt-history
#refund-disputes
```

Implementation notes:
- Use the existing `Drawer` UI for mobile-native behavior.
- Use Lucide icons only.
- Keep the copy short, clear, and tied to the current reservation number, dates, payment status, and property name.
- Add section IDs to the existing trip page cards so the help drawer links work.

---

### 2. Share or email a receipt using the original receipt snapshot

Upgrade `ReceiptHistoryCard.tsx` and `ReceiptActions.tsx`.

#### Share button

For each past receipt:
- Add “Share” next to “Re-download”.
- Re-download the PDF from `lodging-reservation-receipt` using `receipt_id`.
- Use the Web Share API when supported:
  - Share the PDF file if `navigator.canShare({ files })` is available.
  - Otherwise share a reservation/receipt text summary.
- Fallback:
  - Download the PDF again.
  - Copy a short “Receipt downloaded” message if file sharing is unsupported.

#### Email receipt button

Because Lovable app emails do not support file attachments, the email will send a secure re-download link instead of attaching the PDF.

Add a new edge function:

```text
supabase/functions/share-lodging-receipt/index.ts
```

Behavior:
- Validate JWT.
- Verify the caller can access the receipt.
- Load the stored `lodge_reservation_receipts.snapshot`.
- Create a short-lived receipt share token / URL for that exact stored snapshot.
- Send one app email to the reservation guest email only.
- Include:
  - property name
  - reservation number
  - receipt generated timestamp
  - secure “Download receipt” link
- Do not allow arbitrary bulk recipients.

Add one app email template:

```text
supabase/functions/_shared/transactional-email-templates/lodging-receipt-ready.tsx
```

Register it in:

```text
supabase/functions/_shared/transactional-email-templates/registry.ts
```

---

### 3. Post-cancellation dispute / refund request flow

Add a lodging-specific dispute table via migration:

```text
public.lodge_refund_disputes
```

Columns:
- `id`
- `reservation_id`
- `store_id`
- `guest_id`
- `change_request_id`
- `reason_category`
- `description`
- `requested_amount_cents`
- `status` (`pending`, `under_review`, `approved`, `declined`, `paid`, `closed`)
- `admin_response`
- `resolution_amount_cents`
- `resolved_by`
- `resolved_at`
- `created_at`
- `updated_at`

RLS:
- Guest can view and create disputes for their own reservation.
- Store managers/admins can view disputes for their store.
- Admins can update dispute status/resolution.
- No roles stored on profiles/users.

Add realtime publication for the dispute table so status changes can appear live.

Add edge function:

```text
supabase/functions/submit-lodging-refund-dispute/index.ts
```

Behavior:
- Validate JWT and request body.
- Verify the guest owns the reservation.
- Only allow disputes after a cancellation or refund-related outcome.
- Enforce one open dispute per reservation.
- Cap requested amount to paid/non-refundable amount.
- Insert the dispute row.
- Create an admin notification for operations review.
- Trigger guest email/SMS confirmation best-effort.

Add UI:

```text
src/components/lodging/guest/RefundDisputeCard.tsx
src/components/lodging/guest/RefundDisputeSheet.tsx
src/hooks/lodging/useLodgingRefundDisputes.ts
```

Trip page behavior:
- Show “Refund / dispute request” section after cancellation, refund pending, refund failed, or no-refund outcome.
- Display current dispute status, requested amount, admin response, and timestamps.
- Allow submitting a new request only when no open request exists.

---

### 4. Visible add-on purchase/failure timeline

Add:

```text
src/components/lodging/guest/AddOnStatusTimeline.tsx
```

It will read from `lodge_reservation_change_requests` where `type = 'addon'` and show:

- Add-on name(s)
- Quantity
- Total charged
- Payment status
- Success / failed badge
- Failure reason when available
- Timestamp
- Stripe payment reference short ID when available

Integrate it into `MyLodgingTripPage.tsx` under `#addon-status`.

Also update `AddOnsSheet.tsx`:
- After success or failure, invalidate change request queries.
- Keep the user on the page with a visible timeline update, not only a toast.
- If a charge fails, show the failure both in the sheet and timeline.

---

### 5. Email and SMS notifications for lodging reservation events

Use app emails for expected one-to-one reservation updates. These are transactional because they are triggered by the guest’s reservation actions.

Add app email templates:

```text
lodging-receipt-ready
lodging-addon-status
lodging-cancellation-update
lodging-reschedule-update
```

All templates will be registered in the existing app email registry and match ZIVO’s emerald brand styling.

Add a shared notification helper for edge functions:

```text
supabase/functions/_shared/lodging-notifications.ts
```

It will:
- Load guest email/phone from the reservation.
- Respect existing notification preference data when available.
- Send app email through `send-transactional-email`.
- Send SMS through Twilio when SMS secrets are configured.
- Log notification attempts to `notification_audit`.
- Fail safely: notification failure must not break payments, refunds, receipt generation, or reschedules.

Update these edge functions to call the helper after their main database write succeeds:

```text
supabase/functions/lodging-reservation-receipt/index.ts
supabase/functions/purchase-lodging-addons/index.ts
supabase/functions/cancel-lodging-reservation/index.ts
supabase/functions/request-lodging-change/index.ts
supabase/functions/approve-lodging-change/index.ts
supabase/functions/submit-lodging-refund-dispute/index.ts
supabase/functions/share-lodging-receipt/index.ts
```

Notification events:
- Receipt generated / ready
- Receipt shared by email
- Add-on charge succeeded
- Add-on charge failed
- Cancellation submitted
- Refund pending / refunded / no refund due
- Reschedule auto-approved
- Reschedule sent to host
- Reschedule approved
- Reschedule declined
- Refund dispute submitted / status changed

If SMS sending credentials are missing during implementation, the UI and email flow will still be built, and SMS will be guarded behind configuration checks.

---

### 6. Realtime toast updates

Extend `useLodgingTripToasts.ts` to also subscribe to:

```text
lodge_refund_disputes
```

Toast events:
- Refund request submitted
- Refund request under review
- Refund request approved
- Refund request declined
- Refund request paid/closed

Also improve existing add-on toasts:
- Include add-on item name/amount where present.
- Show failure reason from `addon_payload.failure_reason`.

---

### 7. Files to add/edit

New files:

```text
src/components/lodging/guest/LodgingTripHelpDrawer.tsx
src/components/lodging/guest/AddOnStatusTimeline.tsx
src/components/lodging/guest/RefundDisputeCard.tsx
src/components/lodging/guest/RefundDisputeSheet.tsx
src/hooks/lodging/useLodgingRefundDisputes.ts
supabase/functions/share-lodging-receipt/index.ts
supabase/functions/submit-lodging-refund-dispute/index.ts
supabase/functions/_shared/lodging-notifications.ts
supabase/functions/_shared/transactional-email-templates/lodging-receipt-ready.tsx
supabase/functions/_shared/transactional-email-templates/lodging-addon-status.tsx
supabase/functions/_shared/transactional-email-templates/lodging-cancellation-update.tsx
supabase/functions/_shared/transactional-email-templates/lodging-reschedule-update.tsx
supabase/migrations/<timestamp>_lodging_disputes_receipt_sharing_notifications.sql
```

Edited files:

```text
src/pages/MyLodgingTripPage.tsx
src/components/lodging/guest/ReceiptActions.tsx
src/components/lodging/guest/ReceiptHistoryCard.tsx
src/components/lodging/guest/AddOnsSheet.tsx
src/hooks/lodging/useLodgingTripToasts.ts
src/hooks/lodging/useReservationChangeRequests.ts
supabase/functions/_shared/transactional-email-templates/registry.ts
supabase/functions/lodging-reservation-receipt/index.ts
supabase/functions/purchase-lodging-addons/index.ts
supabase/functions/cancel-lodging-reservation/index.ts
supabase/functions/request-lodging-change/index.ts
supabase/functions/approve-lodging-change/index.ts
```

---

### 8. Verification

After implementation:

1. Open a lodging trip and use the help drawer links to jump to each reservation section.
2. Download a receipt, confirm it appears in receipt history, then:
   - re-download from snapshot
   - share via native share where supported
   - email the secure receipt link to the reservation guest email.
3. Cancel a reservation and submit a refund dispute:
   - confirm the dispute appears on the trip page
   - confirm realtime status updates render.
4. Buy add-ons and force a failed add-on scenario:
   - success/failure appears in the add-on timeline
   - toast appears
   - reservation totals only change on success.
5. Confirm email/SMS triggers are best-effort and do not block the reservation action if notification delivery fails.
6. Deploy updated edge functions and app email templates so server-side notification changes are active.
