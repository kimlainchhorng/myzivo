
# Disputes, Refunds, Chargebacks + Payout Hold System Implementation Plan

## Overview

Implement a complete dispute/refund workflow that allows customers and merchants to open disputes, enables admin review with partial/full Stripe refunds, holds driver payouts during dispute resolution, and tracks all actions via audit logging.

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `food_orders` table | Has `refund_status`, `refund_amount`, `refunded_at`, `payout_status` | Already supports refunds |
| `process-refund` edge function | Exists | Basic full refunds for ride/eats |
| `stripe-webhook` | Handles `charge.refunded`, `charge.dispute.created/closed` | Already processes Stripe chargebacks |
| `audit_logs` table | Exists | Used throughout codebase |
| `admin_audit_logs` table | Exists | For admin-specific actions |
| `p2p_payouts` table | Has `is_held`, `held_reason`, `held_at` | Good pattern for payout holds |
| Stripe secrets | `STRIPE_SECRET_KEY` configured | Ready for Stripe API calls |
| Dispatch pages | Exist | `/dispatch/orders/:id` shows order details |

---

## Architecture

```text
                           ┌───────────────────────────────────────────┐
                           │        Customer / Merchant / Admin        │
                           │          Opens Dispute Form               │
                           └──────────────────┬────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            disputes table                                     │
│                                                                               │
│  • Stores reason, description, requested/approved refund amount              │
│  • Status: open → under_review → resolved/rejected                           │
│  • payout_hold flag controls driver payout                                   │
│  • Links to order + created_by + assigned_admin                              │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
┌─────────────────────────────┐            ┌──────────────────────────────────┐
│  DB Trigger: Set order flag │            │        Admin Reviews             │
│  • payout_hold = true       │            │    /dispatch/disputes/:id        │
│  • Notify admin + merchant  │            │                                  │
└─────────────────────────────┘            │  • Set status, approved amount   │
                                           │  • Issue refund via Stripe       │
                                           │  • Toggle payout hold            │
                                           └───────────────┬──────────────────┘
                                                           │
                                                           ▼
                                           ┌──────────────────────────────────┐
                                           │     refund_requests table        │
                                           │                                  │
                                           │  • Tracks each refund attempt    │
                                           │  • status: queued → refunded     │
                                           │  • stripe_refund_id on success   │
                                           └───────────────┬──────────────────┘
                                                           │
                                                           ▼
                                           ┌──────────────────────────────────┐
                                           │  Edge Function: process-dispute- │
                                           │  refund (Stripe API)             │
                                           │                                  │
                                           │  • Creates Stripe refund         │
                                           │  • Updates food_orders           │
                                           │  • Logs to dispute_audit_logs    │
                                           └──────────────────────────────────┘
```

---

## Database Changes

### 1. Create `order_disputes` Table

```sql
CREATE TABLE public.order_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_role TEXT NOT NULL DEFAULT 'customer',
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  requested_refund_amount NUMERIC DEFAULT 0,
  approved_refund_amount NUMERIC DEFAULT 0,
  resolution_notes TEXT,
  assigned_admin_id UUID REFERENCES auth.users(id),
  payout_hold BOOLEAN DEFAULT true,
  resolved_at TIMESTAMPTZ,
  CONSTRAINT valid_reason CHECK (reason IN ('not_delivered', 'late', 'wrong_item', 'damaged', 'fraud', 'overcharged', 'quality', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'under_review', 'resolved', 'rejected', 'escalated')),
  CONSTRAINT valid_role CHECK (created_role IN ('customer', 'merchant', 'driver', 'admin'))
);

CREATE INDEX idx_order_disputes_order ON order_disputes(order_id);
CREATE INDEX idx_order_disputes_status ON order_disputes(status, created_at DESC);
CREATE INDEX idx_order_disputes_assigned ON order_disputes(assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;
```

### 2. Create `refund_requests` Table

