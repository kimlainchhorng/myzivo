
# Item Availability — Implementation Plan

## Overview
Implement menu item availability management so customers only see items that are orderable, with clear visual feedback for out-of-stock items and cart validation to prevent ordering unavailable items.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `is_available` field on MenuItem | Complete | `menu_items` table, types in `eatsApi.ts` |
| Menu query filters available items | Complete | `useMenuItems()` filters by `is_available=true` |
| MenuItemCard component | Complete | `src/pages/EatsRestaurantMenu.tsx` |
| MenuItemModal component | Complete | `src/components/eats/MenuItemModal.tsx` |
| Cart Context | Complete | `src/contexts/CartContext.tsx` |

### Current Behavior
- The `useMenuItems()` hook already filters to `is_available=true`, meaning out-of-stock items are **hidden** entirely
- No visual indicator for items that become unavailable after being added to cart
- No cart validation against current item availability

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Show out-of-stock items visually | Missing | Display items with "Out of Stock" indicator |
| Disable add-to-cart for unavailable | Missing | Grey out button when `is_available=false` |
| Cart validation hook | Missing | Check cart items against current availability |
| Unavailable item warning in cart | Missing | Show message when item is no longer available |
| Real-time availability updates | Missing | Refresh availability before checkout |

---

## Implementation Plan

### 1) Update Menu Query to Include All Items

**File to Modify:** `src/hooks/useEatsOrders.ts` (lines 147-166)

**Changes:**
- Remove the `is_available=true` filter from `useMenuItems()`
- Return **all** menu items so out-of-stock ones can be displayed with a badge
- Items will be marked visually based on `is_available` flag

```typescript
// Before: .eq("is_available", true)
// After: No filter - show all items, handle display in UI
```

**Also Update:** `src/lib/eatsApi.ts` `getMenu()` function (line 143)

---

### 2) Create Item Availability Badge Component

**File to Create:** `src/components/eats/ItemAvailabilityBadge.tsx`

**Purpose:** Visual indicator showing "Available" or "Out of Stock" status.

**Variants:**
- **Available:** Green checkmark (shown optionally or not at all)
- **Out of Stock:** Red badge with crossed-out icon

```
+---------------------------+
| ⊘ Out of Stock           |
+---------------------------+
```

---

### 3) Update MenuItemCard Component

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

**Changes to `MenuItemCard`:**
- Accept `is_available` from the `MenuItem` object directly
- If `is_available === false`:
  - Apply `opacity-50` to the card
  - Show "Out of Stock" badge overlay
  - Disable "Add" button with disabled state
  - Prevent `handleAdd()` from executing

**UI when out of stock:**
```
+------------------------------------------+
| [Image - dimmed]                         |
|   🚫 OUT OF STOCK                        |
|                                          |
|   Item Name                              |
|   Description text...                    |
|                                          |
|   $12.99        [Add] ← disabled/greyed  |
+------------------------------------------+
```

---

### 4) Update MenuItemModal Component

**File to Modify:** `src/components/eats/MenuItemModal.tsx`

**Changes:**
- Add availability check before allowing add to cart
- Show warning message if item is unavailable
- Disable "Add to Cart" button if `item.is_available === false`

```tsx
{!item.is_available && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
    <p className="text-red-400 font-medium">This item is currently out of stock</p>
  </div>
)}
```

---

### 5) Create Cart Validation Hook

**File to Create:** `src/hooks/useCartValidation.ts`

**Purpose:** Check cart items against current menu availability before checkout.

**Logic:**
1. Fetch current menu for the restaurant in cart
2. Compare cart item IDs against menu items
3. Mark unavailable items with a flag
4. Return validation result

```typescript
interface CartValidationResult {
  isValid: boolean;
  unavailableItems: CartItem[];
  availableItems: CartItem[];
  isValidating: boolean;
}
```

**Triggers:**
- On checkout page load
- Before order submission
- On cart drawer open (optional)

---

### 6) Update Cart Context with Validation

**File to Modify:** `src/contexts/CartContext.tsx`

