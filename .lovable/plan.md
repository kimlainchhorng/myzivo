

# Customer Referrals + Credit Wallet

## Overview
Implement a customer referrals dashboard, a credit wallet page, and integrate wallet credits at Eats checkout with the ability to apply credits to orders.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `useReferrals` hook | ✅ Complete | Fetches code, referrals list, tiers, share functions |
| `ReferralCard` component | ✅ Exists | Share UI with copy/email/WhatsApp |
| `customer_wallets` table | ✅ Exists | `balance_cents`, `lifetime_credits_cents` columns |
| `customer_wallet_transactions` table | ✅ Exists | `amount_cents`, `balance_after_cents`, `type`, `order_id`, `is_redeemed` |
| `apply_wallet_credit` RPC | ✅ Exists | `(p_amount_cents, p_order_id, p_user_id)` → JSON |
| `credit_customer_wallet` RPC | ✅ Exists | For adding credits |
| `credit_applied_cents` column | ✅ Exists | On `food_orders` table |
| `zivo_referrals` table | ✅ Exists | Has `status` (pending/qualified/credited/expired) |
| `zivo_referral_codes` table | ✅ Exists | User's personal referral code |
| ZIVO Points config | ✅ Exists | `src/config/zivoPoints.ts` with referral rules |

### Missing
| Feature | Status |
|---------|--------|
| `/account/referrals` page | ❌ No dedicated referrals dashboard |
| `/account/wallet` page | ❌ No wallet page in account section |
| `useCustomerWallet` hook | ❌ No hook to fetch wallet + transactions |
| Credit toggle in Eats cart | ❌ Not integrated |
| `credit_applied_cents` in order creation | ❌ Not passed in mutation |
| Wallet deduction after order | ❌ RPC not called |
| Credit savings toast | ❌ Not shown |

---

## Implementation Plan

### A) Create Customer Wallet Hook

**File: `src/hooks/useCustomerWallet.ts`**

Manages wallet balance and transaction history.

```typescript
export interface CustomerWallet {
  id: string;
  user_id: string;
  balance_cents: number;
  lifetime_credits_cents: number;
}

export interface WalletTransaction {
  id: string;
  amount_cents: number;
  balance_after_cents: number;
  type: string; // 'referral', 'order', 'redemption', 'promo', 'refund'
  description: string | null;
  order_id: string | null;
  is_redeemed: boolean;
  created_at: string;
}

export function useCustomerWallet() {
  const { user } = useAuth();
  
  // Fetch wallet (or create if not exists)
  const wallet = useQuery(...)
  
  // Fetch transaction history
  const transactions = useQuery(...)
  
  // Apply credit to order (calls apply_wallet_credit RPC)
  const applyCredit = useMutation(...)
  
  return { 
    wallet, 
    transactions, 
    balanceDollars: (wallet?.balance_cents || 0) / 100,
    applyCredit,
    isLoading 
  };
}
```

**Data Flow:**
1. Query `customer_wallets` for current user
2. Query `customer_wallet_transactions` ordered by `created_at desc`
3. `applyCredit` calls `apply_wallet_credit` RPC which:
   - Deducts from balance
   - Creates transaction record
   - Links to order_id

### B) Create Account Referrals Page

**File: `src/pages/account/ReferralsPage.tsx`**

**Route:** `/account/referrals`

**Sections:**
1. **Invite Code Card** — Large code display with copy button and share link
2. **How It Works** — 3-step visual guide
3. **Referral Progress** — Table/list showing all referrals with status badges
4. **Tier Progress** — Current tier, next tier unlock, bonus tracker

**UI Layout:**
```text
┌────────────────────────────────────────┐
│ 🔗 Your Invite Code                    │
│                                        │
│     ZIVO-ABC123      [Copy] [Share]    │
│                                        │
│ hizivo.com/signup?ref=ZIVO-ABC123      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ How It Works                           │
│                                        │
│ 1️⃣ Share your link with friends        │
│ 2️⃣ They sign up and get 500 points     │
│ 3️⃣ You earn 1000 points when they book │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Your Referrals                         │
│                                        │
│ friend1@email.com   🟡 Pending         │
│ friend2@email.com   🟢 Credited  +1000 │
│ friend3@email.com   🔵 Qualified       │
└────────────────────────────────────────┘
```

