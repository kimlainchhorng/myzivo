

# Automatic Arrival Updates for Eats Customers

## What exists today

- **`useDriverProximity`** already calculates `isNearDelivery` (driver < 0.15 miles from delivery address) and `isArrivingSoon` (driver < 0.05 miles) in real-time as GPS updates flow in.
- **`DriverInfoCard`** shows a visual "Driver Arriving" banner when the driver is near -- but only if the customer is actively looking at the order page.
- **`useDriverProximityAlert`** fires a toast + sound, but only for **ride trips** (checks `tripStatus === "en_route"`), not food delivery.
- **Push notification infrastructure** is fully built (`send-push-notification` edge function, web push subscriptions, etc.).

## What's missing

1. **No toast/in-app alert** when the Eats driver enters the delivery zone -- the customer only sees it if they're staring at the order detail page.
2. **No push notification** sent to the customer's device when the driver is arriving.

## Plan

### 1. New Hook: `src/hooks/useEatsArrivalAlert.ts`

A lightweight hook used on the Eats order detail page that watches `isNearDelivery` from the existing proximity state and fires a one-time alert:

- **Trigger**: When `isNearDelivery` flips from `false` to `true` while order status is `out_for_delivery`
- **Actions**:
  - Play alert sound (via existing `useNotificationSound`)
  - Show a toast: "Your driver is arriving! Please be ready."
  - Send a push notification to the customer via `send-push-notification` edge function (so they get alerted even if the app is in the background)
  - Insert a record into the `notifications` table for the notification center
- **Guard**: Uses a ref to ensure it only fires once per order (resets if order ID changes)

### 2. Update: `src/pages/EatsOrderDetail.tsx`

- Import and call `useEatsArrivalAlert`, passing in the existing `proximity` state, order data, and customer ID
- No UI changes needed -- the toast and push handle the notification, and the existing `DriverInfoCard` already shows the visual "arriving" state

### 3. Push Notification Content

When the driver enters the delivery zone, the push notification will be:
- **Title**: "Your driver is arriving!"
- **Body**: "Your order from {restaurant_name} will be at your door shortly."
- **URL**: `/eats/orders/{order_id}` (tapping opens the tracking page)

This uses the existing `send-push-notification` edge function -- no backend changes needed.

## Technical Details

```text
Hook: useEatsArrivalAlert
  Inputs:
    - proximity.isNearDelivery (boolean)
    - order.id, order.status, order.customer_id
    - restaurant name (for notification text)
  
  Logic:
    IF isNearDelivery === true
    AND order.status === "out_for_delivery"
    AND hasNotAlerted (ref)
    THEN:
      1. Set hasAlerted = true
      2. playAlertSound()
      3. toast.info("Your driver is arriving!")
      4. supabase.functions.invoke("send-push-notification", {...})
      5. supabase.from("notifications").insert({...})
```

## Edge Cases

- **Customer has app open on order page**: Gets toast + sound immediately
- **Customer has app in background**: Gets push notification on their device
- **Driver GPS goes stale then comes back**: The ref guard prevents duplicate alerts
- **Order gets cancelled while driver is near**: The `out_for_delivery` status check prevents false alerts
- **Multiple orders**: Each hook instance is scoped to its order ID, so alerts are independent

