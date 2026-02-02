

# Public Launch System (Beta → Live) Implementation Plan

## Executive Summary

This plan adds a unified launch control system that manages the transition from invite-only beta to full public launch, building on the existing beta launch infrastructure. The system will provide admin controls for launch mode switching, emergency pause, booking caps, and post-launch monitoring.

---

## Current State Analysis

### Existing Infrastructure (Reuse)
- **`beta_launch_status` table**: Already tracks status (`not_ready`, `ready_for_beta`, `beta_live`, `paused`)
- **`AdminBetaLaunchModule`**: Day-by-day checklist for beta preparation
- **`AdminCityLaunchModule`**: City-by-city launch controls with status (`draft`, `ready`, `live`, `paused`)
- **Beta settings hooks**: `useP2PBetaSettings`, `useRenterBetaSettings`
- **`BetaBadge` component**: Shows "Private Beta" in header

### What's Missing
- Global launch mode switch (Beta ↔ Public Live)
- Emergency pause functionality for all bookings
- Daily booking cap per city
- Minimum supply check before launch
- Post-launch monitoring dashboard
- Site-wide announcement banner
- `LaunchSettings` table for these new controls

---

## Database Changes

### New Table: `launch_settings`

```sql
CREATE TABLE launch_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Global Launch Mode
  global_mode TEXT NOT NULL DEFAULT 'beta' CHECK (global_mode IN ('beta', 'live')),
  
  -- Emergency Controls
  emergency_pause BOOLEAN NOT NULL DEFAULT false,
  emergency_pause_reason TEXT,
  emergency_pause_at TIMESTAMPTZ,
  emergency_pause_by UUID REFERENCES auth.users(id),
  
  -- Booking Limits
  daily_booking_limit_per_city INTEGER DEFAULT 20,
  enforce_supply_minimum BOOLEAN DEFAULT true,
  min_owners_for_launch INTEGER DEFAULT 5,
  min_vehicles_for_launch INTEGER DEFAULT 10,
  
  -- Announcements
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT,
  announcement_cities TEXT[], -- Which cities to show announcement for
  
  -- Timestamps
  mode_changed_at TIMESTAMPTZ,
  mode_changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admin only
ALTER TABLE launch_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read launch settings"
  ON launch_settings FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update launch settings"
  ON launch_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Everyone can read for UI display
CREATE POLICY "Anyone can read launch mode"
  ON launch_settings FOR SELECT TO authenticated
  USING (true);

-- Insert initial row
INSERT INTO launch_settings (global_mode, emergency_pause) 
VALUES ('beta', false);
```

### Add Columns to `p2p_launch_cities`

```sql
ALTER TABLE p2p_launch_cities 
ADD COLUMN IF NOT EXISTS daily_booking_limit INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS bookings_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_booking_reset DATE DEFAULT CURRENT_DATE;
```

---

## Files to Create

### 1. `src/types/launchSettings.ts`
TypeScript types for launch configuration.

```typescript
export type GlobalLaunchMode = 'beta' | 'live';

export interface LaunchSettings {
  id: string;
  global_mode: GlobalLaunchMode;
  emergency_pause: boolean;
  emergency_pause_reason: string | null;
  emergency_pause_at: string | null;
  daily_booking_limit_per_city: number;
  enforce_supply_minimum: boolean;
  min_owners_for_launch: number;
  min_vehicles_for_launch: number;
  announcement_enabled: boolean;
  announcement_text: string | null;
  announcement_cities: string[] | null;
  mode_changed_at: string | null;
}
```

### 2. `src/hooks/useLaunchSettings.ts`
React Query hooks for launch settings.

```typescript
// Key exports:
- useLaunchSettings() - Fetch current launch settings (cached, used by UI)
- useUpdateLaunchMode() - Switch between beta/live
- useEmergencyPause() - Enable/disable emergency pause
- useUpdateAnnouncementSettings() - Manage site banner
- useUpdateBookingLimits() - Set daily caps
- useLaunchReadinessCheck() - Validate supply minimums
```

