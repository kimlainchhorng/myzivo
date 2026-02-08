
# ZIVO Eats 3 — Real Payment, Dispatch, Reviews & Receipts

## Overview
Upgrade ZIVO Eats to production-ready with real Stripe payments (card + cash options), driver dispatch system, live tracking, ratings/reviews, and receipt generation. All features will use existing Supabase tables and maintain the 2026 dark glass UI.

---

## Current State Analysis

### Existing Infrastructure (Verified)

| Feature | Table/File | Key Details |
|---------|-----------|-------------|
| Food Orders | `food_orders` | Has `payment_status`, `stripe_payment_id`, `driver_id`, `rating` columns |
| Drivers | `drivers` | Has `current_lat/lng`, `is_online`, `rating`, `avatar_url`, `full_name` |
| Stripe Checkout | `create-eats-checkout` edge function | Already creates checkout session |
| Stripe Webhook | `stripe-webhook` | Already handles `eats` type payments |
| Stripe Key | `src/lib/stripe.ts` | Publishable key configured |
| Reviews Model | `p2p_reviews` | Existing review schema (can use as reference) |

### Missing Infrastructure (Need to Create)

| Feature | Required Table |
|---------|---------------|
| Eats Reviews | `eats_reviews` (new table) |
| Payment Type | Add `payment_type` column to `food_orders` |

---

## Implementation Details

### 1. Payment Type Selection (Card vs Cash)

**Update `food_orders` table:**
Add new columns via migration:
- `payment_type` (text) — "card" or "cash"
- `paid_at` (timestamp) — When payment confirmed

**Files to Create:**
- `src/components/eats/PaymentTypeSelector.tsx` — Card/Cash toggle component

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Add payment type selection before checkout
- `src/components/eats/PaymentMethodModal.tsx` — Add cash option
- `src/hooks/useEatsOrders.ts` — Include `payment_type` in order creation

**UI Flow:**
```text
+----------------------------------+
|  💳 Payment Method               |
+----------------------------------+
|  [Card - Pay Now]     [Selected] |
|  Visa •••• 4242                  |
+----------------------------------+
|  [Cash - Pay on Delivery]        |
+----------------------------------+
```

### 2. Stripe PaymentIntent Integration (Card Payments)

**Create Edge Function:**
- `supabase/functions/create-eats-payment-intent/index.ts`

This function will:
- Create order in `food_orders` with status="pending_payment"
- Create Stripe PaymentIntent (not checkout session)
- Return `client_secret` for Stripe Elements
- Include order_id in metadata for webhook handling

**Files to Create:**
- `src/components/eats/StripePaymentSheet.tsx` — Stripe Elements card form
- `src/hooks/useEatsPayment.ts` — Hook for payment intent creation + confirmation

**Files to Modify:**
- `src/pages/EatsCart.tsx` — Integrate Stripe Elements for card flow
- `supabase/functions/stripe-webhook/index.ts` — Handle PaymentIntent success for eats

**Card Payment Flow:**
```text
1. User selects "Card" payment
2. Clicks "Place Order"
3. Call create-eats-payment-intent (creates order + PaymentIntent)
4. Show Stripe Elements sheet
5. User enters card details
6. Confirm payment via Stripe SDK
7. On success: Update order to "placed" status
8. Redirect to /eats/orders/{id}
```

**Cash Payment Flow:**
```text
1. User selects "Cash" payment
2. Clicks "Place Order"
3. Insert order directly with status="placed", payment_status="pending"
4. payment_type = "cash"
5. Redirect to /eats/orders/{id}
```

### 3. Basic Driver Dispatch

**MVP Approach:**
Use existing `drivers` table and `food_orders.driver_id` FK.

**Files to Create:**
- `src/hooks/useEatsDriver.ts` — Fetch assigned driver info for an order

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Show driver card when assigned
- `src/hooks/useLiveEatsOrder.ts` — Include driver join in query

**Order Detail Driver Card:**
```text
+----------------------------------+
|  👤 Your Driver                  |
|  [Avatar] John D.                |
|  ⭐ 4.9 · 🚗 Honda Civic         |
|  ETA: 12 min                     |
|  [📞 Call] [💬 Message]          |
+----------------------------------+
```

