

# Gift Cards & Top-Up — Purchase, Send, Redeem, and Wallet Integration

## Overview

Build a full gift card system at `/account/gift-cards` where customers can buy ZIVO gift cards, send them to friends via email, and redeem gift card codes that credit their wallet balance. Redeemed gift cards automatically increase the existing `customer_wallets` balance so credits apply at checkout via the existing `CreditSelector` and `PaymentTypeSelector` flow.

## Current State

- **Database**: `gift_cards` and `gift_card_transactions` tables exist but are restaurant-scoped (`restaurant_id` is required). Need a schema migration to make `restaurant_id` nullable so platform-wide ZIVO gift cards can exist without a restaurant association.
- **Customer Wallet**: Fully functional -- `customer_wallets` table with `balance_cents`, `useCustomerWallet` hook, `apply_wallet_credit` RPC, real-time notifications, and checkout integration via `CreditSelector` and `PaymentTypeSelector`.
- **Existing UI**: `GiftCardsCredits.tsx` (flight checkout) uses mock data only. Account `WalletPage.tsx` shows balance and transaction history but has no gift card section. No `/account/gift-cards` route exists.
- **Edge Functions**: No gift card purchase, redeem, or send functions exist.

## What Changes

### 1. Database Migration -- Make `restaurant_id` nullable on `gift_cards`

Alter `gift_cards.restaurant_id` to be nullable so platform-wide ZIVO gift cards can be created without a restaurant association. Add a `purchaser_user_id` column (nullable, references auth.users via UUID) to track which authenticated user purchased the card.

### 2. Create Edge Function `supabase/functions/purchase-gift-card/index.ts`

Handles gift card purchase via Stripe Checkout:
- Accepts: `amount` (preset values: $10, $25, $50, $100), `recipient_email`, `recipient_name`, `message`, `sender_name`
- Creates a Stripe Checkout session in `payment` mode with a dynamically created price for the gift card amount
- On success URL, includes a `session_id` query param for verification
- Stores a pending gift card record that gets activated after payment verification

### 3. Create Edge Function `supabase/functions/verify-gift-card-purchase/index.ts`

Called from the success page after Stripe redirect:
- Verifies the Stripe Checkout session status
- Activates the gift card (sets `is_active = true`)
- Generates a unique redemption code (format: `ZIVO-XXXX-XXXX`)
- If `recipient_email` is provided, sends a notification email via the existing email patterns (or logs for later email integration)
- Returns the gift card code to display on the success page

### 4. Create Edge Function `supabase/functions/redeem-gift-card/index.ts`

Handles gift card redemption:
- Accepts: `code` (the gift card code)
- Validates: code exists, `is_active = true`, not expired, `current_balance > 0`
- Transfers the gift card's `current_balance` to the user's `customer_wallets.balance_cents`
- Creates a `gift_card_transactions` record (type: "redemption")
- Creates a `customer_wallet_transactions` record (type: "gift_card", description: "Gift card redeemed: ZIVO-XXXX-XXXX")
- Sets the gift card `current_balance` to 0 and `is_active` to false
- Returns the credited amount

### 5. Create `src/hooks/useGiftCards.ts` -- Gift card management hook

Provides:
- `purchaseGiftCard(amount, recipientEmail, recipientName, message)` -- calls `purchase-gift-card` edge function, returns Stripe checkout URL
- `redeemGiftCard(code)` -- calls `redeem-gift-card` edge function, invalidates wallet queries on success
- `myGiftCards` -- query for gift cards purchased by the user (`purchaser_user_id = user.id`) or received by the user (`recipient_email = user.email`)
- Loading and error states

### 6. Create `src/pages/account/GiftCardsPage.tsx` -- Main gift cards page

Three-tab layout:

**Tab 1 -- Buy Gift Card:**
- Preset amount buttons: $10, $25, $50, $100
- Recipient fields: name, email (optional -- if empty, card is for self)
- Personal message field (optional)
- "Purchase" button that redirects to Stripe Checkout
- Trust badges (secure payment, powered by Stripe)

**Tab 2 -- Send to Friend:**
- Same purchase flow but with recipient email/phone required
- Preview of the gift card message
- Option to schedule delivery (future enhancement placeholder)

