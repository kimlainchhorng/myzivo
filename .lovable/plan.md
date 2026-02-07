

# Rider: Promo Code System

## Summary

Implement a functional promo code system that allows riders to apply discount codes before ride confirmation. The system includes a new Supabase table for promo codes, validation logic, usage tracking, and discounted price display on the confirmation screen.

---

## Current State

| Component | Status |
|-----------|--------|
| `/promotions` page | Exists - has "Apply" button but no real functionality |
| `promo_codes` table | Does not exist in database |
| Promo validation logic | Not implemented |
| Discount in ride flow | Not implemented |
| Usage tracking | Not implemented |

---

## Database Change Required

Create new `promo_codes` table:

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active promo codes (for validation)
CREATE POLICY "Allow read access to promo codes" ON promo_codes
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, expires_at) VALUES
  ('FIRST25', 'percent', 25, 1000, '2026-12-31'),
  ('RIDE10', 'percent', 10, null, null),
  ('SAVE5', 'fixed', 5, 500, '2026-06-30');
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/usePromoCode.ts` | Create | Hook for promo code validation and application |
| `src/lib/promoCodeService.ts` | Create | Functions to validate/apply promo codes via Supabase |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Add promo code input and discounted price display |
| `src/types/rideTypes.ts` | Modify | Add promo code fields to RideState |
| `src/stores/rideStore.tsx` | Modify | Add promo code to ride state |

---

## Technical Details

### 1. New File: `src/lib/promoCodeService.ts`

Handles database interactions for promo codes:

```typescript
import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface ValidatePromoResult {
  valid: boolean;
  promoCode?: PromoCode;
  error?: string;
}

export async function validatePromoCode(code: string): Promise<ValidatePromoResult> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid promo code" };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "This promo code has expired" };
  }

  // Check max uses
  if (data.max_uses !== null && data.uses >= data.max_uses) {
    return { valid: false, error: "This promo code has reached its limit" };
  }

  return { valid: true, promoCode: data };
}

export async function incrementPromoCodeUse(promoId: string): Promise<boolean> {
  const { error } = await supabase.rpc("increment_promo_uses", { 
    promo_id: promoId 
  });
  
  // Fallback if RPC doesn't exist
  if (error) {
    const { error: updateError } = await supabase
      .from("promo_codes")
      .update({ uses: supabase.sql`uses + 1` })
      .eq("id", promoId);
    return !updateError;
  }
  
  return true;
}

export function calculateDiscount(
  originalPrice: number,
  promoCode: PromoCode
): { discountAmount: number; finalPrice: number } {
  let discountAmount = 0;

  if (promoCode.discount_type === "percent") {
    discountAmount = (originalPrice * promoCode.discount_value) / 100;
  } else {
    discountAmount = promoCode.discount_value;
  }

  // Ensure discount doesn't exceed original price
  discountAmount = Math.min(discountAmount, originalPrice);
  
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round((originalPrice - discountAmount) * 100) / 100,
  };
}
```

### 2. New Hook: `src/hooks/usePromoCode.ts`

React hook for promo code state management:

```typescript
import { useState, useCallback } from "react";
import { 
  validatePromoCode, 
  calculateDiscount, 
  PromoCode 
} from "@/lib/promoCodeService";
import { toast } from "sonner";

export interface UsePromoCodeReturn {
  promoCode: PromoCode | null;
  isValidating: boolean;
  error: string | null;
  discountAmount: number;
  finalPrice: number;
  applyPromoCode: (code: string, originalPrice: number) => Promise<boolean>;
  removePromoCode: () => void;
}

export function usePromoCode(originalPrice: number): UsePromoCodeReturn {
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { discountAmount, finalPrice } = promoCode
    ? calculateDiscount(originalPrice, promoCode)
    : { discountAmount: 0, finalPrice: originalPrice };

  const applyPromoCode = useCallback(async (code: string, price: number): Promise<boolean> => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return false;
    }

    setIsValidating(true);
    setError(null);

    const result = await validatePromoCode(code);
    setIsValidating(false);

    if (!result.valid) {
      setError(result.error || "Invalid promo code");
      toast.error(result.error || "Invalid promo code");
      return false;
    }

    setPromoCode(result.promoCode!);
    toast.success("Promo applied successfully");
    return true;
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setError(null);
  }, []);

  return {
    promoCode,
    isValidating,
    error,
    discountAmount,
    finalPrice,
    applyPromoCode,
    removePromoCode,
  };
}
```

### 3. Update `RideConfirmPage.tsx`

Add promo code input section below payment method:

```typescript
// Add imports
import { usePromoCode } from "@/hooks/usePromoCode";
import { incrementPromoCodeUse } from "@/lib/promoCodeService";
import { Tag, X, Loader2 } from "lucide-react";

// Inside component
const [promoInput, setPromoInput] = useState("");
const {
  promoCode,
  isValidating,
  error: promoError,
  discountAmount,
  finalPrice,
  applyPromoCode,
  removePromoCode,
} = usePromoCode(displayPrice);

