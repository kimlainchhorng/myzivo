
# ZIVO Anti-Fraud System (Supabase)

## Overview

Implement a comprehensive anti-fraud system with server-side rate limiting, GPS spoof detection, risk scoring, auto-blocks, and audit logging for admin review. This builds on the existing `security_events`, `fraud_assessments`, and `user_fraud_profiles` tables.

---

## Current Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| `security_events` table | ✅ Exists | Logs security events with severity, IP, device fingerprint |
| `fraud_assessments` table | ✅ Exists | Order-level fraud scoring with signals |
| `user_fraud_profiles` table | ✅ Exists | Tracks lifetime risk, chargebacks, blocked status |
| `rate-limiter` edge function | ✅ Exists | In-memory rate limiting for searches (not DB-backed) |
| `assess-fraud` edge function | ✅ Exists | Order fraud scoring with 10+ signals |
| `driver_location_history` | ✅ Exists | Missing GPS spoof detection fields |
| User/driver limits tables | ❌ Missing | Need `user_limits` and `driver_limits` |
| GPS spoof detection | ❌ Missing | Need edge function + table columns |

---

## Database Changes

### 1. New Tables

**`risk_events`** - Consolidated abuse/risk events
```sql
CREATE TABLE risk_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  driver_id uuid REFERENCES drivers(id),
  event_type text NOT NULL,
  severity int NOT NULL DEFAULT 1,  -- 1=low, 5=critical
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  device_fingerprint text,
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz DEFAULT now()
);
```

