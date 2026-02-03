

# OTA-Only Mode: Lock Flights System and Remove All Affiliate Fallback Logic

## Summary

This plan permanently disables all affiliate fallback logic for ZIVO Flights and enforces strict OTA-only mode. A new feature flag (`FLIGHTS_MODE = OTA_ONLY`) will be introduced to globally control this behavior, ensuring that Duffel API failures or empty results never trigger affiliate redirects.

---

## Current State Analysis

### Components Still Using Affiliate Logic for Flights

| File | Issue | Risk Level |
|------|-------|------------|
| `src/components/search/FlightSearchFormPro.tsx` | Debug URL exposed to client with "Open live results directly" link | HIGH |
| `src/components/monetization/ExitIntentPrompt.tsx` | Affiliate redirect on exit intent | HIGH |
| `src/components/monetization/SmartBookingCTA.tsx` | Full affiliate redirect component | HIGH |
| `src/components/flight/FlightFlashSale.tsx` | Mock "flash deals" with affiliate redirect | HIGH |
| `src/components/flight/FlightDestinationInspiration.tsx` | Destination cards with affiliate redirect | HIGH |
| `src/components/flight/NearbyAirports.tsx` | Nearby airports with affiliate "View Deal" CTAs | HIGH |
| `src/components/shared/AffiliateDestinationCard.tsx` | Generic affiliate card used for flights | MEDIUM |
| `src/lib/affiliateRedirect.ts` | `redirectToFlightPartner()` function | MEDIUM |
| `src/hooks/useAffiliateRedirect.ts` | Flight redirect hook | MEDIUM |
| `src/config/affiliateLinks.ts` | `AFFILIATE_LINKS.flights` config | LOW (config only) |

---

## Implementation Plan

### Phase 1: Create Global Feature Flag Configuration

**File:** `src/config/flightBookingMode.ts` (NEW)

```typescript
/**
 * ZIVO Flight Booking Mode Configuration
 * 
 * FLIGHTS_MODE determines how flight bookings are handled:
 * - OTA_ONLY: All bookings through ZIVO + Duffel (no affiliate)
 * - AFFILIATE: Legacy affiliate redirect mode (DEPRECATED)
 * 
 * This is a LOCKED configuration - affiliate mode is permanently disabled.
 */

export const FLIGHTS_MODE = 'OTA_ONLY' as const;

export type FlightsMode = 'OTA_ONLY' | 'AFFILIATE';

/**
 * Check if flights are in OTA-only mode
 * This should ALWAYS return true for production
 */
export function isFlightsOTAMode(): boolean {
  return FLIGHTS_MODE === 'OTA_ONLY';
}

/**
 * Guard function - throws error if affiliate code attempts to run
 * Use in any legacy affiliate function for safety
 */
export function assertOTAMode(context: string): void {
  if (FLIGHTS_MODE !== 'OTA_ONLY') {
    console.error(`[SECURITY] Affiliate mode attempted in: ${context}`);
    throw new Error('Affiliate mode is disabled. ZIVO operates in OTA-only mode.');
  }
}

/**
 * Safe guard for affiliate functions - returns false to prevent execution
 * Use in conditionals before affiliate logic
 */
export function canUseAffiliateForFlights(): boolean {
  return false; // LOCKED: Always return false
}
```

---

### Phase 2: Remove Debug URL from FlightSearchFormPro

**File:** `src/components/search/FlightSearchFormPro.tsx`

**Remove Lines 177-205:** White label URL builder
**Remove Lines 207-208:** Debug URL state
**Remove Lines 218-221:** Debug URL logging
**Remove Lines 244-249:** `handleOpenDirect` function
**Remove Lines 646-658:** Debug URL display section

This removes:
- `WL_BASE_URL` environment variable usage
- `MARKER` tracking parameter
- `buildWhitelabelUrl()` function
- `debugUrl` state
- "Open live results directly →" link

---

### Phase 3: Disable ExitIntentPrompt for Flights

**File:** `src/components/monetization/ExitIntentPrompt.tsx`

**Option A:** Completely remove from FlightResults.tsx import
**Option B:** Add OTA mode guard at component level

Implementation (Option B - safer):
```typescript
// Add at top of component
import { isFlightsOTAMode } from '@/config/flightBookingMode';

export default function ExitIntentPrompt({ ... }) {
  // OTA Mode: Exit intent affiliate prompts are disabled
  if (isFlightsOTAMode()) {
    return null;
  }
  // ... existing code (for hotels/cars if ever used)
}
```

Also update `src/pages/FlightResults.tsx` to not render ExitIntentPrompt.

---

### Phase 4: Remove/Disable SmartBookingCTA

