

# Ratings & Feedback System Implementation Plan

## Overview

Build a comprehensive ratings and feedback system that collects customer ratings for drivers and merchants after order delivery, then displays quality metrics in the Dispatch/Admin dashboard.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| `food_orders` table | Has `rating`, `tracking_code` columns, but no separate detailed ratings |
| `drivers` table | Has `rating` column (single value), no `rating_count` |
| `restaurants` table | Has `rating`, `rating_count` columns |
| `tracking_code` | Auto-generated on food_orders via trigger |
| `TripRatingWidget` | Exists as a component pattern for star ratings |
| `support_tickets` table | Exists for support ticket creation |
| `notifications` table | Exists with order-related event types |
| Edge functions | `send-notification`, `process-order-notifications` exist |
| Dispatch pages | Dashboard, Analytics, Orders, Drivers, Merchants exist |

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                     Order Delivered                                   │
│               (status changes to 'completed')                         │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│            Trigger: notify_on_order_delivered                         │
│                                                                       │
│  Inserts notification (in_app + SMS + email):                        │
│  "Your order was delivered. Rate your experience:                    │
│   https://hizovo.com/rate/{tracking_code}"                           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Public Rating Page: /rate/:code                          │
│                                                                       │
│  • Validates tracking_code via RPC                                   │
│  • Shows driver + merchant rating stars                              │
│  • Comment box + issue tags checkboxes                               │
│  • Submit calls RPC: submit_order_rating()                           │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   order_ratings table                                 │
│                                                                       │
│  • Stores driver_rating, merchant_rating, comment, tags              │
│  • Unique constraint on order_id (one rating per order)              │
│  • Trigger updates drivers.rating and restaurants.rating             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│           Dispatch Quality Dashboard: /dispatch/quality               │
│                                                                       │
│  • Average ratings (drivers + merchants)                             │
│  • Complaint rate (% with negative tags)                             │
│  • Worst performers lists                                            │
│  • Recent low ratings table                                          │
│  • Flag driver/merchant actions                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### 1. Create order_ratings table

```sql
CREATE TABLE public.order_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID UNIQUE NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  driver_id UUID REFERENCES drivers(id),
  restaurant_id UUID REFERENCES restaurants(id),
  driver_rating INT CHECK (driver_rating BETWEEN 1 AND 5),
  merchant_rating INT CHECK (merchant_rating BETWEEN 1 AND 5),
  comment TEXT,
  tags TEXT[],
  contact_back BOOLEAN DEFAULT false
);

-- Indexes for queries
CREATE INDEX idx_order_ratings_driver ON order_ratings(driver_id);
CREATE INDEX idx_order_ratings_restaurant ON order_ratings(restaurant_id);
CREATE INDEX idx_order_ratings_created ON order_ratings(created_at DESC);
```

### 2. Add rating_count to drivers table

```sql
ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS rating_count INT DEFAULT 0;
```

### 3. Create rating average update trigger

```sql
CREATE OR REPLACE FUNCTION update_ratings_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update driver rating
  IF NEW.driver_id IS NOT NULL AND NEW.driver_rating IS NOT NULL THEN
    UPDATE drivers
    SET 
      rating = (
        SELECT ROUND(AVG(driver_rating)::numeric, 2)
        FROM order_ratings
        WHERE driver_id = NEW.driver_id AND driver_rating IS NOT NULL
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM order_ratings
        WHERE driver_id = NEW.driver_id AND driver_rating IS NOT NULL
      )
    WHERE id = NEW.driver_id;
  END IF;
  
  -- Update restaurant rating
  IF NEW.restaurant_id IS NOT NULL AND NEW.merchant_rating IS NOT NULL THEN
    UPDATE restaurants
    SET 
      rating = (
        SELECT ROUND(AVG(merchant_rating)::numeric, 2)
        FROM order_ratings
        WHERE restaurant_id = NEW.restaurant_id AND merchant_rating IS NOT NULL
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM order_ratings
        WHERE restaurant_id = NEW.restaurant_id AND merchant_rating IS NOT NULL
      )
    WHERE id = NEW.restaurant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_ratings
  AFTER INSERT ON order_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_ratings_on_insert();
```

### 4. RLS Policies for order_ratings

```sql
-- Enable RLS
ALTER TABLE order_ratings ENABLE ROW LEVEL SECURITY;

-- Admin can read all
CREATE POLICY "Admin can read all ratings"
  ON order_ratings FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Drivers can read their own ratings
CREATE POLICY "Drivers can read own ratings"
  ON order_ratings FOR SELECT
  TO authenticated
  USING (
    driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );

-- Restaurant owners can read their ratings
CREATE POLICY "Restaurant owners can read own ratings"
  ON order_ratings FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );

-- No direct insert allowed (only via RPC)
```

