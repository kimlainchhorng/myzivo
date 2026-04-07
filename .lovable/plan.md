

# ZiVo Super-App Integration — Full-Stack Update Plan

## Status: What's Already Built vs What Needs Work

### Already Complete
- **Meta secrets**: `META_PIXEL_ID`, `META_ACCESS_TOKEN`, `META_TEST_EVENT_CODE` are configured
- **3 Edge Functions** for Meta: `meta-conversion-handler` (client-side), `meta-conversion-bridge` (DB webhook), `meta-capi-bridge` (DB webhook v2)
- **FloatingProductCard**: "Buy from [Shop] - Xkm away" overlay on Reels with InitiateCheckout tracking
- **TruckDashboardPage**: GPS + barcode scanning + nearby customers + inventory management
- **SalesAttributionPage**: Funnel visualization + $5 Boost button
- **SandboxModePage**: Test Purchase events via Meta handler
- **ShopEmployeesPage**: Driver/Truck mode, GPS clock-in, offline queue
- **ShopPayrollPage**: Base pay + commission config + ROI

### Gaps to Address

| Area | Issue |
|------|-------|
| Meta CAPI Bridge | `store_orders` and `truck_sales` tables are handled but need DB webhook triggers wired to `meta-conversion-bridge` |
| CompleteRegistration | Only fires on profile INSERT/UPDATE in `meta-conversion-bridge`; `meta-capi-bridge` lacks registration events |
| Reel "Buy Now" | Commerce link data (`social_reel_links`) fetch may fail if table doesn't exist or has no RLS policies |
| Truck Inventory Sync | Barcode scan sells locally but doesn't update the Shop Map availability indicator |
| Offline Sync → Meta | Offline queue syncs to Supabase but does NOT fire Meta Purchase events after sync |
| Map Attribution | No tracking of which Map pin click led to a purchase |
| Sandbox Mode | Calls `meta-conversion-handler` directly but doesn't test the full DB-trigger → bridge pipeline |
| Merchant Dashboard | Missing real ad spend tracking; boost just opens Stripe but doesn't log results back |

---

## Implementation Plan

### Step 1: Consolidate Meta CAPI into One Bridge

Merge `meta-conversion-bridge` and `meta-capi-bridge` into a single, definitive `meta-capi-bridge` function that handles:
- **Purchase**: trips, food_orders, flight_bookings, travel_bookings, store_orders, truck_sales, transactions
- **CompleteRegistration**: profiles INSERT + email_verified UPDATE
- **InitiateCheckout**: passthrough from client calls (keep `meta-conversion-handler` for client-side)

Add `truck_sales` to the Purchase tables with proper value/currency extraction.

### Step 2: Wire DB Webhook Triggers

Create a migration that adds `notify_meta_conversion_bridge()` triggers to:
- `truck_sales` (on UPDATE to status = 'completed')
- `store_orders` (on UPDATE to status = 'completed'/'delivered')

These triggers call the edge function via `pg_net` (already patterned in existing migrations).

### Step 3: Offline Sync → Meta Fire

Update `ShopEmployeesPage.tsx` offline sync logic: after successfully inserting queued sales into `truck_sales`, call `sendMetaConversionEvent` with event name "Purchase" for each synced sale. This ensures offline sales hit Meta once connectivity restores.

### Step 4: Map Attribution Tracking

- Add a `map_pin_clicks` table (store_id, user_id, source, timestamp) via migration
- When a user taps a store pin on the Map, insert a click record
- In `SalesAttributionPage`, join `map_pin_clicks` with `store_orders` to attribute purchases to map interactions
- Update the funnel: Views → Map Clicks → Purchases with real data

### Step 5: Boost Payment Completion Tracking

- Add a Stripe webhook handler or success-page logic: when returning from boost checkout with `?boost=success`, insert a record into `merchant_ad_spend` with the $5 amount and reel_id
- Update `SalesAttributionPage` to show cumulative ad spend from `merchant_ad_spend` and calculate ROI

### Step 6: Sandbox Mode Enhancement

Enhance `SandboxModePage` to:
- Insert a real test row into `truck_sales` or `trips` with status = 'completed' (using a `test_mode = true` flag)
- This triggers the DB webhook → `meta-capi-bridge` → Meta, testing the full pipeline
- Show the Meta Events Manager link and expected event details

### Step 7: UI/UX Polish Pass

- Ensure all pages have consistent loading states, error boundaries, and empty states
- Add period selector (7d/30d/all) filtering to the Attribution dashboard
- Improve Truck Dashboard map with actual Google Maps embed showing driver position + nearby customer pins
- Add visual confirmation animations when Meta events fire successfully in Sandbox

---

## Technical Details

### New Migration SQL
```text
-- map_pin_clicks table
CREATE TABLE IF NOT EXISTS public.map_pin_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES store_profiles(id),
  user_id UUID,
  source TEXT DEFAULT 'map',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.map_pin_clicks ENABLE ROW LEVEL SECURITY;

-- Trigger: truck_sales → meta-capi-bridge
CREATE TRIGGER truck_sales_meta_bridge
  AFTER UPDATE ON truck_sales
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION notify_meta_conversion_bridge();
```

### Files to Create/Edit
- `supabase/functions/meta-capi-bridge/index.ts` — add truck_sales + registration handling
- `supabase/migrations/YYYYMMDD_meta_triggers_and_map_clicks.sql` — triggers + map_pin_clicks table
- `src/pages/app/shop/ShopEmployeesPage.tsx` — offline sync fires Meta Purchase
- `src/pages/app/shop/SalesAttributionPage.tsx` — real map click data + ad spend display
- `src/pages/app/shop/SandboxModePage.tsx` — full pipeline test mode
- `src/pages/StoreMapPage.tsx` — insert map_pin_clicks on pin tap
- `src/components/reels/FloatingProductCard.tsx` — minor: add loading state during checkout nav

### Edge Functions to Deploy
- `meta-capi-bridge` (updated)
- `meta-conversion-handler` (no changes needed)

