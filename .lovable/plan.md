

# Safety Center

## Overview
Add a dedicated Safety Center accessible from the ride/delivery trip screen. It will be a bottom-sheet drawer with three core actions: Share Trip (live tracking link), Emergency Call, and Report Issue. The existing safety banner in TripTracker already has a non-functional "Share" button -- this will be wired up to open the new Safety Center instead.

## What Will Be Built

### 1. SafetyCenterSheet Component
A new reusable bottom-sheet (`Drawer`) component at `src/components/rider/SafetyCenterSheet.tsx` with three sections:

- **Share Trip**: Generates a live tracking link (`/track/{tripId}`) and allows sharing via Copy Link, WhatsApp, SMS, or native share. Shows a confirmation toast ("Trip shared with your contact") after sharing.
- **Emergency Call**: Calls 911 (US default) with a single tap. Also shows the existing ZIVO support number option.
- **Report Issue**: Opens the existing rider support flow (`useRiderSupport`) pre-filled with category "safety" and the current trip ID.

### 2. Safety Button on Trip Screen
- Wire the existing "Share" button in the `TripTracker.tsx` safety banner to open the new `SafetyCenterSheet`.
- Add a persistent floating "Safety" shield button visible during active trips for quick access.

### 3. Share Trip Logic
- A new hook `useTripSharing.ts` that:
  - Generates a shareable URL: `{origin}/track/{tripId}`
  - Logs a `share_event` with `entity_type: "trip_share"` using the existing `useShareTracking` hook
  - Supports Copy, WhatsApp, SMS, and native Web Share API
  - Shows a success toast as confirmation notification

### 4. Eats Order Safety
- Add the same Safety button to the Eats order tracking screen (`OrderTrackingPage`) so delivery customers also have access to emergency call and report issue.

## Technical Details

### New Files
- `src/components/rider/SafetyCenterSheet.tsx` -- the drawer UI with Share / Emergency / Report sections
- `src/hooks/useTripSharing.ts` -- generates live tracking links and handles share actions

### Modified Files
- `src/components/rider/TripTracker.tsx` -- wire safety banner "Share" button to open `SafetyCenterSheet`; add floating Safety button during active trips
- `src/pages/track/OrderTrackingPage.tsx` -- add Safety button for Eats delivery orders

### Patterns Followed
- Uses existing `Drawer` (vaul) component consistent with `SocialShareSheet`
- Reuses `useShareTracking` for event logging
- Reuses `useRiderSupport` for issue reporting
- Uses existing `toast` (sonner) for confirmation notifications
- No new database tables or edge functions required -- leverages existing `share_events` table and `/track/:orderId` route