### 5. Create RPCs for secure rating flow

```sql
-- RPC: Get delivered order for rating (public, no auth required)
CREATE OR REPLACE FUNCTION get_delivered_order_for_rating(p_tracking_code TEXT)
RETURNS TABLE(
  order_id UUID,
  restaurant_name TEXT,
  driver_name TEXT,
  driver_id UUID,
  restaurant_id UUID,
  delivered_at TIMESTAMPTZ,
  already_rated BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fo.id,
    r.name,
    d.full_name,
    fo.driver_id,
    fo.restaurant_id,
    fo.delivered_at,
    EXISTS(SELECT 1 FROM order_ratings WHERE order_id = fo.id) as already_rated
  FROM food_orders fo
  LEFT JOIN restaurants r ON r.id = fo.restaurant_id
  LEFT JOIN drivers d ON d.id = fo.driver_id
  WHERE fo.tracking_code = p_tracking_code
    AND fo.status = 'completed'
    AND fo.delivered_at IS NOT NULL;
END;
$$;

-- RPC: Submit rating (public, no auth required)
CREATE OR REPLACE FUNCTION submit_order_rating(
  p_tracking_code TEXT,
  p_driver_rating INT,
  p_merchant_rating INT,
  p_comment TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_contact_back BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Validate order
  SELECT id, customer_id, driver_id, restaurant_id, delivered_at
  INTO v_order
  FROM food_orders
  WHERE tracking_code = p_tracking_code
    AND status = 'completed'
    AND delivered_at IS NOT NULL;
  
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found or not delivered');
  END IF;
  
  -- Check if already rated
  IF EXISTS(SELECT 1 FROM order_ratings WHERE order_id = v_order.id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order already rated');
  END IF;
  
  -- Insert rating
  INSERT INTO order_ratings (
    order_id, customer_id, driver_id, restaurant_id,
    driver_rating, merchant_rating, comment, tags, contact_back
  ) VALUES (
    v_order.id, v_order.customer_id, v_order.driver_id, v_order.restaurant_id,
    p_driver_rating, p_merchant_rating, p_comment, p_tags, p_contact_back
  );
  
  -- Create support ticket if contact_back requested
  IF p_contact_back = true THEN
    INSERT INTO support_tickets (
      user_id, order_id, driver_id, restaurant_id,
      subject, description, priority, status, category
    ) VALUES (
      v_order.customer_id, v_order.id, v_order.driver_id, v_order.restaurant_id,
      'Customer requested callback after rating',
      COALESCE(p_comment, 'Customer requested to be contacted after delivery'),
      'medium', 'open', 'feedback'
    );
  END IF;
  
  RETURN jsonb_build_object('success', true);
END;
$$;
```

---

## Notification Integration

### Update existing notify_on_order_status_change trigger

The existing `notify_on_order_status_change()` trigger already handles `order_delivered` events. Modify it to include a rating request link:

```sql
-- When status = 'completed' (delivered)
-- Message body includes:
-- "Your order has been delivered. Thanks for using ZIVO! Rate your experience: https://hizovo.com/rate/{tracking_code}"
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/rate/RateOrderPage.tsx` | Create | Public rating page by tracking code |
| `src/hooks/useOrderRating.ts` | Create | Hooks for rating RPCs |
| `src/components/rating/StarRating.tsx` | Create | Reusable star rating component |
| `src/components/rating/TagSelector.tsx` | Create | Issue tag checkboxes component |
| `src/pages/dispatch/DispatchQuality.tsx` | Create | Quality dashboard page |
| `src/hooks/useQualityMetrics.ts` | Create | Hooks for quality dashboard data |
| `src/components/dispatch/QualityKPICards.tsx` | Create | Quality KPI cards |
| `src/components/dispatch/WorstPerformers.tsx` | Create | Worst drivers/merchants tables |
| `src/components/dispatch/RecentLowRatings.tsx` | Create | Recent low ratings table |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Quality nav item |
| `src/App.tsx` | Modify | Add `/rate/:code` and `/dispatch/quality` routes |
| Database migration | Create | order_ratings table, triggers, RPCs, RLS |

---

## Component Specifications

### RateOrderPage

**Route:** `/rate/:code`

