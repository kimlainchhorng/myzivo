
# ZIVO+ Membership System with Stripe Subscriptions

## Overview
Implement a complete subscription-based membership system enabling customers to subscribe monthly for reduced fees, free delivery, and priority support.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `zivo_subscriptions` table | ✅ Exists | Has `user_id`, `plan_id`, `status`, `stripe_subscription_id`, `current_period_end` |
| `zivo_subscription_plans` table | ✅ Exists | Has `name`, `price_monthly`, `fee_reduction_pct`, `priority_support`, `benefits` (JSONB) |
| `ZivoPlusBadge` component | ✅ Exists | Badge UI for Plus members |
| `ZivoPlus` landing page | ✅ Exists | `/zivo-plus` marketing page |
| Stripe webhook handler | ✅ Exists | `stripe-webhook` edge function |
| STRIPE_SECRET_KEY | ✅ Configured | Available in secrets |

### Missing
| Feature | Status |
|---------|--------|
| `useMembership` hook | ❌ No hook to check membership status |
| Stripe subscription checkout edge function | ❌ Need `create-membership-checkout` |
| Subscription webhook events handling | ❌ `invoice.paid`, `subscription.deleted`, etc. |
| Membership page (`/membership`) | ❌ Customer-facing subscription management |
| Eats checkout integration | ❌ No fee reduction applied |
| Admin membership dashboard | ❌ `/admin/membership` |
| Membership columns in `food_orders` | ❌ Need to track membership savings |
| `membership_usage` table | ❌ Track benefit usage per order |

---

## Implementation Plan

### A) Database Updates

#### 1. Add Columns to `zivo_subscription_plans`
The existing table already has `fee_reduction_pct`, but we need to add Eats-specific fields:

```sql
ALTER TABLE zivo_subscription_plans ADD COLUMN IF NOT EXISTS delivery_fee_discount_pct NUMERIC DEFAULT 100;
ALTER TABLE zivo_subscription_plans ADD COLUMN IF NOT EXISTS service_fee_discount_pct NUMERIC DEFAULT 50;
ALTER TABLE zivo_subscription_plans ADD COLUMN IF NOT EXISTS free_delivery_min_order NUMERIC DEFAULT 15;
ALTER TABLE zivo_subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT;
ALTER TABLE zivo_subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;
```

#### 2. Add Columns to `food_orders`
Track membership savings per order:

```sql
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS membership_discount_cents INTEGER DEFAULT 0;
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS membership_applied BOOLEAN DEFAULT false;
```

#### 3. Create `membership_usage` Table
Track which benefits were used on each order:

```sql
CREATE TABLE IF NOT EXISTS membership_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES food_orders(id),
  benefit_type TEXT NOT NULL, -- 'free_delivery', 'reduced_service_fee', 'priority_driver'
  saved_amount_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### B) Create Membership Hook

**File: `src/hooks/useMembership.ts`**

```typescript
export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number | null;
  delivery_fee_discount_pct: number;
  service_fee_discount_pct: number;
  free_delivery_min_order: number;
  priority_support: boolean;
  benefits: Record<string, any>;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
}

export interface Membership {
  id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  current_period_end: string;
  stripe_subscription_id: string | null;
  plan: MembershipPlan;
}

export function useMembership() {
  // Query active membership for current user
  const membership = useQuery(...)
  
  // Derived state
  const isActive = membership?.status === 'active' || membership?.status === 'trialing';
  const isPastDue = membership?.status === 'past_due';
  
  return { 
    membership, 
    isActive, 
    isPastDue, 
    isLoading 
  };
}

export function useMembershipPlans() {
  // Query all active plans
  return useQuery(...);
}

export function useCreateMembershipCheckout() {
  // Call edge function to create Stripe subscription checkout
  return useMutation(...);
}

export function useCancelMembership() {
  // Call edge function to cancel subscription
  return useMutation(...);
}
```

### C) Edge Functions

#### 1. Create `create-membership-checkout` Edge Function

Creates a Stripe Checkout session in subscription mode.

```typescript
// supabase/functions/create-membership-checkout/index.ts

// 1. Get authenticated user
// 2. Lookup or create Stripe customer
// 3. Get plan and price ID from request
// 4. Create checkout.sessions.create with mode: 'subscription'
// 5. Return checkout URL

const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${origin}/membership?success=true`,
  cancel_url: `${origin}/membership?cancelled=true`,
  metadata: {
    type: 'membership',
    user_id: user.id,
    plan_id: planId,
  },
});
```

#### 2. Create `cancel-membership` Edge Function

```typescript
// supabase/functions/cancel-membership/index.ts

// 1. Get authenticated user
// 2. Find their active subscription
// 3. Call stripe.subscriptions.cancel()
// 4. Update zivo_subscriptions status = 'cancelled'
```

