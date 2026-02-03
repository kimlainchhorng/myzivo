

# ZIVO Booking Engine - Complete Implementation Plan
## Orders, Payments, and Webhooks for Hotelbeds Integration

---

## Executive Summary

Build a unified booking engine that transforms ZIVO from an affiliate-redirect platform to a real travel booking platform. This system will handle Hotels, Activities, and Transfers through Hotelbeds APIs with Stripe payment integration, order tracking, and webhook-driven confirmations.

---

## Current State Analysis

### Existing Infrastructure
- **Database**: Existing `profiles` table with `user_id`, `full_name`, `email`, `phone`
- **Edge Functions**: Three Hotelbeds edge functions already created (`hotelbeds-hotels`, `hotelbeds-activities`, `hotelbeds-transfers`)
- **Stripe Integration**: Existing `stripe-webhook` handler for rides, eats, flights, and P2P
- **Payment Pattern**: `create-eats-checkout` demonstrates the checkout flow pattern
- **Frontend Hooks**: `useHotelbedsSearch`, `useHotelbedsBooking`, `useHotelbedsActivities`, `useHotelbedsTransfers` already exist

### What Needs to Be Built
1. New database tables: `orders`, `order_items`, `payments`, `audit_logs`
2. New edge functions: `create-order`, `create-checkout-session`, `confirm-hotelbeds-booking`
3. Update existing `stripe-webhook` to handle Hotelbeds bookings
4. Unified checkout page and confirmation flow

---

## Phase 1: Database Schema

### 1.1 Orders Table

```text
Table: orders
Purpose: Central order record for all travel bookings

Columns:
- id (UUID, PK)
- user_id (UUID, FK -> profiles.user_id, nullable for guest checkout)
- order_number (TEXT, unique, format: ZIVO-YYYY-NNNNNN)
- currency (TEXT, default 'USD')
- subtotal (NUMERIC(10,2))
- taxes (NUMERIC(10,2), default 0)
- fees (NUMERIC(10,2), default 0)
- total (NUMERIC(10,2))
- status (TEXT: draft | pending_payment | confirmed | cancelled | failed | refunded)
- provider (TEXT: hotelbeds)
- holder_name (TEXT)
- holder_email (TEXT)
- holder_phone (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 1.2 Order Items Table

```text
Table: order_items
Purpose: Individual products within an order (hotel, activity, transfer)

Columns:
- id (UUID, PK)
- order_id (UUID, FK -> orders.id, CASCADE)
- type (TEXT: hotel | activity | transfer)
- provider (TEXT: hotelbeds)
- provider_reference (TEXT, nullable - set after booking confirmed)
- title (TEXT - hotel name, activity name, or transfer route)
- start_date (DATE)
- end_date (DATE, nullable)
- adults (INT)
- children (INT, default 0)
- quantity (INT, default 1)
- price (NUMERIC(10,2))
- meta (JSONB - rateKey, hotelCode, activityCode, etc.)
- status (TEXT: reserved | confirmed | cancelled | failed)
- created_at (TIMESTAMPTZ)
```

### 1.3 Payments Table

```text
Table: payments
Purpose: Track Stripe payment status for orders

Columns:
- id (UUID, PK)
- order_id (UUID, FK -> orders.id, CASCADE)
- provider (TEXT: stripe)
- stripe_payment_intent_id (TEXT)
- stripe_checkout_session_id (TEXT)
- amount (NUMERIC(10,2))
- currency (TEXT)
- status (TEXT: pending | processing | succeeded | failed | canceled | refunded)
- created_at (TIMESTAMPTZ)
```

### 1.4 Booking Audit Logs Table

```text
Table: booking_audit_logs
Purpose: Security + debugging trail for all booking operations

Columns:
- id (UUID, PK)
- order_id (UUID, nullable)
- user_id (UUID, nullable)
- event (TEXT: order_created | payment_initiated | payment_succeeded | booking_confirmed | booking_failed | refund_requested | etc.)
- ip_address (TEXT, nullable)
- user_agent (TEXT, nullable)
- meta (JSONB - detailed event data)
- created_at (TIMESTAMPTZ)
```

### 1.5 Database Function: Generate Order Number

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ZIVO-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
    LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 2: Row Level Security (RLS)

### Orders Table RLS

```text
Policies:
1. "Users can view own orders"
   - SELECT: user_id = auth.uid() OR user_id IS NULL (guest with email verification)

2. "Users can create orders"
   - INSERT: user_id = auth.uid() OR user_id IS NULL

3. "Service role can manage all orders"
   - ALL: For webhook and backend operations
```

### Order Items Table RLS

```text
Policies:
1. "Users can view items for own orders"
   - SELECT: EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())

2. "Service role can manage all items"
   - ALL: For backend operations
```

### Payments Table RLS

```text
Policies:
1. "Users can view payments for own orders"
   - SELECT: EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND user_id = auth.uid())

2. "Service role can manage all payments"
   - ALL: For webhook operations
```

### Audit Logs Table RLS

```text
Policies:
1. "Only admins can read audit logs"
   - SELECT: public.has_role(auth.uid(), 'admin')

