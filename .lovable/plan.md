

# Wallet Enhancement — Payment Integration and Notifications

## Overview

The wallet infrastructure is already well-built:
- **`/account/wallet` page** (`WalletPage.tsx`): Shows balance, lifetime earned, transaction history, and "How to Earn" section
- **`useCustomerWallet` hook**: Fetches wallet, transactions, and has `applyCredit` mutation (calls `apply_wallet_credit` RPC)
- **`CreditSelector` component**: Toggle to apply wallet credits at checkout (used in `EatsCart.tsx` but NOT in `EatsCheckout.tsx`)
- **`PaymentTypeSelector` component**: Currently shows Card vs Cash options only

What's missing:
1. The wallet page doesn't distinguish reward-added transactions or show a "Rewards added" section
2. Checkout (`EatsCheckout.tsx`) has no wallet payment option -- only the older `EatsCart.tsx` uses `CreditSelector`
3. No wallet + card split payment logic
4. No notifications when wallet is credited

## What Changes

### 1. Update Wallet Page with Rewards Section

Update `WalletPage.tsx` to:
- Add a "Rewards Added" summary card showing total credits from rewards
- Add "reward" as a recognized transaction type with a distinct icon (Trophy) and label
- Add a link to `/account/rewards` in the "How to Earn" section
- Show pending credits if any exist

### 2. Add Wallet Payment Option to Checkout

Update `PaymentTypeSelector.tsx` to support a "wallet" payment type:
- Add a third option: "Wallet" (shown only if balance > 0)
- When wallet balance covers the full order: single "Wallet" payment
- When wallet balance is insufficient: show "Wallet + Card" as a combined option that uses wallet balance first, then charges the remainder to card
- Pass wallet balance as a prop so the component can show "$X.XX available"

### 3. Integrate Wallet Payment into EatsCheckout

Update `EatsCheckout.tsx` to:
- Import `useCustomerWallet` and wallet payment logic
- Add payment type state (`card` | `wallet` | `wallet_card`)
- Show `PaymentTypeSelector` with wallet option when balance > 0
- On submit with wallet payment: call `applyCredit` RPC to deduct wallet balance
- On submit with wallet + card: deduct wallet balance first, then process card for remainder
- Show wallet deduction as a line item in order summary

### 4. Wallet Credit Notifications

Update `useCustomerWallet` hook to:
- Subscribe to real-time changes on `customer_wallet_transactions` table for the current user
- When a new credit transaction is detected (positive amount), show a toast notification: "Your wallet was credited $X.XX"
- Invalidate wallet queries so balance updates immediately

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/pages/account/WalletPage.tsx` | Update | Add rewards section, reward transaction type, link to rewards page |
| `src/components/eats/PaymentTypeSelector.tsx` | Update | Add wallet and wallet+card payment options |
| `src/pages/EatsCheckout.tsx` | Update | Integrate wallet payment flow with applyCredit |
| `src/hooks/useCustomerWallet.ts` | Update | Add real-time subscription for credit notifications |

## Technical Details

### PaymentTypeSelector updates

```text
Current types: "card" | "cash"
New types: "card" | "cash" | "wallet" | "wallet_card"

New props:
  walletBalanceCents?: number  // Shows wallet option when > 0
  orderTotalCents?: number     // Determines if full wallet or split

Logic:
  If walletBalanceCents >= orderTotalCents:
    Show "Pay with Wallet" option ($XX.XX available)
  If walletBalanceCents > 0 but < orderTotalCents:
    Show "Wallet + Card" option (Use $XX.XX, card for rest)
  If walletBalanceCents === 0:
    Don't show wallet options
```

### Checkout wallet payment flow

```text
On submit:
  If paymentType === "wallet":
    Call applyCredit({ amount_cents: totalCents, order_id })
    Create order with payment_type: "wallet", payment_status: "paid"

  If paymentType === "wallet_card":
    Call applyCredit({ amount_cents: walletBalanceCents, order_id })
    Remaining = totalCents - walletBalanceCents
    Process card payment for remaining amount
    Create order with payment_type: "wallet_card"

  If paymentType === "card":
    Existing card flow (unchanged)

  If paymentType === "cash":
    Existing cash flow (unchanged)
```

### Real-time wallet notifications

```text
In useCustomerWallet, add:

useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel('wallet-credits')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'customer_wallet_transactions',
      filter: `user_id=eq.${user.id}`,
    }, (payload) => {
      const tx = payload.new;
      if (tx.amount_cents > 0) {
        toast.success(`Your wallet was credited $${(tx.amount_cents / 100).toFixed(2)}`, {
          description: tx.description || 'Credit added to your wallet',
        });
      }
      // Refresh wallet data
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

### Wallet page rewards section

Add between the balance card and "How to Earn":
- A summary card showing total reward credits earned (filter transactions by type === "reward")
- Link to `/account/rewards` page

Add "reward" to the transaction type mapping:
- Icon: Trophy
- Label: "Reward Credit"
- Color: primary (same as the rewards theme)

### Edge cases

- Wallet balance changes between page load and submit: `applyCredit` RPC validates balance server-side and fails gracefully
- Max $25 credit per order cap still applies when using wallet
- If wallet payment fails, fall back to showing error without creating the order
- Real-time subscription cleanup on unmount to prevent memory leaks
- Wallet option hidden when balance is 0