**Tab 3 -- Redeem Code:**
- Code input field (formatted as ZIVO-XXXX-XXXX)
- "Redeem" button
- Success animation showing the credited amount and new wallet balance
- Link to wallet page

**My Gift Cards section (below tabs):**
- List of purchased and received gift cards
- Status: Active (with remaining balance), Redeemed, Expired
- Code display with copy button

### 7. Create `src/pages/account/GiftCardSuccessPage.tsx` -- Post-purchase success page

- Displayed after Stripe redirect with `session_id`
- Calls `verify-gift-card-purchase` to activate the card
- Shows the gift card code with a copy button
- If sent to a friend: "Gift card sent to [email]!" confirmation
- If for self: "Redeem now" button that auto-fills the redeem flow
- Link back to gift cards page and wallet

### 8. Update `src/pages/account/WalletPage.tsx` -- Add gift card entry point

Add a "Gift Cards" button in the "How to Earn Credits" section:
- Icon: Gift
- Label: "Gift Cards"
- Subtitle: "Buy, send, or redeem gift cards"
- Links to `/account/gift-cards`

Also add "gift_card" to the transaction icon/label mappings so redeemed gift card transactions display correctly.

### 9. Update `src/App.tsx` -- Add routes

- `/account/gift-cards` -> `GiftCardsPage`
- `/account/gift-cards/success` -> `GiftCardSuccessPage`

### 10. Update `src/pages/Profile.tsx` -- Add quick link

Add "Gift Cards" to the profile quick links array pointing to `/account/gift-cards`.

## Technical Detail

### Database migration

```sql
ALTER TABLE gift_cards ALTER COLUMN restaurant_id DROP NOT NULL;
ALTER TABLE gift_cards ADD COLUMN purchaser_user_id uuid REFERENCES auth.users(id);
```

### Gift card code generation (in edge function)

```text
Format: ZIVO-XXXX-XXXX (uppercase alphanumeric, no ambiguous chars)
Charset: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no 0/O/1/I)
Collision check: query gift_cards for existing code before insert
```

### Redeem flow data

```text
1. User enters code -> calls redeem-gift-card edge function
2. Edge function validates code, checks balance
3. Transfers balance:
   - gift_cards.current_balance -> 0
   - customer_wallets.balance_cents += gift card amount
   - customer_wallets.lifetime_credits_cents += gift card amount
4. Creates transaction records in both tables
5. Real-time listener on customer_wallet_transactions fires toast notification
```

### Purchase flow

```text
1. User selects amount, fills recipient info -> calls purchase-gift-card
2. Edge function creates Stripe Checkout session (mode: "payment")
3. User redirected to Stripe -> pays -> redirected to /account/gift-cards/success?session_id=xxx
4. Success page calls verify-gift-card-purchase
5. Edge function verifies payment, activates card, returns code
6. If recipient_email provided, card is associated with that email
```

### Checkout integration

No changes needed -- redeemed gift cards increase `customer_wallets.balance_cents`, which is already consumed by `CreditSelector`, `PaymentTypeSelector`, and `useCustomerWallet` at checkout. The wallet credit application flow handles everything automatically.

## File Summary

| File | Action | What |
|---|---|---|
| Database migration | Create | Make `restaurant_id` nullable, add `purchaser_user_id` |
| `supabase/functions/purchase-gift-card/index.ts` | Create | Stripe Checkout session for gift card purchase |
| `supabase/functions/verify-gift-card-purchase/index.ts` | Create | Verify payment and activate gift card |
| `supabase/functions/redeem-gift-card/index.ts` | Create | Redeem code and credit wallet balance |
| `src/hooks/useGiftCards.ts` | Create | Purchase, redeem, and list gift cards |
| `src/pages/account/GiftCardsPage.tsx` | Create | Buy / Send / Redeem tabs page |
| `src/pages/account/GiftCardSuccessPage.tsx` | Create | Post-purchase success with code display |
| `src/pages/account/WalletPage.tsx` | Update | Add gift card entry point and transaction type |
| `src/App.tsx` | Update | Add gift card routes |
| `src/pages/Profile.tsx` | Update | Add gift cards quick link |

Seven new files (3 edge functions, 1 hook, 2 pages, 1 migration), three updates.
