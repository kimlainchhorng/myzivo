

# Trust & Safety System for Eats Orders

## Overview
Build a comprehensive safety infrastructure covering Delivery PIN verification, Report/Block system, Incident Reports, Fraud Signals, and Admin Moderation tools.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `food_orders.delivery_pin` | ✅ Exists | 4-6 digit PIN field |
| `food_orders.delivery_pin_verified` | ✅ Exists | Boolean verification flag |
| `food_orders.pin_attempts` | ✅ Exists | Attempt counter (via views) |
| `incident_reports` table | ✅ Exists | `category`, `severity`, `reporter_role`, `reported_user_id`, `order_id` |
| `user_blocks` table | ✅ Exists | `blocker_user_id`, `blocked_user_id`, `reason` |
| `risk_events` table | ✅ Exists | Event tracking with `severity`, `score`, `event_type` |
| `risk_scores` table | ✅ Exists | User risk scoring |
| `blocked_entities` table | ✅ Exists | Global entity blocking |
| `user_fraud_profiles` table | ✅ Exists | `refund_count`, `chargeback_count`, `is_blocked` |
| `user_limits` table | ✅ Exists | Daily limits and blocking |
| `profiles.payout_hold` | ✅ Exists | Boolean hold flag |
| `profiles.status` | ✅ Exists | User status field |
| `drivers.is_suspended` | ✅ Exists | Suspension flag |
| `order_events` table | ✅ Exists | Event logging |
| `admin_actions` table | ✅ Exists | Admin action audit |
| `DispatchSafety.tsx` page | ✅ Exists | Basic fraud dashboard |
| `useFraudPrevention` hook | ✅ Exists | Risk events, blocked entities management |
| `AdminIncidentReports` component | ✅ Exists | Mock incident table (needs real data) |

### Missing
| Feature | Status |
|---------|--------|
| PIN generation trigger | ❌ Need DB trigger on status = "out_for_delivery" |
| PIN display for customer | ❌ Need UI in `EatsOrderDetail.tsx` |
| PIN entry for driver | ❌ Need UI in `EatsOrderCard.tsx` + verification logic |
| `useDeliveryPin` hook | ❌ Verify PIN with attempt tracking |
| `useIncidentReports` hook | ❌ Create/fetch incident reports from DB |
| `useUserBlocks` hook | ❌ Block/unblock users with reason |
| Incident report form UI | ❌ Modal for customer/driver/merchant to submit |
| Report buttons on order UI | ❌ "Report Issue" in order detail pages |
| Admin Safety dashboard | ❌ `/admin/safety` with full moderation tools |
| Fraud signal triggers | ❌ Edge function for refund/cancel thresholds |
| PIN attempt fraud signal | ❌ Too many wrong PINs = risk event |

---

## Implementation Plan

### A) Delivery PIN System

#### 1. Database: Generate PIN on Dispatch

Create database trigger to generate 4-digit PIN when order status becomes "out_for_delivery".

**Migration:**
```sql
-- Function to generate 4-digit PIN
CREATE OR REPLACE FUNCTION generate_delivery_pin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate PIN when status changes to out_for_delivery
  IF NEW.status = 'out_for_delivery' AND (OLD.status IS NULL OR OLD.status != 'out_for_delivery') THEN
    -- Generate 4-digit random PIN (1000-9999)
    NEW.delivery_pin := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
    NEW.delivery_pin_verified := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_delivery_pin
BEFORE UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION generate_delivery_pin();
```

#### 2. Customer UI: Display PIN

**File to Modify:** `src/pages/EatsOrderDetail.tsx`

When order status is `out_for_delivery` and `delivery_pin` exists, show a prominent PIN card:

```typescript
{/* Delivery PIN Display */}
{order.status === "out_for_delivery" && order.delivery_pin && (
  <motion.div className="bg-gradient-to-br from-emerald-500/20 to-zinc-900 border border-emerald-500/30 rounded-2xl p-5 text-center">
    <p className="text-sm text-zinc-400 mb-2">Give this PIN to your driver</p>
    <div className="text-4xl font-mono font-bold tracking-[0.5em] text-white">
      {order.delivery_pin}
    </div>
    <p className="text-xs text-zinc-500 mt-2">Driver must enter this to complete delivery</p>
  </motion.div>
)}
```

#### 3. Driver UI: PIN Entry Dialog

**File to Modify:** `src/components/driver/EatsOrderCard.tsx`

Replace direct "Delivered" button with PIN entry flow when order is `out_for_delivery`:

**New Component:** `src/components/driver/DeliveryPinDialog.tsx`

- 4-digit PIN input using OTP input component
- Max 3 attempts before lockout
- On success: mark delivered
- On failure: increment attempts, show error
- After 3 failures: log fraud signal, require support

#### 4. Hook: `useDeliveryPin`

**File to Create:** `src/hooks/useDeliveryPin.ts`

```typescript
export function useDeliveryPin() {
  const verifyPin = useMutation({
    mutationFn: async ({ orderId, pin }: { orderId: string; pin: string }) => {
      // 1. Fetch order and check pin_attempts
      // 2. If attempts >= 3, reject
      // 3. Compare PIN
      // 4. If match: update delivered_at, delivery_pin_verified=true
      // 5. If no match: increment attempts, log risk_event if attempts=3
    }
  });
  
  return { verifyPin };
}
```

### B) Report/Block System

#### 1. Hook: `useUserBlocks`

**File to Create:** `src/hooks/useUserBlocks.ts`

```typescript
export function useUserBlocks() {
  // Block a user
  const blockUser = useMutation({
    mutationFn: async ({ blockedUserId, reason }: BlockParams) => {
      // Insert to user_blocks
      // Log to risk_events
    }
  });
  
  // Check if user is blocked
  const isBlocked = useQuery({...});
  
  // Get my blocks
  const myBlocks = useQuery({...});
  
  return { blockUser, unblockUser, isBlocked, myBlocks };
}
```

#### 2. Hook: `useIncidentReports`

**File to Create:** `src/hooks/useIncidentReports.ts`

```typescript
interface IncidentReport {
  order_id: string;
  reported_user_id?: string;
  reporter_role: 'customer' | 'driver' | 'merchant';
  category: 'safety' | 'harassment' | 'fraud' | 'theft' | 'accident' | 'other';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  attachment_url?: string;
}

export function useIncidentReports() {
  const createReport = useMutation({...});
  const myReports = useQuery({...});
  const reportsByOrder = useQuery({...});
  
  return { createReport, myReports, reportsByOrder };
}
```

#### 3. Component: `ReportIncidentModal`

**File to Create:** `src/components/safety/ReportIncidentModal.tsx`

- Category picker (safety, harassment, fraud, theft, accident, other)
- Severity selector (low/medium/high/urgent)
- Description textarea
- Photo upload (optional)
- 7-day window check from order completion
- Submit to `incident_reports` table

#### 4. Component: `BlockUserButton`

**File to Create:** `src/components/safety/BlockUserButton.tsx`

- Confirmation dialog
- Reason input
- Inserts to `user_blocks`
- Toast feedback

#### 5. UI Integration: Report Buttons

**Modify `EatsOrderDetail.tsx` (Customer):**
- Add "Report an Issue" dropdown in header actions
- Options: "Report Driver", "Report Restaurant"

**Modify `EatsOrderCard.tsx` (Driver):**
- Add "Report Customer" option in dropdown menu

**Modify `RestaurantOrders.tsx` (Merchant):**
- Add "Report Customer" action on order cards

### C) Fraud Signals & Holds

#### 1. Edge Function: `check-fraud-signals`

**File to Create:** `supabase/functions/check-fraud-signals/index.ts`