// Update handleConfirm to use finalPrice and increment promo uses
const handleConfirm = async () => {
  // ... existing availability check
  
  // Increment promo code usage if applied
  if (promoCode) {
    await incrementPromoCodeUse(promoCode.id);
  }
  
  // Use finalPrice instead of displayPrice for the ride
  createRide({
    // ... other fields
    price: finalPrice,  // Use discounted price
  });
  
  // ... rest of function
};

// JSX - Add promo section after payment methods
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  className="mt-6"
>
  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
    <Tag className="w-4 h-4 text-primary" />
    Promo Code
  </h3>
  
  {promoCode ? (
    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-green-400" />
        <span className="font-mono font-bold text-green-400">{promoCode.code}</span>
        <span className="text-sm text-green-400/80">
          -{promoCode.discount_type === 'percent' 
            ? `${promoCode.discount_value}%` 
            : `$${promoCode.discount_value}`}
        </span>
      </div>
      <button
        onClick={removePromoCode}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-white/60" />
      </button>
    </div>
  ) : (
    <div className="flex gap-2">
      <input
        type="text"
        value={promoInput}
        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
        placeholder="Enter code"
        className="flex-1 h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none"
      />
      <button
        onClick={() => applyPromoCode(promoInput, displayPrice)}
        disabled={isValidating || !promoInput.trim()}
        className="px-4 h-11 bg-primary/20 border border-primary/30 rounded-xl text-primary font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isValidating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Apply"
        )}
      </button>
    </div>
  )}
  
  {promoError && (
    <p className="text-xs text-destructive mt-2">{promoError}</p>
  )}
</motion.div>

// Update price display to show discount
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2 text-white/60">
    <Clock className="w-4 h-4" />
    <span className="text-sm">{ride.eta} min away</span>
  </div>
  <div className="text-right">
    {promoCode && discountAmount > 0 && (
      <p className="text-sm text-white/40 line-through">
        ${displayPrice.toFixed(2)}
      </p>
    )}
    <p className="text-2xl font-bold text-primary">
      ${finalPrice.toFixed(2)}
    </p>
  </div>
</div>

// Show discount breakdown if promo applied
{promoCode && discountAmount > 0 && (
  <div className="flex items-center justify-center gap-2 py-2 bg-green-500/10 border border-green-500/30 rounded-lg mt-2">
    <Tag className="w-4 h-4 text-green-400" />
    <span className="text-sm text-green-400">
      Promo {promoCode.code}: -${discountAmount.toFixed(2)} off
    </span>
  </div>
)}

// Update confirm button to show final price
<motion.button
  onClick={handleConfirm}
  disabled={isSubmitting || isCheckingAvailability}
  className="..."
>
  {isSubmitting ? (
    // existing loading state
  ) : (
    `PAY $${finalPrice.toFixed(2)} & REQUEST`
  )}
</motion.button>
```

### 4. Database RPC for atomic increment (optional)

Add an RPC function for safely incrementing usage:

```sql
CREATE OR REPLACE FUNCTION increment_promo_uses(promo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes 
  SET uses = uses + 1 
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## User Flow

```text
User on /ride/confirm page
        │
        ▼
Sees "Promo Code" section with input
        │
        ▼
Types promo code (e.g., "FIRST25")
        │
        ▼
Taps "Apply" button
        │
    ┌───┴───────────────┐
    │                   │
    ▼                   ▼
 Valid Code          Invalid Code
    │                   │
    ▼                   ▼
"Promo applied      Show error:
 successfully"      "Invalid/expired/
 toast               used up"
    │                   
    ▼                   
Show discount:
"FIRST25: -$5.00 off"
    │
    ▼
Update price display:
$25.00 → $20.00
    │
    ▼
Button shows:
"PAY $20.00 & REQUEST"
    │
    ▼
User confirms → promo_codes.uses +1
```

---

## UI Mockup: Promo Applied

```text
+----------------------------------+
|         Trip Summary             |
|----------------------------------|
| Base fare             $25.00     |
|----------------------------------|
| Promo Code                       |
|                                  |
| +------------------------------+ |
| | 🏷️ FIRST25  -25%      [✕]   | |
| +------------------------------+ |
|                                  |
|        $25.00 → $18.75           |
|                                  |
| ✅ Promo FIRST25: -$6.25 off     |
+----------------------------------+
|  [  PAY $18.75 & REQUEST  ]      |
+----------------------------------+
```

---

## Validation Rules

| Check | Error Message |
|-------|---------------|
| Code not found | "Invalid promo code" |
| `is_active = false` | "Invalid promo code" |
| `expires_at < now()` | "This promo code has expired" |
| `uses >= max_uses` | "This promo code has reached its limit" |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User removes promo before confirming | Reset to original price |
| Network error during validation | Show error, allow retry |
| Promo reaches limit during confirm | Check again before incrementing |
| Discount exceeds ride price | Cap at ride price (free ride) |
| Surge + promo | Apply promo to surged price |

---

## No Changes To

- Ride selection page (RidePage.tsx)
- Driver app
- Receipt modal
- Existing Promotions page (can integrate later)

