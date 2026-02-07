

# Redirect to ZIVO Payments for Checkout

## Summary

Modify the ride confirmation flow to redirect users to an external ZIVO Payments app for checkout instead of processing payment inline. The ride is created in Supabase first, then the user is redirected to the payments app with the ride ID. After payment, the user returns to the searching page to continue the normal realtime flow.

---

## Current Flow

```text
User taps "Pay & Request"
        │
        ▼
Create ride in Supabase (status='requested')
        │
        ▼
Navigate to /ride/searching
        │
        ▼
Realtime updates → Driver assigned → Navigate to /ride/driver
```

---

## New Flow

```text
User taps "Pay & Request"
        │
        ▼
Create ride in Supabase (status='requested')
        │
        ▼
Redirect to: ${VITE_PAYMENTS_APP_URL}/handoff?rideId=${tripId}
        │
        ▼
(User completes payment on external payments app)
        │
        ▼
Payments app redirects back to: /ride/searching?rideId=${tripId}
        │
        ▼
RideSearchingPage reads rideId from URL, restores state, continues realtime flow
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `.env` | Modify | Add VITE_PAYMENTS_APP_URL |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Redirect to payments app after ride creation |
| `src/pages/ride/RideSearchingPage.tsx` | Modify | Accept rideId from URL params and restore state |
| `src/stores/rideStore.tsx` | Modify | Add method to restore state from tripId |
| `src/lib/supabaseRide.ts` | Modify | Add function to fetch trip details by ID |

---

## Technical Details

### 1. Environment Variable

Add to `.env`:

```env
VITE_PAYMENTS_APP_URL="https://payments.zivo.com"
```

### 2. RideConfirmPage Changes

Update `handleConfirm` to redirect instead of navigate:

```typescript
// Add at top of file
const PAYMENTS_APP_URL = import.meta.env.VITE_PAYMENTS_APP_URL || "";

// In handleConfirm, after successful ride creation:
const handleConfirm = async () => {
  // ... existing availability check code ...
  
  setIsSubmitting(true);

  try {
    // Increment promo code usage if applied
    if (promoCode) {
      await incrementPromoCodeUse(promoCode.id);
    }

    // Create ride in the central store first
    createRide({
      pickup,
      destination,
      rideType: ride.id,
      rideName: ride.name,
      rideImage: ride.image,
      price: finalPrice,
      distance: tripDetails?.distance || 0,
      duration: tripDetails?.duration || 0,
      paymentMethod: selectedPayment,
      pickupCoords,
      dropoffCoords,
      routeCoordinates,
    });

    // Create ride in database
    const result = await createRideInDb(/* existing params */);

    if (result.tripId) {
      setTripId(result.tripId);
      
      // Check if payments app URL is configured
      if (PAYMENTS_APP_URL) {
        // Redirect to external payments app
        const returnUrl = `${window.location.origin}/ride/searching?rideId=${result.tripId}`;
        const handoffUrl = `${PAYMENTS_APP_URL}/handoff?rideId=${result.tripId}&returnUrl=${encodeURIComponent(returnUrl)}`;
        
        // Store minimal state for restoration after redirect
        localStorage.setItem('zivo_pending_ride', JSON.stringify({
          tripId: result.tripId,
          rideName: ride.name,
          price: finalPrice,
          pickup,
          destination,
        }));
        
        window.location.href = handoffUrl;
        return;
      }
      
      // Fallback: navigate directly (for testing without payments app)
      navigate("/ride/searching");
    } else if (result.error) {
      // ... existing error handling ...
    }
  } catch (err) {
    // ... existing error handling ...
  }
};
```

### 3. RideSearchingPage Changes

Handle `rideId` query parameter for return from payments app:

```typescript
import { useSearchParams } from "react-router-dom";
import { fetchTripById } from "@/lib/supabaseRide";

const RideSearchingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, setTripId, createRide } = useRideStore();
  const [isRestoring, setIsRestoring] = useState(false);
  
  // ... existing state ...

  // Restore state from URL param (returning from payments app)
  useEffect(() => {
    const rideIdFromUrl = searchParams.get("rideId");
    
    if (rideIdFromUrl && (!state.tripId || state.tripId !== rideIdFromUrl)) {
      setIsRestoring(true);
      
      // Try to restore from localStorage first (faster)
      const pendingRide = localStorage.getItem('zivo_pending_ride');
      if (pendingRide) {
        try {
          const parsed = JSON.parse(pendingRide);
          if (parsed.tripId === rideIdFromUrl) {
            // Restore state from localStorage
            createRide({
              pickup: parsed.pickup,
              destination: parsed.destination,
              rideType: parsed.rideType || 'standard',
              rideName: parsed.rideName,
              rideImage: parsed.rideImage || '',
              price: parsed.price,
              distance: parsed.distance || 0,
              duration: parsed.duration || 0,
              paymentMethod: parsed.paymentMethod || 'card',
            });
            setTripId(rideIdFromUrl);
            localStorage.removeItem('zivo_pending_ride');
            setIsRestoring(false);
            return;
          }
        } catch (e) {
          console.warn("[RideSearching] Failed to parse pending ride:", e);
        }
      }
      
      // Fallback: fetch from database
      fetchTripById(rideIdFromUrl).then((trip) => {
        if (trip) {
          createRide({
            pickup: trip.pickup_address,
            destination: trip.dropoff_address,
            rideType: trip.ride_type || 'standard',
            rideName: trip.ride_type || 'Standard',
            rideImage: '',
            price: trip.fare_amount || 0,
            distance: (trip.distance_km || 0) / 1.60934,
            duration: trip.duration_minutes || 0,
            paymentMethod: 'card',
          });
          setTripId(rideIdFromUrl);
        } else {
          toast.error("Could not find ride details");
          navigate("/ride");
        }
        setIsRestoring(false);
      });
    }
  }, [searchParams, state.tripId]);

  // ... rest of component ...
  
  // Show loading while restoring
  if (isRestoring) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white/60">Resuming your ride...</p>
        </div>
      </div>
    );
  }
  
  // ... existing render ...
};
```

### 4. New Function in supabaseRide.ts

Add function to fetch trip by ID:

```typescript
// Fetch a trip by ID (for restoring state after redirect)
export const fetchTripById = async (tripId: string) => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (error) {
      console.error("[fetchTripById] Error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[fetchTripById] Exception:", err);
    return null;
  }
};
```

---

## localStorage Keys Used

| Key | Purpose |
|-----|---------|
| `zivo_pending_ride` | Temporarily stores ride details during redirect to payments app |
| `zivo_ride_store` | Existing - full ride state persistence |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User cancels on payments page | Payments app redirects with error param; show message |
| Payments app URL not configured | Falls back to existing direct navigation flow |
| localStorage cleared during redirect | Fetches trip from database as fallback |
| User refreshes searching page | tripId in URL allows state restoration |
| Payment already completed | Normal realtime flow continues; driver may already be assigned |

---

## Security Considerations

- The `rideId` in URL is a UUID (not guessable)
- State restoration validates trip exists in database
- Payments app should verify the ride belongs to the authenticated user
- `returnUrl` is included so payments app knows where to redirect back

---

## No Changes To

- Database schema (no new tables or columns)
- Auto-dispatch logic (still triggers after ride creation)
- Realtime subscription logic
- Driver assignment flow
- UI design (only behavior change)

---

## Testing Notes

To test without the payments app configured:
1. Leave `VITE_PAYMENTS_APP_URL` empty or unset
2. Flow will work as before (direct navigation to searching page)

To simulate payments redirect:
1. Set `VITE_PAYMENTS_APP_URL` to a test URL
2. Complete ride creation
3. Manually navigate to `/ride/searching?rideId={tripId}` to test restoration

