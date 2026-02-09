

# Automatic Rewards System

## Overview

The database already has a `rewards` table (user_id, reward_type, reward_value, status, expires_at) and a `reward_redemptions` table, but nothing in the frontend reads from them. No auto-award logic exists. This plan adds:

1. A dedicated `/account/rewards` page showing earned coupons, loyalty rewards, and expiration dates
2. A hook that auto-awards rewards based on milestone triggers (5 orders, tier changes, campaigns)
3. Checkout integration to auto-apply or let users select available rewards

## What Changes

### 1. New hook: `useAutoRewards` (new file)

Detects milestones and awards rewards into the `rewards` table:

```text
On mount (for logged-in user):
  1. Count delivered food_orders for this user
  2. Read current tier from loyalty_points
  3. Query rewards table for already-awarded milestones (by reward_type prefix)

Auto-award logic:
  - 5 orders completed => award "5_orders" reward (e.g., $5 coupon, expires 30 days)
  - 10 orders => award "10_orders" reward ($10 coupon)
  - 25 orders => award "25_orders" reward ($15 coupon)
  - Traveler tier reached => award "tier_traveler" reward ($5 coupon)
  - Elite tier reached => award "tier_elite" reward ($15 coupon)

Each award:
  - Checks if reward_type already exists for user (prevents duplicates)
  - Inserts into rewards table with status='active', expires_at = now + 30 days
  - Shows a toast notification: "You earned a reward! $5 off your next order"

Returns: { rewards: Reward[], isLoading, hasUnusedRewards }
```

### 2. New hook: `useUserRewards` (new file)

Simple data-fetching hook for the rewards page:

```text
Queries rewards table WHERE user_id = auth.uid()
Orders by created_at DESC
Returns rewards grouped by status: active, redeemed, expired

Also queries reward_redemptions for redemption history
```

### 3. New page: `/account/rewards` (new file)

Shows three sections:

- **Active Rewards**: Cards with reward name, value, expiration countdown, and "Use at checkout" CTA
- **Earned History**: Timeline of all rewards earned with dates and triggers
- **Expired/Used**: Dimmed cards showing past rewards

Each reward card shows:
- Reward type icon (gift for coupons, crown for tier rewards, trophy for milestones)
- Dollar value or description
- Expiration date with countdown ("Expires in 12 days")
- Status badge (Active, Used, Expired)

### 4. New component: `RewardSelector` for checkout (new file)

A compact card shown in the checkout order summary (above the promo code input):

```text
If user has active, non-expired rewards:
  Show top reward as auto-selected with "Applied: $5 reward" badge
  Toggle to deselect or pick a different reward from a dropdown
  Applied reward reduces the order total (same as promo discount)

If no rewards available:
  Don't render anything
```

### 5. Update `EatsCheckout.tsx`

- Import `useAutoRewards` (triggers milestone check on checkout load)
- Import `RewardSelector` component
- Place it above the PromoCodeInputInline in the order summary
- When a reward is selected, apply its discount to the total
- On order submission, update the reward status to 'redeemed' and create a reward_redemptions entry

### 6. Update `App.tsx` routing

- Add route: `/account/rewards` pointing to the new AccountRewardsPage

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useAutoRewards.ts` | Create | Milestone detection and auto-award logic |
| `src/hooks/useUserRewards.ts` | Create | Fetch and manage user rewards |
| `src/pages/account/AccountRewardsPage.tsx` | Create | /account/rewards page with active/history/expired sections |
| `src/components/checkout/RewardSelector.tsx` | Create | Checkout widget to auto-apply or select rewards |
| `src/pages/EatsCheckout.tsx` | Update | Integrate RewardSelector and useAutoRewards |
| `src/App.tsx` | Update | Add /account/rewards route |

## Technical Details

### Milestone thresholds

```text
const MILESTONES = [
  { orderCount: 5,  rewardType: '5_orders',   value: 5,  label: '5 Orders Milestone' },
  { orderCount: 10, rewardType: '10_orders',  value: 10, label: '10 Orders Milestone' },
  { orderCount: 25, rewardType: '25_orders',  value: 15, label: '25 Orders Milestone' },
];

const TIER_REWARDS = [
  { tier: 'traveler', rewardType: 'tier_traveler', value: 5,  label: 'Traveler Tier Achieved' },
  { tier: 'elite',    rewardType: 'tier_elite',    value: 15, label: 'Elite Tier Achieved' },
];
```

### Reward insertion

```text
Insert into rewards:
  user_id: auth.uid()
  reward_type: milestone key (e.g. '5_orders')
  reward_value: dollar amount
  status: 'active'
  expires_at: now() + 30 days
```

### Checkout reward application

```text
selectedReward state in EatsCheckoutContent

If selectedReward:
  rewardDiscount = selectedReward.reward_value
  total = pricing.orderTotal - rewardDiscount (floored at 0)

On order submit:
  Update rewards SET status = 'redeemed' WHERE id = selectedReward.id
  Insert reward_redemptions: { user_id, reward_id, points_spent: 0, status: 'redeemed', applied_to_order_id }
```

### Auto-selection logic

When RewardSelector mounts:
- Pick the reward with the nearest expiration date (use-it-or-lose-it priority)
- Auto-select it (user sees "Reward applied: $5 off")
- User can deselect via toggle or choose a different one

### Expiration handling

- Rewards expire 30 days after creation
- The rewards page shows countdown: "Expires in X days"
- Expired rewards (expires_at < now) are shown dimmed with "Expired" badge
- Checkout filters out expired rewards from selection

### Edge cases

- User not logged in: hooks return empty, no components render
- No delivered orders: no milestones triggered
- Reward already awarded: duplicate check by reward_type prevents re-insert
- Reward used + new milestone: new reward created independently
- Both reward and promo applied: reward discount applied first, then promo on remaining total
- Reward expires between page load and submit: server-side check on status/expires_at before applying

