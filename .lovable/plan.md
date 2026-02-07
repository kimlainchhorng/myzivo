

# Promotions, Coupons, and Referral Rewards Implementation Plan

## Current State Analysis

The project already has a **significant foundation** for promotions and referrals that we need to build upon rather than replace:

### Existing Promo Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `promotions` table | Exists | Has code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, usage_count, per_user_limit, applicable_services, starts_at, ends_at, is_active |
| `promo_codes` table | Exists | Simpler structure: code, discount_type, discount_value, max_uses, uses, expires_at |
| `zivo_promo_campaigns` table | Exists | Full campaign system with budgets, per-user limits, service filtering |
| `zivo_promo_codes` table | Exists | Links to campaigns |
| `zivo_promo_redemptions` table | Exists | Tracks campaign usage |
| `promotion_usage` table | Exists | Tracks promotions table usage |
| `src/lib/promoCodeService.ts` | Exists | Validates promo_codes table |
| `src/hooks/usePromotions.ts` | Exists | Full campaign validation & redemption |
| `src/hooks/usePromoCode.ts` | Exists | Hook for promo code UI |
| `AdminPromotions.tsx` | Exists | Admin UI for promotions table |

### Existing Referral Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `zivo_referral_codes` table | Exists | user_id, code, is_active, total_referrals, total_earnings |
| `zivo_referrals` table | Exists | referrer_id, referee_id, status, credit amounts |
| `zivo_referral_tiers` table | Exists | Tiered rewards structure |
| `src/hooks/useReferrals.ts` | Exists | Full referral hook with apply, share |
| `src/config/referralProgram.ts` | Exists | ZIVO Points-based rewards config |

### Wallet Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `zivo_wallet_transactions` table | Exists | Transaction ledger with reference types |
| `zivo_wallet_credits` table | Exists | Credit balances with expiry |
| `src/hooks/useZivoWallet.ts` | Exists | Wallet hooks |

### Missing Components

| Gap | Description |
|-----|-------------|
| **Merchant-specific promos** | promotions.merchant_id column missing |
| **Free delivery type** | Need to handle in checkout |
| **Food orders promo columns** | No promotion_id, discount_amount, final_total |
| **Checkout promo integration** | EatsCheckout.tsx has no promo code input |
| **Driver referral rewards** | Current system is customer-focused |
| **Dispatch promo admin** | No /dispatch/promotions page |
| **Dispatch referral admin** | No /dispatch/referrals page |
| **Unified validate RPC** | Single source of truth validation |
| **Wallet credit rewards** | Link referrals → wallet_credits |

---

## Architecture Decision

Rather than creating new tables, we will:
1. **Enhance the existing `promotions` table** with merchant_id
2. **Add promo columns to `food_orders`** for tracking
3. **Create a unified `validate_promo_code` RPC** as single source of truth
4. **Extend referral system** for drivers
5. **Add dispatch admin pages** for promotions/referrals
6. **Integrate promo code input into checkout flows**

---

## Database Changes

### 1. Enhance `promotions` Table

```sql
-- Add merchant_id for merchant-specific promotions
ALTER TABLE promotions 
  ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES restaurants(id),
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

CREATE INDEX IF NOT EXISTS idx_promotions_merchant ON promotions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_tenant ON promotions(tenant_id);
```

### 2. Add Promo Columns to `food_orders`

```sql
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id),
  ADD COLUMN IF NOT EXISTS promotion_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_total NUMERIC;

-- Update final_total for existing orders
UPDATE food_orders SET final_total = total_amount WHERE final_total IS NULL;
```

### 3. Create `driver_referrals` Table

Extend referral system for driver-specific referrals:

```sql
CREATE TABLE IF NOT EXISTS public.driver_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  referrer_driver_id UUID REFERENCES drivers(id),
  referred_driver_id UUID REFERENCES drivers(id),
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, qualified, credited
  required_orders INT DEFAULT 10,
  completed_orders INT DEFAULT 0,
  reward_amount NUMERIC DEFAULT 50,
  credited_at TIMESTAMPTZ,
  CONSTRAINT unique_driver_referral UNIQUE (referred_driver_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_referrals_referrer ON driver_referrals(referrer_driver_id);
```

### 4. Add Referral Code to Drivers

```sql
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_referral_code ON drivers(referral_code);
```

---

## RPC Functions

### 1. `validate_promo_code` (Single Source of Truth)

