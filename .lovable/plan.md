
# Loyalty Points and Rewards System Implementation Plan

## Overview
Build a comprehensive loyalty points and rewards system for customers where they earn points on delivered orders and can redeem them for discounts or perks. The system will include a customer-facing loyalty page, admin configuration controls, automatic point awarding, and checkout integration.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `loyalty_points` table | Available | User balance, lifetime points, tier |
| `loyalty_transactions` table | Available | Restaurant-scoped transactions (member_id, restaurant_id) |
| `loyalty_rewards` table | Available | Restaurant-scoped rewards configuration |
| `loyalty_members` table | Available | Restaurant-specific loyalty program |
| `customer_wallets` table | Available | Credit balance in cents |
| `customer_wallet_transactions` | Available | Credit history |
| `useLoyaltyPoints` hook | Complete | Balance fetching, earn/redeem mutations |
| ZIVO Points config | Complete | `src/config/zivoPoints.ts` with tiers, earning rules, redemption options |
| Loyalty UI components | Complete | PointsBalanceCard, TierProgressCard, RedemptionOptions, etc. |
| RewardsPage | Complete | `/rewards` with tabs for overview, earn, redeem, refer |
| WalletPage | Complete | `/account/wallet` with credit balance |
| `platform_settings` table | Available | Key-value config storage |

### Missing
| Feature | Status |
|---------|--------|
| Dedicated `/account/loyalty` page | Need to create |
| Points history timeline | Need to add to loyalty hook |
| Admin loyalty dashboard `/admin/loyalty` | Need to create |
| Configurable earn rate (admin) | Need to create |
| Admin reward management | Need to create |
| Top customers by points | Need to create |
| Manual points adjustment | Need to create |
| `src/lib/loyalty.ts` data layer | Need to create |
| Auto-award points on order delivered | Need to create edge function |
| Checkout points redemption flow | Need to enhance |

---

## Database Schema Enhancement

### New Table: `loyalty_settings`
Store configurable loyalty program parameters:

```sql
CREATE TABLE loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Default settings
INSERT INTO loyalty_settings (key, value, description) VALUES
('earn_rate', '{"points_per_dollar": 1, "enabled": true}', 'Points earned per $1 spent'),
('bonus_rules', '{"first_order": 500, "membership_multiplier": 1.5}', 'Bonus point rules'),
('tier_thresholds', '{"explorer": 0, "traveler": 5000, "elite": 25000}', 'Tier point thresholds'),
('redemption_enabled', 'true', 'Whether points redemption is active');
```

### New Table: `platform_rewards`
Platform-wide rewards (not restaurant-specific):

```sql
CREATE TABLE platform_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT NOT NULL, -- 'discount', 'free_delivery', 'credits'
  reward_value NUMERIC, -- dollar value or percentage
  is_active BOOLEAN DEFAULT true,
  max_redemptions INTEGER, -- null = unlimited
  current_redemptions INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### New Table: `points_ledger`
Detailed transaction history for customers (platform-wide):

```sql
CREATE TABLE points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  points_amount INTEGER NOT NULL, -- positive = earn, negative = redeem
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn', 'redeem', 'bonus', 'adjust', 'expire'
  source TEXT, -- 'order', 'referral', 'promotion', 'admin', 'reward'
  reference_id UUID, -- order_id, reward_id, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_points_ledger_user ON points_ledger(user_id);
CREATE INDEX idx_points_ledger_created ON points_ledger(created_at DESC);
```

### New Table: `reward_redemptions`
Track when users redeem rewards:

```sql
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reward_id UUID NOT NULL REFERENCES platform_rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, applied, expired
  applied_to_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  applied_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

---

## Implementation Plan

### A) Loyalty Data Library

**File to Create:** `src/lib/loyalty.ts`

