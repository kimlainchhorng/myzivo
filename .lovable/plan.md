
# ZIVO Driver App - Connect to Supabase + Realtime Dispatch

## Current State Analysis

**What Already Exists:**
| Component | Status |
|-----------|--------|
| Supabase client | ✅ Hardcoded in `src/integrations/supabase/client.ts` (no env vars needed) |
| `drivers` table | ✅ Full schema with `user_id`, `is_online`, `current_lat/lng`, `rating`, etc. |
| `trips` table | ✅ Full schema with `status`, `driver_id`, `pickup/dropoff`, etc. |
| Driver login | ✅ `DriverLoginPage.tsx` - email/password authentication |
| Driver profile hook | ✅ `useDriverProfile()` - fetches by `user_id` |
| Online toggle | ✅ `useUpdateDriverStatus()` + location tracking |
| Available trips | ✅ `useAvailableTripRequests()` with realtime via `useAvailableTripsRealtime()` |
| Accept trip | ✅ `useAcceptTrip()` - atomic update checking `status=requested` |
| Active trip | ✅ `useDriverActiveTrip()` + `ActiveTripCard` with status buttons |
| Realtime | ✅ Multiple hooks for trips and driver location |
| RLS Policies | ✅ Drivers can update own record, claim unassigned trips, update assigned trips |

**What's Missing/Needs Improvement:**
1. **Signup flow** - Login exists but no signup for new drivers
2. **Driver profile upsert on first login** - Driver must already exist (from admin/drive application)
3. **Account/Setup page** - No `/driver/account` or `/driver/settings` page exists
4. **Demo mode banner** - No warning when Supabase isn't configured
5. **Simulated location warning** - Exists in code but no UI banner
6. **Atomic accept with better error handling** - Already atomic, but could improve race condition feedback

---

## Implementation Plan

### 1. Update Driver Login Page - Add Signup Support

**File:** `src/pages/driver/DriverLoginPage.tsx`

Changes:
- Add toggle between "Sign In" and "Sign Up" modes
- On signup: create auth user, then create driver profile with defaults
- Handle "driver already exists" case gracefully

```text
┌─────────────────────────────────────────┐
│           Login/Signup Flow             │
├─────────────────────────────────────────┤
│ [Sign In] / [Sign Up] tabs              │
│                                         │
│ If Sign Up:                             │
│   1. supabase.auth.signUp(email, pass)  │
│   2. Insert driver row with defaults:   │
│      - full_name: email prefix          │
│      - rating: 4.8                      │
│      - is_online: false                 │
│      - status: 'pending' (needs verify) │
│   3. Navigate to /driver                │
│                                         │
│ If Sign In:                             │
│   1. supabase.auth.signInWithPassword   │
│   2. Check driver exists & is verified  │
│   3. Navigate to /driver                │
└─────────────────────────────────────────┘
```

### 2. Add Driver Auto-Upsert Hook

**File:** `src/hooks/useDriverApp.ts`

Add new hook `useEnsureDriverProfile()`:
- Called on app load when authenticated
- If no driver row for `auth.uid()`, create one with defaults
- Updates existing driver if needed (e.g., sync email)

### 3. Improve Accept Trip - Better Race Condition Handling

**File:** `src/hooks/useDriverApp.ts`

Update `useAcceptTrip()`:
- If update returns no rows (trip already taken), show specific toast
- Add `updatedRows` count check in response

### 4. Add Simulated Location Warning Banner

**File:** `src/components/driver/SimulatedLocationBanner.tsx` (Create)

Create small warning banner:
- Shows "Using simulated location" with icon
- Displayed when geolocation denied or unavailable
- Dismissible

### 5. Update Driver Home Page

**File:** `src/pages/driver/DriverHomePage.tsx`

Changes:
- Add simulated location warning if applicable
- Call `useEnsureDriverProfile()` on mount

### 6. Create Driver Account/Setup Page

**File:** `src/pages/driver/DriverAccountPage.tsx` (Create)

Sections:
1. **Profile Settings** - Edit name, phone, vehicle info
2. **Setup Instructions** - SQL schema, realtime config notes
3. **Account Status** - Verification status, online/offline stats

### 7. Add Route for Driver Account

**File:** `src/App.tsx`

Add new route:
```typescript
<Route path="/driver/account" element={<DriverAccountPage />} />
```

### 8. Create Supabase Configuration Check Utility

**File:** `src/lib/supabaseDriver.ts` (Create)

