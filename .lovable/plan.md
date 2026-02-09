

# Split Payments for Group Orders

## Overview

Replace the "Split payment coming soon" placeholder in group orders with a full split payment system. When a host locks a group order, they choose a payment mode: **Host pays all**, **Split evenly**, or **Pay for own items**. Each participant then sees their share and pays individually. The order only confirms once all required payments are complete.

## Database Changes

### New table: `group_order_payments`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| session_id | uuid (FK) | References group_order_sessions |
| user_id | uuid | Who this payment is for |
| user_name | text | Display name |
| amount | numeric | Amount this person owes |
| status | text | `pending`, `paid`, `failed` |
| paid_at | timestamptz | When payment was confirmed |
| created_at | timestamptz | |

RLS: users can read all payments in their session, update only their own.

### Alter table: `group_order_sessions`

Add column:
- `payment_mode` text (nullable, values: `host_pays`, `split_even`, `pay_own`)

## How It Works

### Payment Modes

1. **Host Pays** (existing behavior) -- Host proceeds to normal checkout with all items. No per-participant payment tracking needed.
2. **Split Evenly** -- Total is divided equally among all participants. A `group_order_payments` row is created for each unique participant with an equal share.
3. **Pay for Own Items** -- Each participant's items are totaled separately. A `group_order_payments` row is created per participant matching their individual subtotal plus a proportional share of delivery/fees.

### Flow

```text
Host taps "Lock & Checkout"
        |
        v
  Payment Mode Selector
  (Host pays / Split evenly / Pay own)
        |
        v
  If "Host pays": existing flow (host goes to checkout)
        |
  If "Split" or "Pay own":
        |
        v
  Payment rows created for each participant
        |
        v
  Each participant sees their share on the group order page
  with a "Pay Now" button
        |
        v
  Participants pay individually (order request with their share)
        |
        v
  Real-time status updates: each payment marked as "Paid"
        |
        v
  When ALL payments are "paid", order is placed automatically
```

## New and Modified Files

### 1. New: `src/components/eats/GroupPaymentModeSelector.tsx`

A modal/sheet shown when host taps "Lock & Checkout" with three radio options:
- Host pays total
- Split evenly (shows per-person amount)
- Pay for own items (shows each person's subtotal)

Includes a "Confirm & Lock" button that locks the session and creates payment records.

### 2. New: `src/components/eats/GroupPaymentCard.tsx`

Card component shown on the group order page for each participant when payment mode is `split_even` or `pay_own`:
- Shows participant name, items (for pay_own mode), amount owed
- Status badge: "Pending" (amber) or "Paid" (green)
- "Pay Now" button for the current user's own payment row
- Clicking "Pay Now" navigates to a lightweight checkout or triggers the existing order creation flow for their portion

### 3. Update: `src/hooks/useGroupOrder.ts`

Add functions:
- `setPaymentMode(sessionId, mode, participants)` -- locks session, sets `payment_mode`, creates `group_order_payments` rows
- `markPaymentPaid(paymentId)` -- marks a participant's payment as paid
- `checkAllPaid(sessionId)` -- checks if all payment rows are `paid`; if so, triggers the final order placement

### 4. Update: `src/hooks/useGroupOrder.ts` (`useGroupSession`)

Add real-time subscription to `group_order_payments` table so all participants see payment status updates live. Return `payments` array and derived `allPaid` boolean.

### 5. Update: `src/pages/EatsGroupOrder.tsx`

- Replace the "Split payment coming soon" placeholder with the actual `GroupPaymentModeSelector`
- When session is locked and has a split/pay-own payment mode, show `GroupPaymentCard` for each participant instead of the current "host is checking out" message
- Show a progress indicator: "2 of 3 payments complete"
- When `allPaid` becomes true, show a success state: "All payments complete -- order placed!"

### 6. Migration SQL

```text
ALTER TABLE group_order_sessions ADD COLUMN payment_mode text;

CREATE TABLE group_order_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES group_order_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS, indexes, realtime
```

## Participant Experience

**Non-host participants** see:
- When session is `open`: normal shared cart view (add/remove items)
- When session is `locked` with `host_pays`: "The host is completing checkout"
- When session is `locked` with `split_even` or `pay_own`: their payment card with amount owed and a "Pay Now" button
- After they pay: their card shows a green "Paid" checkmark
- When everyone has paid: "Order confirmed!" success state

## Edge Cases

- **Participant leaves before paying**: Their payment row stays `pending`. Host can see who hasn't paid yet. A "Remind" button could send a push notification (future enhancement).
- **Only one participant**: Split options still work but effectively behave like host-pays.
- **Zero-item participant**: If someone joined but added nothing, they're excluded from payments in pay-own mode and from the even split calculation.
- **Host cancels after locking**: Session status goes to `cancelled`, all pending payments are voided.

## Technical Notes

- Payment in this context uses the existing order-request flow (no Stripe integration) -- each participant's "Pay Now" action creates an individual order request or marks their portion as confirmed, matching the current "payment collected on delivery" model.
- The `group_order_payments` table and real-time sync ensure all participants see live status without polling.
- The final order is placed only when `checkAllPaid` returns true, triggered reactively via the Supabase Realtime subscription on the payments table.