### 3. `src/pages/admin/modules/AdminPublicLaunchModule.tsx`
Main admin module for launch controls (replaces/extends Beta Launch).

**Sections:**
1. **Launch Mode Banner** - Shows current mode (Beta/Live) with large toggle
2. **Emergency Pause Panel** - Big red button with reason input
3. **Supply Readiness** - Shows owners/vehicles per city vs minimums
4. **Booking Limits** - Configure daily caps per city
5. **Announcement Banner** - Enable/configure site-wide banner
6. **Post-Launch Monitoring** - Real-time stats widgets

### 4. `src/components/shared/AnnouncementBanner.tsx`
Site-wide announcement banner component.

```typescript
// Shows when announcement_enabled = true
// Displays: "We're live in [CITY]! 🎉"
// Closeable with localStorage persistence
```

### 5. `src/components/admin/PostLaunchMonitoringPanel.tsx`
Dashboard widgets for post-launch monitoring.

```typescript
// Widgets:
// - New bookings today (per city)
// - Failed payments (24h)
// - Open disputes (count)
// - Pending verifications (owners + renters)
// - Active cars by city
```

---

## Files to Modify

### 1. `src/pages/admin/AdminPanel.tsx`
- Add new nav item: `{ id: "public-launch", label: "Public Launch", icon: Globe }`
- Add module render case for `AdminPublicLaunchModule`

### 2. `src/components/Header.tsx`
- Import and render `AnnouncementBanner` at top when enabled
- Conditionally show `BetaBadge` only in beta mode

### 3. `src/pages/Index.tsx` (Homepage)
- Create conditional hero section based on launch mode:
  - **Beta Mode**: Current hero with flights focus
  - **Live Mode**: P2P-focused hero with "Rent cars from local owners — insurance included."

### 4. `src/hooks/useP2PBooking.ts`
- Add booking limit check before creating booking
- Check `emergency_pause` status before allowing new bookings
- Implement daily limit counter per city

### 5. `src/pages/p2p/P2PVehicleSearch.tsx`
- Filter vehicles to only show from `live` cities
- Show "Coming soon" for non-live cities with email collection

### 6. `src/pages/p2p/P2PVehicleDetail.tsx`
- Block booking when `emergency_pause = true`
- Show warning banner when approaching daily limit

### 7. `src/pages/admin/modules/AdminOverview.tsx`
- Add launch status indicator card
- Add quick link to launch controls

---

## UI/UX Design

### Launch Mode Toggle (Admin)

```
┌─────────────────────────────────────────────┐
│  🚀 Launch Mode                             │
├─────────────────────────────────────────────┤
│                                             │
│   [ PRIVATE BETA ]  ←──→  [ PUBLIC LIVE ]   │
│        ⚫                      ⚪           │
│                                             │
│   Current: Private Beta                     │
│   Switched: Never                           │
│                                             │
│   Pre-launch checklist: 7/7 complete ✓      │
│   Cities ready: 3 of 3 ✓                    │
│   Supply minimum met: Yes ✓                 │
│                                             │
│   [ Switch to Public Live ]                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Emergency Pause Panel

```
┌─────────────────────────────────────────────┐
│  ⚠️ Emergency Controls                      │
├─────────────────────────────────────────────┤
│                                             │
│   Status: ● Normal Operations               │
│                                             │
│   ┌───────────────────────────────────┐     │
│   │      [ 🛑 PAUSE ALL BOOKINGS ]     │     │
│   └───────────────────────────────────┘     │
│                                             │
│   This immediately blocks new bookings.     │
│   Existing trips are not affected.          │
│                                             │
└─────────────────────────────────────────────┘
```

### Post-Launch Monitoring

```
┌──────────────────┬──────────────────┬──────────────────┐
│ 📊 Bookings Today│ 💳 Failed Payments│ ⚠️ Open Disputes │
│       12         │        2         │        1         │
│   +3 vs yesterday│   Investigate →  │   Review →       │
└──────────────────┴──────────────────┴──────────────────┘
┌──────────────────┬──────────────────┬──────────────────┐
│ 📋 Pending       │ 🚗 Active Cars    │ 👥 New Signups   │
│ Verifications    │    by City       │    Today         │
│       5          │  NYC: 23         │   Owners: 4      │
│   owners: 2      │  LA: 18          │   Renters: 12    │
│   renters: 3     │  Miami: 8        │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## Launch Mode Behavior Matrix

