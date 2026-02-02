
# Remove Driver App Features from ZIVO Codebase

## Overview

Since you have your driver app at **zivo-driver-app.rork.app**, we'll remove the driver-facing application code from this Lovable project while **keeping the admin driver management** capabilities (which manage drivers through the shared Supabase database).

---

## What Gets Removed

### Pages
| File | Reason |
|------|--------|
| `src/pages/DriverApp.tsx` | Full driver app interface (823 lines) |
| `src/pages/DriverRegistration.tsx` | Driver signup form (596 lines) |

### Components
| File | Reason |
|------|--------|
| `src/components/driver/ActiveTripPanel.tsx` | Active trip UI for drivers |
| `src/components/driver/DriverEarningsTab.tsx` | Earnings display for drivers |
| `src/components/driver/DriverPayoutsTab.tsx` | Payout history for drivers |
| `src/components/driver/DriverTripCard.tsx` | Trip cards for driver app |
| `src/components/driver/EatsDeliveryPanel.tsx` | Eats delivery UI |
| `src/components/driver/JobRequestModal.tsx` | Job request popup |
| `src/components/driver/MoveDeliveryPanel.tsx` | Move delivery UI |
| `src/components/driver/ProofOfDelivery.tsx` | Photo/signature capture |
| `src/components/driver/ServiceToggles.tsx` | Service enable/disable toggles |

### Hooks (Driver App-Specific)
| File | Reason |
|------|--------|
| `src/hooks/useDriverApp.ts` | Driver app data hooks |
| `src/hooks/useDriverState.ts` | Persistent driver state (Capacitor Preferences) |
| `src/hooks/useJobDispatch.ts` | Real-time job dispatch |

### Services (Native Mobile)
| File | Reason |
|------|--------|
| `src/services/LocationService.ts` | GPS tracking service |
| `src/services/PushNotificationService.ts` | Push notifications |

---

## What Gets Kept

### Admin Modules (For Backend Management)
- **AdminDriversModule.tsx** - Manage drivers, status, verify documents
- **AdminMoveModule.tsx** - Manage package deliveries  
- **AdminRidesModule.tsx** - Manage ride requests
- **AdminEatsModule.tsx** - Manage food orders

These modules interact with the shared Supabase database, so your Rork driver app will see the same data.

### Shared Hooks (Used by Admin)
- `src/hooks/useDrivers.ts` - Driver CRUD for admin
- `src/hooks/useDriverDocuments.ts` - Document verification
- `src/hooks/useDriverEarnings.ts` - Earnings calculations
- `src/hooks/useOnlineDrivers.ts` - Online driver tracking for admin maps

### Edge Functions
All driver-related edge functions remain since your Rork app uses them:
- `send-driver-notification` - Push notifications
- Payout processing functions

---

## Route Changes

**App.tsx modifications:**
```text
Remove:
- /driver route (DriverApp)
- /drive route (DriverRegistration)

Keep:
- All other routes unchanged
```

---

## Marketing Pages Update

The marketing pages (Rides, Eats, Move) already redirect to external URLs. We'll verify they still point to the correct destination:

| Page | Current Behavior |
|------|-----------------|
| `/rides` | Links to zivodriver.com (update to zivo-driver-app.rork.app) |
| `/eats` | Links to zivodriver.com (update to zivo-driver-app.rork.app) |
| `/move` | Links to zivodriver.com (update to zivo-driver-app.rork.app) |

---

## Cross-App Navigation Update

Update `useCrossAppAuth.ts` to point to your Rork app:

```text
APP_URLS:
  driver: "https://zivo-driver-app.rork.app"  (was zivodriver.lovable.app)
```

---

## Files Summary

| Action | Count | Files |
|--------|-------|-------|
| **Delete** | 13 | DriverApp, DriverRegistration, 9 components, 3 hooks, 2 services |
| **Modify** | 4 | App.tsx (routes), useCrossAppAuth.ts, Rides.tsx, Eats.tsx |
| **Keep** | All | Admin modules, shared hooks, edge functions, database |

---

## Database Impact

**None** - The `drivers` table and all related tables remain unchanged. Your Rork app connects to the same Supabase database.

---

## Testing After Removal

1. Admin panel still loads and shows driver management
2. Ride/Eats/Move marketing pages link to your Rork app
3. Cross-app navigation button points to Rork app
4. No broken imports or 404 errors