```typescript
// Interfaces
export interface LoyaltySettings {
  earnRate: { points_per_dollar: number; enabled: boolean };
  bonusRules: { first_order: number; membership_multiplier: number };
  tierThresholds: { explorer: number; traveler: number; elite: number };
  redemptionEnabled: boolean;
}

export interface PlatformReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: 'discount' | 'free_delivery' | 'credits';
  rewardValue: number;
  isActive: boolean;
  maxRedemptions: number | null;
  currentRedemptions: number;
  validFrom: string | null;
  validUntil: string | null;
}

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  pointsAmount: number;
  balanceAfter: number;
  transactionType: 'earn' | 'redeem' | 'bonus' | 'adjust' | 'expire';
  source: string;
  referenceId: string | null;
  description: string;
  createdAt: string;
}

export interface TopCustomer {
  userId: string;
  fullName: string;
  email: string;
  lifetimePoints: number;
  currentBalance: number;
  tier: string;
  totalOrders: number;
}

// Functions
export async function getPointsBalance(userId: string): Promise<number>
export async function getPointsHistory(userId: string, limit?: number): Promise<PointsLedgerEntry[]>
export async function awardPoints(orderId: string): Promise<{ pointsAwarded: number; newBalance: number }>
export async function redeemReward(userId: string, rewardId: string): Promise<void>
export async function getLoyaltySettings(): Promise<LoyaltySettings>
export async function updateLoyaltySettings(key: string, value: any): Promise<void>
export async function getAvailableRewards(): Promise<PlatformReward[]>
export async function createReward(reward: Partial<PlatformReward>): Promise<PlatformReward>
export async function updateReward(id: string, updates: Partial<PlatformReward>): Promise<void>
export async function getTopCustomers(limit?: number): Promise<TopCustomer[]>
export async function adjustPoints(userId: string, amount: number, reason: string): Promise<void>
```

### B) Loyalty Hooks

**File to Create:** `src/hooks/useLoyalty.ts`

```typescript
export function useLoyaltySettings()
export function useUpdateLoyaltySettings()
export function usePointsHistory(userId?: string)
export function useAvailableRewards()
export function useRedeemReward()
export function useTopCustomers(limit?: number)
export function useAdjustPoints()
export function useCreateReward()
export function useUpdateReward()
```

### C) Customer Loyalty Page

**File to Create:** `src/pages/account/LoyaltyPage.tsx`

**Route:** `/account/loyalty`

**Layout:**
```text
+----------------------------------------------------------+
|  ZIVO Points                          [Back to Account]   |
+----------------------------------------------------------+
|                                                           |
|  +------------------------------------------------------+|
|  |  POINTS BALANCE CARD                                  ||
|  |  2,450 pts | Traveler Tier                            ||
|  |  Progress to Elite: 2,550 pts to go                   ||
|  +------------------------------------------------------+|
|                                                           |
|  [Overview] [History] [Rewards] [Refer]                   |
|                                                           |
|  Points History                                           |
|  +------------------------------------------------------+|
|  | +500 | Order #12345 delivered      | Feb 8, 2026     ||
|  | +250 | Referral bonus              | Feb 7, 2026     ||
|  | -500 | Redeemed $5 discount        | Feb 6, 2026     ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- Points balance card with tier progress (reuse existing component)
- Transaction history timeline from `points_ledger`
- Available rewards list with redeem buttons
- Referral section

### D) Admin Loyalty Dashboard

**File to Create:** `src/pages/admin/AdminLoyaltyPage.tsx`

**Route:** `/admin/loyalty`

**Layout:**
```text
+----------------------------------------------------------+
|  Loyalty Program                      [Settings]          |
+----------------------------------------------------------+
|                                                           |
|  +------------------+  +------------------+               |
|  | TOTAL POINTS OUT |  | ACTIVE MEMBERS   |               |
|  | 1,234,500        |  | 8,432            |               |
|  +------------------+  +------------------+               |
|                                                           |
|  [Earn Rate] [Rewards] [Top Customers] [Adjustments]      |
|                                                           |
|  Earn Rate Configuration                                  |
|  +------------------------------------------------------+|
|  | Points per $1:  [1] pts                               ||
|  | First order bonus: [500] pts                          ||
|  | Membership multiplier: [1.5]x                         ||
|  | [Save Changes]                                        ||
|  +------------------------------------------------------+|
|                                                           |
|  Active Rewards                                           |
|  +------------------------------------------------------+|
|  | $5 Discount | 500 pts | Active | [Edit]               ||
|  | Free Delivery | 300 pts | Active | [Edit]             ||
|  | [+ Create Reward]                                     ||
|  +------------------------------------------------------+|
|                                                           |
|  Top Customers by Points                                  |
|  +------------------------------------------------------+|
|  | 1. John D. | 12,450 pts | Elite | [Adjust]            ||
|  | 2. Sarah M. | 8,200 pts | Traveler | [Adjust]         ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- KPI cards for program health
- Configurable earn rate (points per dollar)
- Bonus configuration (first order, membership)
- Rewards CRUD with points cost, type, value
- Top customers leaderboard
- Manual points adjustment with reason