**Changes:**
- Add `validateCart()` method that checks item availability
- Add `unavailableItems` state
- Add `removeUnavailable()` helper to remove all unavailable items

```typescript
interface CartContextType {
  // ... existing
  validateCart: () => Promise<void>;
  unavailableItems: string[]; // IDs of unavailable items
  removeUnavailable: () => void;
}
```

---

### 7) Create Unavailable Item Banner Component

**File to Create:** `src/components/eats/UnavailableItemBanner.tsx`

**Purpose:** Warning banner shown in cart/checkout when items are unavailable.

**UI:**
```
+--------------------------------------------------+
| ⚠️  Some items are no longer available           |
|                                                  |
|   • Crispy Chicken Sandwich                      |
|   • Large Fries                                  |
|                                                  |
|   [Remove Unavailable Items]                     |
+--------------------------------------------------+
```

---

### 8) Update Checkout Page with Validation

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Call `validateCart()` on page load
- Show `UnavailableItemBanner` if items are unavailable
- Block order submission if cart has unavailable items
- Allow user to remove unavailable items and continue

---

### 9) Update Cart Drawer with Validation

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx` (CartDrawer component)

**Changes:**
- Add availability indicator per item
- Show warning if item is no longer available
- Strike through unavailable item names
- Show "Remove" button prominently for unavailable items

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/components/eats/ItemAvailabilityBadge.tsx` | Visual badge for availability status |
| `src/hooks/useCartValidation.ts` | Hook to validate cart against current menu |
| `src/components/eats/UnavailableItemBanner.tsx` | Warning banner for unavailable cart items |

### Modified Files (6)
| File | Changes |
|------|---------|
| `src/hooks/useEatsOrders.ts` | Remove `is_available=true` filter from `useMenuItems()` |
| `src/lib/eatsApi.ts` | Remove `is_available=true` filter from `getMenu()` |
| `src/pages/EatsRestaurantMenu.tsx` | Update MenuItemCard and CartDrawer for availability |
| `src/components/eats/MenuItemModal.tsx` | Add availability check and disable button |
| `src/contexts/CartContext.tsx` | Add validation methods |
| `src/pages/EatsCheckout.tsx` | Add pre-submit validation with banner |

---

## UI Behavior Matrix

| Scenario | Menu Display | Add Button | Cart Display | Checkout |
|----------|--------------|------------|--------------|----------|
| Available item | Normal | Enabled | Normal | Allowed |
| Out of stock item | Dimmed + badge | Disabled | N/A (can't add) | N/A |
| Item in cart becomes unavailable | N/A | N/A | Strikethrough + warning | Blocked until removed |

---

## Technical Details

### Availability Check Flow
```
1. User opens menu page
   └─> Fetch ALL menu items (available + unavailable)
   └─> Display with appropriate styling

2. User adds item to cart
   └─> Check is_available before adding
   └─> Block if unavailable

3. User opens checkout
   └─> Validate cart against current menu
   └─> Show warning for unavailable items
   └─> Require removal before proceeding

4. User submits order
   └─> Final validation check
   └─> Block submission if any items unavailable
```

### Real-Time Considerations
- Menu items are refetched when user navigates to menu page
- Cart validation queries the database on checkout load
- No real-time subscriptions (acceptable for MVP)
- Consider adding refresh button for long sessions

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Item becomes unavailable while in cart | Show warning on next cart view |
| All cart items unavailable | Show empty cart message after removal |
| Item re-becomes available | Validation passes, no action needed |
| User offline during validation | Show error, allow retry |
| Restaurant closes while ordering | Handled by existing restaurant availability system |

---

## Summary

This implementation provides:

1. **Visual availability indicators** — Clear "Out of Stock" badges on menu items
2. **Disabled add-to-cart** — Cannot add unavailable items to cart
3. **Cart validation** — Check availability before checkout
4. **Warning banners** — Clear messaging when items become unavailable
5. **One-click removal** — Easy way to remove all unavailable items
6. **Graceful degradation** — Show all items with status rather than hiding unavailable ones

The feature ensures customers never unknowingly order items that can't be fulfilled while maintaining a smooth browsing experience.