Triggered after refunds or cancellations to check thresholds:

```typescript
// Check conditions:
// - User has > 5 refunds in 30 days
// - User has > 3 cancelled orders in 7 days
// - Driver has > 3 wrong PIN attempts on single order

// If triggered:
// - Insert risk_event
// - Update user_fraud_profiles
// - If severe: set profiles.payout_hold = true or user_limits.is_blocked = true
```

#### 2. Database Function: Log Wrong PIN Attempt

**Migration:**
```sql
CREATE OR REPLACE FUNCTION log_wrong_pin_attempt(p_order_id uuid, p_driver_id uuid)
RETURNS void AS $$
DECLARE
  v_attempts int;
BEGIN
  -- Increment attempt counter
  UPDATE food_orders 
  SET pin_attempts = COALESCE(pin_attempts, 0) + 1
  WHERE id = p_order_id
  RETURNING pin_attempts INTO v_attempts;
  
  -- Log risk event on 3rd failure
  IF v_attempts >= 3 THEN
    INSERT INTO risk_events (event_type, severity, score, order_id, driver_id, details)
    VALUES ('wrong_pin_limit', 4, 30, p_order_id, p_driver_id, 
            jsonb_build_object('attempts', v_attempts));
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### D) Admin Safety Dashboard

#### 1. Create Admin Safety Page

**File to Create:** `src/pages/admin/AdminSafetyDashboard.tsx`

**Route:** `/admin/safety`

**Features:**
- KPI cards: Open incidents, Fraud flags today, Payout holds, Blocked users
- Tabs: Incidents | Blocked Users | Fraud Signals | User Holds
- Incident table with actions (Investigate, Resolve, Dismiss)
- Blocked users list with unblock action
- Fraud signals timeline
- User risk profiles with actions

#### 2. Hook: `useAdminSafety`

**File to Create:** `src/hooks/useAdminSafety.ts`

```typescript
export function useAdminSafety() {
  // Fetch all incident reports
  const incidents = useQuery({...});
  
  // Fetch all blocked users
  const blockedUsers = useQuery({...});
  
  // Fetch users with payout holds
  const payoutHolds = useQuery({...});
  
  // Suspend user
  const suspendUser = useMutation({
    mutationFn: async ({ userId, reason }) => {
      // Update profiles.status = 'suspended'
      // Log to admin_actions
    }
  });
  
  // Apply payout hold
  const applyPayoutHold = useMutation({
    mutationFn: async ({ userId, reason }) => {
      // Update profiles.payout_hold = true
      // Log to admin_actions
    }
  });
  
  // Clear flags
  const clearFlags = useMutation({...});
  
  // Add admin note
  const addNote = useMutation({...});
  
  return { incidents, blockedUsers, payoutHolds, suspendUser, applyPayoutHold, clearFlags, addNote };
}
```

#### 3. Admin Moderation Actions

Each action logs to `admin_actions`:
```typescript
await supabase.from("admin_actions").insert({
  admin_id: user.id,
  action_type: "suspend_user",
  entity_type: "user",
  entity_id: targetUserId,
  payload_json: { reason, notes }
});
```

### E) Add Route

**File to Modify:** `src/App.tsx`

```typescript
const AdminSafetyDashboard = lazy(() => import("./pages/admin/AdminSafetyDashboard"));

