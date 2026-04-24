# Hide redundant "Blue verified" button & keep status in sync

## Problem
After approval, both the blue check next to the name AND the large "Blue verified" pill button show. The button is redundant once verified.

## Changes (single file: `src/pages/Profile.tsx`)

1. **Hide the verification button when `profile.is_verified === true`**
   - Wrap the entire `<button>` in `{!profile?.is_verified && (...)}`.
   - Remove the now-unreachable `is_verified` branches from inside (cleaner JSX).
   - The blue ✓ badge next to the name (already present) remains as the sole verification indicator.

2. **Add focus + reconnect refresh fallback** (in case Realtime misses an event)
   - In the existing `useEffect` that subscribes to Realtime, add a `window` `focus` listener and an `online` listener that call `refreshBlueVerified()` — re-invalidates `userProfile` and `verification-request` queries.
   - Cleans up listeners on unmount.

3. **Make the `userProfile` query refetch on focus** so `is_verified` stays current
   - In `src/hooks/useUserProfile.ts`, add `refetchOnWindowFocus: true` and a short `staleTime` (e.g. 10s) to the query options.

## Result
- Verified users see only the small Facebook-style ✓ next to their name.
- Non-verified users still see the "Get blue verified" / "Pending" / "Reapply" pill.
- Realtime + focus refresh ensures the UI updates within seconds of approval, even if the websocket drops.