**Status Badges:**
| Status | Color | Label |
|--------|-------|-------|
| `pending` | Yellow | Signed up |
| `qualified` | Blue | First booking |
| `credited` | Green | Points earned |
| `expired` | Gray | Expired |

### C) Create Account Wallet Page

**File: `src/pages/account/WalletPage.tsx`**

**Route:** `/account/wallet`

**Sections:**
1. **Balance Card** — Large balance display with "Available Credit" label
2. **Transaction History** — List of credits earned and spent with timestamps
3. **How to Earn** — Quick links to referrals, tips on earning

**UI Layout:**
```text
┌────────────────────────────────────────┐
│ 💰 Your Credit Balance                 │
│                                        │
│           $15.00                       │
│       Available Credit                 │
│                                        │
│   Lifetime Earned: $45.00              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Transaction History                    │
│                                        │
│ + $5.00   Referral Bonus    2 days ago │
│ - $3.00   Order #ZE-12345   Yesterday  │
│ + $10.00  Welcome Credit    Last week  │
│ + $5.00   Promo Code        Last week  │
└────────────────────────────────────────┘
```

**Transaction Types Display:**
| Type | Icon | Color |
|------|------|-------|
| `referral` | Users | Green |
| `promo` | Tag | Green |
| `refund` | RotateCcw | Green |
| `order` | ShoppingBag | Red |
| `redemption` | Gift | Red |

### D) Create Credit Selector Component

**File: `src/components/eats/CreditSelector.tsx`**

Reusable component for applying credits at checkout.

**Props:**
```typescript
interface CreditSelectorProps {
  availableBalanceCents: number;
  orderTotalCents: number;
  creditAppliedCents: number;
  onCreditChange: (creditCents: number) => void;
  maxPerOrder?: number; // Default 2500 (= $25)
}
```

**Business Logic:**
```typescript
const MAX_CREDIT_PER_ORDER = 2500; // $25.00

const creditToApply = Math.min(
  orderTotalCents,
  availableBalanceCents,
  MAX_CREDIT_PER_ORDER
);
```

**UI:**
```text
┌────────────────────────────────────────┐
│ ✨ Use Credits                         │
│                                        │
│ [Toggle: ON/OFF]                       │
│ Apply $5.00 credit                     │
│ Balance: $15.00                        │
│                                        │
│ Max $25 per order                      │
└────────────────────────────────────────┘
```

### E) Integrate Credits in Eats Cart

**File to Modify:** `src/pages/EatsCart.tsx`

**Changes:**
1. Import and use `useCustomerWallet` hook
2. Add `useCredits` toggle state (default: false)
3. Add `creditAppliedCents` state
4. Calculate applicable credit amount
5. Update total when credits applied
6. Pass `credit_applied_cents` to order creation
7. Call wallet deduction after order success
8. Show success toast with savings

**Integration Points:**
```typescript
// 1. Get wallet data
const { wallet, applyCredit, balanceDollars } = useCustomerWallet();

// 2. Credit toggle state
const [useCredits, setUseCredits] = useState(false);

// 3. Calculate credit to apply
const totalCents = Math.round(total * 100);
const creditAppliedCents = useCredits 
  ? Math.min(totalCents, wallet?.balance_cents || 0, MAX_CREDIT_PER_ORDER)
  : 0;
const creditAppliedDollars = creditAppliedCents / 100;

// 4. Update total display
const finalTotal = total - creditAppliedDollars;

// 5. In handlePlaceOrder:
const order = await createOrder.mutateAsync({
  // ... existing fields ...
  credit_applied_cents: creditAppliedCents,
});

// 6. Apply wallet deduction
if (creditAppliedCents > 0) {
  await applyCredit.mutateAsync({
    amount_cents: creditAppliedCents,
    order_id: order.id,
  });
  
  toast.success(`You saved $${creditAppliedDollars.toFixed(2)} with credits!`);
}
```

