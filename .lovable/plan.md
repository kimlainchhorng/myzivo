

# My Trips Dashboard + Email Confirmations + Cancel/Refund Flow
## Complete Implementation Plan

---

## Executive Summary

Enhance the ZIVO booking experience by consolidating all travel bookings (Hotels, Activities, Transfers) into a unified "My Trips" dashboard. Add email confirmation functionality, support ticket integration, and a cancellation/refund request workflow.

---

## Current State Analysis

### Existing Infrastructure

**Database Tables**:
- `travel_orders` - Core orders with holder info, totals, status
- `travel_order_items` - Individual booking items with provider references
- `travel_payments` - Stripe payment tracking
- `booking_audit_logs` - Audit trail for operations
- `email_logs` - Email delivery tracking (already exists with Resend integration)
- `support_tickets` - General support (existing table)
- `zivo_support_tickets` - Enhanced support with service routing

**Existing Pages**:
- `MyOrdersPage.tsx` - Basic order list (exists but minimal)
- `TravelConfirmationPage.tsx` - Shows confirmation after booking
- `TravelTrips.tsx` - Travel booking history (affiliate-based redirects)
- `SupportCenterPage.tsx` - Support ticket creation

**Hooks**:
- `useOrderDetails.ts` - Fetches orders with items/payments
- `useGlobalSupport.ts` - Support ticket CRUD operations

**Edge Functions**:
- `send-travel-confirmation` - Sends confirmation emails (logs to console, needs Resend integration)
- `send-travel-email` - Generic travel email sender with Resend

### What Needs to Be Built

1. **Database**: Add cancellation columns to `travel_orders` + `travel_order_items`
2. **UI**: Enhanced "My Trips" page with tabs and detailed order view
3. **Backend**: Cancellation request + resend confirmation endpoints
4. **Email**: Integration with existing email system for confirmations

---

## Phase 1: Database Schema Updates

### 1.1 Add Columns to travel_orders

```text
ALTER TABLE travel_orders ADD:
- cancellation_status (TEXT default 'none')
    Options: 'none' | 'requested' | 'under_review' | 'approved' | 'rejected' | 'processed'
- cancellation_reason (TEXT nullable)
- cancellation_requested_at (TIMESTAMPTZ nullable)
- cancelled_at (TIMESTAMPTZ nullable)
- cancelled_by (UUID nullable) - admin who processed
```

### 1.2 Add Columns to travel_order_items

```text
ALTER TABLE travel_order_items ADD:
- cancellation_policy (TEXT nullable) - summary text
- cancellable (BOOLEAN default false)
- cancellation_deadline (TIMESTAMPTZ nullable)
- supplier_status (TEXT default 'pending')
    Options: 'pending' | 'confirmed' | 'cancelled' | 'failed'
- supplier_payload (JSONB nullable) - raw Hotelbeds response
```

### 1.3 Create travel_email_logs Table

Link emails specifically to travel orders (extends existing email_logs pattern):

```text
Table: travel_email_logs
- id (UUID, PK)
- order_id (UUID FK -> travel_orders.id)
- to_email (TEXT)
- template (TEXT: 'booking_confirmation' | 'cancellation_request' | 'cancellation_update' | 'refund_processed')
- resend_message_id (TEXT nullable)
- status (TEXT: 'queued' | 'sent' | 'failed')
- error_message (TEXT nullable)
- created_at (TIMESTAMPTZ)
```

### 1.4 RLS Policies

```text
travel_email_logs:
- SELECT: order belongs to user (join travel_orders)
- INSERT: service role only

travel_orders updates:
- UPDATE cancellation columns: user can only set cancellation_status = 'requested' for their own orders
```

---

## Phase 2: Backend Edge Functions

### 2.1 Resend Confirmation Email

**File**: `supabase/functions/resend-travel-confirmation/index.ts`

**Purpose**: User can request their confirmation email to be resent

**Flow**:
1. Validate order belongs to user
2. Check rate limit (max 3 per hour per order)
3. Fetch order details
4. Call existing `send-travel-confirmation` function
5. Log to `travel_email_logs`
6. Return success

### 2.2 Request Cancellation

**File**: `supabase/functions/request-travel-cancellation/index.ts`

