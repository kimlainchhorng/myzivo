## Money & Marketing Layer — Implementation Plan

### 1. KHQR Dynamic QR Payment Flow
- Update `aba-payway-checkout` edge function to return QR data for dynamic amounts
- Create a `KHQRPaymentModal` component that displays the QR code and polls for payment confirmation
- On confirmed payment, fire `Purchase` event to `meta-conversion-handler` with the bank transaction ID as `event_id`

### 2. Merchant Boost Ad System ($5/$10/$20)
- Add `merchant_boosts` table (merchant_id, amount, paid_via, featured_until, payment_ref)
- Create boost payment flow supporting both KHQR and Stripe
- Add `is_featured` logic to Map pins and Reels feed queries (prioritize boosted merchants for 24h)
- Add "Boost My Shop" UI on Merchant Dashboard with budget selector

### 3. Professional Merchant ROI Dashboard
- Build `/shop-dashboard/analytics` page pulling real data:
  - **Reel Views**: aggregate from `reel_views` or analytics tables
  - **Map Clicks**: aggregate from `map_pin_clicks` table
  - **Verified Revenue**: sum of completed `store_orders` / `truck_sales` Purchase events
- Clean card-based layout with charts (recharts)

### 4. Meta Data Quality (fbc/fbp + Event ID dedup)
- Read `_fbc` and `_fbp` cookies from the browser and pass them through to `meta-conversion-handler`
- Update the edge function to include `fbc` and `fbp` in `user_data`
- Ensure `event_id` = ABA transaction ID to prevent double-counting

### Order of execution:
1. Database migration for `merchant_boosts` table
2. Update `meta-conversion-handler` for fbc/fbp support
3. Update `metaConversion.ts` client to pass fbc/fbp
4. Build KHQR payment modal component
5. Build Merchant Boost UI + payment flow
6. Build ROI Dashboard page
