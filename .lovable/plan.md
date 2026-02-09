
# Customer Role Enforcement — Implementation Plan

## Overview
Add explicit `customer` role verification to customer-facing endpoints to ensure that only users with the `customer` role can access customer functionality. This provides role-based isolation so admin role changes don't affect customer access patterns.

## Current State Analysis

### Existing Role System
| Role | Purpose |
|------|---------|
| `admin` | Full platform access |
| `super_admin` | Super administrator |
| `operations` | Operations team |
| `finance` | Finance team |
| `support` | Customer support |
| `driver` | Delivery drivers |
| `merchant` | Restaurant/business owners |
| `customer` | End users/customers |

### Current Authorization Pattern
| Endpoint Type | Current Check | Gap |
|--------------|---------------|-----|
| Admin endpoints | `has_role(user.id, 'admin')` | None |
| Driver endpoints | `driver_id = user.id` via drivers table | None |
| Customer endpoints | `customer_id = auth.uid()` (ownership only) | No explicit role check |

### What's Missing
Customer-facing endpoints rely solely on **ownership checks** but do not verify the user has the `customer` role. This means:
- An admin could theoretically access customer flows without the customer role
- Role revocation doesn't affect customer access if ownership exists

---

## Implementation Plan

### 1) Create `is_customer` Helper Function

**Purpose:** Security definer function to check if a user has the customer role.

```sql
CREATE OR REPLACE FUNCTION public.is_customer(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'customer'
  )
$$;
```

### 2) Auto-Assign Customer Role on Signup

**Purpose:** Ensure all new users automatically receive the `customer` role.

**Trigger on auth.users insert:**
```sql
CREATE OR REPLACE FUNCTION public.assign_customer_role_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign customer role to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_customer_role_on_signup();
```

### 3) Backfill Existing Users with Customer Role

**Purpose:** Ensure all existing users have the `customer` role.

```sql
-- Backfill customer role for all existing users who don't have it
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'customer'::app_role
FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'customer'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

### 4) Update RLS Policies for Customer Tables

**Tables to Update:**
- `food_orders` — add `is_customer(auth.uid())` check
- `trips` — add customer role check to rider policies
- `travel_orders` — add customer role check
- `hotel_bookings` — add customer role check
- `flight_bookings` — add customer role check
- `customer_wallets` — add customer role check
- `customer_feedback` — add customer role check (for insert)

**Example Policy Update:**
```sql
-- Current policy
CREATE POLICY "Customers can view own food orders"
  ON public.food_orders FOR SELECT
  USING (customer_id = auth.uid());

-- Updated policy with role check
DROP POLICY IF EXISTS "Customers can view own food orders" ON public.food_orders;
CREATE POLICY "Customers can view own food orders"
  ON public.food_orders FOR SELECT
  USING (
    customer_id = auth.uid() 
    AND is_customer(auth.uid())
  );
```

### 5) Update Edge Functions with Customer Role Check

**Customer-Facing Functions to Update:**

| Function | Current Auth | Add |
|----------|-------------|-----|
| `update-eats-order` | `user.id === order.customer_id` | `has_role(user.id, 'customer')` |
| `request-travel-cancellation` | `order.user_id === user.id` | `has_role(user.id, 'customer')` |
| `create-membership-checkout` | `user.email` exists | `has_role(user.id, 'customer')` |
| `customer-portal-membership` | `user` authenticated | `has_role(user.id, 'customer')` |

**Example Update Pattern:**
```typescript
// Add after user authentication
const { data: isCustomer } = await supabase.rpc("has_role", {
  _user_id: user.id,
  _role: "customer",
});

if (!isCustomer) {
  return new Response(
    JSON.stringify({ success: false, error: "Customer role required" }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### 6) Create Frontend Hook for Customer Role

**File:** `src/hooks/useCustomerRole.ts`

```typescript
export function useCustomerRole() {
  const { user } = useAuth();
  
  const { data: isCustomer, isLoading } = useQuery({
    queryKey: ["customer-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "customer",
      });
      return data ?? false;
    },
    enabled: !!user?.id,
  });
  
  return { isCustomer: isCustomer ?? false, isLoading };
}
```

---

## File Summary

### Database Changes (1 migration)
| Change | Description |
|--------|-------------|
| Create function | `is_customer()` helper function |
| Create trigger | Auto-assign customer role on signup |
| Backfill data | Assign customer role to existing users |
| Update policies | Add role checks to customer table policies |

### Edge Functions to Update (4)
| Function | Change |
|----------|--------|
| `update-eats-order/index.ts` | Add `has_role(..., 'customer')` check |
| `request-travel-cancellation/index.ts` | Add customer role verification |
| `create-membership-checkout/index.ts` | Add customer role verification |
| `customer-portal-membership/index.ts` | Add customer role verification |

### New Frontend File (1)
| File | Purpose |
|------|---------|
| `src/hooks/useCustomerRole.ts` | Check if current user has customer role |

---

## RLS Policy Updates Detail

### food_orders Table
```sql
-- SELECT: Own orders + customer role
DROP POLICY IF EXISTS "Customers can view own food orders" ON public.food_orders;
CREATE POLICY "Customers can view own food orders"
  ON public.food_orders FOR SELECT
  USING (customer_id = auth.uid() AND is_customer());

-- INSERT: Customer role required
DROP POLICY IF EXISTS "Customers can create food orders" ON public.food_orders;
CREATE POLICY "Customers can create food orders"
  ON public.food_orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id AND is_customer());
```

### trips Table
```sql
-- SELECT: Rider owns trip + customer role
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
CREATE POLICY "Users can view their own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = rider_id AND is_customer());
```

### travel_orders Table
```sql
-- SELECT: User owns order + customer role
CREATE POLICY "Customers can view own travel orders"
  ON public.travel_orders FOR SELECT
  USING (user_id = auth.uid() AND is_customer());
```

---

## Security Model

### Before (Ownership Only)
```
Customer Access = (user_id == record.customer_id)
```

### After (Role + Ownership)
```
Customer Access = (user_id == record.customer_id) AND has_role('customer')
```

### Benefits
1. **Role Revocation** — Removing customer role immediately blocks access
2. **Separation of Concerns** — Admin/support can't accidentally use customer flows
3. **Audit Trail** — Clear role-based access control
4. **Future Flexibility** — Can add customer tiers or restrictions per role

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| New user signup | Auto-assigned `customer` role via trigger |
| Existing user without role | Backfill migration assigns role |
| Admin accessing customer endpoint | Blocked unless they also have `customer` role |
| User loses customer role | Immediately loses access to customer endpoints |

---

## Rollout Strategy

1. **Phase 1:** Create helper function + trigger + backfill (no breaking changes)
2. **Phase 2:** Update RLS policies with new role checks
3. **Phase 3:** Update edge functions with role verification
4. **Phase 4:** Add frontend hook for customer role checks

---

## Summary

This implementation adds explicit customer role verification to all customer-facing endpoints:

1. **Helper Function** — `is_customer()` for RLS policies
2. **Auto-Assignment** — New users get customer role automatically
3. **Backfill** — Existing users receive customer role
4. **RLS Updates** — All customer tables require role + ownership
5. **Edge Function Updates** — Server-side role verification
6. **Frontend Hook** — Client-side role awareness

The feature ensures that admin role changes don't affect customer access and provides clear role-based isolation between user types.