### F) Update Order Creation

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Changes to `CreateFoodOrderInput`:**
```typescript
export interface CreateFoodOrderInput {
  // ... existing fields ...
  credit_applied_cents?: number;
}
```

**Changes to Insert:**
```typescript
credit_applied_cents: input.credit_applied_cents || 0,
```

### G) Add Routes to App.tsx

**File to Modify:** `src/App.tsx`

Add lazy imports and routes:
```typescript
// Imports
const AccountReferralsPage = lazy(() => import("./pages/account/ReferralsPage"));
const AccountWalletPage = lazy(() => import("./pages/account/WalletPage"));

// Routes
<Route path="/account/referrals" element={<ProtectedRoute><AccountReferralsPage /></ProtectedRoute>} />
<Route path="/account/wallet" element={<ProtectedRoute><AccountWalletPage /></ProtectedRoute>} />
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useCustomerWallet.ts` | Wallet balance + transactions + apply credit |
| `src/pages/account/ReferralsPage.tsx` | Customer referrals dashboard |
| `src/pages/account/WalletPage.tsx` | Credit wallet page |
| `src/components/eats/CreditSelector.tsx` | Credit toggle component |

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes `/account/referrals` and `/account/wallet` |
| `src/pages/EatsCart.tsx` | Add credit toggle, calculate savings, apply wallet credit |
| `src/hooks/useEatsOrders.ts` | Add `credit_applied_cents` to input and insert |

---

## Credit Application Flow

```text
User opens /eats/cart
    ↓
useCustomerWallet() fetches balance
    ↓
If balance > 0, show CreditSelector:
  "Apply $X.XX credit" [Toggle]
  Balance: $XX.XX
    ↓
Toggle ON → Recalculate total:
  Subtotal: $50.00
  Delivery: $3.99
  Tax: $4.00
  Credit: -$5.00  ← Applied
  Total: $52.99   ← Reduced
    ↓
Place Order
    ↓
Order created with credit_applied_cents = 500
    ↓
apply_wallet_credit RPC called:
  - Deducts 500 cents from balance
  - Creates transaction record
  - Links to order_id
    ↓
Toast: "You saved $5.00 with credits!"
    ↓
Navigate to order detail
```

---

## Referrals Page Flow

```text
User navigates to /account/referrals
    ↓
useReferrals() fetches:
  - referralCode
  - referrals list
  - tiers
    ↓
Display:
  - Invite code with copy/share buttons
  - "How it works" steps
  - Referral list with status badges
  - Tier progress (if applicable)
```

---

## Wallet Page Flow

```text
User navigates to /account/wallet
    ↓
useCustomerWallet() fetches:
  - wallet balance
  - transaction history
    ↓
Display:
  - Balance card ($XX.XX available)
  - Lifetime earned total
  - Transaction list (green = earned, red = spent)
  - Link to /account/referrals to earn more
```

---

## Technical Notes

1. **Credit Deduction Timing**: Credits are deducted immediately after order creation (not after delivery) because:
   - The `apply_wallet_credit` RPC is transactional
   - Simpler UX — user sees savings immediately
   - Refunds can restore credits if order is cancelled

2. **Max Credit Per Order**: Capped at $25 (2500 cents) to prevent abuse and ensure sustainable economics.

3. **Wallet Creation**: If no wallet exists for user, the hook will create one with 0 balance.

4. **Transaction Types**:
   - `referral` — Earned from referral program
   - `promo` — Promotional credit
   - `order` — Spent on order
   - `refund` — Refunded from cancelled order
   - `redemption` — Points redemption

---

## Summary

This implementation adds:

1. **Account Referrals Page** (`/account/referrals`): Invite code, share buttons, referral progress list with status badges
2. **Account Wallet Page** (`/account/wallet`): Credit balance, transaction history (earned/spent)
3. **Customer Wallet Hook**: Fetch balance, transactions, apply credit RPC call
4. **Credit Selector Component**: Toggle to apply credits at checkout
5. **Eats Checkout Integration**: Apply up to `min(total, balance, $25)` at checkout
6. **Credit Tracking**: `credit_applied_cents` saved on order, wallet balance deducted via RPC
7. **Success UX**: Toast showing "You saved $X.XX with credits!"