```sql
CREATE OR REPLACE FUNCTION public.validate_promo_code(
  p_code TEXT,
  p_order_amount NUMERIC,
  p_customer_id UUID,
  p_restaurant_id UUID DEFAULT NULL,
  p_service_type TEXT DEFAULT 'eats'
)
RETURNS JSONB AS $$
DECLARE
  v_promo RECORD;
  v_usage_count INT;
  v_discount_amount NUMERIC;
  v_final_total NUMERIC;
BEGIN
  -- Find matching promotion
  SELECT * INTO v_promo
  FROM promotions
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now());

  IF v_promo IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired promo code');
  END IF;

  -- Check merchant restriction
  IF v_promo.merchant_id IS NOT NULL AND v_promo.merchant_id != p_restaurant_id THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This code is not valid for this restaurant');
  END IF;

  -- Check service eligibility
  IF v_promo.applicable_services IS NOT NULL 
     AND NOT (p_service_type = ANY(v_promo.applicable_services)) 
     AND NOT ('all' = ANY(v_promo.applicable_services)) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This code is not valid for this service');
  END IF;

  -- Check minimum order
  IF p_order_amount < COALESCE(v_promo.min_order_amount, 0) THEN
    RETURN jsonb_build_object('valid', false, 'error', 
      format('Minimum order of $%s required', v_promo.min_order_amount));
  END IF;

  -- Check usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This promotion has reached its usage limit');
  END IF;

  -- Check per-user limit
  IF p_customer_id IS NOT NULL AND v_promo.per_user_limit > 0 THEN
    SELECT COUNT(*) INTO v_usage_count
    FROM promotion_usage
    WHERE promotion_id = v_promo.id AND user_id = p_customer_id;

    IF v_usage_count >= v_promo.per_user_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'You have already used this promotion');
    END IF;
  END IF;

  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount_amount := p_order_amount * (v_promo.discount_value / 100);
  ELSIF v_promo.discount_type = 'fixed' THEN
    v_discount_amount := v_promo.discount_value;
  ELSIF v_promo.discount_type = 'free_delivery' THEN
    v_discount_amount := v_promo.discount_value; -- delivery fee amount
  ELSE
    v_discount_amount := 0;
  END IF;

  -- Apply max discount cap
  IF v_promo.max_discount IS NOT NULL AND v_discount_amount > v_promo.max_discount THEN
    v_discount_amount := v_promo.max_discount;
  END IF;

  -- Can't discount more than order
  IF v_discount_amount > p_order_amount THEN
    v_discount_amount := p_order_amount;
  END IF;

  v_final_total := p_order_amount - v_discount_amount;

  RETURN jsonb_build_object(
    'valid', true,
    'promotion_id', v_promo.id,
    'code', v_promo.code,
    'discount_type', v_promo.discount_type,
    'discount_amount', ROUND(v_discount_amount, 2),
    'final_total', ROUND(v_final_total, 2),
    'description', v_promo.description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 2. `apply_promo_to_order` (On Order Completion)

```sql
CREATE OR REPLACE FUNCTION public.apply_promo_to_order(
  p_order_id UUID,
  p_promotion_id UUID,
  p_discount_amount NUMERIC,
  p_customer_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update order with promo details
  UPDATE food_orders
  SET 
    promotion_id = p_promotion_id,
    discount_amount = p_discount_amount,
    final_total = total_amount - p_discount_amount,
    updated_at = now()
  WHERE id = p_order_id;

  -- Increment usage count
  UPDATE promotions
  SET usage_count = usage_count + 1
  WHERE id = p_promotion_id;

  -- Record usage
  INSERT INTO promotion_usage (promotion_id, user_id, order_id, discount_amount)
  VALUES (p_promotion_id, p_customer_id, p_order_id, p_discount_amount)
  ON CONFLICT DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 3. `process_referral_reward` (On First Completed Order)

```sql
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_referral RECORD;
  v_tier RECORD;
BEGIN
  -- Get order details
  SELECT * INTO v_order FROM food_orders WHERE id = p_order_id AND status = 'delivered';
  IF v_order IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Order not found'); END IF;

  -- Check for pending referral
  SELECT * INTO v_referral
  FROM zivo_referrals
  WHERE referee_id = v_order.customer_id
    AND status = 'pending';

  IF v_referral IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'No pending referral');
  END IF;

  -- Get current tier for referrer
  SELECT * INTO v_tier
  FROM zivo_referral_tiers
  WHERE is_active = true
    AND min_referrals <= (
      SELECT total_referrals FROM zivo_referral_codes WHERE user_id = v_referral.referrer_id
    )
  ORDER BY min_referrals DESC
  LIMIT 1;

  -- Update referral to credited
  UPDATE zivo_referrals
  SET 
    status = 'credited',
    first_booking_service = 'eats',
    first_booking_id = p_order_id,
    first_booking_at = now(),
    credited_at = now()
  WHERE id = v_referral.id;

  -- Update referrer stats
  UPDATE zivo_referral_codes
  SET 
    total_referrals = total_referrals + 1,
    total_earnings = total_earnings + COALESCE(v_tier.referrer_reward, 0)
  WHERE user_id = v_referral.referrer_id;

  -- Add wallet credit for referee
  INSERT INTO zivo_wallet_credits (
    user_id, credit_type, amount, currency, 
    source_description, source_reference_id
  ) VALUES (
    v_referral.referee_id, 'referral_bonus', v_referral.referee_credit_amount, 'USD',
    'Referral signup bonus', v_referral.id::text
  );

  -- Add wallet credit for referrer
  INSERT INTO zivo_wallet_credits (
    user_id, credit_type, amount, currency,
    source_description, source_reference_id
  ) VALUES (
    v_referral.referrer_id, 'referral_reward', COALESCE(v_tier.referrer_reward, v_referral.referrer_credit_amount), 'USD',
    'Referral reward for new customer', v_referral.id::text
  );

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'referee_credit', v_referral.referee_credit_amount,
    'referrer_credit', COALESCE(v_tier.referrer_reward, v_referral.referrer_credit_amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### 4. `process_driver_referral_milestone` (After X Orders)

```sql
CREATE OR REPLACE FUNCTION public.process_driver_referral_milestone(p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_referral RECORD;
  v_order_count INT;
BEGIN
  -- Get pending driver referral
  SELECT * INTO v_referral
  FROM driver_referrals
  WHERE referred_driver_id = p_driver_id
    AND status = 'pending';

  IF v_referral IS NULL THEN RETURN jsonb_build_object('success', false); END IF;

  -- Count completed deliveries
  SELECT COUNT(*) INTO v_order_count
  FROM food_orders
  WHERE driver_id = p_driver_id
    AND status = 'delivered';

  -- Update progress
  UPDATE driver_referrals
  SET completed_orders = v_order_count
  WHERE id = v_referral.id;

  -- Check if milestone reached
  IF v_order_count >= v_referral.required_orders THEN
    UPDATE driver_referrals
    SET status = 'credited', credited_at = now()
    WHERE id = v_referral.id;

    -- Add credit to referrer driver wallet
    INSERT INTO zivo_wallet_transactions (
      user_id, service_type, transaction_type, amount, currency,
      description, reference_type, reference_id, status
    ) VALUES (
      (SELECT user_id FROM drivers WHERE id = v_referral.referrer_driver_id),
      'bonus', 'credit', v_referral.reward_amount, 'USD',
      'Driver referral bonus', 'driver_referral', v_referral.id::text, 'completed'
    );

    RETURN jsonb_build_object('success', true, 'credited', true, 'amount', v_referral.reward_amount);
  END IF;

  RETURN jsonb_build_object('success', true, 'credited', false, 'progress', v_order_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

---

## Frontend Changes

### 1. Create `usePromotionValidation.ts` Hook

```typescript
// Single hook for promo code validation using the RPC
export function usePromotionValidation() {
  const validate = async (code: string, orderAmount: number, restaurantId?: string) => {
    const { data, error } = await supabase.rpc('validate_promo_code', {
      p_code: code,
      p_order_amount: orderAmount,
      p_customer_id: user?.id,
      p_restaurant_id: restaurantId,
      p_service_type: 'eats'
    });
    return data;
  };
  // ...
}
```

### 2. Update `EatsCheckout.tsx` - Add Promo Code Input

Add promo code section between Order Summary and Submit button:

```tsx
{/* Promo Code Section */}
<div className="flex gap-2">
  <Input
    placeholder="Promo code"
    value={promoCode}
    onChange={(e) => setPromoCode(e.target.value)}
    disabled={appliedPromo !== null}
  />
  {appliedPromo ? (
    <Button variant="outline" onClick={() => setAppliedPromo(null)}>
      Remove
    </Button>
  ) : (
    <Button onClick={handleApplyPromo} disabled={!promoCode || isValidating}>
      Apply
    </Button>
  )}
</div>

{appliedPromo && (
  <div className="flex justify-between text-green-600">
    <span>Discount ({appliedPromo.code})</span>
    <span>-${appliedPromo.discount_amount.toFixed(2)}</span>
  </div>
)}
```

### 3. Create `DispatchPromotions.tsx` Page

**Route:** `/dispatch/promotions`

Features:
- List promotions with filters (active, expired, merchant-specific)
- Create new promotion form
- Toggle active state
- View usage stats
- Copy promo code
- Merchant filter (if tenant manages merchants)

### 4. Create `DispatchReferrals.tsx` Page

**Route:** `/dispatch/referrals`

Features:
- List customer referrals with status
- List driver referrals with progress
- Manual reward trigger (admin override)
- Stats cards (total referrals, conversion rate, pending)

### 5. Update `DispatchSidebar.tsx`

Add navigation items:
```typescript
{
  label: "Promotions",
  path: "/dispatch/promotions",
  icon: Tag,
  permission: "promotions.manage",
},
{
  label: "Referrals", 
  path: "/dispatch/referrals",
  icon: Gift,
  permission: "promotions.manage",
},
```

### 6. Create `useDispatchPromotions.ts` Hook

```typescript
export function useDispatchPromotions(tenantId?: string) {
  // List promotions for tenant
  const { data: promotions } = useQuery({
    queryKey: ['dispatch-promotions', tenantId],
    queryFn: async () => {
      let query = supabase.from('promotions').select('*');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      return (await query).data;
    }
  });
  
  // Create promotion
  const createPromotion = useMutation({ ... });
  
  // Toggle active
  const toggleActive = useMutation({ ... });
  
  return { promotions, createPromotion, toggleActive };
}
```

### 7. Create `useDispatchReferrals.ts` Hook

```typescript
export function useDispatchReferrals() {
  // Customer referrals
  const { data: customerReferrals } = useQuery(...);
  
  // Driver referrals
  const { data: driverReferrals } = useQuery(...);
  
  // Manual trigger reward
  const triggerReward = useMutation({
    mutationFn: async (referralId: string) => {
      return supabase.rpc('manually_credit_referral', { p_referral_id: referralId });
    }
  });
  
  return { customerReferrals, driverReferrals, triggerReward };
}
```

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/XXX.sql` | Create | DB changes for promo columns, driver referrals, RPCs |
| `src/hooks/usePromotionValidation.ts` | Create | Unified promo validation hook using RPC |
| `src/hooks/useDispatchPromotions.ts` | Create | Dispatch promo management hook |
| `src/hooks/useDispatchReferrals.ts` | Create | Dispatch referral management hook |
| `src/pages/EatsCheckout.tsx` | Modify | Add promo code input section |
| `src/pages/dispatch/DispatchPromotions.tsx` | Create | Promotions admin page |
| `src/pages/dispatch/DispatchReferrals.tsx` | Create | Referrals admin page |
| `src/components/dispatch/DispatchSidebar.tsx` | Modify | Add Promotions, Referrals nav items |
| `src/App.tsx` | Modify | Add dispatch promo/referral routes |
| `src/integrations/supabase/types.ts` | Auto-update | Type definitions |

---

## RLS Policies

### Promotions

```sql
-- Existing policies likely in place, add tenant/merchant scoping
CREATE POLICY "Tenant admins can manage promotions" ON promotions
  FOR ALL TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (tenant_id IS NOT NULL AND public.has_tenant_permission(tenant_id, 'promotions.manage'))
  );

CREATE POLICY "Merchants can manage own promotions" ON promotions
  FOR ALL TO authenticated
  USING (
    merchant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Active promotions readable by all" ON promotions
  FOR SELECT TO authenticated
  USING (is_active = true AND (ends_at IS NULL OR ends_at > now()));
```

### Driver Referrals

```sql
ALTER TABLE driver_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage driver referrals" ON driver_referrals
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Drivers can view own referrals" ON driver_referrals
  FOR SELECT TO authenticated
  USING (
    referrer_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    OR referred_driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
  );
```

---

## Checkout Flow Integration

```text
Customer Flow:
1. Add items to cart
2. Go to checkout
3. Enter promo code → calls validate_promo_code RPC
4. See discount preview in order summary
5. Submit order
6. Backend: apply_promo_to_order saves promo details
7. On delivery complete: process_referral_reward checks for pending referrals
8. Wallet credits issued automatically

Free Delivery Flow:
- If discount_type = 'free_delivery':
  - Set discount_amount = delivery_fee
  - Display "Free Delivery" badge
  - delivery_fee shown as $0 in checkout
```

---

## Implementation Order

1. **Database migration** - Add columns, create tables, RPCs, RLS
2. **usePromotionValidation hook** - Unified validation
3. **Update EatsCheckout.tsx** - Add promo code input
4. **useDispatchPromotions hook** - Dispatch promo management
5. **DispatchPromotions page** - Admin UI
6. **useDispatchReferrals hook** - Referral management
7. **DispatchReferrals page** - Admin UI
8. **Update DispatchSidebar** - Add nav items
9. **Update App.tsx** - Add routes
10. **Test end-to-end** - Promo application, referral rewards

---

## Testing Checklist

- [ ] Promo code validates correctly (valid/invalid/expired)
- [ ] Percentage discount calculates correctly
- [ ] Fixed discount applies correctly
- [ ] Free delivery zeroes delivery fee
- [ ] Max discount cap works
- [ ] Per-user limit enforced
- [ ] Usage limit enforced
- [ ] Merchant-specific codes only work for that merchant
- [ ] Discount shows in checkout summary
- [ ] Order saves with promotion_id, discount_amount, final_total
- [ ] Customer referral credits wallet after first order
- [ ] Driver referral credits after milestone orders
- [ ] Dispatch promo list loads
- [ ] Dispatch can create/toggle promotions
- [ ] Dispatch referral list shows status
- [ ] Manual reward trigger works