### E) Admin Components

**Files to Create:**

1. `src/components/admin/loyalty/EarnRateConfig.tsx`
   - Points per dollar input
   - First order bonus input
   - Membership multiplier input
   - Save button

2. `src/components/admin/loyalty/RewardsManager.tsx`
   - Table of rewards with edit/delete
   - Create reward dialog
   - Reward form (name, points, type, value)

3. `src/components/admin/loyalty/TopCustomersTable.tsx`
   - Sortable table of top customers
   - Points adjustment modal
   - Pagination

4. `src/components/admin/loyalty/PointsAdjustmentModal.tsx`
   - User selector
   - Points amount (+/-)
   - Reason input
   - Confirmation

### F) Points Award Edge Function

**File to Create:** `supabase/functions/award-order-points/index.ts`

**Triggered when:** Order status changes to `delivered`

**Logic:**
1. Fetch order by ID
2. Check if points already awarded (prevent duplicate)
3. Get loyalty settings (earn rate, bonuses)
4. Calculate points:
   - Base: `total_amount * points_per_dollar`
   - First order bonus: Check if first completed order
   - Membership bonus: Check `user_memberships` status
5. Insert into `points_ledger`
6. Update `loyalty_points.points_balance` and `lifetime_points`
7. Check tier upgrade
8. Send notification if tier upgraded

```typescript
const basePoints = Math.floor(orderTotal * settings.earnRate.points_per_dollar);
let totalPoints = basePoints;

// First order bonus
if (isFirstOrder) {
  totalPoints += settings.bonusRules.first_order;
}

// Membership multiplier
if (hasMembership) {
  totalPoints = Math.floor(totalPoints * settings.bonusRules.membership_multiplier);
}
```

### G) Checkout Integration Enhancement

**File to Modify:** Checkout flow components

**Features:**
- Show available points balance
- "Apply points" toggle or slider
- Calculate discount: `points / 100 = dollar value`
- Update order total
- On order placement, record redemption

### H) Points Redemption Flow

**Flow:**
```text
User Selects Reward
        ↓
Check Points Balance >= Required
        ↓
Create reward_redemptions record (status: pending)
        ↓
Deduct points from loyalty_points
        ↓
Insert points_ledger (type: redeem)
        ↓
For discount/credits:
  - Add to user's pending_rewards
  - Auto-apply at checkout
For free_delivery:
  - Set flag on user's session
  - Zero delivery fee at checkout
        ↓
On order complete:
  - Update redemption status to applied
```

### I) Database Trigger for Auto-Award

**SQL Trigger:**
```sql
CREATE OR REPLACE FUNCTION trigger_award_points_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Call edge function or inline logic
    PERFORM net.http_post(
      url := 'https://slirphzzwcogdbkeicff.supabase.co/functions/v1/award-order-points',
      body := json_build_object('order_id', NEW.id)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_delivered
AFTER UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_award_points_on_delivery();
```

### J) Routes Configuration

**File to Modify:** `src/App.tsx`

