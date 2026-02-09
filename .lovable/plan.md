

# ZIVO+ Membership Implementation Plan

## Executive Summary
The ZIVO+ membership feature is **90% complete** with robust infrastructure already built. This plan addresses the remaining gaps: adding the `/account/membership` route, activating the Stripe plan, creating a monthly savings summary, and ensuring the badge is visible across the platform.

---

## Current State Analysis

### Already Built
| Component | Status | Details |
|-----------|--------|---------|
| Membership Page | Complete | Full UI at `src/pages/MembershipPage.tsx` with plan pricing, benefits, management |
| Hooks | Complete | `useMembership`, `useMembershipPlans`, `useCreateMembershipCheckout`, `useCancelMembership`, `useOpenCustomerPortal` |
| Edge Functions | Complete | `create-membership-checkout`, `cancel-membership`, `customer-portal-membership`, `stripe-webhook` |
| Checkout Integration | Complete | EatsCart.tsx applies free delivery + 50% off service fees |
| Database Tables | Complete | `zivo_subscription_plans`, `zivo_subscriptions`, `membership_usage` |
| Order Tracking | Complete | `membership_applied`, `membership_discount_cents` columns |
| Badges | Complete | `ZivoPlusBadge`, `MembershipSavingsBadge` components |

### Missing Pieces
| Item | What's Needed |
|------|---------------|
| Route | Add `/account/membership` and `/membership` routes to App.tsx |
| Stripe Prices | Create ZIVO+ product and prices in Stripe, update plan record |
| Plan Activation | Set `is_active = true` on the plan |
| Monthly Savings Hook | Create hook to aggregate savings from orders |
| Savings Card on Membership Page | Show "You saved $X this month" |
| Member Badge Visibility | Show badge in header/profile for active members |

---

## Implementation Steps

### 1) Add Membership Routes to App.tsx

**File to Modify:** `src/App.tsx`

Add routes for both public membership page and account-level access:

```typescript
// Add near other account routes (around line 915)
<Route path="/membership" element={<MembershipPage />} />
<Route path="/account/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
```

### 2) Create Stripe Products and Prices

Using Stripe tools:
- Create product: "ZIVO Plus" with description
- Create monthly price: $9.99/month recurring
- Create annual price: $79.99/year recurring
- Get price IDs and update database

**SQL to execute after creating Stripe prices:**
```sql
UPDATE zivo_subscription_plans
SET 
  stripe_price_id_monthly = 'price_xxx_monthly',
  stripe_price_id_yearly = 'price_xxx_yearly',
  is_active = true
WHERE slug = 'zivo-plus';
```

### 3) Create Monthly Savings Hook

**File to Create:** `src/hooks/useMembershipSavings.ts`

Query `food_orders` to aggregate membership savings for the current month:

```typescript
export function useMembershipSavings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["membership-savings", user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("food_orders")
        .select("membership_discount_cents")
        .eq("customer_id", user.id)
        .eq("membership_applied", true)
        .gte("created_at", startOfMonth.toISOString());
      
      if (error) throw error;
      
      const totalCents = data?.reduce((sum, order) => 
        sum + (order.membership_discount_cents || 0), 0) || 0;
      
      return {
        thisMonthCents: totalCents,
        thisMonthDollars: totalCents / 100,
        orderCount: data?.length || 0,
      };
    },
    enabled: !!user?.id,
  });
}
```

### 4) Add Savings Summary Card to MembershipPage

**File to Modify:** `src/pages/MembershipPage.tsx`

For active members, show a card with this month's savings:

```text
+------------------------------------------+
| 📊 Your Savings This Month               |
+------------------------------------------+
|                                          |
|   $12.47 saved                           |
|   across 5 orders                        |
|                                          |
|   [View Order History →]                 |
+------------------------------------------+
```

### 5) Add Member Badge to Header

**File to Modify:** `src/components/home/NavBar.tsx` (or `Header.tsx`)

For logged-in members, show small badge next to avatar:

```typescript
// Import useMembership hook
const { isActive } = useMembership();

// In render, near user avatar:
{isActive && <ZivoPlusBadge variant="small" />}
```

### 6) Add Member Badge to Mobile Account Page

**File to Modify:** `src/pages/mobile/MobileAccount.tsx`

