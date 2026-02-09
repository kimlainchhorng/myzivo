

# Personalized Win-Back Offers

## Overview

No win-back code exists in the codebase yet. The admin side has `winback` campaign types and the `automated_message_log` table is available for deduplication, but nothing customer-facing detects inactivity or shows offers. This plan adds three things: a detection hook, a home page banner, and checkout auto-application.

## What Changes

### 1. Create `useWinBackOffer` hook (new file)

Queries the `food_orders` table for the logged-in user's most recent delivered order. Calculates days since that order and returns the appropriate tier:

- 7-13 days: `gentle` -- "We miss you!" reminder, no discount
- 14-29 days: `small` -- fetches a small win-back promo (discount_value <= 15%) from `promotions` where name matches "winback"
- 30+ days (or no orders ever): `strong` -- fetches a stronger win-back promo (discount_value > 15%)

Deduplicates via `automated_message_log` with `trigger_type = 'winback'` and a 7-day cooldown per tier.

### 2. Create `WinBackBanner` component (new file)

A tiered banner for the home page:

- Gentle: Warm message "We miss you! Check out what's new" with a browse CTA
- Small: "Welcome back -- here's 10% off your next order" with promo code and copy button
- Strong: "It's been a while! Enjoy 25% off on us" with prominent promo code and urgency countdown

Dismissible via close button (state in sessionStorage, reappears next session). Uses the existing dark glass card aesthetic.

### 3. Add WinBackBanner to home pages

- Desktop (`Index.tsx`): Render above HeroSection for logged-in users
- Mobile (`AppHome.tsx`): Render below the header greeting, above service cards

### 4. Auto-apply win-back promo at checkout (`EatsCheckout.tsx`)

When checkout loads and no promo is already applied, if the user has a win-back promo code, auto-validate it via the existing `usePromotionValidation.validateCode()`. Show a toast: "Win-back offer applied automatically!" User can remove it and enter a different code.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useWinBackOffer.ts` | Create | Detect inactivity tier, fetch matching promo, dedup via automated_message_log |
| `src/components/home/WinBackBanner.tsx` | Create | Tiered banner with promo code display and dismiss |
| `src/pages/Index.tsx` | Update | Add WinBackBanner above HeroSection for logged-in users |
| `src/pages/app/AppHome.tsx` | Update | Add WinBackBanner below header |
| `src/pages/EatsCheckout.tsx` | Update | Auto-apply win-back promo on mount if eligible |

## Technical Details

### Inactivity detection

```text
Query: food_orders table
  WHERE customer_id = user.id
  AND status = 'delivered'
  ORDER BY created_at DESC
  LIMIT 1

daysSince = floor((now - lastOrder.created_at) / 86400000)

Tier:
  < 7 days   => null (active user)
  7-13 days  => 'gentle'
  14-29 days => 'small'
  30+ days   => 'strong'
  no orders  => 'strong'
```

### Win-back promo matching

```text
Query: promotions table
  WHERE is_active = true
  AND (name ILIKE '%winback%' OR name ILIKE '%win-back%')
  AND applicable_services contains 'eats'
  ORDER BY discount_value DESC

Tier selection:
  'small'  => first promo with discount_value <= 15
  'strong' => first promo with discount_value > 15
```

### Deduplication

```text
Query: automated_message_log
  WHERE user_id = user.id
  AND trigger_type = 'winback'
  AND trigger_ref = tier
  AND sent_at > now() - 7 days

If found => skip banner for that tier
On first display => insert log entry
```

### Checkout auto-application

In `EatsCheckoutContent`, a useEffect runs once:

```text
if (!promoValidation.appliedPromo && winBackOffer.promoCode && !autoAppliedRef.current) {
  autoAppliedRef.current = true;
  promoValidation.validateCode(winBackOffer.promoCode, subtotal);
}
```

Uses the existing `validate_promo_code` RPC so all server-side checks still apply.

### Banner dismiss

- Close button sets `sessionStorage.setItem('winback_dismissed', 'true')`
- Banner checks on render and hides if set
- Clears on next session automatically

## Edge Cases

- No orders ever: treated as 30+ days (strong tier)
- User not logged in: hook returns null, no banner, no auto-apply
- No win-back promos configured in DB: banner shows reminder text only (gentle style), no code; checkout skips auto-apply
- User already applied a manual promo: auto-apply skips
- Promo expired between page load and checkout: validateCode RPC catches it server-side
- Multiple service types: detection uses food_orders only; extensible to rides/travel later