**Admin Assignment:**
The dispatch command center (`/dispatch`) already exists and can assign `driver_id` to `food_orders`. The order detail page will reactively show driver info when assigned via realtime subscription.

### 4. Live Map Tracking (MVP UI)

**MVP Approach:**
Add map placeholder to order detail. Use existing driver `current_lat/lng` columns.

**Files to Create:**
- `src/components/eats/DeliveryMap.tsx` — Map component with driver marker

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Add map section when driver assigned

**Map UI:**
```text
+----------------------------------+
|  [Google Map]                    |
|  📍 Driver location (live)       |
|  🏠 Delivery address             |
+----------------------------------+
|  Driver 2.3 miles away           |
|  ETA: 8 minutes                  |
+----------------------------------+
```

**Driver Tracking Logic:**
- Show map only when `status = "out_for_delivery"` and `driver_id` is set
- Subscribe to driver location updates via realtime
- If no driver assigned, show: "Tracking will appear when driver is assigned"

### 5. Ratings & Reviews

**Create Reviews Table (Migration):**
```sql
CREATE TABLE eats_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES food_orders(id) NOT NULL,
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Files to Create:**
- `src/components/eats/RatingModal.tsx` — Post-delivery rating prompt
- `src/hooks/useEatsReviews.ts` — Review CRUD + restaurant avg rating

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Show rating prompt when status="delivered"
- `src/components/eats/MobileEatsPremium.tsx` — Show avg rating from reviews

**Rating Flow:**
```text
Order delivered
    ↓
Show rating modal after 3 second delay
    ↓
User rates: Overall (1-5 stars)
           Food quality (optional)
           Delivery speed (optional)
           Comment (optional)
    ↓
Insert into eats_reviews
    ↓
Update restaurant avg rating (view or trigger)
```

**Rating Modal UI:**
```text
+----------------------------------+
|  How was your order?             |
|                                  |
|  ⭐⭐⭐⭐☆  4/5                  |
|                                  |
|  [Food Quality] [Delivery Speed] |
|                                  |
|  [Leave a comment...]            |
|                                  |
|  [Skip]       [Submit Review]    |
+----------------------------------+
```

### 6. Receipt Section & Download

**Files to Create:**
- `src/components/eats/OrderReceipt.tsx` — Receipt component (printable)
- `src/pages/EatsReceipt.tsx` — Full-page receipt view (print-friendly)

**Files to Modify:**
- `src/pages/EatsOrderDetail.tsx` — Add "View Receipt" button
- `src/App.tsx` — Add `/eats/orders/:id/receipt` route

**Receipt Contents:**
```text
+----------------------------------+
|  ZIVO EATS RECEIPT               |
|  Order #ABC12345                 |
|  Feb 8, 2026 · 7:45 PM           |
+----------------------------------+
|  Sakura Sushi Bar                |
|  123 Restaurant Ave              |
+----------------------------------+
|  2x Dragon Roll         $33.98   |
|  1x Miso Soup            $4.99   |
+----------------------------------+
|  Subtotal               $38.97   |
|  Delivery Fee            $3.99   |
|  Service Fee             $1.95   |
|  Tax                     $3.51   |
|  Discount (SUMMER20)    -$5.00   |
+----------------------------------+
|  TOTAL                  $43.42   |
|  Payment: Visa ••4242            |
+----------------------------------+
|  [Download PDF] [Print]          |
+----------------------------------+
```

### 7. Error Handling & Polish

**Duplicate Submission Prevention:**
- Add `isSubmitting` lock in EatsCart
- Disable button immediately on click
- Show loading spinner
- Prevent navigation during submission

**Error States:**
- Payment failed → Show error modal with retry option
- Network error → Toast with retry button
- Order creation failed → Clear error message

**Loading Skeletons:**
- Already implemented in most pages
- Verify coverage on new components

---

## Database Migration

```sql
-- Add payment_type column to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'card' 
CHECK (payment_type IN ('card', 'cash'));

