
# Saved Addresses and Favorites — Implementation Plan

## Overview
This feature set speeds up the ordering and checkout flow by allowing customers to:
1. Manage saved delivery addresses from `/account/addresses`
2. Select saved addresses during checkout
3. Favorite restaurants from any restaurant card
4. View favorites at `/account/favorites`
5. Quickly reorder from past orders

---

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Saved Locations hook | Complete | `src/hooks/useSavedLocations.ts` |
| EatsAddress page | Complete | `src/pages/EatsAddress.tsx` (at `/eats/address`) |
| Favorites hook | Complete | `src/hooks/useEatsFavorites.ts` |
| FavoriteButton component | Complete | `src/components/eats/FavoriteButton.tsx` |
| EatsFavorites page | Complete | `src/pages/EatsFavorites.tsx` (at `/eats/favorites`) |
| AddressSelector component | Complete | `src/components/eats/AddressSelector.tsx` |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| `/account/addresses` page | Missing | Dedicated account-section address manager |
| `/account/favorites` page | Missing | Account-section favorites page |
| Checkout saved address picker | Missing | Select from saved addresses at checkout |
| Favorite button on restaurant cards | Partial | Not on EatsRestaurants.tsx cards |
| Reorder button on orders | Missing | Quick reorder from past orders |
| Reorder hook | Missing | Logic to add past order items to cart |

---

## Implementation Plan

### 1) Create Account Addresses Page

**File to Create:** `src/pages/account/AddressesPage.tsx`

**Purpose:** Account-section page for managing delivery addresses.

This page will reuse the same logic as `EatsAddress.tsx` but with a more account-focused layout:
- Header with back navigation to profile/account
- Add new address button
- List of saved addresses with edit/delete options
- Default address indicator with star icon
- Support for Home/Work/Other labels

**Key Components:**
- Uses `useSavedLocations`, `useAddSavedLocation`, `useUpdateSavedLocation`, `useDeleteSavedLocation` hooks
- Dialog for add/edit address form
- Icon selection (Home, Work, Other)
- "Set as default" functionality (add `is_default` field or use first address)

---

### 2) Create Account Favorites Page

**File to Create:** `src/pages/account/FavoritesPage.tsx`

**Purpose:** Account-section page for viewing favorite restaurants.

Similar to `EatsFavorites.tsx` but styled for the account section:
- Clean list of favorited restaurants
- Link to each restaurant's menu
- Remove favorite button
- Uses existing `useEatsFavorites` hook

---

### 3) Update Checkout with Saved Address Selector

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Add a "Select saved address" section before the manual address input
- Show list of user's saved addresses as selectable cards
- When selected, auto-fill the delivery address field
- Keep manual entry option for new addresses
- Add "Save this address" checkbox for new addresses

**UI Flow:**
```
Delivery Details
├── [Select Saved Address]
│   ├── 🏠 Home - 123 Main St...  [Selected ✓]
│   ├── 🏢 Work - 456 Office Blvd...
│   └── + Add new address
│
├── Or enter a new address:
│   └── [________________]
│       □ Save this address for future orders
```

---

### 4) Add Favorite Button to Restaurant Cards

**File to Modify:** `src/pages/EatsRestaurants.tsx`

**Changes:**
- Import `FavoriteButton` component
- Add heart icon overlay on each restaurant card (top-right corner)
- Pass restaurant data to FavoriteButton for toggle functionality

**File to Modify:** `src/components/food/PremiumRestaurantCard.tsx`

**Changes:**
- Add FavoriteButton to the card's top-right corner overlay
- Ensure it doesn't interfere with card click navigation

---

### 5) Create Reorder Hook and Button

**File to Create:** `src/hooks/useReorder.ts`

**Purpose:** Handle reordering logic by adding past order items to cart.

```typescript
interface UseReorderResult {
  reorder: (order: PastOrder) => Promise<void>;
  isReordering: boolean;
}
```

**Logic:**
1. Clear current cart (or prompt if items exist)
2. Fetch restaurant availability
3. Add each item from past order to cart
4. Navigate to cart or checkout

**File to Modify:** `src/pages/EatsOrders.tsx`

**Changes:**
- Add "Reorder" button to each completed order card
- Clicking triggers the reorder flow
- Shows loading state while processing

---

### 6) Add Routes for Account Pages

**File to Modify:** `src/App.tsx`

**Changes:**
- Add route for `/account/addresses`
- Add route for `/account/favorites`
- Both wrapped in `<ProtectedRoute>`

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/pages/account/AddressesPage.tsx` | Account section address manager |
| `src/pages/account/FavoritesPage.tsx` | Account section favorites list |
| `src/hooks/useReorder.ts` | Reorder past orders to cart |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for /account/addresses and /account/favorites |
| `src/pages/EatsCheckout.tsx` | Add saved address selector |
| `src/pages/EatsRestaurants.tsx` | Add FavoriteButton to restaurant cards |
| `src/pages/EatsOrders.tsx` | Add Reorder button to past orders |

---

## UI Components

### Saved Address Card
```
+------------------------------------------+
| 🏠 Home                          [★ Default]
|    123 Main St, Apt 4B
|    New York, NY 10001
|                           [Edit] [Delete]
+------------------------------------------+
```

### Reorder Button (Orders Page)
```
+------------------------------------------+
| 🍔 Burger Palace           Delivered ✓   |
| 2 items · $24.50          Jan 15, 2026   |
|                                          |
|           [View Details]  [🔄 Reorder]   |
+------------------------------------------+
```

### Checkout Saved Address Selector
```
+------------------------------------------+
| 📍 Select delivery address:              |
|                                          |
| ◉ 🏠 Home                                |
|     123 Main St, Apt 4B                  |
|                                          |
| ○ 🏢 Work                                |
|     456 Office Blvd, Floor 3             |
|                                          |
| ○ + Enter a different address            |
+------------------------------------------+
```

---

## Default Address Logic

To support "Set as default":
- Add `is_default` boolean to `saved_locations` table (if not already present)
- OR use first address in list as default (simpler approach)
- When setting a new default, unset the previous one

For this implementation, we'll use the **first address as default** pattern to avoid database changes.

---

## Summary

This implementation provides:

1. **Dedicated `/account/addresses` page** for managing delivery addresses
2. **Dedicated `/account/favorites` page** for viewing favorite restaurants  
3. **Saved address selection at checkout** for faster ordering
4. **Heart icons on restaurant cards** for easy favoriting
5. **Reorder button on past orders** for quick repeat orders
6. **Consistent UX** between Eats-specific pages and account pages

All features leverage existing hooks and components where possible, minimizing new code while maximizing reusability.
