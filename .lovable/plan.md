

## Plan: Complete Walmart Shopping Order Flow

Most of the infrastructure already exists. The cart, checkout drawer, order confirmation page, driver shop page, and admin shopping orders page are all built. Here's what needs to be fixed/polished:

### 1. Fix Checkout Drawer — Dynamic Store Name
**File:** `src/components/grocery/GroceryCheckoutDrawer.tsx`
- The `store` field is hardcoded to `"Walmart"` on line 58. Change it to use the store from the first cart item (e.g., `items[0]?.store || "Walmart"`), since cart items already carry the `store` field.
- Update the summary text ("X items from Walmart") to be dynamic.

### 2. Polish Product Card Layout
**File:** `src/components/grocery/GroceryProductCard.tsx`
- Increase image padding and size for better readability
- Make product name `text-sm` instead of `text-xs`, increase `line-clamp` to 2 lines
- Add more spacing between brand, name, and price sections
- Make the Add to Cart button more prominent (filled instead of outline)

### 3. UI Polish on Store Page Cart Drawer
**File:** `src/pages/GroceryStorePage.tsx`
- Add item subtotal display per line (price × quantity)
- Ensure cart images are slightly larger for readability

### 4. Admin Dashboard — Shopping Orders Tab
**File:** `src/pages/admin/AdminShoppingOrders.tsx`
- Already exists. Verify it filters/labels `shopping_delivery` orders and displays the store name. No major changes expected — just confirm it shows the `store` column prominently.

### 5. Driver Flow — Already Built
**Files:** `src/pages/driver/DriverShopPage.tsx`, `src/hooks/useDriverShoppingOrders.ts`
- The driver shopping list, item marking (found/replaced/unavailable), receipt upload, and delivery confirmation are already fully implemented.
- No changes needed unless UI polish is requested.

### Summary of Changes
| File | Change |
|---|---|
| `GroceryCheckoutDrawer.tsx` | Dynamic store name instead of hardcoded "Walmart" |
| `GroceryProductCard.tsx` | Larger images, bigger text, more prominent Add button |
| `GroceryStorePage.tsx` | Show per-item subtotal in cart, slightly larger cart images |

This is a small polish pass — the full flow (add to cart → checkout → order saved → admin sees it → driver shops it) is already wired end-to-end.

