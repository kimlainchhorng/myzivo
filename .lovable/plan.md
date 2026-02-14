

# Multi-Account Device Detection on Customer App Start

## Overview
When a customer logs in and lands on the app, automatically link their device and check for multi-account abuse. This involves creating three new database RPCs and a React hook that fires once after authentication.

## What gets built

### 1. Database Migration (SQL)

Three new RPC functions:

- **`link_user_device(p_device_id text, p_role text)`**
  - Upserts into a new `user_devices` table: `(user_id, device_id, role, last_seen_at)`
  - Uses `auth.uid()` for the user ID
  - Updates `last_seen_at` on conflict

- **`check_multi_account(p_device_id text, p_role text, p_max_users int, p_days int)`**
  - Counts distinct `user_id` values linked to this `device_id` + `role` within the last `p_days` days
  - Returns a JSON object: `{ flagged: boolean, user_count: int, threshold: int }`

- **`log_risk_event(p_role text, p_event_type text, p_details jsonb)`**
  - Inserts into the existing `user_fraud_profiles` or a new `risk_events` table
  - Records `user_id` (from `auth.uid()`), role, event type, device info, and timestamp

New table: **`user_devices`**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users)
  - `device_id` (text)
  - `role` (text) -- 'customer' or 'driver'
  - `last_seen_at` (timestamptz)
  - `created_at` (timestamptz)
  - Unique constraint on `(user_id, device_id, role)`
  - RLS: users can only read/write their own rows

New table: **`risk_events`**
  - `id` (uuid, PK)
  - `user_id` (uuid)
  - `role` (text)
  - `event_type` (text) -- e.g. 'multi_account'
  - `details` (jsonb)
  - `created_at` (timestamptz)
  - RLS: insert-only for authenticated users (own rows), select for admins

### 2. New Hook: `useDeviceIntegrityCheck`

File: `src/hooks/useDeviceIntegrityCheck.ts`

- Runs once when `user` is available (via `useAuth`)
- Reuses `getOrCreateDeviceId()` from `useMobileApp.ts` (extract to shared util)
- Calls `link_user_device(device_id, 'customer')`
- Calls `check_multi_account(device_id, 'customer', 3, 30)`
- If `flagged === true`, calls `log_risk_event('customer', 'multi_account', { device_id, user_count })`
- Uses a ref to ensure it only runs once per session
- Logs warnings to console; does not block the user (silent detection)

### 3. Extract `getOrCreateDeviceId` to shared utility

Move from `src/hooks/useMobileApp.ts` to `src/lib/deviceId.ts` so both `useMobileApp` and `useDeviceIntegrityCheck` can import it.

### 4. Wire into AppHome

Add `useDeviceIntegrityCheck()` call in `src/pages/app/AppHome.tsx` so it fires when the customer app loads after login.

## Technical Details

```text
Login -> AppHome mounts
  -> useDeviceIntegrityCheck()
     -> getOrCreateDeviceId()  // from localStorage
     -> RPC link_user_device(device_id, 'customer')
     -> RPC check_multi_account(device_id, 'customer', 3, 30)
     -> if flagged:
          RPC log_risk_event('customer', 'multi_account', {...})
```

## Files Changed
| File | Action |
|------|--------|
| `supabase/migrations/...` | New: tables + RPCs |
| `src/lib/deviceId.ts` | New: shared `getOrCreateDeviceId` |
| `src/hooks/useMobileApp.ts` | Edit: import from shared util |
| `src/hooks/useDeviceIntegrityCheck.ts` | New: the integrity check hook |
| `src/pages/app/AppHome.tsx` | Edit: add hook call |
| `src/integrations/supabase/types.ts` | Auto-updated with new types |