**File:** `src/components/monetization/SmartBookingCTA.tsx`

This component is exclusively for affiliate redirects. For flights:

**Option A:** Delete the component entirely (risky if used elsewhere)
**Option B:** Add OTA mode guard

Since it might be used for hotels/cars, add guard:
```typescript
import { isFlightsOTAMode, assertOTAMode } from '@/config/flightBookingMode';

// Add to handlePrimaryClick:
const handlePrimaryClick = () => {
  // For flights, affiliate redirect is DISABLED
  if (serviceType === 'flights' || origin || destination) {
    assertOTAMode('SmartBookingCTA'); // Will throw if called
    return;
  }
  // ... existing affiliate logic for other services
};
```

Also export `FallbackBookingCTA` with same guard.

---

### Phase 5: Remove FlightFlashSale Component

**File:** `src/components/flight/FlightFlashSale.tsx`

This component shows fake "flash deals" with affiliate redirects. For OTA model:

**Option A:** Delete component and remove from imports
**Option B:** Convert to OTA model (internal navigation)

Recommended: **Delete entirely** - flash deals with fake prices contradict OTA model

**Remove from:** `src/pages/FlightBooking.tsx` (lines 41, 310)

---

### Phase 6: Convert FlightDestinationInspiration to OTA

**File:** `src/components/flight/FlightDestinationInspiration.tsx`

Replace affiliate redirect with internal navigation:

```typescript
// Change onClick handler (line 91)
onClick={() => {
  // OTA: Navigate to flight search internally
  const params = new URLSearchParams({
    dest: dest.city,
  });
  navigate(`/flights?${params.toString()}`);
}}
```

Remove:
- `AFFILIATE_LINKS` import
- `window.open()` calls
- ExternalLink icons

---

### Phase 7: Convert NearbyAirports to OTA

**File:** `src/components/flight/NearbyAirports.tsx`

Replace affiliate redirects with internal navigation:

```typescript
// Change all onClick handlers that use AFFILIATE_LINKS.flights.url
onClick={() => {
  // OTA: Navigate to search with this airport
  const params = new URLSearchParams({
    origin: airport.code,
    dest: destination,
  });
  navigate(`/flights/results?${params.toString()}`);
}}
```

Remove:
- `AFFILIATE_LINKS` import (line 22)
- `window.open(AFFILIATE_LINKS.flights.url, ...)` calls (lines 168, 349)
- ExternalLink icons for flights

---

### Phase 8: Add OTA Guard to AffiliateDestinationCard

**File:** `src/components/shared/AffiliateDestinationCard.tsx`

Add guard for flights:

```typescript
import { isFlightsOTAMode } from '@/config/flightBookingMode';
import { useNavigate } from 'react-router-dom';

const handleClick = () => {
  // OTA Mode: Use internal navigation for flights
  if (serviceType === 'flights' && isFlightsOTAMode()) {
    const params = new URLSearchParams();
    if (originCode) params.set('origin', originCode);
    if (destinationCode) params.set('dest', destinationCode);
    if (departDate) params.set('depart', departDate);
    navigate(`/flights/results?${params.toString()}`);
    return;
  }
  // ... existing affiliate logic for hotels/cars
};
```

---

### Phase 9: Disable Flight Affiliate Redirect Functions

**File:** `src/lib/affiliateRedirect.ts`

Add OTA mode guard:

```typescript
import { isFlightsOTAMode, assertOTAMode } from '@/config/flightBookingMode';

export function redirectToFlightPartner(
  params: FlightDeepLinkParams,
  options: RedirectOptions
) {
  // OTA MODE: Flight partner redirect is DISABLED
  if (isFlightsOTAMode()) {
    assertOTAMode('redirectToFlightPartner');
    console.error('[BLOCKED] Attempted affiliate redirect for flights');
    return null; // Don't redirect
  }
  
  // ... legacy code (never executes in OTA mode)
}
```

---

### Phase 10: Disable Flight Affiliate Hook

**File:** `src/hooks/useAffiliateRedirect.ts`

Add OTA mode guard:

```typescript
import { isFlightsOTAMode } from '@/config/flightBookingMode';

export function useFlightRedirect(source: string, ctaType?: CTAType) {
  // OTA MODE: Return no-op functions for flights
  if (isFlightsOTAMode()) {
    return {
      redirectWithParams: () => {
        console.warn('[OTA] Flight affiliate redirect is disabled');
        return null;
      },
      redirectSimple: () => {
        console.warn('[OTA] Flight affiliate redirect is disabled');
        return null;
      },
    };
  }
  
  // ... legacy code
}
```

---

### Phase 11: Update Error Handling (No Affiliate Fallback)