Utilities:
- `isSupabaseConfigured()` - check if client works
- `upsertDriverProfile()` - create/update driver from auth
- `updateDriverLocation()` - with fallback handling

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/driver/DriverLoginPage.tsx` | Modify | Add signup mode + auto-create driver profile |
| `src/hooks/useDriverApp.ts` | Modify | Add `useEnsureDriverProfile()`, improve accept error handling |
| `src/components/driver/SimulatedLocationBanner.tsx` | Create | Warning banner for simulated location |
| `src/pages/driver/DriverAccountPage.tsx` | Create | Account settings + setup instructions |
| `src/lib/supabaseDriver.ts` | Create | Driver-specific Supabase utilities |
| `src/pages/driver/DriverHomePage.tsx` | Modify | Add simulated location state + banner |
| `src/pages/driver/DriverTripsPage.tsx` | Modify | Add simulated location banner |
| `src/App.tsx` | Modify | Add `/driver/account` route |

---

## Technical Details

### Signup + Auto-Create Driver Profile

```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/driver",
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    // 2. Create driver profile with defaults
    const { error: driverError } = await supabase
      .from("drivers")
      .insert({
        user_id: data.user.id,
        full_name: email.split("@")[0],
        email: email,
        phone: "",
        license_number: "PENDING",
        vehicle_type: "sedan",
        vehicle_plate: "PENDING",
        rating: 4.8,
        is_online: false,
        status: "pending", // Needs admin verification
      });

    if (driverError) {
      // If driver already exists, that's okay
      if (!driverError.message.includes("duplicate")) {
        throw driverError;
      }
    }

    toast.success("Account created! Pending verification.");
    navigate("/driver");
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Improved Accept Trip with Race Condition Handling

```typescript
export const useAcceptTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const { data, error, count } = await supabase
        .from("trips")
        .update({ 
          status: "accepted",
          driver_id: driverId,
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", tripId)
        .eq("status", "requested") // Only if still available
        .is("driver_id", null)     // Extra safety check
        .select();

      if (error) throw error;
      
      // No rows updated means trip was already taken
      if (!data || data.length === 0) {
        throw new Error("TRIP_ALREADY_TAKEN");
      }

      return data[0];
    },
    onError: (error) => {
      if (error.message === "TRIP_ALREADY_TAKEN") {
        toast.error("This ride was already accepted by another driver");
      } else {
        toast.error("Failed to accept trip: " + error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      toast.success("Trip accepted!");
    },
  });
};
```

### Simulated Location Banner Component

```typescript
const SimulatedLocationBanner = ({ onDismiss }: { onDismiss?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-4 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between"
  >
    <div className="flex items-center gap-2">
      <MapPinOff className="w-4 h-4 text-yellow-400" />
      <span className="text-sm text-yellow-400">Using simulated location</span>
    </div>
    {onDismiss && (
      <button onClick={onDismiss} className="text-yellow-400/60">
        <X className="w-4 h-4" />
      </button>
    )}
  </motion.div>
);
```

### Driver Account Page - Setup Section

```typescript
// Setup instructions panel
<Card className="bg-zinc-900/80 border-white/10">
  <CardHeader>
    <CardTitle>Developer Setup</CardTitle>
    <CardDescription>Required configuration for this app</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <h4 className="font-semibold mb-2">Supabase Tables</h4>
      <p className="text-sm text-white/60">
        • drivers - Stores driver profiles and location<br/>
        • trips - Stores ride requests and status
      </p>
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">Realtime Required</h4>
      <p className="text-sm text-white/60">
        Enable Realtime for both tables in Supabase Dashboard:<br/>
        Database → Replication → trips, drivers
      </p>
    </div>
    
    <div>
      <h4 className="font-semibold mb-2">Same Project as Rider App</h4>
      <p className="text-sm text-white/60">
        Both Rider and Driver apps must connect to the same Supabase project
        for realtime dispatch to work.
      </p>
    </div>
  </CardContent>
</Card>
```

---

## Connection Flow: Rider ↔ Driver

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Same Supabase Project                        │
│                                                                 │
│  RIDER APP                          DRIVER APP                  │
│  ─────────                          ──────────                  │
│  1. User confirms ride              1. Driver goes online       │
│  2. INSERT trips (requested)        2. Subscribe to trips       │
│  3. Subscribe to trip updates       3. See new request card     │
│                                     4. Tap ACCEPT               │
│                                     5. UPDATE trips:            │
│                                        status='accepted'        │
│                                        driver_id=<driver>       │
│  6. Realtime pushes update                                      │
│  7. Rider sees "Driver found!"      7. Show ActiveTripCard      │
│  8. Navigate to /ride/driver        8. Tap "I'VE ARRIVED"       │
│                                     9. UPDATE status='arrived'  │
│  10. Realtime: "Driver arrived"                                 │
│  11. Driver starts trip             11. Tap "START TRIP"        │
│                                     12. UPDATE status='in_prog' │
│  13. Trip in progress...            13. Navigate/complete       │
│  14. Driver completes               14. Tap "COMPLETE TRIP"     │
│                                     15. UPDATE status='completed│
│  16. Show receipt                   16. Clear active trip       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Important Notes

1. **No env vars needed** - Supabase credentials are already hardcoded in `src/integrations/supabase/client.ts`

2. **Rider/Driver use same project** - This project (slirphzzwcogdbkeicff) is already configured for both apps

3. **Driver verification** - New signups are `status='pending'` and need admin approval. The login flow already checks for `status='verified'`

4. **Realtime is working** - The hooks `useAvailableTripsRealtime()` and `useDriverTripRealtime()` are already implemented

5. **RLS policies exist** - Drivers can claim trips, update their assigned trips, and update their own profile

6. **Location tracking exists** - `useDriverLocationTracking()` with geolocation + simulation fallback already implemented