| Feature | Beta Mode | Live Mode |
|---------|-----------|-----------|
| Owner signup | Invite-only (beta badge shown) | Open (still requires approval) |
| Renter signup | Waitlist + invite | Open signup |
| Homepage badge | "Private Beta" | None |
| SEO pages | noindex | Indexed |
| City visibility | Only beta cities | Only `live` cities |
| Promo codes | Enabled | Optional |
| Hero text | Travel-focused | "Rent cars from local owners" |

---

## Safety Controls Implementation

### Booking Limit Check

```typescript
// In useP2PBooking.ts - before creating booking
const checkBookingAllowed = async (cityId: string) => {
  // Check emergency pause
  const { data: settings } = await supabase
    .from("launch_settings")
    .select("emergency_pause")
    .single();
    
  if (settings?.emergency_pause) {
    throw new Error("Bookings are temporarily paused. Please try again later.");
  }
  
  // Check daily limit
  const { data: city } = await supabase
    .from("p2p_launch_cities")
    .select("daily_booking_limit, bookings_today")
    .eq("id", cityId)
    .single();
    
  if (city && city.bookings_today >= city.daily_booking_limit) {
    throw new Error("Daily booking limit reached for this city. Please try tomorrow.");
  }
  
  return true;
};
```

### City Coming Soon UI

When user searches in a non-live city:

```
┌─────────────────────────────────────────────┐
│  🚗 Car Sharing Coming Soon to [CITY]!     │
├─────────────────────────────────────────────┤
│                                             │
│  We're expanding! Be the first to know     │
│  when we launch in [CITY].                  │
│                                             │
│  [ your@email.com        ] [ Notify Me ]   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Flow

### Beta → Live Transition

```text
1. Admin opens /admin → "Public Launch" module
2. System checks:
   - Beta checklist 100% complete
   - At least 1 city is "live" status
   - Each live city meets supply minimums
3. If all checks pass:
   - Admin clicks "Switch to Public Live"
   - Confirmation dialog with checklist summary
4. On confirm:
   - Update launch_settings.global_mode = 'live'
   - Record timestamp and admin user
   - Remove beta badges from UI
   - Enable public SEO indexing
   - Show success toast
```

### Emergency Pause Flow

```text
1. Admin clicks "Pause All Bookings"
2. Dialog: "Enter reason for pause"
3. On confirm:
   - Set emergency_pause = true
   - Record reason, timestamp, admin
4. Immediate effects:
   - All new booking attempts blocked
   - Vehicle pages show "Booking temporarily unavailable"
   - Admin sees red "PAUSED" banner
5. Existing active bookings continue normally
6. To resume: Admin clicks "Resume Bookings"
```

---

## Implementation Order

1. **Database migration**: Create `launch_settings` table and update `p2p_launch_cities`
2. **Types and hooks**: Create TypeScript types and React Query hooks
3. **Admin module**: Build `AdminPublicLaunchModule` with all controls
4. **Booking integration**: Add pause and limit checks to booking flow
5. **UI updates**: Announcement banner, conditional hero, city coming soon
6. **Testing**: Manual testing of all flows

---

## Summary

This implementation adds a complete public launch system that:

- ✅ Provides admin-controlled mode switching (Beta → Live)
- ✅ Includes emergency pause for instant booking halt
- ✅ Enforces daily booking caps per city
- ✅ Validates supply minimums before launch
- ✅ Shows site-wide announcements
- ✅ Provides post-launch monitoring dashboard
- ✅ Handles non-live cities gracefully with "Coming Soon"
- ✅ Integrates with existing beta launch infrastructure
- ✅ Maintains stability of existing website and web app