**Flow:**
1. On mount, call `get_delivered_order_for_rating(code)` RPC
2. If not found or already rated, show appropriate message
3. Display rating form:
   - Order summary (restaurant name, delivered time)
   - Driver rating (1-5 stars) with name
   - Merchant rating (1-5 stars) with name
   - Comment textarea (optional)
   - Tag checkboxes: `late`, `rude`, `cold_food`, `wrong_item`, `unsafe`, `great_service`, `on_time`, `friendly`
   - "Request support contact" checkbox
4. Submit button calls `submit_order_rating()` RPC
5. Show thank you confirmation

**Design:**
- Mobile-first, works without login
- Use existing TripRatingWidget patterns
- ZIVO branding

### DispatchQuality Page

**Route:** `/dispatch/quality`

**Sections:**

1. **KPI Cards**
   - Avg Driver Rating (overall + 7d + 30d)
   - Avg Merchant Rating (overall + 7d + 30d)
   - Complaint Rate (% orders with negative tags)
   - Total Ratings Count

2. **Charts**
   - Rating distribution (pie chart: 5-star, 4-star, etc.)
   - Ratings trend over time (line chart)

3. **Worst Performers**
   - Drivers with lowest avg rating (min 5 ratings)
   - Merchants with lowest avg rating (min 5 ratings)
   - Action: "Flag for review" button

4. **Recent Low Ratings**
   - Table of ratings <= 2 stars
   - Columns: Date, Order#, Driver, Merchant, Rating, Tags, Comment
   - Action: Link to order, "Create ticket" button

5. **Real-time Updates**
   - Subscribe to `order_ratings` inserts
   - Toast: "New rating received"

---

## Issue Tags Definition

| Tag | Category | Description |
|-----|----------|-------------|
| `late` | Negative | Order arrived late |
| `rude` | Negative | Driver was rude |
| `cold_food` | Negative | Food was cold |
| `wrong_item` | Negative | Wrong items delivered |
| `unsafe` | Negative | Unsafe driving/handling |
| `damaged` | Negative | Order was damaged |
| `great_service` | Positive | Excellent service |
| `on_time` | Positive | Delivered on time |
| `friendly` | Positive | Driver was friendly |
| `professional` | Positive | Professional service |

---

## useQualityMetrics Hook

```typescript
interface QualityKPIs {
  avgDriverRating: number;
  avgDriverRating7d: number;
  avgMerchantRating: number;
  avgMerchantRating7d: number;
  complaintRate: number;
  totalRatings: number;
}

interface WorstPerformer {
  id: string;
  name: string;
  avgRating: number;
  ratingCount: number;
  complaintCount: number;
}

interface LowRating {
  id: string;
  orderId: string;
  createdAt: string;
  driverName: string;
  merchantName: string;
  driverRating: number;
  merchantRating: number;
  tags: string[];
  comment: string;
}
```

---

## Security Considerations

| Access Pattern | Control |
|----------------|---------|
| Get order for rating | RPC with tracking_code validation, no auth required |
| Submit rating | RPC with idempotency (unique order_id), no auth |
| View all ratings | Admin RLS policy |
| View own ratings | Driver/Restaurant owner RLS policies |
| Insert ratings | Only via RPC (no direct insert) |
| Flag performers | Admin only action (writes to admin_driver_actions) |

---

## Real-time Subscriptions

```typescript
// Quality dashboard: subscribe to new ratings
supabase
  .channel('quality-ratings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'order_ratings'
  }, handleNewRating)
  .subscribe()
```

---

## Implementation Order

1. **Database migration** - Create order_ratings table, RPCs, triggers, RLS
2. **useOrderRating hook** - Rating submission hooks
3. **StarRating component** - Reusable star rating UI
4. **TagSelector component** - Issue tag checkboxes
5. **RateOrderPage** - Public rating page
6. **useQualityMetrics hook** - Quality dashboard data
7. **Quality dashboard components** - KPIs, charts, tables
8. **DispatchQuality page** - Quality dashboard layout
9. **Update sidebar** - Add Quality nav link
10. **Update routes** - Add `/rate/:code` and `/dispatch/quality`
11. **Update notification trigger** - Add rating link to delivery notification

---

## Testing Checklist

- [ ] Tracking code validation works
- [ ] Already-rated orders show appropriate message
- [ ] Star ratings capture correctly (1-5)
- [ ] Tags selection works (multi-select)
- [ ] Comment submission works
- [ ] Contact-back creates support ticket
- [ ] Driver avg rating updates after submission
- [ ] Restaurant avg rating updates after submission
- [ ] Quality dashboard shows correct KPIs
- [ ] Worst performers list is accurate
- [ ] Recent low ratings table populates
- [ ] Real-time toast shows on new rating
- [ ] RLS blocks unauthorized access
- [ ] Duplicate rating submission prevented

