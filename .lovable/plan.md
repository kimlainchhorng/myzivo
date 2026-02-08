
# Mobile App Readiness Layer (Driver / Merchant / Customer)

## Overview

This update prepares the ZIVO backend and web apps to run smoothly as native mobile apps by implementing mobile-optimized APIs, push notification infrastructure, background location tracking, offline-safe updates, and navigation integration.

---

## What Already Exists (Foundations to Build On)

| Component | Status | Notes |
|-----------|--------|-------|
| `device_tokens` table | Exists | Has `user_id`, `token`, `platform`, `is_active` |
| `push_tokens` table | Exists | Alternative token storage |
| `send-push-notification` edge function | Exists | Supports FCM, APNs, Web Push |
| `send-driver-notification` edge function | Exists | Driver-specific notifications |
| `update-driver-location` edge function | Exists | GPS spoof detection, throttling |
| `usePushNotifications` hook | Exists | Capacitor integration |
| `useNetworkStatus` hook | Exists | Offline action queue |
| `nativeNavigation.ts` utils | Exists | Apple Maps / Google Maps deep links |
| Supabase Realtime | Exists | Used for orders, trips, drivers |
| Skeleton component | Exists | For loading states |

---

## Implementation Plan

### A) Mobile-Friendly API Endpoints

Create RPC functions optimized for mobile with minimal payloads and `updated_at` timestamps.

**New Database Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `get_active_driver_state(p_driver_id)` | Driver's current state for home screen | Online status, active trip, earnings today |
| `get_driver_orders(p_driver_id, p_limit, p_offset)` | Paginated driver order/trip history | Trip list with status, fare, timestamps |
| `get_merchant_orders(p_restaurant_id, p_status, p_limit)` | Merchant order queue | Orders filtered by status |
| `get_order_tracking_public(p_tracking_code)` | Customer tracking without auth | Order status, driver location, ETA |

**Migration SQL:**
```sql
-- get_active_driver_state: Returns driver home screen data
CREATE FUNCTION get_active_driver_state(p_driver_id UUID)
RETURNS TABLE (
  is_online BOOLEAN,
  current_lat NUMERIC,
  current_lng NUMERIC,
  active_trip_id UUID,
  active_trip_status TEXT,
  earnings_today NUMERIC,
  trips_today INT,
  updated_at TIMESTAMPTZ
) ...

-- get_driver_orders: Paginated trip history
CREATE FUNCTION get_driver_orders(p_driver_id UUID, p_limit INT, p_offset INT)
RETURNS TABLE (
  id UUID,
  status TEXT,
  pickup_address TEXT,
  dropoff_address TEXT,
  fare_amount NUMERIC,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ...

-- get_merchant_orders: Restaurant order queue  
CREATE FUNCTION get_merchant_orders(p_restaurant_id UUID, p_status TEXT, p_limit INT)
RETURNS TABLE (
  id UUID,
  status TEXT,
  customer_name TEXT,
  items_count INT,
  total_amount NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ...

-- get_order_tracking_public: Public tracking by code
CREATE FUNCTION get_order_tracking_public(p_tracking_code TEXT)
RETURNS TABLE (
  order_id UUID,
  status TEXT,
  restaurant_name TEXT,
  driver_name TEXT,
  driver_lat NUMERIC,
  driver_lng NUMERIC,
  eta_minutes INT,
  updated_at TIMESTAMPTZ
) ...
```

---

### B) Push Notification Infrastructure

Consolidate and enhance push notification system.

**B1. Unify Token Storage**

Consolidate `push_tokens` and `device_tokens` tables. Add `tenant_id` to device_tokens.

```sql
ALTER TABLE device_tokens 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

CREATE INDEX idx_device_tokens_tenant ON device_tokens(tenant_id);
```

**B2. Create Register Token Edge Function**

New edge function: `register-push-token`

```typescript
// supabase/functions/register-push-token/index.ts
// Accepts: { token, platform, device_name, app_version }
// Upserts into device_tokens with user_id from auth
```

**B3. Create Unified Send Push Function**

Enhance existing `send-push-notification` to:
- Support batch sending to multiple users
- Include notification logging
- Handle tenant-scoped notifications

**B4. Push Notification Triggers**

Create database triggers or call from edge functions when:

| Event | Notification Type | Recipients |
|-------|------------------|------------|
| Order created | `new_order` | Restaurant owner |
| Order assigned | `order_assigned` | Driver |
| Order picked up | `order_picked_up` | Customer |
| Order delivered | `order_delivered` | Customer + Admin |
| Trip requested | `new_trip` | Nearby drivers |
| Trip accepted | `trip_accepted` | Rider |
| High-risk event | `security_alert` | Admin |

---

### C) Background Location (Driver)

**C1. Update Location Tracking Hook**

Enhance `useDriverLocationTracking` in `useDriverApp.ts`:

```typescript
// Add configurable interval (default 15s)
// Add distance-based throttling (ignore if < 20m and < 10s)
// Add battery-aware mode for Capacitor
```

**C2. Location Throttling in Edge Function**

The existing `update-driver-location` function already has throttling logic. Add explicit distance check:

```sql
-- Skip update if:
-- distance < 20 meters AND time_since_last < 10 seconds
```

**C3. Driver Location History Index**

```sql
CREATE INDEX idx_driver_location_recent 
ON driver_location_history(driver_id, recorded_at DESC);
```

---

### D) Offline-Safe Updates

**D1. Enhance useNetworkStatus Hook**

Add persistent localStorage queue:

```typescript
// src/hooks/useOfflineQueue.ts
interface OfflineAction {
  id: string;
  type: 'update_order_status' | 'update_trip_status' | 'location_update';
  payload: Record<string, any>;
  created_at: string;
  synced: boolean;
}

// Queue persists to localStorage
// Sync on reconnect with idempotency checks
```

**D2. Idempotent Status Updates**

Add to order/trip status update functions:

```sql
-- Only update if transition is valid and not already in target state
UPDATE food_orders 
SET status = p_new_status, updated_at = NOW()
WHERE id = p_order_id 
  AND status != p_new_status
  AND updated_at < p_client_timestamp;
```

**D3. Create Sync Edge Function**

```typescript
// supabase/functions/sync-offline-actions/index.ts
// Accepts array of queued actions
// Processes each with idempotency
// Returns success/failure for each
```

---

### E) Navigation Integration

**E1. Navigation Buttons Component**

```typescript
// src/components/driver/NavigationButtons.tsx
// Props: pickupLat, pickupLng, dropoffLat, dropoffLng, tripStatus
// Shows "Navigate to Pickup" or "Navigate to Dropoff" based on status
// Uses existing openNativeNavigation() utility
```

**E2. Integrate into Driver Trip View**

Add navigation buttons to:
- `src/pages/driver/DriverTripsPage.tsx`
- Active trip card component

---

### F) Mobile Performance Optimizations

**F1. Reduce Polling with Realtime**

Already implemented via `RealtimeSyncContext`. Add subscriptions for:
- `notifications` table changes
- `device_tokens` status

**F2. Lazy Loading**

Add intersection observer for:
- Order lists in merchant dashboard
- Menu item images

**F3. Enhanced Skeleton Loaders**

Create specialized skeletons:

```typescript
// src/components/mobile/OrderCardSkeleton.tsx
// src/components/mobile/DriverStatsSkeleton.tsx
// src/components/mobile/TripListSkeleton.tsx
```

**F4. Retry Logic**

Add exponential backoff to critical API calls in hooks.

---

### G) App Settings Table

```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- Default settings
INSERT INTO app_settings (tenant_id, key, value) VALUES
(NULL, 'location_update_interval', '15000'),
(NULL, 'push_enabled', 'true'),
(NULL, 'offline_mode_enabled', 'true');

-- RLS
CREATE POLICY "Admins can manage app_settings"
ON app_settings FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can read app_settings"
ON app_settings FOR SELECT TO authenticated USING (true);
```

**Create useAppSettings hook:**

```typescript
// src/hooks/useAppSettings.ts
// Fetches settings with caching
// Returns { locationInterval, pushEnabled, offlineModeEnabled }
```

---

### H) Dispatch Devices Management

**H1. New Route: `/dispatch/devices`**

Create `src/pages/dispatch/DispatchDevices.tsx`:

| Column | Description |
|--------|-------------|
| User | Profile name + email |
| Platform | iOS / Android / Web badge |
| Last Seen | Relative timestamp |
| Token Active | Status indicator |
| Actions | Revoke, Send Test Push |

**H2. Device Management Hooks**

```typescript
// src/hooks/useDeviceManagement.ts
// useDeviceTokens(tenantId) - list all tokens
// useRevokeToken() - mark token inactive
// useSendTestPush() - send test notification
```

---

### I) Security (RLS Policies)

**Device Tokens:**
```sql
-- Users manage own tokens
CREATE POLICY "Users can manage own device_tokens"
ON device_tokens FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Admins read tenant-wide
CREATE POLICY "Admins can read tenant device_tokens"
ON device_tokens FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);
```

**App Settings:**
```sql
-- Already included in section G
```

---

## Files to Create/Modify

| Type | File | Description |
|------|------|-------------|
| Migration | `supabase/migrations/xxx_mobile_readiness.sql` | RPC functions, app_settings table, RLS policies |
| Edge Function | `supabase/functions/register-push-token/index.ts` | Token registration |
| Edge Function | `supabase/functions/sync-offline-actions/index.ts` | Offline action sync |
| Hook | `src/hooks/useOfflineQueue.ts` | Persistent offline queue |
| Hook | `src/hooks/useAppSettings.ts` | App settings access |
| Hook | `src/hooks/useDeviceManagement.ts` | Admin device management |
| Component | `src/components/driver/NavigationButtons.tsx` | Map navigation buttons |
| Component | `src/components/mobile/OrderCardSkeleton.tsx` | Loading skeleton |
| Component | `src/components/mobile/TripListSkeleton.tsx` | Loading skeleton |
| Page | `src/pages/dispatch/DispatchDevices.tsx` | Device management UI |
| Update | `src/hooks/useDriverApp.ts` | Enhanced location tracking |
| Update | `src/App.tsx` | Add /dispatch/devices route |

---

## Summary of Deliverables

| Deliverable | Status |
|-------------|--------|
| Push notification infrastructure | Enhanced (consolidate tokens, triggers) |
| Mobile-ready APIs | New RPC functions with pagination |
| Background location updates | Enhanced throttling + battery awareness |
| Offline-safe action handling | New queue hook + sync function |
| Navigation links for drivers | New component with platform detection |
| Device/token management screen | New admin page |
| App settings configuration | New table + hook |
| Performance optimizations | Skeleton loaders, lazy loading, realtime |

---

## Technical Notes

- All RPC functions include `updated_at` for client-side sync logic
- Push notifications use existing FCM/APNs infrastructure
- Offline queue persists to localStorage and syncs on reconnect
- Navigation uses platform-specific deep links (Apple Maps on iOS, Google Maps on Android)
- Device management is tenant-scoped for multi-tenant support