#### 3. Create `customer-portal-membership` Edge Function

Allows users to manage their subscription via Stripe Customer Portal.

```typescript
// supabase/functions/customer-portal-membership/index.ts

// 1. Get authenticated user
// 2. Find Stripe customer
// 3. Create billing portal session
// 4. Return portal URL
```

#### 4. Update `stripe-webhook` to Handle Subscription Events

Add these event handlers to the existing webhook:

```typescript
case "customer.subscription.created":
case "customer.subscription.updated": {
  const subscription = event.data.object as Stripe.Subscription;
  if (subscription.metadata?.type === 'membership') {
    await supabase.from("zivo_subscriptions")
      .upsert({
        user_id: subscription.metadata.user_id,
        plan_id: subscription.metadata.plan_id,
        status: subscription.status, // 'active', 'trialing', 'past_due'
        stripe_subscription_id: subscription.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });
  }
  break;
}

case "customer.subscription.deleted": {
  const subscription = event.data.object as Stripe.Subscription;
  if (subscription.metadata?.type === 'membership') {
    await supabase.from("zivo_subscriptions")
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);
  }
  break;
}

case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription;
  if (subscriptionId && invoice.metadata?.type === 'membership') {
    await supabase.from("zivo_subscriptions")
      .update({ status: 'active' })
      .eq("stripe_subscription_id", subscriptionId);
  }
  break;
}

case "invoice.payment_failed": {
  const invoice = event.data.object as Stripe.Invoice;
  if (invoice.subscription && invoice.metadata?.type === 'membership') {
    await supabase.from("zivo_subscriptions")
      .update({ status: 'past_due' })
      .eq("stripe_subscription_id", invoice.subscription);
  }
  break;
}
```

### D) Customer Pages

#### 1. Create `/membership` Page

**File: `src/pages/MembershipPage.tsx`**

**Sections:**
1. **Hero** — ZIVO+ branding and current status
2. **Plan Card** — Price, benefits list, Join/Cancel button
3. **Savings Calculator** — Example order showing savings
4. **Benefits Grid** — Visual benefits with icons
5. **Billing Info** — Next billing date, manage subscription link

**UI States:**
- **Not subscribed**: Show plan card with "Join ZIVO+" button
- **Active subscriber**: Show "You're a ZIVO+ member" with billing info and cancel option
- **Past due**: Show warning and prompt to update payment
- **Processing**: Loading state after checkout return

#### 2. Update Account Page (`/app/account` or `/profile`)

Add membership status section:
- Show `ZivoPlusBadge` if active
- Link to `/membership` for management
- Show next billing date

### E) Eats Checkout Integration

#### 1. Update `EatsCart.tsx`

Add membership discount logic:

```typescript
const { membership, isActive } = useMembership();

// Calculate membership discounts
const membershipSavings = useMemo(() => {
  if (!isActive || !membership?.plan) return { deliverySavings: 0, serviceSavings: 0 };
  
  const plan = membership.plan;
  
  // Free delivery if order meets minimum
  let deliverySavings = 0;
  if (subtotal >= plan.free_delivery_min_order) {
    deliverySavings = deliveryFee; // 100% off
  } else if (plan.delivery_fee_discount_pct > 0) {
    deliverySavings = deliveryFee * (plan.delivery_fee_discount_pct / 100);
  }
  
  // Reduced service fee
  const serviceSavings = serviceFee * (plan.service_fee_discount_pct / 100);
  
  return { deliverySavings, serviceSavings };
}, [isActive, membership, subtotal, deliveryFee, serviceFee]);

// Update totals
const effectiveDeliveryFee = deliveryFee - membershipSavings.deliverySavings;
const effectiveServiceFee = serviceFee - membershipSavings.serviceSavings;
const total = subtotal - promo.discountAmount + effectiveDeliveryFee + effectiveServiceFee + tax + tipAmount;
```

#### 2. Create `MembershipSavingsBadge` Component

Show savings inline in cart:

```typescript
{isActive && (membershipSavings.deliverySavings > 0 || membershipSavings.serviceSavings > 0) && (
  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
    <Crown className="w-4 h-4 text-amber-500" />
    <span className="text-sm text-amber-400">
      ZIVO+ savings: ${(membershipSavings.deliverySavings + membershipSavings.serviceSavings).toFixed(2)}
    </span>
  </div>
)}
```

#### 3. Update Order Creation

Pass membership savings to order:

```typescript
const order = await createOrder.mutateAsync({
  // ... existing fields ...
  membership_applied: isActive,
  membership_discount_cents: Math.round((membershipSavings.deliverySavings + membershipSavings.serviceSavings) * 100),
});

// Log membership usage
if (isActive) {
  await supabase.from("membership_usage").insert([
    {
      user_id: userId,
      order_id: order.id,
      benefit_type: 'reduced_delivery_fee',
      saved_amount_cents: Math.round(membershipSavings.deliverySavings * 100),
    },
    {
      user_id: userId,
      order_id: order.id,
      benefit_type: 'reduced_service_fee',
      saved_amount_cents: Math.round(membershipSavings.serviceSavings * 100),
    },
  ]);
}
```

### F) Admin Dashboard

#### Create `/admin/membership` Page

**File: `src/pages/admin/MembershipDashboard.tsx`**

**Tabs:**
1. **Overview**: Active subscribers count, MRR, churn rate
2. **Plans**: Create/edit plans with pricing and benefits
3. **Subscribers**: List of all subscribers with status filter
4. **Revenue**: Monthly revenue chart from subscriptions

**Key Metrics Cards:**
- Active Subscribers
- Monthly Recurring Revenue (MRR)
- Average Savings per Order
- Churn Rate (30-day)

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useMembership.ts` | Membership status and plan hooks |
| `src/pages/MembershipPage.tsx` | Customer membership page |
| `src/pages/admin/MembershipDashboard.tsx` | Admin dashboard for plans and subscribers |
| `src/components/membership/MembershipCard.tsx` | Plan display with pricing |
| `src/components/membership/MembershipSavingsBadge.tsx` | Savings indicator in cart |
| `supabase/functions/create-membership-checkout/index.ts` | Stripe subscription checkout |
| `supabase/functions/cancel-membership/index.ts` | Cancel subscription |
| `supabase/functions/customer-portal-membership/index.ts` | Stripe billing portal |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/functions/stripe-webhook/index.ts` | Add subscription event handlers |
| `src/pages/EatsCart.tsx` | Apply membership discounts |
| `src/hooks/useEatsOrders.ts` | Add `membership_applied`, `membership_discount_cents` |
| `src/pages/EatsOrderDetail.tsx` | Show "ZIVO+ savings" in receipt |
| `src/contexts/AuthContext.tsx` | Optionally add `isMember` flag |
| `src/App.tsx` | Add `/membership`, `/admin/membership` routes |
| `src/pages/ZivoPlus.tsx` | Connect "Join" button to checkout |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Add plan columns | `delivery_fee_discount_pct`, `service_fee_discount_pct`, `free_delivery_min_order`, Stripe price IDs |
| Add order columns | `membership_applied`, `membership_discount_cents` on `food_orders` |
| Create `membership_usage` table | Track benefit usage per order |
| Seed default plan | Insert "ZIVO+" plan with $9.99/month pricing |

---

## Stripe Setup Requirements

Before implementation, create products in Stripe:

1. **Product**: "ZIVO+ Membership"
2. **Prices**:
   - Monthly: $9.99/month (recurring)
   - Yearly: $79.99/year (recurring)

Store the `price_*` IDs in `zivo_subscription_plans.stripe_price_id_monthly/yearly`.

---

## Checkout Flow

```text
User clicks "Join ZIVO+"
    ↓
Call create-membership-checkout edge function
    ↓
Redirect to Stripe Checkout (subscription mode)
    ↓
User enters payment details
    ↓
Stripe processes subscription
    ↓
Webhook: customer.subscription.created
    ↓
Insert/update zivo_subscriptions with status='active'
    ↓
Redirect to /membership?success=true
    ↓
Show success toast + membership benefits
```

---

## Eats Discount Logic

```text
Customer opens /eats/cart
    ↓
useMembership() checks active subscription
    ↓
If active:
  - Check if subtotal >= free_delivery_min_order
    - Yes → delivery_fee = $0
    - No → delivery_fee * (1 - delivery_fee_discount_pct/100)
  - service_fee * (1 - service_fee_discount_pct/100)
    ↓
Display badge: "ZIVO+ savings: $X.XX applied"
    ↓
Place order with membership_discount_cents logged
```

---

## Summary

This implementation adds:

1. **Membership Hook** (`useMembership`): Check subscription status anywhere in app
2. **Stripe Subscription Checkout**: Edge function for subscription mode checkout
3. **Webhook Handlers**: `subscription.created/updated/deleted`, `invoice.paid/failed`
4. **Customer Page** (`/membership`): Join, manage, cancel subscription
5. **Eats Integration**: Auto-apply fee discounts at checkout
6. **Admin Dashboard** (`/admin/membership`): Plan management, subscriber list, revenue
7. **Savings UX**: Badge showing savings, receipts highlighting membership discounts
8. **Benefit Tracking**: Log usage per order for analytics
