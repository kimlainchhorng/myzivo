
# ZIVO Driver App — Native MVP Implementation Plan

## Overview
Transform the current web-based Driver App into a production-ready native iOS + Android application using Capacitor, with real-time job dispatch, GPS tracking, push notifications, and full Ride / Eats / Move service support.

---

## Current State Analysis

The existing Driver App (`/driver`) provides:
- Basic driver dashboard with online/offline toggle
- Real-time trip subscriptions via Supabase Postgres Changes
- Manual trip acceptance for ride requests
- Location tracking via browser Geolocation API
- Earnings summary (today/week)
- Active trip panel with map and status flow

**Missing for native MVP:**
- Capacitor native wrapper for iOS/Android
- Service type filtering (Rides/Eats/Move toggles)
- Real-time job dispatch with countdown timer
- Background GPS tracking
- Native push notifications (APNs/FCM)
- Proof of delivery (photo/signature)
- Offline resilience and state persistence
- Complete Eats and Move job flows
- Native navigation handoff

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ZIVO Driver App (Capacitor)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │   Rides   │  │   Eats    │  │   Move    │  │ Earnings  │    │
│  │  Module   │  │  Module   │  │  Module   │  │  Module   │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
│        │              │              │              │           │
│  ┌─────┴──────────────┴──────────────┴──────────────┴─────┐    │
│  │              Unified Job Dispatch Engine               │    │
│  │         (Real-time + Countdown + Auto-decline)         │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │                  Capacitor Native Layer                │     │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────┐   │     │
│  │  │ Geolocation│ │Push Notify │ │ Camera/Signature │   │     │
│  │  │ Background │ │ APNs/FCM   │ │ Proof of Delivery│   │     │
│  │  └────────────┘ └────────────┘ └──────────────────┘   │     │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Capacitor Native Setup

### 1.1 Install Capacitor Dependencies
Install core packages and native plugins:
- `@capacitor/core`, `@capacitor/cli`
- `@capacitor/ios`, `@capacitor/android`
- `@capacitor/geolocation` (foreground + background)
- `@capacitor/push-notifications`
- `@capacitor/camera`
- `@capacitor/preferences` (state persistence)
- `@capacitor/app` (lifecycle management)
- `@capacitor/network` (connectivity detection)

### 1.2 Create Capacitor Config
Create `capacitor.config.ts`:
- App ID: `app.lovable.72f993409c9f453aacff60e5a9b25774`
- App Name: `ZIVO Driver`
- Server URL for hot-reload during development
- Plugin configurations for background location

### 1.3 Native Navigation Helper
Create utility to open Apple Maps (iOS) or Google Maps (Android):

```typescript
// src/utils/nativeNavigation.ts
import { Capacitor } from '@capacitor/core';

export const openNativeNavigation = (lat: number, lng: number) => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') {
    window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`);
  } else {
    window.open(`google.navigation:q=${lat},${lng}`);
  }
};
```

---

## Phase 2: Database Schema Updates

### 2.1 Add Service Type Toggle Columns to Drivers Table

```sql
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS rides_enabled boolean DEFAULT true;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS eats_enabled boolean DEFAULT true;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS move_enabled boolean DEFAULT true;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS fcm_token text;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS apns_token text;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS device_platform text;
```

### 2.2 Add Service Type to Trips Table

```sql
ALTER TABLE trips ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'ride';
-- Values: 'ride', 'eats', 'move'
```

### 2.3 Add Proof of Delivery Fields to Food Orders

```sql
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS delivery_photo_url text;
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS delivery_pin text;
ALTER TABLE food_orders ADD COLUMN IF NOT EXISTS delivery_pin_verified boolean DEFAULT false;
```

### 2.4 Create Package Deliveries Table (for Move)

```sql
CREATE TABLE IF NOT EXISTS package_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id),
  customer_id uuid,
  customer_name text,
  customer_phone text,
  pickup_address text NOT NULL,
  pickup_lat double precision NOT NULL,
  pickup_lng double precision NOT NULL,
  dropoff_address text NOT NULL,
  dropoff_lat double precision NOT NULL,
  dropoff_lng double precision NOT NULL,
  package_size text,
  package_weight decimal,
  package_contents text,
  delivery_speed text DEFAULT 'standard',
  estimated_payout decimal,
  status text DEFAULT 'requested',
  pickup_photo_url text,
  delivery_photo_url text,
  signature_url text,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz
);
```

---

## Phase 3: State Persistence Layer

### 3.1 Driver State Manager Hook

Create `src/hooks/useDriverState.ts`:
- Persist `is_online` to Capacitor Preferences
- Persist active job ID and type
- Auto-restore state on app launch
- Sync with database on reconnection

### 3.2 Offline Queue Manager

Create `src/hooks/useOfflineQueue.ts`:
- Queue status updates when offline
- Sync queue when connection restored
- Show pending actions indicator

---

## Phase 4: Real-Time Job Dispatch System

### 4.1 Unified Job Request Hook

Create `src/hooks/useJobDispatch.ts`:

```typescript
type JobType = 'ride' | 'eats' | 'move';

