
# Next Update: Complete Driver App Integration

## Overview
This update will fully integrate all the native MVP components into the DriverApp, create the push notification edge function, and enhance the Admin Dashboard for driver service management.

---

## Phase 1: DriverApp.tsx Full Integration

### 1.1 Integrate Native Hooks and Components
Update `src/pages/DriverApp.tsx` to incorporate:

- **useDriverState** for persistent online/service toggles
- **useJobDispatch** for real-time job requests
- **useNetworkStatus** for offline detection
- **LocationService** for GPS tracking

### 1.2 Add JobRequestModal
Display the 30-second countdown modal when new jobs arrive:
- Show for Ride, Eats, or Move requests
- Haptic feedback on arrival
- Sound notification

### 1.3 Add Service Toggles Section
Insert the ServiceToggles component in the main dashboard:
- Allow drivers to enable/disable Rides, Eats, Move
- Persist toggles to database via useDriverState

### 1.4 Add Tabs for Earnings and Payouts
Expand the tab navigation to include:
- **Requests** (existing)
- **History** (existing)
- **Earnings** (DriverEarningsTab)
- **Payouts** (DriverPayoutsTab)

### 1.5 Handle Multi-Service Active Jobs
When a job is accepted, detect the job type and render:
- `ActiveTripPanel` for Rides
- `EatsDeliveryPanel` for Eats
- `MoveDeliveryPanel` for Move

### 1.6 Add Offline Banner
Display a network status banner when offline using useNetworkStatus.

---

## Phase 2: Push Notification Edge Function

### 2.1 Create `send-driver-notification` Edge Function
Create `supabase/functions/send-driver-notification/index.ts`:

```text
Input:
- driver_id: string
- title: string
- body: string
- data: object (optional)

Process:
1. Fetch driver's fcm_token and device_platform from drivers table
2. If FCM token exists, send via Firebase Admin SDK
3. Log notification to driver_notification_logs table
4. Return success/failure status
```

### 2.2 Environment Variables Required
The function will need Firebase credentials:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

A placeholder implementation will be created that logs notifications to the database until Firebase is configured.

---

## Phase 3: Admin Dashboard Enhancements

### 3.1 Update AdminDriversModule.tsx
Add columns for service toggles:
- Rides Enabled (toggle switch)
- Eats Enabled (toggle switch)
- Move Enabled (toggle switch)

Add to driver detail dialog:
- Current service status
- Push notification token status
- Last notification sent

### 3.2 Create Notification Logs Section
Add a collapsible section in driver details showing:
- Recent notifications sent
- Delivery status (pending/sent/failed)
- Timestamp

---

## Phase 4: Assets and Polish

### 4.1 Add Sound File
Create placeholder audio for job requests:
- `/public/sounds/job-request.mp3`

### 4.2 Update capacitor.config.ts
Ensure background mode messages are configured for:
- Location tracking
- Push notification handling

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/DriverApp.tsx` | **Major Update** | Integrate all native hooks, service toggles, job modal, multi-service active panels, tabs |
| `supabase/functions/send-driver-notification/index.ts` | **Create** | Push notification delivery endpoint |
| `src/pages/admin/modules/AdminDriversModule.tsx` | **Update** | Add service toggle columns, notification logs |
| `public/sounds/job-request.mp3` | **Create** | Audio file for job alerts |
| `supabase/config.toml` | **Update** | Register new edge function |
| `.lovable/plan.md` | **Update** | Mark integration complete |

---

## Technical Implementation Notes

### DriverApp Integration Structure

```text
DriverApp.tsx
├── useDriverState (persistent state)
├── useJobDispatch (real-time jobs)
├── useNetworkStatus (offline detection)
├── LocationService (GPS)
│
├── Header (existing)
├── Online/Offline Toggle (existing + service toggles)
├── NetworkStatusBanner (new - shows when offline)
├── ServiceToggles (new)
├── Earnings Summary (existing)
│
├── JobRequestModal (new - appears on incoming job)
│
├── Active Job Panel (conditional)
│   ├── ActiveTripPanel (for rides)
│   ├── EatsDeliveryPanel (for eats)
│   └── MoveDeliveryPanel (for move)
│
└── Tabs (expanded)
    ├── Requests
    ├── History
    ├── Earnings (new)
    └── Payouts (new)
```

### Push Notification Flow

```text
Event Trigger → Database Change
       ↓
Postgres Trigger (future) or Manual Call
       ↓
send-driver-notification Edge Function
       ↓
Fetch driver's FCM/APNs token
       ↓
Send via Firebase Cloud Messaging
       ↓
Log to driver_notification_logs
```

---

## Post-Implementation

After this update:
1. **Test on web**: Verify all components render and integrate correctly
2. **Test job dispatch**: Create test ride/eats/move requests to trigger modal
3. **Build native**: Export to GitHub, run `npx cap sync`, test on device
4. **Configure Firebase**: Add credentials for real push notifications
