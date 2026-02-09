

# Account Trust Level

## Overview

Add a trust level system that scores customers as "Excellent", "Good", or "Needs Attention" based on observable account signals. The trust level is computed client-side from existing data (profile completeness, verification status, order history, account age). It's displayed on the Account page and an optional detail page at `/account/trust` explains the benefits and how to improve.

No new database tables are needed -- trust level is derived from data that already exists.

## Trust Level Logic

Trust is computed from a set of weighted signals (0-100 score):

| Signal | Points | Source |
|--------|--------|--------|
| Email verified | +15 | `profiles.email_verified` |
| Phone verified | +15 | `profiles.phone_verified` |
| Identity verified | +20 | `customer_identity_verifications.status = 'verified'` |
| Account age > 30 days | +10 | `profiles.created_at` |
| Account age > 90 days | +10 | `profiles.created_at` |
| Has completed orders | +10 | `useSpendingStats` order count > 0 |
| 5+ completed orders | +10 | `useSpendingStats` order count >= 5 |
| Profile complete (name + phone) | +10 | `profiles.full_name` and `profiles.phone` |

Score mapping:
- 80-100: **Excellent** (green, shield-check icon)
- 50-79: **Good** (amber, shield icon)
- 0-49: **Needs Attention** (red, shield-alert icon)

## Benefits Display

| Trust Level | Benefits |
|-------------|----------|
| Excellent | Faster checkout, fewer verifications, best promotions, priority support |
| Good | Standard checkout, occasional verifications, regular promotions |
| Needs Attention | Additional verifications required, limited promotions |

## What Gets Built

### 1. Trust Level Hook

New file: `src/hooks/useAccountTrustLevel.ts`

Fetches profile and verification data, computes the score, and returns:
- `level`: "excellent" | "good" | "needs_attention"
- `score`: number (0-100)
- `signals`: list of earned/missing signals with labels
- `improvements`: actionable suggestions to raise the score
- `benefits`: current tier's benefits
- `isLoading`: boolean

### 2. Trust Level Config

New file: `src/config/trustLevel.ts`

Contains the signal definitions, weights, tier thresholds, benefits per tier, and display config (colors, icons, labels).

### 3. Trust Level Card (for Account page)

New file: `src/components/account/TrustLevelCard.tsx`

A compact card showing the trust level badge, score bar, and a "View Details" link. Inserted into the MobileAccount page between the Profile Card and Account Settings sections.

### 4. Trust Level Detail Page

New file: `src/pages/account/TrustLevelPage.tsx`

Full page at `/account/trust` showing:
- Current trust level with animated score ring
- Benefits unlocked at this level
- Signal breakdown (what's earned, what's missing)
- Actionable improvement suggestions with direct links (e.g., "Verify your phone" links to profile)

### 5. Route and Navigation

- Add route `/account/trust` in `App.tsx`
- Add trust card to `MobileAccount.tsx` (above Account Settings)

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/config/trustLevel.ts` | Create | Signal weights, tiers, benefits config |
| `src/hooks/useAccountTrustLevel.ts` | Create | Hook computing trust from profile + verification + orders |
| `src/components/account/TrustLevelCard.tsx` | Create | Compact card for account page |
| `src/pages/account/TrustLevelPage.tsx` | Create | Full detail page |
| `src/App.tsx` | Update | Add `/account/trust` route |
| `src/pages/mobile/MobileAccount.tsx` | Update | Insert TrustLevelCard |

## Technical Details

### Trust level config structure

```text
TRUST_SIGNALS = [
  { id: "email_verified", label: "Email verified", weight: 15, improvement: "Verify your email address" },
  { id: "phone_verified", label: "Phone verified", weight: 15, improvement: "Add and verify your phone number" },
  { id: "identity_verified", label: "Identity verified", weight: 20, improvement: "Complete identity verification" },
  { id: "account_age_30", label: "Account older than 30 days", weight: 10 },
  { id: "account_age_90", label: "Account older than 90 days", weight: 10 },
  { id: "has_orders", label: "Completed at least 1 order", weight: 10, improvement: "Complete your first booking" },
  { id: "frequent_user", label: "Completed 5+ orders", weight: 10, improvement: "Keep booking to build trust" },
  { id: "profile_complete", label: "Profile complete", weight: 10, improvement: "Add your full name and phone number" },
]

TRUST_TIERS = {
  excellent: { min: 80, label: "Excellent", color: "emerald", icon: ShieldCheck },
  good:      { min: 50, label: "Good",      color: "amber",   icon: Shield },
  needs_attention: { min: 0, label: "Needs Attention", color: "red", icon: ShieldAlert },
}
```

### Hook data sources

The hook combines three queries:
1. Profile data (already available via auth context -- `profiles` row)
2. Customer verification status (reuses `useCustomerVerification` hook)
3. Order count (lightweight query: `food_orders` count for the user)

All queries use existing RLS-protected tables -- no new database access patterns.

### MobileAccount integration

The TrustLevelCard is placed between the Profile Card and the "Account Settings" heading. It shows:
- Trust level name + colored badge
- Progress bar (score / 100)
- "Tap to see details" link to `/account/trust`

### Edge cases

- New users with no data: score is 0, shows "Needs Attention" with clear improvement steps
- Fully verified long-term users: score is 100, shows "Excellent" with all benefits
- Loading state: skeleton card while data loads
- The trust score is read-only and informational -- it does not gate any features (benefits are aspirational/motivational text)

