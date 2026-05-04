# Cross-Border Marketplace + Warehouse Forwarding

Expand the Marketplace tab into a Lazada/Taobao-style shopping experience where customers buy international products in the ZIVO app, pay locally, and receive items via your Cambodia warehouse for last-mile delivery.

## User Flow

```
Browse (Lazada/Taobao/Shein style)
   → Add to Cart
   → Checkout (ABA / Card / Cash on Delivery / Wallet)
   → Order placed (status: awaiting_supplier)
   → Admin/Ops procures from supplier (Taobao/Lazada/1688)
   → Item arrives at CN/TH warehouse → status: at_origin_warehouse
   → International shipping → status: in_transit
   → Arrives at PP warehouse → status: at_local_warehouse
   → Assigned to ZIVO Driver → status: out_for_delivery
   → Delivered (with proof photo + signature) → status: delivered
```

## Scope

### 1. Customer Marketplace UI (`/marketplace`)
- Replace the empty state with a Lazada-style feed: categories chips (Fashion, Electronics, Home, Beauty, Toys, Grocery), flash-sale banner, "Trending from China/Thailand" rails, product grid (2-col mobile, 4-col desktop)
- Product detail page: image gallery, variants (size/color), seller country badge, est. delivery window (e.g. "7–14 days via PP warehouse"), shipping fee preview, reviews, "Buy Now" + "Add to Cart"
- Cart + checkout drawer reusing existing `GroceryInlinePaymentForm` (Stripe) + ABA/Cash options already in the Cambodia payment architecture
- Order tracking page with the 6-stage timeline above and warehouse photos

### 2. Seller / Source Catalog
- Two product sources:
  a. **Manual curated** — admin adds products with markup (sourced from Taobao/Lazada/1688 URLs)
  b. **Affiliate import** — paste a Taobao/Lazada URL, edge function scrapes title/images/price, applies FX + markup + est. shipping
- `marketplace_products` table with `source_platform`, `source_url`, `source_price_cny/thb`, `markup_percent`, `final_price_usd`, `weight_grams`, `category`, `variants` (JSONB)

### 3. Warehouse & Fulfillment Module (`/admin/warehouse`)
- **Procurement queue**: paid orders awaiting supplier order placement (admin marks "ordered from supplier" + tracking #)
- **Inbound receiving**: scan/enter inbound parcels at PP warehouse, attach to order, photo proof
- **Outbound dispatch**: assign packages to ZIVO Drivers (reuses existing dispatch engine, 25km radius, Haversine fallback per Mobility Engine memory)
- Status transitions write to `marketplace_order_events` for full audit

### 4. Pricing Engine
- Final price = `(supplier_price × FX) × (1 + markup) + intl_shipping_per_kg × weight + local_delivery_fee + 3.5% card surcharge (if card)`
- Reuses KH FX rate `1 USD = 4,062.5 KHR` from Regional Strategy memory
- Weight-based shipping tiers: <0.5kg, 0.5–2kg, 2–5kg, >5kg

### 5. Payments
- Card (Stripe) → existing `GroceryInlinePaymentForm`
- ABA Pay → manual via Telegram (per Cambodia Payments V2 memory)
- Cash on Delivery → only after item reaches local warehouse; collected by driver
- Wallet balance → existing wallet system

### 6. Notifications
- Push at every status transition via existing `send-push-notification` edge function
- Telegram alert to ops on each new paid order

## Technical Details

### New DB tables (migration)
- `marketplace_products` (id, source_platform enum, source_url, title, images jsonb, variants jsonb, weight_grams, source_price, currency, markup_percent, final_price_cents, category, active, created_by)
- `marketplace_orders` (id, customer_id, items jsonb, subtotal_cents, shipping_cents, surcharge_cents, total_cents, payment_method, payment_status, fulfillment_status enum, supplier_tracking, intl_tracking, local_tracking, warehouse_id, assigned_driver_id, delivery_address, delivery_lat/lng, created_at)
- `marketplace_order_events` (id, order_id, status, note, photo_url, actor_id, created_at)
- `warehouses` (id, name, country, address, lat, lng, active)
- RLS: customers read own orders; admins/ops full access via `has_role`

### New edge functions
- `marketplace-import-product` — scrape supplier URL, return normalized product
- `marketplace-create-order` — atomic cart→order, calls Stripe, writes events
- `marketplace-update-status` — admin/driver status transitions + push notifications
- `marketplace-fx-rates` — daily CNY/THB→USD/KHR cache

### New / edited frontend files
- `src/pages/MarketplacePage.tsx` (rewrite — currently empty state)
- `src/pages/MarketplaceProductPage.tsx` (new)
- `src/pages/MarketplaceOrderTrackingPage.tsx` (new)
- `src/pages/admin/AdminMarketplaceProductsPage.tsx` (new)
- `src/pages/admin/AdminWarehousePage.tsx` (new — procurement + receiving + dispatch tabs)
- `src/hooks/useMarketplaceCart.ts` (clone of `useGroceryCart` pattern)
- `src/hooks/useMarketplaceProducts.ts`
- `src/components/marketplace/*` (ProductCard, CategoryChips, StatusTimeline, VariantPicker, CheckoutDrawer)
- Reuse: `GroceryInlinePaymentForm`, `CheckoutPinMap`, dispatch engine, push notification engine

### Memory updates
- New `mem://features/marketplace/cross-border-fulfillment` describing the 6-stage flow, table names, and warehouse module

## Out of Scope (phase 2)
- Direct Taobao/Lazada API integration (start with URL scraping + manual procurement)
- Customs/duty calculator UI
- Multi-warehouse routing optimization
- Seller self-onboarding portal

## Rollout Order
1. DB migration + RLS
2. Customer browse + product detail + cart
3. Checkout (Stripe + ABA + COD)
4. Admin procurement + warehouse receiving
5. Driver dispatch + delivery proof
6. Notifications + memory update

Confirm and I'll implement in this order.