```typescript
// Lazy imports
const LoyaltyPage = lazy(() => import("./pages/account/LoyaltyPage"));
const AdminLoyaltyPage = lazy(() => import("./pages/admin/AdminLoyaltyPage"));

// Routes
<Route path="/account/loyalty" element={<LoyaltyPage />} />
<Route path="/admin/loyalty" element={<ProtectedRoute requireAdmin><AdminLoyaltyPage /></ProtectedRoute>} />
```

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Create `loyalty_settings` table | Configurable earn rates and rules |
| Create `platform_rewards` table | Platform-wide reward definitions |
| Create `points_ledger` table | Detailed transaction history |
| Create `reward_redemptions` table | Track reward usage |
| Create trigger for auto-award | Award points on order delivery |

### New Files (10)
| File | Purpose |
|------|---------|
| `src/lib/loyalty.ts` | Core loyalty data functions |
| `src/hooks/useLoyalty.ts` | React Query hooks |
| `src/pages/account/LoyaltyPage.tsx` | Customer loyalty page |
| `src/pages/admin/AdminLoyaltyPage.tsx` | Admin loyalty dashboard |
| `src/components/admin/loyalty/EarnRateConfig.tsx` | Earn rate configuration |
| `src/components/admin/loyalty/RewardsManager.tsx` | Rewards CRUD |
| `src/components/admin/loyalty/TopCustomersTable.tsx` | Customer leaderboard |
| `src/components/admin/loyalty/PointsAdjustmentModal.tsx` | Manual adjustment |
| `supabase/functions/award-order-points/index.ts` | Auto-award points |
| Migration SQL file | Schema changes |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add loyalty routes |
| `src/hooks/useLoyaltyPoints.ts` | Integrate with points_ledger for history |

---

## Data Flow

```text
Order Completed (status = 'delivered')
        ↓
Database Trigger
        ↓
award-order-points Edge Function
        ├── Fetch loyalty_settings
        ├── Calculate points (base + bonuses)
        ├── Insert points_ledger
        ├── Update loyalty_points balance
        └── Check tier upgrade
        ↓
Customer sees points in /account/loyalty
        ↓
Customer redeems reward
        ├── Check balance
        ├── Deduct points
        ├── Insert points_ledger (redeem)
        └── Create reward_redemptions
        ↓
At checkout
        ├── Check pending rewards
        └── Apply discount/free delivery
```

---

## Admin Controls Summary

| Feature | Location | Functionality |
|---------|----------|---------------|
| Earn Rate | `/admin/loyalty` | Configure points per dollar |
| Bonuses | `/admin/loyalty` | First order, membership multiplier |
| Rewards | `/admin/loyalty` | Create/edit/delete rewards |
| Top Customers | `/admin/loyalty` | View leaderboard, adjust points |
| Manual Adjustment | `/admin/loyalty` | Add/remove points with reason |

---

## Points Calculation Formula

```text
Base Points = floor(order_total × points_per_dollar)

First Order Bonus = 500 (if first delivered order)

Membership Multiplier = 1.5x (if active ZIVO+ membership)

Tier Bonus (future):
  - Explorer: 0%
  - Traveler: +10%
  - Elite: +25%

Final Points = (Base × Membership × Tier) + First Order Bonus
```

---

## Redemption Options

| Reward | Points | Value | Type |
|--------|--------|-------|------|
| $5 Discount | 500 | $5 off order | discount |
| $10 Discount | 1,000 | $10 off order | discount |
| $25 Discount | 2,000 | $25 off order | discount |
| Free Delivery | 300 | Waive delivery fee | free_delivery |
| Priority Alerts | 300 | 30-day feature | perk |
| $5 Credits | 500 | Wallet credit | credits |

---

## Summary

This implementation creates a complete loyalty points and rewards system:

1. **Data Layer** (`src/lib/loyalty.ts`) with all CRUD and calculation functions
2. **Customer Page** (`/account/loyalty`) showing balance, history, rewards, referrals
3. **Admin Dashboard** (`/admin/loyalty`) with earn rate config, rewards management, top customers
4. **Automatic Points Award** via edge function triggered on order delivery
5. **Configurable Rules** stored in `loyalty_settings` table
6. **Points Ledger** for full transaction history and audit trail
7. **Checkout Integration** for applying points as discounts
8. **Tier System** with automatic upgrades based on lifetime points

All integrated with existing `loyalty_points` table and UI components.