**Request**:
```typescript
{
  orderId: string;
  reason: string;
}
```

**Flow**:
1. Validate order belongs to user
2. Check order status is 'confirmed' (not already cancelled/refunded)
3. Update `travel_orders.cancellation_status = 'requested'`
4. Update `travel_orders.cancellation_reason`
5. Update `travel_orders.cancellation_requested_at`
6. Log to `booking_audit_logs`
7. Send notification email to admin inbox
8. Return success

### 2.3 Process Cancellation (Admin)

**File**: `supabase/functions/process-travel-cancellation/index.ts`

**Purpose**: Admin reviews and approves/rejects cancellation

**Flow**:
1. Verify admin role
2. Update cancellation_status to 'approved' or 'rejected'
3. If approved and payment exists:
   - Call Hotelbeds cancellation API for each item
   - Process Stripe refund if eligible
   - Update order status to 'cancelled'
4. Send email to customer with decision
5. Log all actions

### 2.4 Update send-travel-confirmation

Modify existing function to:
- Integrate with Resend API (currently just logging)
- Use HTML email template
- Log to `travel_email_logs`

---

## Phase 3: Frontend Pages

### 3.1 Enhanced My Trips Page

**File**: `src/pages/MyTripsPage.tsx` (new, replaces MyOrdersPage.tsx route)

**Features**:
- **Tabs**: Upcoming | Past | Cancelled
- **Order Cards**: Show order number, date range, destination icons, status badge, total
- **Status Badges**:
  - Confirmed (green)
  - Pending Payment (yellow)
  - Cancellation Requested (orange)
  - Cancelled (gray)
  - Refunded (blue)
- **Click to expand**: Navigate to detailed view

**Data Classification**:
```typescript
Upcoming: start_date >= today AND status != cancelled
Past: start_date < today AND status = confirmed
Cancelled: status = cancelled OR status = refunded
```

### 3.2 Order Detail Page

**File**: `src/pages/TravelOrderDetailPage.tsx`

**Route**: `/my-trips/:orderNumber`

**Sections**:

1. **Header**: Order number, status badge, total
2. **Itinerary Summary**: Timeline view of all items
3. **Item Cards** (for each travel_order_item):
   - Type icon (hotel/activity/transfer)
   - Title
   - Date range
   - Guests count
   - Supplier reference (if confirmed)
   - Cancellation policy text
   - Cancellation deadline (if applicable)
   - Status badge

4. **Traveler Info**: Holder name, email, phone

5. **Payment Summary**: Subtotal, fees, taxes, total

6. **Action Buttons**:
   - "Resend Confirmation" (calls resend endpoint)
   - "Contact Support" (opens support modal with order pre-filled)
   - "Request Cancellation" (if order.cancellable and not already requested)

### 3.3 Cancel Request Modal

**Component**: `src/components/travel/CancelRequestModal.tsx`

**Content**:
- Order summary
- Cancellation policy warning text:
  ```
  Cancellation depends on supplier rules.
  Some bookings are non-refundable.
  If eligible, refund timing depends on payment provider.
  Typical processing: 5-10 business days.
  ```
- Reason input (required)
- Confirm button

### 3.4 Support Modal Integration

**Update**: `src/components/travel/OrderSupportModal.tsx`

- Pre-fill order reference
- Set service_type = 'hotels' | 'activities' | 'transfers' based on order items
- Set reference_id = order.id
- Categories: booking_issue, refund_request, room_issue, etc.

---

## Phase 4: Frontend Hooks

### 4.1 useMyTrips Hook

**File**: `src/hooks/useMyTrips.ts`

```typescript
export function useMyTrips(filter?: 'upcoming' | 'past' | 'cancelled') {
  // Fetch travel_orders with items for current user
  // Apply date-based filtering
  // Return grouped and sorted orders
}
```

### 4.2 useOrderActions Hook

**File**: `src/hooks/useOrderActions.ts`

```typescript
export function useOrderActions() {
  return {
    resendConfirmation: (orderId: string) => {...},
    requestCancellation: (orderId: string, reason: string) => {...},
    // Rate limit state for resend
  };
}
```

---

## Phase 5: Email Templates

