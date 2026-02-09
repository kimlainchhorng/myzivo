

# Fix: "Place Order" Fails Due to Foreign Key Constraint

## Root Cause

When you tap "Place Order", the food order row is inserted into `food_orders` successfully. However, a database trigger (`trigger_notify_order_status` / `notify_on_order_status_change()`) immediately fires and tries to insert a notification into the `notifications` table using the food order's ID as `order_id`.

The problem: `notifications.order_id` has a foreign key constraint (`notifications_order_id_fkey`) that references the `travel_orders` table -- not `food_orders`. Since the food order ID doesn't exist in `travel_orders`, the insert fails and the entire transaction rolls back, killing the order.

## Fix

**Alter the foreign key** on `notifications.order_id` to remove the constraint that only allows `travel_orders` IDs. Since notifications serve both travel orders and food orders, the `order_id` column should not be restricted to a single table.

### Database Change (single SQL migration)

Drop the existing foreign key constraint:

```sql
ALTER TABLE notifications
  DROP CONSTRAINT notifications_order_id_fkey;
```

This allows `order_id` to hold IDs from either `food_orders` or `travel_orders`. No data is lost and no other changes are needed -- the trigger function and all existing code continue to work as-is.

### No Code Changes Required

The frontend (`EatsCart.tsx`) and the `useCreateFoodOrder` hook are working correctly. The failure is entirely in the database constraint, so only the SQL migration is needed.

## What Will Work After the Fix

- Tapping "Place Order" on the cart page will succeed
- The notification trigger will insert merchant/customer/driver notifications without error
- Travel order notifications continue to work (they still reference valid `travel_orders` IDs)
- Order confirmation toast appears and user is navigated to the order detail page

