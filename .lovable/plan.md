

# Priority Orders and Express Delivery Option

## Overview
Add an Express Delivery tier to ZIVO Eats and Rides that lets customers pay a premium fee for faster service -- priority dispatch, reduced batching delays, and prominent "Express" badges across all touchpoints (customer, driver, restaurant, admin).

## What Changes

### 1. Database -- New Columns
- Add `is_express` (boolean, default false) and `express_fee` (numeric, default 0) columns to the `food_orders` table
- Add `is_express` and `express_fee` columns to `ride_requests` table
- Add admin-configurable settings row in `pricing_settings` for express fee amount and zone-level caps

### 2. New Component -- `DeliverySpeedSelector`
A radio-card selector placed in the Eats checkout between "Delivery Time" and "Payment Method" sections:
- **Standard** -- current ETA range, no extra fee
- **Express** -- reduced ETA (roughly 30% faster), shows additional fee (e.g. +$2.99), highlighted with a lightning bolt badge
- Displays side-by-side ETA comparison so customers see the value clearly

### 3. Eats Checkout Integration (`EatsCheckout.tsx`)
- Add `isExpress` and `expressFee` state
- Wire `DeliverySpeedSelector` into the form between the Timing card and Payment card
- Add express fee as a line item in the Order Summary sidebar
- Include `is_express` and `express_fee` in the order creation payload (both cash and Stripe flows)
- Adjust total calculation: `total = currentTotal + expressFee`

### 4. Pricing Hook Update (`useEatsDeliveryPricing.ts`)
- Accept optional `isExpress` parameter
- When express is selected, apply the configured express fee to the total
- Export express fee amount for display

### 5. Express Badge Component
A small reusable `<ExpressBadge />` component (lightning bolt icon + "Express" text in amber/orange) used across:
- Customer order tracking page
- Driver trip request modal and active delivery view
- Restaurant order dashboard
- Dispatch Kanban cards

### 6. Dispatch Priority Boost
- In `useDriverQueue.ts` scoring logic, add a priority boost (+15 points) for express orders so they rank higher in the assignment queue
- Reduce batching delay tolerance for express orders (skip batching or use tighter proximity window)
- In `auto_assign_order_v2` RPC call, pass `is_express` flag for server-side priority handling

### 7. Driver Interface Updates
- Show `<ExpressBadge />` on incoming trip request
- Display higher estimated earnings (base + express bonus)
- Add "Priority" label in active delivery view

### 8. Restaurant Interface Updates
- Show `<ExpressBadge />` on incoming orders
- Display suggested faster prep time for express orders
- Optional kitchen priority queue indicator

### 9. Order Tracking Updates
- Show "Express" badge next to order status
- Display the faster ETA estimate the customer selected

### 10. Edge Function Updates
- `create-eats-checkout` and `create-eats-payment-intent`: accept and store `is_express` and `express_fee`, add express fee as a Stripe line item
- Webhook handler: preserve express flag on payment confirmation

### 11. Admin Analytics (Lightweight)
- Add express order count and express revenue to existing admin dashboard metrics
- Filter support for express vs standard in order lists

## Technical Details

### File Changes Summary

| File | Change |
|------|--------|
| `src/components/eats/DeliverySpeedSelector.tsx` | New component -- Standard vs Express radio cards |
| `src/components/shared/ExpressBadge.tsx` | New reusable badge component |
| `src/pages/EatsCheckout.tsx` | Add state, wire selector, update total, pass to order creation |
| `src/hooks/useEatsDeliveryPricing.ts` | Accept `isExpress` param, include express fee in pricing |
| `src/hooks/useDriverQueue.ts` | Add priority boost for express orders in scoring |
| `src/hooks/useCreateFoodOrder` (or equivalent) | Pass `is_express` and `express_fee` fields |
| `supabase/functions/create-eats-checkout/index.ts` | Accept and store express fields, add Stripe line item |
| `supabase/functions/create-eats-payment-intent/index.ts` | Same as above |
| `src/components/dispatch/KanbanColumn.tsx` | Show ExpressBadge on express order cards |
| `src/pages/eats/EatsOrderDetail.tsx` (or equivalent) | Show ExpressBadge in tracking view |
| Database migration | Add `is_express` and `express_fee` columns to `food_orders` and `ride_requests` |

### Express Fee Configuration
- Default express fee: $2.99
- Stored as a constant initially, with admin override via `pricing_settings` table
- Express ETA reduction: multiply standard ETA by 0.7 (30% faster display)

### Fairness Safeguard
- Cap express orders at a configurable percentage per zone (e.g., max 30% of active orders can be express) to prevent standard order starvation
- If cap is reached, express option is grayed out with "Express unavailable right now" message