**`user_limits`** - Customer rate limits (orders/cancels)
```sql
CREATE TABLE user_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  orders_created_today int DEFAULT 0,
  cancels_today int DEFAULT 0,
  last_reset date DEFAULT current_date,
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,
  block_reason text,
  total_blocks int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**`driver_limits`** - Driver rate limits (cancels/suspicious activity)
```sql
CREATE TABLE driver_limits (
  driver_id uuid PRIMARY KEY REFERENCES drivers(id),
  cancels_today int DEFAULT 0,
  gps_flags_today int DEFAULT 0,
  last_reset date DEFAULT current_date,
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,
  block_reason text,
  total_blocks int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Alter `driver_location_history` for GPS Spoof Detection

```sql
ALTER TABLE driver_location_history
ADD COLUMN prev_lat double precision,
ADD COLUMN prev_lng double precision,
ADD COLUMN prev_recorded_at timestamptz,
ADD COLUMN is_suspicious boolean DEFAULT false,
ADD COLUMN speed_mph double precision,
ADD COLUMN distance_jump_miles double precision;
```

### 3. RLS Policies

- `risk_events`: Admin-only SELECT, service-role INSERT
- `user_limits`: Edge function controlled (no direct access)
- `driver_limits`: Edge function controlled (no direct access)

---

## Edge Functions

### 1. `check-rate-limit` (Enhanced)

Handles customer order/cancel rate limiting with DB persistence.

```
Path: supabase/functions/check-rate-limit/index.ts
```

**Flow:**
```text
Request → Auth check → Load/init user_limits row
    → Reset daily counters if new day
    → Check if blocked
    → Increment action counter
    → Check thresholds (30 orders/day, 8 cancels/day)
    → If exceeded: block for 6 hours, log risk_event
    → Return { ok, blocked, blocked_until }
```

**Thresholds:**
| Action | Daily Limit | Block Duration |
|--------|-------------|----------------|
| create_order | 30 | 6 hours |
| cancel_order | 8 | 6 hours |

### 2. `check-driver-rate-limit` (New)

Handles driver-side cancel limits.

**Thresholds:**
| Action | Daily Limit | Block Duration |
|--------|-------------|----------------|
| cancel_trip | 5 | 4 hours |
| gps_suspicious | 10 | 24 hours (auto-suspend) |

### 3. `update-driver-location` (New)

GPS spoof detection with impossible speed/jump detection.

```
Path: supabase/functions/update-driver-location/index.ts
```

**Detection Rules:**
| Rule | Threshold | Severity |
|------|-----------|----------|
| Speed > 120 mph | Flag suspicious | 3 |
| Jump > 2 miles in < 10 seconds | Flag suspicious | 4 |
| Accuracy > 100m repeatedly | Flag suspicious | 2 |

**Flow:**
```text
Request { lat, lng, heading, speed, accuracy }
    → Auth check → Get driver
    → Load previous location
    → Calculate distance (Haversine) and time delta
    → Check speed: distance / time_hours > 120 mph?
    → Check jump: distance > 2 miles && time < 10 seconds?
    → Upsert location with prev_* fields and is_suspicious flag
    → If suspicious: insert risk_event
    → If gps_flags_today >= 5: auto-suspend driver
    → Return { ok, suspicious }
```

### 4. `auto-suspend-driver` (New - optional cron or trigger)

Runs on GPS suspicious events to auto-suspend repeat offenders.

```sql
-- When gps_suspicious count >= 5 in 1 hour:
UPDATE drivers SET is_suspended = true 
WHERE id = driver_id;

INSERT INTO risk_events (driver_id, event_type, severity, details)
VALUES (driver_id, 'auto_suspended', 5, { reason: 'gps_spoof_repeat' });
```

---

## Client-Side Integration

### 1. Update `useDriverApp.ts` Location Hook

Replace direct DB update with edge function call:

```typescript
// Before (current)
const success = await updateLocationWithRetry(driverId, lat, lng);

// After (with GPS check)
const result = await supabase.functions.invoke("update-driver-location", {
  body: { lat, lng, heading, speed, accuracy }
});

if (result.data?.suspended) {
  toast.error("Account suspended", { description: "Contact support." });
  // Navigate to suspended screen
}
```

### 2. Add Rate Limit Checks to Booking Flows

**Before creating order:**
```typescript
const limitCheck = await supabase.functions.invoke("check-rate-limit", {
  body: { action: "create_order" }
});

if (!limitCheck.data?.ok) {
  toast.error("Booking limit reached", {
    description: `Try again ${formatDistanceToNow(limitCheck.data?.blocked_until)}`
  });
  return;
}
```

**Before canceling order:**
```typescript
const limitCheck = await supabase.functions.invoke("check-rate-limit", {
  body: { action: "cancel_order" }
});

if (!limitCheck.data?.ok) {
  toast.error("Cancellation limit reached", {
    description: "Too many cancellations today."
  });
  return;
}
```

---

## Admin Dashboard Components

### 1. Risk Events Panel

View and resolve risk events with filtering:
- Filter by: event_type, severity, user/driver, date range
- Actions: Resolve, Escalate, Block user/driver

### 2. Suspended Accounts List

View blocked users/drivers with:
- Block reason and duration
- Quick actions: Unblock, Extend block, Review history

### 3. GPS Anomaly Map (optional)

Visualize suspicious driver locations on a map.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| Migration SQL | Create | New tables + ALTER for location history |
| `supabase/functions/check-rate-limit/index.ts` | Modify | DB-backed user limits |
| `supabase/functions/check-driver-rate-limit/index.ts` | Create | Driver limit checking |
| `supabase/functions/update-driver-location/index.ts` | Create | GPS spoof detection |
| `supabase/config.toml` | Modify | Add new function configs |
| `src/lib/supabaseDriverOperations.ts` | Modify | Call edge function for location |
| `src/hooks/useDriverApp.ts` | Modify | Handle suspended state |
| `src/lib/security/rateLimiter.ts` | Modify | Add order/cancel actions |
| `src/components/admin/AdminRiskEvents.tsx` | Create | Risk events panel |
| `src/components/admin/AdminSuspendedAccounts.tsx` | Create | Suspended accounts list |

---

## Technical Details

### Haversine Distance Function (Edge Function)
```typescript
function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + 
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

### Auto-Suspend Trigger (Database Function)
```sql
CREATE OR REPLACE FUNCTION check_gps_spoof_threshold()
RETURNS trigger AS $$
DECLARE
  recent_flags INTEGER;
BEGIN
  IF NEW.event_type = 'gps_suspicious' THEN
    SELECT COUNT(*) INTO recent_flags
    FROM risk_events
    WHERE driver_id = NEW.driver_id
      AND event_type = 'gps_suspicious'
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_flags >= 5 THEN
      UPDATE drivers SET is_suspended = true WHERE id = NEW.driver_id;
      
      INSERT INTO driver_limits (driver_id, is_blocked, blocked_until, block_reason)
      VALUES (NEW.driver_id, true, NOW() + INTERVAL '24 hours', 'GPS spoof auto-suspend')
      ON CONFLICT (driver_id) DO UPDATE SET
        is_blocked = true,
        blocked_until = NOW() + INTERVAL '24 hours',
        block_reason = 'GPS spoof auto-suspend',
        total_blocks = driver_limits.total_blocks + 1;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Benefits

1. **Order Spam Prevention** - Blocks excessive order creation (30/day limit)
2. **Cancel Abuse Prevention** - Limits cancellations (8/day for users, 5/day for drivers)
3. **GPS Spoof Detection** - Flags impossible movement patterns (>120 mph, >2 mile jumps)
4. **Auto Blocks** - Temporary lockouts (6-24 hours) for abusers
5. **Audit Trail** - All risk events logged for admin review with full context
6. **Existing Integration** - Builds on current `security_events` and `fraud_assessments` tables
