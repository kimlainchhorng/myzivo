

# Hotels & Resort — 5 Booking-record & post-booking refinements

## 1. Audit which policy sources the guest viewed

Persist a verifiable trail of consent on each reservation.

- **DB**: extend `lodge_reservations` with two jsonb columns:
  - `policy_consent jsonb` → `{ rules: { viewed_at, viewed_section: "house_rules" }, cancellation: { viewed_at, viewed_section: "cancellation_policy", policy_key } }`
  - `policy_consent_version text` (snapshot of `lodge_property_profile.updated_at` ISO at consent time, so we can prove which version of the rules they saw).
- **Drawer (`LodgingBookingDrawer.tsx`)**: existing `viewedRulesSource` / `viewedCancelSource` flags now also record timestamp + section key on first open. On submit, the insert includes `policy_consent` and `policy_consent_version`.
- **Review panel**: each consent row shows a small green `ShieldCheck` "Verified · viewed {time ago}" marker once the source has been opened, replacing the "Tap View source to enable" hint.
- **Trip detail**: render a compact "Policies acknowledged" card (`PolicyAcknowledgementCard.tsx`) listing the two viewed sections with timestamps and the version stamp — visible to both guest and host.

## 2. CSV export of timeline + audit history

In `TripDetailPage.tsx` lodging panel, add a `Download CSV` button beside the existing timeline.

- New util `src/lib/lodging/auditCsv.ts` builds a CSV string from `lodge_reservation_audit` rows: `timestamp,from_status,to_status,actor_role,actor_name,note`.
- File name: `reservation-{reference}-history.csv`, downloaded via Blob + `URL.createObjectURL`.
- Visible to guest (own reservation) and host (store owner) — RLS already restricts the audit query.
- Header row + ISO-8601 timestamps + UTF-8 BOM so Excel opens it cleanly.

## 3. Refund / refund-in-progress / retry states

Extend the Stripe lifecycle UI.

- **Webhook (`stripe-lodging-webhook`)**: handle three more events:
  - `charge.refund.updated` with `status === "pending"` → set `payment_status = "refund_pending"`.
  - `charge.refunded` (already handled) → `refunded`.
  - `payment_intent.payment_failed` (already handled) → `failed`, plus store `last_payment_error` text on the reservation.
- **Migration**: add `last_payment_error text` column.
- **`LodgingPaymentBadge.tsx`**: add two new states:
  - `refund_pending` → amber `RotateCcw` chip "Refund in progress".
  - `refunded` → muted `Undo2` chip "Deposit refunded · ${amount}".
- **Retry action**: when `payment_status === "failed"`, badge becomes a button that re-invokes `create-lodging-deposit` with the existing `reservation_id`, opening a fresh Checkout session (the edge function will reuse / replace `stripe_session_id`). Shown on success screen, `MyTripsPage`, and `TripDetailPage`.

## 4. Specific availability-conflict reason

Replace the generic "dates no longer available" banner with a precise, evidence-backed message.

- Update `useRoomConflictCheck.ts` to return the actual conflicting rows (`id, reference, status, check_in, check_out, guest_first_name`) instead of a boolean — limit 5, ordered by `check_in`.
- New `ConflictReasonPanel.tsx` rendered in Step 4 review when conflicts exist:
  - Title: "Room is booked for these dates".
  - For each conflict: chip showing `#{reference} · {status}` (status colour-coded) and the overlapping date range (`May 3 → May 5`).
  - For privacy, guest name shown only to the host preview (not consumer) — consumer just sees the reference + status.
  - Action button: `Pick new dates` → jumps drawer back to Step 1.
- `submit()` race-guard re-uses the same shape and surfaces the same panel as a toast description if it triggers.

## 5. Lock check-in/out edits inside the cutoff window

Prevent last-minute calendar tweaks that would mismatch the host's prep.

- **Property profile**: add `ics_lock_hours int default 24` to `lodge_property_profile.house_rules` (existing jsonb — no migration needed) and a numeric input in the admin property profile editor labeled "Lock calendar edits within (hours)".
- **`IcsPreviewPanel.tsx`**:
  - Compute `hoursUntilCheckIn = differenceInHours(checkInDateTime, now)` using property tz.
  - When `hoursUntilCheckIn <= ics_lock_hours`, the time inputs and address textarea become **read-only**, the Reset button is hidden, and an amber alert appears at the top:
    `"Check-in is in {n} hours. Calendar details are locked to match the host's prep window. Download will use the property defaults."`
  - The download still works — it just uses the locked-in defaults.
  - When unlocked, a small caption shows the lock window: `"Edits lock {ics_lock_hours}h before check-in"` so the guest knows in advance.

## File map

**Created**
- `src/components/lodging/PolicyAcknowledgementCard.tsx`
- `src/components/lodging/ConflictReasonPanel.tsx`
- `src/lib/lodging/auditCsv.ts`

**Modified**
- `src/components/lodging/LodgingBookingDrawer.tsx` — record `policy_consent`, render verified markers, conflict reason panel, retry on failed.
- `src/components/lodging/LodgingPaymentBadge.tsx` — new `refund_pending` / `refunded` / `failed+retry` states.
- `src/components/lodging/IcsPreviewPanel.tsx` — lock-window logic + amber alert + caption.
- `src/hooks/lodging/useRoomConflictCheck.ts` — return conflict row details (not just bool).
- `src/pages/trips/TripDetailPage.tsx` — CSV export button + PolicyAcknowledgementCard.
- `src/pages/app/MyTripsPage.tsx` — failed-state retry badge wiring.
- `supabase/functions/stripe-lodging-webhook/index.ts` — handle `charge.refund.updated`, store `last_payment_error`.
- `supabase/functions/create-lodging-deposit/index.ts` — allow re-invocation on `failed` to mint a fresh session.
- Admin property-profile editor — `ics_lock_hours` input.

**Migration**
- Add `policy_consent jsonb`, `policy_consent_version text`, `last_payment_error text` to `lodge_reservations`.

## Technical notes

- No new dependencies (date-fns + existing Stripe SDK cover everything).
- RLS unchanged — guest sees own reservation; host sees rows for their store; audit rows already follow the same pattern.
- CSV uses native Blob (no library); BOM prefix for Excel compat.
- All UI follows v2026 high-density tokens (`text-[11px]`, `rounded-xl`, Lucide icons only — no emojis).
- Realtime already wired in step 2 of the previous round, so refund/retry badge state propagates without extra subscriptions.