**File:** `src/pages/FlightResults.tsx`

Ensure error states don't trigger affiliate fallback:

```typescript
// Verify error handling doesn't redirect
{error && (
  <Card className="p-6 text-center">
    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
    <h3 className="font-bold text-lg mb-2">Unable to load flights</h3>
    <p className="text-muted-foreground mb-4">
      We couldn't connect to our flight search. Please try again.
    </p>
    <Button onClick={() => window.location.reload()}>
      Try Again
    </Button>
    {/* NO affiliate fallback CTA */}
  </Card>
)}
```

---

### Phase 12: Remove Affiliate Feature Flags (Admin)

**File:** `src/components/admin/settings/FeatureFlagsPanel.tsx`

Add a locked "FLIGHTS_OTA_MODE" flag that cannot be toggled:

```typescript
// Add to mockFlags array
{
  id: "ota_flights",
  key: "flights_ota_mode",
  name: "Flights OTA Mode",
  description: "LOCKED: ZIVO is the Merchant of Record for flights. Affiliate mode permanently disabled.",
  isEnabled: true,
  rolloutPercentage: 100,
  targetAudience: "all",
  category: "locked", // New category
  createdAt: new Date(),
  lastModified: new Date(),
},
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/config/flightBookingMode.ts` | CREATE | Global OTA mode flag and guard functions |
| `src/components/search/FlightSearchFormPro.tsx` | MODIFY | Remove debug URL section and white label URL builder |
| `src/components/monetization/ExitIntentPrompt.tsx` | MODIFY | Add OTA mode guard, return null for flights |
| `src/components/monetization/SmartBookingCTA.tsx` | MODIFY | Add OTA mode guard, block flight affiliate redirects |
| `src/components/flight/FlightFlashSale.tsx` | DELETE | Fake flash deals contradict OTA model |
| `src/components/flight/FlightDestinationInspiration.tsx` | MODIFY | Convert to internal navigation |
| `src/components/flight/NearbyAirports.tsx` | MODIFY | Convert to internal navigation |
| `src/components/shared/AffiliateDestinationCard.tsx` | MODIFY | Add OTA mode guard for flights |
| `src/lib/affiliateRedirect.ts` | MODIFY | Add OTA mode guard to block flight redirects |
| `src/hooks/useAffiliateRedirect.ts` | MODIFY | Add OTA mode guard to flight hooks |
| `src/pages/FlightResults.tsx` | MODIFY | Remove ExitIntentPrompt import |
| `src/pages/FlightBooking.tsx` | MODIFY | Remove FlightFlashSale import and usage |
| `src/components/admin/settings/FeatureFlagsPanel.tsx` | MODIFY | Add locked OTA mode flag |

---

## Security Verification Checklist

After implementation, verify:

1. **Duffel API Key Security**
   - [ ] `DUFFEL_API_KEY` is ONLY in edge function (server-side)
   - [ ] No Duffel URLs exposed to client except through edge function

2. **No Affiliate URLs for Flights**
   - [ ] No `window.open()` calls for flight affiliate links
   - [ ] No `AFFILIATE_LINKS.flights.url` usage in flight components
   - [ ] No ExternalLink icons on flight CTAs

3. **No Debug URLs**
   - [ ] No "Open live results directly" links
   - [ ] No white label URLs exposed to users
   - [ ] No partner tracking URLs in console logs

4. **No Affiliate Fallback**
   - [ ] Empty results show "No flights available" (no partner CTA)
   - [ ] Error states show "Try again" (no partner fallback)
   - [ ] Exit intent disabled for flights

5. **Proper Error Handling**
   - [ ] API failures show user-friendly message
   - [ ] Errors logged server-side (edge function logs)
   - [ ] No redirect on any error condition

---

## Compliance Benefits

This implementation ensures:

1. **Seller of Travel Compliance**
   - ZIVO is clearly the seller/MoR
   - No confusing partner redirects
   - Clear price disclosure

2. **Duffel LIVE Approval**
   - Clean API integration
   - No affiliate mixing
   - Proper ticketing flow

3. **User Trust**
   - Consistent booking experience
   - No unexpected redirects
   - Clear ZIVO branding throughout

---

## Testing Requirements

After implementation, test:

1. **Search Flow**
   - Search flights → Results display → Select flight → Checkout on ZIVO
   - No external links or redirects at any step

2. **Empty Results**
   - Search with no results → "No flights available" message
   - NO partner fallback buttons

3. **Error States**
   - Trigger API error → User-friendly error message
   - NO affiliate fallback

4. **All Flight Pages**
   - `/flights` landing
   - `/flights/results` results page
   - `/flights/booking` (if separate)
   - Verify no affiliate CTAs appear