```sql
CREATE TABLE public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  dispute_id UUID REFERENCES order_disputes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES food_orders(id),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'queued',
  stripe_refund_id TEXT,
  stripe_error TEXT,
  created_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  CONSTRAINT valid_status CHECK (status IN ('queued', 'processing', 'refunded', 'failed', 'cancelled'))
);

CREATE INDEX idx_refund_requests_dispute ON refund_requests(dispute_id);
CREATE INDEX idx_refund_requests_order ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
```

### 3. Create `dispute_audit_logs` Table

```sql
CREATE TABLE public.dispute_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address TEXT,
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('dispute', 'refund', 'order', 'payout'))
);

CREATE INDEX idx_dispute_audit_entity ON dispute_audit_logs(entity_type, entity_id);
CREATE INDEX idx_dispute_audit_created ON dispute_audit_logs(created_at DESC);
```

### 4. Add Columns to `food_orders` Table

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS dispute_id UUID REFERENCES order_disputes(id),
  ADD COLUMN IF NOT EXISTS dispute_status TEXT,
  ADD COLUMN IF NOT EXISTS payout_hold BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_hold_reason TEXT;
```

### 5. RLS Policies

```sql
-- order_disputes
ALTER TABLE order_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all disputes"
  ON order_disputes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own disputes"
  ON order_disputes FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR order_id IN (SELECT id FROM food_orders WHERE customer_id = auth.uid())
    OR order_id IN (SELECT id FROM food_orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))
  );

CREATE POLICY "Users can create disputes for their orders"
  ON order_disputes FOR INSERT TO authenticated
  WITH CHECK (
    order_id IN (SELECT id FROM food_orders WHERE customer_id = auth.uid())
    OR order_id IN (SELECT id FROM food_orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))
  );

-- refund_requests (admin only)
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage refund requests"
  ON refund_requests FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- dispute_audit_logs (admin only)
ALTER TABLE dispute_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view dispute audit logs"
  ON dispute_audit_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
```

### 6. Triggers

```sql
-- When dispute is created, update order flags and notify
CREATE OR REPLACE FUNCTION on_dispute_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Update food_orders with dispute info and payout hold
  UPDATE food_orders SET
    dispute_id = NEW.id,
    dispute_status = NEW.status,
    payout_hold = NEW.payout_hold,
    payout_hold_reason = CASE WHEN NEW.payout_hold THEN 'Dispute: ' || NEW.reason ELSE NULL END,
    updated_at = now()
  WHERE id = NEW.order_id;

  -- Insert audit log
  INSERT INTO dispute_audit_logs (actor_id, action, entity_type, entity_id, new_values)
  VALUES (NEW.created_by, 'dispute_created', 'dispute', NEW.id, 
    jsonb_build_object('reason', NEW.reason, 'status', NEW.status, 'payout_hold', NEW.payout_hold));

  -- Notify admins
  INSERT INTO notifications (user_id, channel, category, template, title, body, action_url, event_type, status)
  SELECT ur.user_id, 'in_app', 'operational', 'dispute', 'New Dispute Opened',
    'Order dispute: ' || NEW.reason, '/dispatch/disputes/' || NEW.id, 'dispute_created', 'sent'
  FROM user_roles ur WHERE ur.role = 'admin' LIMIT 3;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER trigger_on_dispute_created
  AFTER INSERT ON order_disputes
  FOR EACH ROW EXECUTE FUNCTION on_dispute_created();