interface IncomingJob {
  id: string;
  type: JobType;
  pickup: { lat: number; lng: number; address: string };
  dropoff: { lat: number; lng: number; address: string };
  estimatedPayout: number;
  distanceToPickup: number; // miles
  expiresAt: Date;
}
```

Features:
- Subscribe to `trips` (status=requested, driver_id=null)
- Subscribe to `food_orders` (status=ready_for_pickup, driver_id=null)
- Subscribe to `package_deliveries` (status=requested, driver_id=null)
- Filter by enabled service types
- Calculate distance from driver location
- Auto-decline after 30s countdown

### 4.2 Job Request Modal Component

Create `src/components/driver/JobRequestModal.tsx`:
- Service type badge (Ride/Eats/Move with distinct colors)
- Pickup address + distance
- Estimated payout
- Circular countdown timer (30 seconds)
- Accept / Decline buttons
- Sound notification on arrival
- Haptic feedback (native)

### 4.3 Real-Time Subscription Updates

Modify `src/hooks/useTripRealtime.ts`:
- Add filter for service_type
- Add subscription for food_orders for delivery
- Add subscription for package_deliveries

---

## Phase 5: Service-Specific Job Flows

### 5.1 Ride Flow (Existing, Enhanced)
Status progression:
1. `accepted` → Navigate to pickup
2. `en_route` → Heading to pickup
3. `arrived` → Waiting for rider
4. `in_progress` → Navigate to dropoff
5. `completed` → Trip done

### 5.2 Eats Delivery Flow

Create `src/components/driver/EatsDeliveryPanel.tsx`:

Status progression:
1. `accepted` → Navigate to restaurant
2. `at_restaurant` → Mark arrived, wait for food
3. `picked_up` → Navigate to customer
4. `arrived_customer` → At delivery location
5. `delivered` → Require photo OR PIN verification

Proof of delivery:
- Photo capture using Capacitor Camera
- OR 4-digit PIN entry (customer provides)

### 5.3 Move Package Flow

Create `src/components/driver/MoveDeliveryPanel.tsx`:

Status progression:
1. `accepted` → Navigate to pickup
2. `at_pickup` → Take photo of package
3. `picked_up` → Navigate to dropoff
4. `at_dropoff` → Delivery location
5. `delivered` → Photo + optional signature

Proof of delivery:
- Delivery photo (required)
- Signature capture (optional, using canvas)

---

## Phase 6: GPS & Location Tracking

### 6.1 Capacitor Geolocation Service

Create `src/services/LocationService.ts`:

```typescript
import { Geolocation } from '@capacitor/geolocation';

class LocationService {
  private watchId: string | null = null;
  
  async requestPermissions(): Promise<boolean>;
  async startTracking(callback: (lat, lng) => void): Promise<void>;
  async stopTracking(): Promise<void>;
  async getCurrentPosition(): Promise<{lat, lng}>;
}
```

### 6.2 Background Location Configuration

Configure in `capacitor.config.ts`:

```typescript
plugins: {
  Geolocation: {
    requestPermissions: true,
    backgroundModeEnabled: true,
    backgroundModeMessage: "ZIVO is tracking your location for active jobs"
  }
}
```

### 6.3 Location Tracking Rules
- Track ONLY when: `is_online = true` OR during active job
- Update frequency: every 10 seconds during active job
- Battery optimization: reduce frequency when stationary

---

## Phase 7: Push Notifications

### 7.1 Notification Service

Create `src/services/PushNotificationService.ts`:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

class PushNotificationService {
  async register(): Promise<string>; // Returns FCM/APNs token
  async saveToken(driverId: string, token: string, platform: string): Promise<void>;
  setupListeners(): void;
}
```

### 7.2 Edge Function for Sending Notifications

Create `supabase/functions/send-driver-notification/index.ts`:
- Accept driver_id, title, body, data
- Fetch driver's FCM/APNs token
- Send via Firebase Admin SDK

### 7.3 Notification Triggers

Trigger notifications for:
| Event | Title | Body |
|-------|-------|------|
| New job request | "New [Type] Request" | "[Address] - $X.XX" |
| Job cancelled | "Job Cancelled" | "The customer cancelled" |
| Job completed | "Job Completed!" | "You earned $X.XX" |
| Payout processed | "Payout Sent" | "$X.XX sent to your account" |
| Support message | "New Message" | Preview of message |

### 7.4 Database Trigger for Notifications