### 5.1 Booking Confirmation Email

Enhance existing `send-travel-confirmation` with HTML template:

```text
Subject: Booking Confirmed - {order_number}

Content:
- ZIVO logo
- "Your booking is confirmed!"
- Order number
- Itinerary summary with dates
- Supplier booking references
- Support contact
- Terms link
- Footer with unsubscribe
```

### 5.2 Cancellation Request Email

**To Customer**:
```text
Subject: Cancellation Request Received - {order_number}

"We've received your cancellation request.
Our team will review it within 24-48 hours.
You'll receive an update by email."
```

**To Admin**:
```text
Subject: [Action Required] Cancellation Request - {order_number}

Order details
Customer reason
Link to admin dashboard
```

### 5.3 Cancellation Decision Email

```text
Subject: Cancellation Update - {order_number}

APPROVED:
"Your cancellation has been approved.
Refund of ${amount} will be processed in 5-10 business days."

REJECTED:
"We're unable to process your cancellation.
Reason: {reason}
Please contact support for assistance."
```

---

## Phase 6: Routing Updates

**Add to App.tsx**:

```typescript
// My Trips routes
<Route path="/my-trips" element={<MyTripsPage />} />
<Route path="/my-trips/:orderNumber" element={<TravelOrderDetailPage />} />

// Keep old route as redirect
<Route path="/my-orders" element={<Navigate to="/my-trips" replace />} />
```

---

## Phase 7: Admin Dashboard

### 7.1 Cancellation Queue

**File**: `src/pages/admin/TravelCancellationsPage.tsx`

**Features**:
- List orders with cancellation_status = 'requested'
- Show order details, reason, requested date
- Action buttons: Approve | Reject
- Approval triggers Hotelbeds cancellation + Stripe refund
- Audit log of all decisions

---

## Implementation Order

### Week 1: Database + Backend
1. Create database migration for new columns
2. Add `travel_email_logs` table with RLS
3. Create `resend-travel-confirmation` edge function
4. Create `request-travel-cancellation` edge function
5. Update `send-travel-confirmation` with Resend integration

### Week 2: Frontend My Trips
1. Create `MyTripsPage.tsx` with tabs
2. Create `TravelOrderDetailPage.tsx`
3. Create `useMyTrips` and `useOrderActions` hooks
4. Build `CancelRequestModal` component
5. Integrate support modal with order context

### Week 3: Admin + Polish
1. Create admin cancellation queue
2. Create `process-travel-cancellation` edge function
3. Add email templates for cancellation flow
4. End-to-end testing

---

## Files Summary

### To Create

| Category | Files |
|----------|-------|
| Database | Migration for new columns + travel_email_logs table |
| Edge Functions | `resend-travel-confirmation/index.ts`, `request-travel-cancellation/index.ts`, `process-travel-cancellation/index.ts` |
| Pages | `MyTripsPage.tsx`, `TravelOrderDetailPage.tsx`, `TravelCancellationsPage.tsx` (admin) |
| Hooks | `useMyTrips.ts`, `useOrderActions.ts` |
| Components | `CancelRequestModal.tsx`, `OrderSupportModal.tsx`, `TripCard.tsx`, `OrderItemCard.tsx` |

### To Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add my-trips routes |
| `supabase/functions/send-travel-confirmation/index.ts` | Integrate Resend API |
| `src/hooks/useOrderDetails.ts` | Add cancellation fields |
| `supabase/config.toml` | Add new function configs |

---

## Security Considerations

1. **Authorization**: Users can only view/cancel their own orders
2. **Rate Limiting**: Resend confirmation limited to 3/hour/order
3. **Admin Verification**: Cancellation processing requires admin role
4. **Audit Trail**: All cancellation actions logged
5. **Email Safety**: No sensitive data (full card numbers, secrets) in emails

---

## Success Criteria

- [ ] Users can view all their travel orders in My Trips
- [ ] Orders show accurate status (Confirmed, Cancellation Requested, etc.)
- [ ] Resend confirmation works with rate limiting
- [ ] Support tickets linked to orders
- [ ] Cancellation request updates order status
- [ ] Admin can process cancellation requests
- [ ] Email notifications sent at each step
- [ ] Audit logs capture all actions