-- When dispute status changes
CREATE OR REPLACE FUNCTION on_dispute_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order dispute_status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    UPDATE food_orders SET
      dispute_status = NEW.status,
      updated_at = now()
    WHERE id = NEW.order_id;
  END IF;

  -- Update payout_hold on order
  IF OLD.payout_hold IS DISTINCT FROM NEW.payout_hold THEN
    UPDATE food_orders SET
      payout_hold = NEW.payout_hold,
      payout_hold_reason = CASE WHEN NEW.payout_hold THEN 'Dispute: ' || NEW.reason ELSE NULL END,
      updated_at = now()
    WHERE id = NEW.order_id;
  END IF;

  -- Set resolved_at when status becomes resolved or rejected
  IF NEW.status IN ('resolved', 'rejected') AND OLD.status NOT IN ('resolved', 'rejected') THEN
    NEW.resolved_at := now();
  END IF;

  -- Update timestamp
  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE TRIGGER trigger_on_dispute_updated
  BEFORE UPDATE ON order_disputes
  FOR EACH ROW EXECUTE FUNCTION on_dispute_updated();
```

---

## Edge Function: `process-dispute-refund`

**File: `supabase/functions/process-dispute-refund/index.ts`**

**Purpose:** Process partial or full refunds via Stripe for disputes.

**Input:**
```typescript
{
  dispute_id: string;
  amount: number; // in dollars
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}
```

**Steps:**
1. Verify admin role
2. Get dispute and order details
3. Validate amount <= original payment
4. Create refund_request record (status: processing)
5. Call Stripe refunds.create with payment_intent
6. On success:
   - Update refund_request (status: refunded, stripe_refund_id)
   - Update food_orders (refund_status, refund_amount, refunded_at)
   - Update dispute (approved_refund_amount)
   - Log to dispute_audit_logs
7. On failure:
   - Update refund_request (status: failed, stripe_error)
   - Log error

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/process-dispute-refund/index.ts` | Create | Stripe refund processing for disputes |
| `src/hooks/useDisputes.ts` | Create | Dispute CRUD + real-time hooks |
| `src/pages/dispatch/DispatchDisputes.tsx` | Create | Disputes list with filters |
| `src/pages/dispatch/DispatchDisputeDetail.tsx` | Create | Dispute detail + refund actions |
| `src/components/disputes/DisputeStatusBadge.tsx` | Create | Status badge component |
| `src/components/disputes/DisputeReasonBadge.tsx` | Create | Reason badge component |
| `src/components/disputes/DisputeTimeline.tsx` | Create | Audit log timeline |
| `src/components/disputes/RefundDialog.tsx` | Create | Refund amount + confirmation dialog |
| `src/components/disputes/CreateDisputeDialog.tsx` | Create | User dispute creation form |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Disputes nav item |
| `src/pages/dispatch/DispatchOrderDetail.tsx` | Modify | Add dispute banner + create dispute button |
| `src/App.tsx` | Modify | Add dispute routes |
| Database migration | Create | All tables, triggers, RLS |

---

## Component Specifications

### DispatchDisputes Page

**Route:** `/dispatch/disputes`

**Features:**
- Filter tabs: All | Open | Under Review | Resolved | Rejected
- Search by order ID, dispute ID
- Sort by created_at (newest first)
- Priority badges (normal, high, urgent)
- Payout hold indicator
- Quick assign action

**Columns:**
| Column | Source |
|--------|--------|
| Dispute ID | `id.slice(0,8)` |
| Order | Link to order detail |
| Reason | Badge |
| Status | Badge |
| Amount | `requested_refund_amount` |
| Created | Relative time |
| Assigned | Admin name or "Unassigned" |
| Actions | View button |

### DispatchDisputeDetail Page

**Route:** `/dispatch/disputes/:id`

**Sections:**

1. **Header**
   - Dispute ID
   - Status badge with dropdown to change
   - Priority dropdown
   - Assign to me button

2. **Order Summary Card**
   - Order details with link
   - Customer info
   - Amount paid
   - Payment status

3. **Dispute Details Card**
   - Reason + description
   - Requested refund amount
   - Created by / role
   - Created at

4. **Actions Card**
   - Approved refund amount input
   - Issue Refund button (opens RefundDialog)
   - Toggle payout hold switch
   - Resolution notes textarea
   - Save button

5. **Timeline Card**
   - Dispute audit logs
   - Order events
   - Refund history

