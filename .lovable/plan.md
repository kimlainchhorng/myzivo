

# Referral Program — Add Account Menu Link

## Current State

The referral program is **already fully built**:

- `/account/referrals` page exists with referral code display, copy/share buttons, "How It Works" steps, tier progress bar, referral list with status badges (Signed Up / First Booking / Points Earned / Expired), and a link to the wallet
- `useReferrals` hook handles code generation, sharing, and applying referral codes
- Wallet page shows referral bonus transactions
- Route is registered and protected

**The only gap**: There is no "Invite Friends" or "Referrals" menu item on the Account page. Users can only reach the referrals page through the Wallet page, which is buried.

## What Changes

A single update to `MobileAccount.tsx` to add a prominent "Invite Friends" menu item in the account settings list, making the existing referral page easily discoverable.

### File Change

| File | Action | What |
|------|--------|------|
| `src/pages/mobile/MobileAccount.tsx` | Update | Add "Invite Friends" item with Users icon linking to `/account/referrals` |

The new item will be added to the `accountItems` array after "ZIVO Rewards":

```text
{ icon: Users, label: "Invite Friends", path: "/account/referrals" }
```

This is a one-line change -- the referral page, hook, config, wallet integration, and reward flow are all already in place and working.