-- Add paid_at timestamp
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create eats_reviews table
CREATE TABLE IF NOT EXISTS eats_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES food_orders(id) NOT NULL,
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for eats_reviews
ALTER TABLE eats_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reviews" ON eats_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON eats_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON eats_reviews
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## File Summary

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/create-eats-payment-intent/index.ts` | Stripe PaymentIntent for embedded checkout |
| `src/components/eats/PaymentTypeSelector.tsx` | Card/Cash toggle |
| `src/components/eats/StripePaymentSheet.tsx` | Stripe Elements card form |
| `src/hooks/useEatsPayment.ts` | Payment intent creation + confirmation |
| `src/hooks/useEatsDriver.ts` | Fetch driver for order |
| `src/hooks/useEatsReviews.ts` | Review CRUD + avg ratings |
| `src/components/eats/DeliveryMap.tsx` | Live driver tracking map |
| `src/components/eats/RatingModal.tsx` | Post-delivery rating prompt |
| `src/components/eats/OrderReceipt.tsx` | Printable receipt component |
| `src/pages/EatsReceipt.tsx` | Full-page receipt view |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsCart.tsx` | Add payment type selection, Stripe Elements flow |
| `src/pages/EatsOrderDetail.tsx` | Add driver card, map, rating prompt, receipt link |
| `src/components/eats/PaymentMethodModal.tsx` | Add cash option |
| `src/hooks/useEatsOrders.ts` | Include payment_type in order creation |
| `src/hooks/useLiveEatsOrder.ts` | Include driver join |
| `supabase/functions/stripe-webhook/index.ts` | Handle PaymentIntent succeeded for eats |
| `src/App.tsx` | Add receipt route |

---

## Implementation Order

1. **Database Migration** — Add payment_type, paid_at columns + eats_reviews table
2. **PaymentTypeSelector Component** — Card/Cash toggle UI
3. **Update PaymentMethodModal** — Add cash payment option
4. **create-eats-payment-intent Edge Function** — Stripe PaymentIntent creation
5. **StripePaymentSheet Component** — Stripe Elements integration
6. **Update EatsCart** — Full payment flow (card + cash)
7. **Update stripe-webhook** — Handle PaymentIntent for eats
8. **useEatsDriver Hook** — Driver info for orders
9. **Update EatsOrderDetail** — Driver card + map placeholder
10. **DeliveryMap Component** — Live tracking UI
11. **eats_reviews Table + RLS** — Reviews infrastructure
12. **RatingModal Component** — Post-delivery rating
13. **Update EatsOrderDetail** — Rating prompt on delivered
14. **OrderReceipt Component** — Receipt display
15. **EatsReceipt Page** — Print-friendly receipt
16. **Polish** — Error handling, loading states, duplicate prevention

---

## Data Flow

```text
Cart (/eats/cart)
    ├── Select Payment Type (Card / Cash)
    │
    ├── CASH PATH:
    │   └── Insert order (status=placed, payment_status=pending)
    │       └── Redirect to order detail
    │
    └── CARD PATH:
        ├── Call create-eats-payment-intent
        │   └── Returns client_secret
        ├── Show Stripe Elements sheet
        ├── User enters card → confirm payment
        ├── On success: Order status → placed
        └── Redirect to order detail

Order Detail (/eats/orders/:id)
    ├── Status timeline with realtime updates
    ├── Driver card (when assigned)
    ├── Live map (when out_for_delivery)
    ├── Receipt link
    └── Rating prompt (when delivered)
```

---

## Summary

This update transforms ZIVO Eats into a production-ready ordering platform:

- **Dual Payment**: Card (Stripe) + Cash on delivery
- **Real Stripe**: PaymentIntent with embedded Elements (not redirect)
- **Driver Dispatch**: Shows assigned driver info from existing drivers table
- **Live Tracking**: Map with driver location (MVP ready)
- **Ratings & Reviews**: 5-star rating with optional comments
- **Receipts**: Printable order receipts
- **2026 UI**: Consistent dark glass design throughout
- **Production Quality**: Error handling, duplicate prevention, loading states