Create Postgres trigger to call edge function on:
- New trip/order/delivery created (for available drivers)
- Status changes (cancelled, completed)
- Payout status changes

---

## Phase 8: Earnings & Payouts

### 8.1 Enhanced Earnings Hook

Update `src/hooks/useDriverEarnings.ts`:

```typescript
interface DriverEarnings {
  today: number;
  week: number;
  month: number;
  pending: number;
  tripsByType: { ride: number; eats: number; move: number };
  completedJobs: Job[];
}
```

### 8.2 Earnings Dashboard Tab

Create `src/components/driver/DriverEarningsTab.tsx`:
- Today / This Week / This Month cards
- Service type breakdown
- Completed jobs list with:
  - Job ID (short format)
  - Service type badge
  - Date/time
  - Amount earned

### 8.3 Payout History Tab

Create `src/components/driver/DriverPayoutsTab.tsx`:
- Pending balance card
- Payout history list
- Status badges (Pending/Processing/Completed)
- Request instant payout button (if enabled)

---

## Phase 9: Error Handling & Resilience

### 9.1 Network Status Hook

Create `src/hooks/useNetworkStatus.ts`:
- Subscribe to Network plugin events
- Show banner when offline
- Queue actions when offline
- Retry failed requests on reconnection

### 9.2 Permission Denied Handling
- Location: Show modal with settings link
- Notifications: Show banner with enable option
- Camera: Graceful fallback with file picker

### 9.3 App Lifecycle Handling

Handle app backgrounding/foregrounding:
- Save active job state before background
- Restore job UI on foreground
- Continue location tracking in background

### 9.4 App Killed Recovery
- On app launch, check for active job in database
- Restore to active job panel if found
- Show missed job notification if job was auto-cancelled

---

## Phase 10: Admin Dashboard Enhancements

### 10.1 Driver Service Toggles

Add to `AdminDriversModule.tsx`:
- Toggle columns for Rides/Eats/Move enabled
- Bulk enable/disable actions

### 10.2 Job Type Filtering

Add to admin trip/order monitoring:
- Filter by service type
- Service type badges in lists

### 10.3 Push Notification Logs

Create admin view for:
- Sent notifications
- Delivery status
- Failed notifications

---

## File Structure Summary

```text
src/
├── services/
│   ├── LocationService.ts
│   └── PushNotificationService.ts
├── hooks/
│   ├── useDriverState.ts
│   ├── useJobDispatch.ts
│   ├── useOfflineQueue.ts
│   └── useNetworkStatus.ts
├── components/driver/
│   ├── JobRequestModal.tsx
│   ├── EatsDeliveryPanel.tsx
│   ├── MoveDeliveryPanel.tsx
│   ├── ProofOfDelivery.tsx
│   ├── SignatureCapture.tsx
│   ├── DriverEarningsTab.tsx
│   └── DriverPayoutsTab.tsx
├── pages/
│   └── DriverApp.tsx (enhanced)
└── utils/
    └── nativeNavigation.ts

supabase/
├── functions/
│   └── send-driver-notification/
│       └── index.ts
└── migrations/
    └── [timestamp]_driver_native_mvp.sql

capacitor.config.ts
```

---

## Native Build Instructions

After implementation, developers will:

1. Export to GitHub
2. `npm install` all dependencies
3. `npx cap add ios` and/or `npx cap add android`
4. `npm run build`
5. `npx cap sync`
6. Open in Xcode/Android Studio
7. Configure signing and push notification certificates
8. Build and distribute via TestFlight/Play Console Internal

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Persistence | Capacitor Preferences | Native, no extra dependencies |
| Real-time | Supabase Postgres Changes | Already integrated, works well |
| Push Notifications | FCM + APNs via Edge Function | Industry standard, reliable |
| Background Location | Capacitor Geolocation | Cross-platform, configurable |
| Signature Capture | HTML Canvas | Simple, no extra dependency |
| Job Countdown | Client-side timer | Immediate UX, server validates |

---

## Estimated Deliverables

| Component | Description |
|-----------|-------------|
| Capacitor Setup | Config, plugins, native projects |
| Database Migration | Service types, proof of delivery fields |
| Job Dispatch System | Real-time multi-service dispatch |
| Service Flow Panels | Ride/Eats/Move specific UIs |
| Proof of Delivery | Photo capture + signature |
| Push Notifications | FCM/APNs integration |
| Earnings Dashboard | Enhanced with job history |
| Error Handling | Offline mode, recovery |
| Admin Updates | Service toggles, notification logs |

---

## Post-Implementation: Build Distribution

- **iOS**: Configure APNs certificates, TestFlight distribution
- **Android**: Configure Firebase project, Play Console internal testing
- **Documentation**: README with build steps for each platform
