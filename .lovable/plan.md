

## Wallet and Payment Summary Card on Home Screen

Most of the Wallet and Payment system already exists in the codebase:

### What Already Exists (no changes needed)

| Feature | Location |
|---------|----------|
| Credit Wallet page (balance, transactions, how to earn) | `src/pages/account/WalletPage.tsx` |
| Wallet hook (balance, transactions, credits) | `src/hooks/useCustomerWallet.ts` |
| Payment Methods page (add/remove/default card) | `src/pages/PaymentMethodsPage.tsx` |
| Local payment methods hook | `src/hooks/useLocalPaymentMethods.ts` |
| Payment method modal (Eats) | `src/components/eats/PaymentMethodModal.tsx` |
| Routes for `/payment-methods` and `/account/wallet` | `src/App.tsx` |

### What Will Be Added

**1 compact "Wallet" card** on the home sliding panel, positioned after the Scheduled Bookings card and before "Recently Used". It shows:

- Wallet icon + "Wallet" heading with "See All" link to `/account/wallet`
- Current credit balance in large bold typography
- Default payment method (card brand + last 4 from `useLocalPaymentMethods`)
- "Add Funds" button navigating to `/account/gift-cards` (existing gift card redemption flow adds funds to wallet)
- "Manage Cards" link to `/payment-methods`

---

### Technical Details

**File modified**: `src/pages/app/AppHome.tsx` (1 file)

**New imports**:
- `useCustomerWallet` from `@/hooks/useCustomerWallet`
- `useLocalPaymentMethods` from `@/hooks/useLocalPaymentMethods`
- `Wallet`, `CreditCard` icons from lucide-react

**New hook calls** (at component top level alongside existing hooks):
```
const { balanceDollars } = useCustomerWallet();
const { getDefault } = useLocalPaymentMethods();
const defaultCard = getDefault();
```

**Card placement**: After the Scheduled Bookings section (line ~493), before the "Recently Used" section (line ~495).

**Card design**:
- `rounded-2xl` with `bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/20`
- Wallet icon + "Wallet" title with "See All" link
- Balance displayed as `$X.XX` in large bold text
- Default card shown as small pill: "Visa ****4242"
- Row of two buttons: "Add Funds" (primary) and "Cards" (outline) linking to `/account/gift-cards` and `/payment-methods`
- Auth-gated: only shows when user is signed in

**Summary**:

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/app/AppHome.tsx`) |
| New hooks imported | 2 (`useCustomerWallet`, `useLocalPaymentMethods`) |
| Existing pages reused | WalletPage, PaymentMethodsPage, GiftCardsPage |
| No new pages needed | All wallet, transaction, and payment management pages already exist |