// In routes:
<Route path="/admin/safety" element={<AdminRoute><AdminSafetyDashboard /></AdminRoute>} />
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useDeliveryPin.ts` | PIN verification with attempt tracking |
| `src/hooks/useUserBlocks.ts` | Block/unblock users |
| `src/hooks/useIncidentReports.ts` | Create/fetch incident reports |
| `src/hooks/useAdminSafety.ts` | Admin moderation actions |
| `src/components/driver/DeliveryPinDialog.tsx` | PIN entry modal for drivers |
| `src/components/safety/ReportIncidentModal.tsx` | Incident report form |
| `src/components/safety/BlockUserButton.tsx` | Block user action button |
| `src/pages/admin/AdminSafetyDashboard.tsx` | Full admin safety dashboard |
| `supabase/functions/check-fraud-signals/index.ts` | Fraud threshold checker |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsOrderDetail.tsx` | Add PIN display card, report buttons |
| `src/components/driver/EatsOrderCard.tsx` | Add PIN entry flow before delivery confirmation |
| `src/hooks/useDriverEatsOrders.ts` | Update `markDelivered` to require PIN verification |
| `src/components/restaurant/RestaurantOrders.tsx` | Add report customer action |
| `src/App.tsx` | Add `/admin/safety` route |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Add `trg_generate_delivery_pin` trigger | Auto-generate PIN on dispatch |
| Add `pin_attempts` column to `food_orders` (if not exists) | Track wrong attempts |
| Add `log_wrong_pin_attempt` function | Fraud signal on 3 failures |
| Add RLS policies for `incident_reports` | Proper access control |

---

## Delivery PIN Flow

```text
Order dispatched (status = out_for_delivery)
    ↓
DB trigger generates 4-digit PIN
    ↓
Customer sees PIN on order detail page
    ↓
Driver arrives, taps "Complete Delivery"
    ↓
PIN entry dialog appears
    ↓
Driver enters PIN received from customer
    ↓
┌─────────────────────────┬────────────────────────────┐
│ PIN Correct             │ PIN Incorrect              │
├─────────────────────────┼────────────────────────────┤
│ ✓ delivery_pin_verified │ Increment pin_attempts     │
│ ✓ status = delivered    │ Show error "Try again"     │
│ ✓ Log order_event       │ If attempts >= 3:          │
│                         │   → Log risk_event         │
│                         │   → Block further attempts │
│                         │   → Contact support        │
└─────────────────────────┴────────────────────────────┘
```

---

## Report/Block Flow

```text
User experiences issue during order
    ↓
Opens order detail → taps "Report Issue"
    ↓
ReportIncidentModal opens
    ↓
Selects: Category + Severity + Description + Photo
    ↓
Validates: Order completed within 7 days
    ↓
Inserts to incident_reports
    ↓
Optional: Block user (inserts to user_blocks)
    ↓
Admin sees in /admin/safety dashboard
    ↓
Admin investigates → takes action:
  - Suspend user
  - Apply payout hold
  - Add internal note
  - Mark resolved
```

---

## Fraud Signal Flow

```text
User refund processed
    ↓
check-fraud-signals triggered
    ↓
Count refunds in last 30 days
    ↓
If count > 5:
    ↓
Insert risk_event (high severity)
    ↓
Update user_fraud_profiles.refund_count
    ↓
If count > 10:
    ↓
Set profiles.payout_hold = true (if merchant/driver)
OR user_limits.is_blocked = true (if customer)
    ↓
Admin notification
```

---

## Security Considerations

1. **PIN Privacy**: Only customer sees PIN; driver enters it blind
2. **Attempt Limits**: Max 3 wrong PINs before lockout + fraud signal
3. **Report Window**: 7-day limit prevents stale/abusive reports
4. **Block Validation**: Can only block users from orders you participated in
5. **Admin Audit**: All moderation actions logged to `admin_actions`
6. **RLS Policies**: Proper access control on all safety tables

---

## Summary

This implementation adds:

1. **Delivery PIN System**: Auto-generated PINs with customer display and driver verification
2. **Report/Block Infrastructure**: Incident reporting and user blocking for all roles
3. **Fraud Signal Detection**: Automated threshold checks on refunds/cancellations
4. **Admin Safety Dashboard**: Comprehensive moderation tools at `/admin/safety`
5. **Audit Trail**: All safety actions logged to `order_events` and `admin_actions`
6. **Attempt Limiting**: Max 3 PIN attempts with fraud escalation