2. "Service role can insert logs"
   - INSERT: For backend logging
```

---

## Phase 3: Edge Functions

### 3.1 Create Order Edge Function

**File**: `supabase/functions/create-travel-order/index.ts`

**Purpose**: Create order + order_items from selected hotel/activity/transfer

**Request Body**:
```typescript
{
  items: Array<{
    type: 'hotel' | 'activity' | 'transfer';
    title: string;
    startDate: string;
    endDate?: string;
    adults: number;
    children?: number;
    quantity?: number;
    price: number;
    meta: {
      rateKey?: string;
      hotelCode?: string;
      activityCode?: string;
      modalityCode?: string;
      transferRoute?: object;
    };
  }>;
  holder: {
    name: string;
    email: string;
    phone: string;
  };
  currency?: string;
}
```

**Response**:
```typescript
{
  orderId: string;
  orderNumber: string;
  total: number;
}
```

**Flow**:
1. Validate input
2. Calculate totals (subtotal + taxes + fees)
3. Insert into `orders` with status='draft'
4. Insert each item into `order_items` with status='reserved'
5. Log to `booking_audit_logs`
6. Return order details

### 3.2 Create Checkout Session Edge Function

**File**: `supabase/functions/create-travel-checkout/index.ts`

**Purpose**: Create Stripe Checkout session for an order

**Request Body**:
```typescript
{
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
}
```

**Response**:
```typescript
{
  url: string;
  sessionId: string;
}
```

**Flow**:
1. Fetch order + order_items from database
2. Validate order status is 'draft'
3. Build Stripe line items from order_items
4. Create Stripe Checkout session with metadata: `{ type: 'travel', orderId, orderNumber }`
5. Insert into `payments` table with status='pending'
6. Update order status to 'pending_payment'
7. Store `stripe_checkout_session_id` on order
8. Log audit event
9. Return checkout URL

### 3.3 Confirm Hotelbeds Booking Edge Function

**File**: `supabase/functions/confirm-hotelbeds-booking/index.ts`

**Purpose**: Called by webhook after payment succeeds - confirms actual bookings with Hotelbeds

**Request Body** (internal):
```typescript
{
  orderId: string;
}
```

**Flow**:
1. Fetch order + order_items
2. For each order_item:
   - If type='hotel': Call `hotelbeds-hotels` with action='book'
   - If type='activity': Call `hotelbeds-activities` with action='book'
   - If type='transfer': Call `hotelbeds-transfers` with action='book'
3. Update each item's `provider_reference` and `status='confirmed'`
4. If all items confirmed: Update order `status='confirmed'`
5. If any item fails: Update order `status='failed'`, create support ticket
6. Log all events to audit_logs
7. Trigger confirmation email

### 3.4 Update Stripe Webhook Handler

**File**: `supabase/functions/stripe-webhook/index.ts` (modify existing)

**Add handler for travel bookings**:

```typescript
case "checkout.session.completed": {
  // Existing handlers for ride, eats, flight, p2p...
  
  if (metadata.type === "travel") {
    // Update order status
    await supabase
      .from("orders")
      .update({ status: "pending_payment" }) // Already set, but confirm
      .eq("id", metadata.orderId);
    
    // Update payment status
    await supabase
      .from("payments")
      .update({ status: "succeeded" })
      .eq("stripe_checkout_session_id", session.id);
    
    // Trigger booking confirmation
    await fetch(`${supabaseUrl}/functions/v1/confirm-hotelbeds-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ orderId: metadata.orderId }),
    });
  }
}
```

---

## Phase 4: Frontend - Checkout Flow

### 4.1 Checkout Page

**File**: `src/pages/TravelCheckoutPage.tsx`

**Route**: `/checkout`

**Features**:
- Step 1: Review itinerary (display all order_items)
- Step 2: Traveler details form (holder info)
- Step 3: Payment method selection:
  - Pay Now (Stripe)
  - Pay at Hotel (only if rate supports it - check meta.paymentType)
- Step 4: Terms acceptance + Confirm button
- Loading/error states

**Data Flow**:
```text
User selects hotel/activity/transfer
  -> Adds to cart (localStorage/context)
  -> Navigates to /checkout
  -> Fills holder info
  -> Clicks "Pay Now"
  -> Calls create-travel-order
  -> Calls create-travel-checkout
  -> Redirect to Stripe Checkout
  -> Stripe webhook triggers booking
  -> User returns to confirmation page
```

### 4.2 Cart Context

**File**: `src/contexts/TravelCartContext.tsx`

**State**:
```typescript
interface CartItem {
  id: string;
  type: 'hotel' | 'activity' | 'transfer';
  title: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children: number;
  price: number;
  meta: object;
}

interface TravelCartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}
```

### 4.3 Order Confirmation Page

**File**: `src/pages/TravelConfirmationPage.tsx`

**Route**: `/confirmation/:orderNumber`

**Display**:
- Order number
- Booking references for each item (from provider_reference)
- Hotel/activity/transfer details
- Check-in/out dates
- Guest names
- Total paid
- Support contact info
- Download confirmation (PDF future)

### 4.4 My Orders Page

**File**: `src/pages/MyOrdersPage.tsx`

**Route**: `/my-orders`

**Features**:
- List all user's orders
- Filter by status
- Click to view order details
- Cancel order (if cancellation allowed)

---

## Phase 5: Frontend Hooks

### 5.1 useCreateOrder Hook

**File**: `src/hooks/useCreateOrder.ts`

```typescript
export function useCreateOrder() {
  const createOrder = async (items: CartItem[], holder: HolderInfo) => {
    const { data, error } = await supabase.functions.invoke('create-travel-order', {
      body: { items, holder }
    });
    return data;
  };
  
  return { createOrder, isLoading, error };
}
```

### 5.2 useCheckout Hook

**File**: `src/hooks/useTravelCheckout.ts`

```typescript
export function useTravelCheckout() {
  const startCheckout = async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('create-travel-checkout', {
      body: { orderId }
    });
    
    if (data?.url) {
      window.location.href = data.url; // Redirect to Stripe
    }
  };
  
  return { startCheckout, isLoading, error };
}
```

### 5.3 useOrderDetails Hook

**File**: `src/hooks/useOrderDetails.ts`

```typescript
export function useOrderDetails(orderNumber: string) {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          payments (*)
        `)
        .eq('order_number', orderNumber)
        .single();
      return data;
    }
  });
}
```

---

## Phase 6: Integration Points

### 6.1 Hotel Detail Page Integration

**Modify**: `src/pages/HotelDetailPage.tsx` (to be created)

When user clicks "Book Now" on a room:
1. Add hotel to cart context
2. Navigate to `/checkout` or show cart drawer

### 6.2 Activity Detail Page Integration

**Modify**: `src/pages/ActivityDetailPage.tsx` (to be created)

When user clicks "Book" on an activity:
1. Add activity to cart context
2. Navigate to `/checkout`

### 6.3 Transfer Results Integration

**Modify**: Transfer selection flow

When user selects a transfer:
1. Add transfer to cart context
2. Continue to checkout or upsell activities

---

## Phase 7: Email Notifications

### 7.1 Confirmation Email Edge Function

**File**: `supabase/functions/send-travel-confirmation/index.ts`

**Trigger**: Called after all items in order confirmed

**Content**:
- Order number
- All booking references
- Itinerary summary
- Cancellation policy
- Support contact

---

## Implementation Order

### Week 1: Database + Core Backend
1. Create database migration with all tables
2. Add RLS policies
3. Create `create-travel-order` edge function
4. Create `create-travel-checkout` edge function
5. Test order creation flow

### Week 2: Webhook + Booking Confirmation
1. Create `confirm-hotelbeds-booking` edge function
2. Update `stripe-webhook` to handle travel type
3. Test end-to-end payment -> booking flow
4. Add audit logging

### Week 3: Frontend Checkout
1. Create `TravelCartContext`
2. Create `TravelCheckoutPage`
3. Create `TravelConfirmationPage`
4. Integrate with hotel/activity/transfer selection

### Week 4: Polish + Testing
1. Create `MyOrdersPage`
2. Add email notifications
3. Error handling refinement
4. End-to-end testing in Hotelbeds TEST mode

---

## Files Summary

### To Create

| Category | Files |
|----------|-------|
| Edge Functions | `create-travel-order/index.ts`, `create-travel-checkout/index.ts`, `confirm-hotelbeds-booking/index.ts`, `send-travel-confirmation/index.ts` |
| Pages | `TravelCheckoutPage.tsx`, `TravelConfirmationPage.tsx`, `MyOrdersPage.tsx` |
| Hooks | `useCreateOrder.ts`, `useTravelCheckout.ts`, `useOrderDetails.ts` |
| Context | `TravelCartContext.tsx` |
| Components | `CheckoutSummary.tsx`, `TravelerForm.tsx`, `PaymentMethodSelector.tsx`, `OrderConfirmationCard.tsx` |

### To Modify

| File | Changes |
|------|---------|
| `stripe-webhook/index.ts` | Add travel booking handler |
| `supabase/config.toml` | Add new function configs |
| `src/App.tsx` | Add checkout, confirmation, my-orders routes |

---

## Security Considerations

1. **API Keys**: All Hotelbeds API calls remain server-side only
2. **RLS**: Users can only see their own orders
3. **Audit Trail**: All operations logged to `booking_audit_logs`
4. **Webhook Verification**: Stripe signature verification required
5. **Rate Limiting**: Apply to all checkout endpoints
6. **PII Minimization**: Store only essential traveler info
7. **Guest Checkout**: Secured by email verification link for order access

---

## Success Criteria

- [ ] Order creation stores all items correctly
- [ ] Stripe Checkout redirects work properly
- [ ] Webhook successfully triggers Hotelbeds bookings
- [ ] Booking references stored in database
- [ ] Confirmation page shows all booking details
- [ ] Users can view their order history
- [ ] Failed bookings create support tickets
- [ ] Audit logs capture all events
- [ ] Works in Hotelbeds TEST environment