Show member status in profile section:

```typescript
{isActive && (
  <Link to="/account/membership" className="...">
    <ZivoPlusBadge />
    <span>Manage Membership</span>
  </Link>
)}
```

---

## File Summary

### New Files (1)
| File | Purpose |
|------|---------|
| `src/hooks/useMembershipSavings.ts` | Aggregate monthly savings from orders |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/membership` and `/account/membership` routes |
| `src/pages/MembershipPage.tsx` | Add savings summary card using `useMembershipSavings` |
| `src/components/home/NavBar.tsx` | Show member badge for active subscribers |
| `src/pages/mobile/MobileAccount.tsx` | Show membership link with badge |

### Database Updates (via Stripe + SQL)
| Action | Details |
|--------|---------|
| Create Stripe Product | "ZIVO Plus" membership product |
| Create Monthly Price | $9.99/month recurring |
| Create Annual Price | $79.99/year recurring |
| Update Plan Record | Set price IDs and `is_active = true` |

---

## UI Components

### Savings Summary Card (MembershipPage)
```text
+------------------------------------------+
| [📊]  Your Savings                       |
+------------------------------------------+
|                                          |
|   $12.47                                 |
|   saved this month                       |
|                                          |
|   ─────────────────────────────────────  |
|   5 orders with ZIVO+ benefits           |
|                                          |
+------------------------------------------+
```
- Gradient background (amber/orange theme)
- Crown icon
- Animated entry

### Member Badge in NavBar
```text
[Avatar] 👑   ← Small crown badge overlay
```
- ZivoPlusBadge variant="small"
- Tooltip on hover: "ZIVO Plus Member"

### Mobile Account Link
```text
+------------------------------------------+
| [👑 ZIVO Plus]                           |
|      Manage your membership          →   |
+------------------------------------------+
```

---

## Technical Details

### Membership Benefits (from plan)
| Benefit | Config |
|---------|--------|
| Free delivery | Orders $15+ (`free_delivery_min_order`) |
| Delivery fee discount | 100% off if threshold met |
| Service fee discount | 50% off (`service_fee_discount_pct`) |
| Priority support | Enabled (`priority_support = true`) |

### Savings Calculation (already implemented)
```typescript
// calculateMembershipSavings in useMembership.ts
if (subtotal >= plan.free_delivery_min_order) {
  deliverySavings = deliveryFee; // 100% off
}
serviceSavings = serviceFee * (plan.service_fee_discount_pct / 100);
```

### Edge Function Flow
```text
User clicks "Join ZIVO+"
       ↓
useMembershipCheckout.mutate()
       ↓
create-membership-checkout (edge function)
       ↓
Returns Stripe Checkout URL
       ↓
User completes payment on Stripe
       ↓
Stripe webhook → stripe-webhook (edge function)
       ↓
Inserts/updates zivo_subscriptions table
       ↓
useMembership() returns isActive = true
       ↓
EatsCart applies discounts automatically
```

---

## Stripe Setup Required

Before the plan works, Stripe products/prices must be created:

1. **Product**: ZIVO Plus
   - Description: "Premium membership with free delivery and reduced fees"

2. **Monthly Price**: 
   - Amount: $9.99
   - Interval: month
   - Usage: licensed (subscription)

3. **Annual Price**:
   - Amount: $79.99
   - Interval: year
   - Usage: licensed (subscription)

4. **Update Database**:
   ```sql
   UPDATE zivo_subscription_plans
   SET 
     stripe_price_id_monthly = '[monthly_price_id]',
     stripe_price_id_yearly = '[yearly_price_id]',
     is_active = true
   WHERE slug = 'zivo-plus';
   ```

---

## Summary

The ZIVO+ membership system is **largely built** with:
- Complete checkout and subscription management flow
- Working checkout integration with automatic discounts
- Database tracking of per-order savings

**Remaining work**:
1. Add routes to App.tsx (2 lines)
2. Create Stripe prices (via tools)
3. Activate the plan (1 SQL update)
4. Create savings aggregation hook (new file)
5. Add savings card to membership page (UI addition)
6. Show member badge in header/account (small UI updates)

Total estimated implementation: 4 files modified, 1 new file, Stripe setup