6. **Refund History Card**
   - List of refund_requests for this dispute
   - Status, amount, Stripe ID, date

### Payout Hold Logic

When checking if driver payout can be processed:

```typescript
// In payout processing logic
if (order.payout_hold === true || 
    order.dispute_status IN ('open', 'under_review')) {
  // Block payout, show "Held due to dispute" message
}
```

Update `DispatchPayouts` page to show held payouts with badge.

### Order Detail Dispute Banner

When viewing `/dispatch/orders/:id`, if dispute exists:

```text
┌────────────────────────────────────────────────────────────────┐
│ ⚠️ Dispute Open                                    [View →]    │
│ Reason: Wrong item • Payout on hold                           │
└────────────────────────────────────────────────────────────────┘
```

If no dispute, show "Report Problem" button for admin to create one.

---

## Customer/Merchant Dispute Creation

Add "Report a Problem" button on order detail pages:

**Flow:**
1. User clicks "Report Problem" on order detail
2. Dialog opens with:
   - Reason dropdown
   - Description textarea
   - Optional refund amount request
3. Submit creates dispute via RPC
4. User sees confirmation + can track status

---

## Webhook Updates

Enhance `stripe-webhook` to update `order_disputes`:

```typescript
case "charge.dispute.created": {
  // Find food_order by payment_intent
  // Create order_dispute with reason='chargeback_stripe'
  // Set payout_hold = true
  // Create admin alert
}

case "charge.refunded": {
  // If refund was from dispute flow, update refund_requests
  // Otherwise handle as before
}
```

---

## Implementation Order

1. **Database migration** - Create tables, triggers, RLS policies
2. **useDisputes hook** - CRUD operations + real-time
3. **DisputeStatusBadge + DisputeReasonBadge** - UI components
4. **DispatchDisputes page** - List view with filters
5. **DispatchDisputeDetail page** - Detail view with actions
6. **DisputeTimeline component** - Audit log display
7. **RefundDialog component** - Refund confirmation
8. **process-dispute-refund edge function** - Stripe integration
9. **Update DispatchOrderDetail** - Add dispute banner
10. **Update DispatchSidebar** - Add Disputes nav
11. **Update App.tsx** - Add routes
12. **CreateDisputeDialog** - User dispute creation
13. **Update webhook** - Handle Stripe disputes

---

## Technical Notes

### Stripe Refund API

```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: amountInCents, // Optional for partial refund
  reason: 'requested_by_customer', // or 'duplicate', 'fraudulent'
});
```

### Partial Refunds

- Food orders can have multiple partial refunds
- Track total refunded in `food_orders.refund_amount`
- Each refund creates new `refund_requests` record
- Validate: total refunds cannot exceed original payment

### Driver Payout Hold

When driver requests payout:
1. Check `food_orders.payout_hold` flag
2. If true, reject with message "Payout held due to active dispute"
3. Admin can release hold by toggling `payout_hold` in dispute detail

### Security

| Action | Access |
|--------|--------|
| Create dispute | Customer/Merchant for their orders |
| View dispute | Customer/Merchant (own) + Admin |
| Update dispute | Admin only |
| Process refund | Admin only |
| View audit logs | Admin only |
| Toggle payout hold | Admin only |

---

## Testing Checklist

- [ ] Customer can create dispute for delivered order
- [ ] Merchant can create dispute for their orders
- [ ] Admin sees dispute in inbox
- [ ] Payout hold is set on dispute creation
- [ ] Admin can change status
- [ ] Admin can assign to self
- [ ] Partial refund works via Stripe
- [ ] Full refund works via Stripe
- [ ] Refund updates order payment_status
- [ ] Payout hold toggle works
- [ ] Timeline shows all actions
- [ ] Order detail shows dispute banner
- [ ] Stripe chargeback creates dispute automatically
- [ ] Audit logs capture all actions
- [ ] RLS blocks unauthorized access
