
# Require Auth for Ride Requests

## Summary

Add authentication requirement before creating a ride request. When a user taps "Pay & Request" without being logged in, they'll be redirected to the login page. After successful login, they'll return to complete their ride request.

---

## Current State

| Component | Status |
|-----------|--------|
| Auth system | Already implemented at `/login` with login/signup toggle |
| `rider_id` field | Already set in `createRideInDb` (line 113) |
| Ride routes | Not protected - allows anonymous access |

The `createRideInDb` function already sets `rider_id: user?.id ?? null`, so rides can be created without auth (rider_id becomes null).

---

## Approach

Add a pre-flight auth check in `RideConfirmPage.tsx` before creating the ride. If the user is not logged in, redirect to `/login` with a return path so they come back after authenticating.

This approach:
- Keeps existing UI unchanged
- No new pages needed (uses existing `/login`)
- Preserves ride details in location state for restoration

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Import `useAuth`, add auth check before `handleConfirm` |

---

## Implementation Details

### RideConfirmPage.tsx Changes

Add import:
```typescript
import { useAuth } from "@/contexts/AuthContext";
```

Add hook inside component:
```typescript
const { user, isLoading: authLoading } = useAuth();
```

Modify `handleConfirm` function to check auth first:

```typescript
const handleConfirm = async () => {
  if (isSubmitting || isCheckingAvailability) return;
  
  // Auth gate: if not logged in, redirect to login with return path
  if (!user) {
    // Save current ride state to localStorage for restoration
    const rideState = {
      ride,
      pickup,
      destination,
      tripDetails,
      routeCoordinates,
      pickupCoords,
      dropoffCoords,
      surgeMultiplier,
      selectedPayment,
      promoCode: promoCode?.code || null,
    };
    localStorage.setItem('zivo_pending_confirm', JSON.stringify(rideState));
    
    // Redirect to login with return path
    navigate('/login', { 
      state: { from: { pathname: '/ride/confirm' } },
      replace: false 
    });
    return;
  }
  
  // ... rest of existing handleConfirm logic
};
```

Add effect to restore state after login return:

```typescript
useEffect(() => {
  // Restore pending ride confirmation after login
  const pending = localStorage.getItem('zivo_pending_confirm');
  if (pending && user && !state?.ride) {
    try {
      const restored = JSON.parse(pending);
      // Navigate back to confirm page with restored state
      navigate('/ride/confirm', { 
        state: restored,
        replace: true 
      });
      localStorage.removeItem('zivo_pending_confirm');
    } catch (e) {
      console.warn('[RideConfirm] Failed to restore pending state:', e);
      localStorage.removeItem('zivo_pending_confirm');
    }
  }
}, [user]);
```

---

## User Flow Diagram

```text
User on /ride/confirm (not logged in)
            │
            ▼
    Taps "Pay & Request"
            │
            ▼
    ┌───────────────────┐
    │  Check auth.user  │
    └────────┬──────────┘
             │
    ┌────────┴────────┐
    │   user = null   │
    └────────┬────────┘
             │
             ▼
    Save ride state to localStorage
             │
             ▼
    Redirect to /login with from=/ride/confirm
             │
             ▼
    ┌───────────────────┐
    │   LOGIN PAGE      │
    │  (existing UI)    │
    └────────┬──────────┘
             │
    User logs in / signs up
             │
             ▼
    Redirected back to /ride/confirm
             │
             ▼
    Restore ride state from localStorage
             │
             ▼
    Continue with ride creation
             │
             ▼
    rider_id = auth.uid() ← RLS-ready!
```

---

## Technical Details

### Why localStorage?

React Router's location state is lost on page reload and OAuth redirects. Storing to localStorage ensures the ride details survive:
- Social login redirects (Google, Apple)
- Page refreshes during auth flow
- Browser back/forward navigation

### RLS Readiness

Once this change is implemented:
- All rides will have `rider_id` set to the authenticated user's ID
- Ready for RLS policies like: `USING (rider_id = auth.uid())`
- Anonymous guest checkout can be added later with explicit `customer_name` flow

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| User already logged in | Proceeds directly to ride creation |
| OAuth redirect (Google/Apple) | State restored from localStorage after callback |
| User cancels login | They can navigate back; localStorage entry expires naturally |
| Stale localStorage data | Clear on successful restoration or after 24h (optional) |

---

## No Changes To

- Database schema (rider_id column already exists)
- Login page UI (uses existing combined login/signup)
- RideSearchingPage or other ride pages
- Existing authentication flow
