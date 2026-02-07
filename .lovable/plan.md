

# Rider Payment Methods Screen (Mock)

## Summary

Create a dedicated `/payment-methods` page for riders to manage their saved cards. This is a mock implementation storing payment methods in localStorage, preparing the UI and data structure for future real payment integration.

---

## Current State

| Component | Status |
|-----------|--------|
| `zivo_payment_methods` table | Exists in Supabase (for real integration later) |
| `usePaymentMethods()` hook | Exists but queries Supabase |
| `/payment-methods` route | Does not exist |
| Add card form | Does not exist |
| Mock localStorage storage | Does not exist |

---

## Implementation Approach

### 1. Create Mock Payment Methods Hook

New hook `useLocalPaymentMethods` that:
- Stores cards in localStorage under `zivo_local_payment_methods`
- Provides add, delete, and set default functions
- Syncs with localStorage on changes

### 2. Create `/payment-methods` Page

Full-screen mobile-first page with:
- List of saved payment methods
- Add card form (mock fields: card number, expiry, CVV, name)
- Set default functionality
- Delete card functionality

### 3. Update Ride Confirm Page

Show the selected default payment method from localStorage with a link to manage cards.

### 4. Add Navigation Button

Add "Manage Cards" link on ride confirmation screen.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useLocalPaymentMethods.ts` | Create | Mock hook for localStorage-based payment methods |
| `src/pages/PaymentMethodsPage.tsx` | Create | Payment methods management page |
| `src/App.tsx` | Modify | Add `/payment-methods` route |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Show selected payment method from local storage |
| `src/pages/app/AppHome.tsx` | Modify | Add "Payment Methods" quick action |

---

## Technical Details

### New Hook: `useLocalPaymentMethods`

```typescript
const STORAGE_KEY = "zivo_local_payment_methods";

interface LocalPaymentMethod {
  id: string;
  type: "card" | "wallet";
  brand: string;        // "Visa", "Mastercard", etc.
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: number;
}

export function useLocalPaymentMethods() {
  const [methods, setMethods] = useState<LocalPaymentMethod[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  }, [methods]);

  const addCard = (card: Omit<LocalPaymentMethod, "id" | "createdAt">) => {
    // ...
  };

  const deleteCard = (id: string) => {
    // ...
  };

  const setDefault = (id: string) => {
    // ...
  };

  const getDefault = () => methods.find(m => m.isDefault) || methods[0];

  return { methods, addCard, deleteCard, setDefault, getDefault };
}
```

### New Page: `PaymentMethodsPage.tsx`

Mobile-first design matching ZIVO's dark glassmorphic aesthetic:

```text
┌────────────────────────────────────────┐
│  ← Payment Methods                      │
├────────────────────────────────────────┤
│                                        │
│  ┌────────────────────────────────┐    │
│  │ 💳 Visa •••• 4242    [Default] │    │
│  │    Expires 12/25       ★  🗑   │    │
│  └────────────────────────────────┘    │
│                                        │
│  ┌────────────────────────────────┐    │
│  │ 💳 Mastercard •••• 8888        │    │
│  │    Expires 06/26       ★  🗑   │    │
│  └────────────────────────────────┘    │
│                                        │
│  ┌────────────────────────────────┐    │
│  │     + Add New Card             │    │
│  └────────────────────────────────┘    │
│                                        │
├────────────────────────────────────────┤
│           ADD CARD FORM               │
│  (Expandable when "Add" is tapped)    │
│                                        │
│  Card Number: [________________]       │
│  Expiry:      [MM/YY]  CVV: [___]     │
│  Name:        [________________]       │
│                                        │
│  [       ADD CARD       ]              │
└────────────────────────────────────────┘
```

### Add Card Form Validation

Mock validation (no real processing):
- Card number: 16 digits with formatting (XXXX XXXX XXXX XXXX)
- Expiry: MM/YY format, future date
- CVV: 3-4 digits
- Name: Required, non-empty

Card brand detection:
- Starts with 4 → Visa
- Starts with 5 → Mastercard
- Starts with 3 → Amex
- Default → Unknown

### Integration with Ride Confirm Page

Update `RideConfirmPage.tsx` to:
1. Import and use `useLocalPaymentMethods`
2. Show default card from localStorage instead of hardcoded options
3. Add "Manage" link to `/payment-methods`

```typescript
// In RideConfirmPage
const { getDefault, methods } = useLocalPaymentMethods();
const defaultCard = getDefault();

// Display:
{defaultCard ? (
  <div className="flex items-center gap-3">
    <CreditCard />
    <span>{defaultCard.brand} •••• {defaultCard.last4}</span>
    <Link to="/payment-methods">Manage</Link>
  </div>
) : (
  <Link to="/payment-methods">Add payment method</Link>
)}
```

---

## Data Structure

```typescript
interface LocalPaymentMethod {
  id: string;           // UUID
  type: "card";         // For now, only cards
  brand: string;        // Visa, Mastercard, Amex, Discover
  last4: string;        // Last 4 digits
  expMonth: number;     // 1-12
  expYear: number;      // Full year (2025)
  cardholderName: string;
  isDefault: boolean;
  createdAt: number;    // Timestamp
}
```

### localStorage Key

```
zivo_local_payment_methods
```

### Example Stored Data

```json
[
  {
    "id": "pm_abc123",
    "type": "card",
    "brand": "Visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2025,
    "cardholderName": "John Doe",
    "isDefault": true,
    "createdAt": 1707350400000
  }
]
```

---

## UI Components

### Card Form Fields

| Field | Format | Validation |
|-------|--------|------------|
| Card Number | XXXX XXXX XXXX XXXX | 16 digits |
| Expiry | MM/YY | Future date |
| CVV | XXX or XXXX | 3-4 digits |
| Name | Text | Required |

### Card Display

- Card icon based on brand
- Masked number (•••• last4)
- Expiry date
- Default badge (if applicable)
- Star button to set default
- Trash button to delete

---

## Navigation Flow

```text
AppHome
    │
    └─→ "Payment Methods" button
              │
              ▼
        /payment-methods
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
View Cards        Add Card Form
    │                   │
    ▼                   ▼
Set Default      Submit → Save
Delete Card      to localStorage
```

From Ride Flow:

```text
/ride/confirm
    │
    └─→ "Manage" link
              │
              ▼
        /payment-methods
              │
              ▼
        Manage cards
              │
              ▼
        Back to /ride/confirm
              (shows updated default)
```

---

## Security Notes

This is a **mock implementation** - no real card data is processed:
- Card numbers are stored in localStorage (not secure for real use)
- No Stripe or payment gateway integration
- UI only - prepares structure for future real implementation
- Add clear "Demo Mode" indicator on the page

---

## Future Migration Path

When ready for real payments:
1. Replace `useLocalPaymentMethods` with `usePaymentMethods` from `useZivoWallet.ts`
2. Add Stripe Elements for secure card entry
3. Call edge function to create Stripe payment method
4. Remove localStorage fallback

