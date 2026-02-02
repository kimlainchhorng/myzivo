

# Phase 1 & 2: Aviasales White Label + API Fix Implementation

## Current State Analysis

The codebase already has substantial implementation:
- White label URL builder exists in both `FlightSearchFormPro.tsx` and `useAviasalesFlightSearch.ts`
- `ApiPendingNotice` component displays fallback when API returns no results
- Edge function has full search/poll/clicks flow implemented
- Trust/compliance text is present

**Key Issues to Fix:**
1. **Search form opens white label in new tab but ALSO should still navigate to results page** for internal tracking
2. **Results page hides all flight cards when API is pending** - currently shows nothing useful
3. **Missing `TRAVELPAYOUTS_MARKER` secret** - only token is configured (confirmed via secrets check)
4. **Edge function logs marker incorrectly** - logs full marker/token which is a security concern
5. **Better 403 handling with specific messaging** needed

---

## Implementation Scope

### Phase 1: Immediate White Label Flow (API Access Pending)

#### 1. Update `/flights` Search Form Behavior

**File: `src/components/search/FlightSearchFormPro.tsx`**

Change from "open white label only" to:
- Build clean URL params with IATA codes
- Navigate to `/flights/results` (internal page)
- Show toast: "Searching for live prices..."

This ensures internal tracking while the results page handles the white label fallback.

#### 2. Update Results Page API Pending UX

**File: `src/pages/FlightResults.tsx`**

When API returns fallback (403 or no access):
- Remove the "fake price" generated flight cards entirely 
- Only show `ApiPendingNotice` component front-and-center
- Ensure cross-sell sections still render below for engagement

**Current problematic logic (lines 614-625):**
```tsx
{/* Results - Only show if we have real API prices */}
{!isLoading && isRealPrice && flightCards.length > 0 && (...)}
```

This is correct but the generated flights pollute the results. The fix is in the filtering logic that mixes API + generated flights.

#### 3. Improve ApiPendingNotice Component

**File: `src/components/results/ApiPendingNotice.tsx`**

Update messaging to be clearer:
- Headline: "Live prices and availability open on our partner site."
- Button: "View Live Results"
- Helper: "Live prices and final booking on partner site."
- Disclosure: "ZIVO compares prices from third-party partners. Booking completed on partner sites."

---

### Phase 2: Fix Travelpayouts API 403

#### 1. Add Missing Secret

**Secret Required: `TRAVELPAYOUTS_MARKER`**

Currently only `TRAVELPAYOUTS_API_TOKEN` is configured. The marker is hardcoded to `700031` in the edge function (line 32) but should be a secret for flexibility.

Will add secret with value matching the partner account's marker ID.

#### 2. Secure Logging in Edge Function

**File: `supabase/functions/search-flights/index.ts`**

Current logging exposes sensitive data:
```typescript
console.log(`[API] Signature string: ${signatureString.replace(token, 'TOKEN')}`);
```

Change to only log:
- Endpoint path
- HTTP status code
- Marker last 3 digits
- Token present: true/false

```typescript
console.log(`[API] Request: /search/affiliate/start`);
console.log(`[API] Status: ${response.status}`);
console.log(`[API] Marker: ***${marker.slice(-3)}`);
console.log(`[API] Token present: ${!!token}`);
```

#### 3. Add Graceful 403 Fallback

When API returns 403:
- Return `fallback: true` with clear message
- Include white label URL
- UI shows `ApiPendingNotice`

---

## Technical Details

### FlightSearchFormPro Changes

**Lines 198-209 - Replace:**
```typescript
const handleSearch = () => {
  if (!validate()) return;
  
  const fromCode = fromOption?.value || fromDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "";
  const toCode = toOption?.value || toDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "";
  
  // Build search params for internal results page
  const params = new URLSearchParams({
    from: fromCode.toUpperCase(),
    to: toCode.toUpperCase(),
    depart: departDate ? format(departDate, "yyyy-MM-dd") : "",
    passengers: String(passengers),
    cabin: cabin,
    tripType: tripType,
  });
  
  if (tripType === "roundtrip" && returnDate) {
    params.set("return", format(returnDate, "yyyy-MM-dd"));
  }
  
  // Navigate to results page (handles white label fallback internally)
  navigate(`/flights/results?${params.toString()}`);
};
```

### FlightResults Changes

**Lines 181-198 - Fix flight mixing logic:**
```typescript
const flights = useMemo(() => {
  if (!isValid) return [];
  
  // If we have real API prices, use ONLY those
  if (isRealPrice && convertedApiFlights.length > 0) {
    // Apply filters and return
    let filtered = convertedApiFlights.filter(f => f.price <= filters.maxPrice);
    // ... rest of filter logic
    return filtered;
  }
  
  // If no real prices (API pending), return empty array
  // The ApiPendingNotice will handle the UI
  return [];
}, [convertedApiFlights, sortBy, filters, isValid, isRealPrice]);
```

This ensures no "fake" generated prices are ever shown.

### Edge Function Secure Logging

**Lines 543-544 and 553-554 - Replace:**
```typescript
// BEFORE (security risk):
console.log(`[API] Signature string: ${signatureString.replace(token, 'TOKEN')}`);
console.log(`[API] MD5 signature: ${signature}`);
console.log(`[API] Request body:`, JSON.stringify(searchBody, null, 2));

// AFTER (secure):
console.log(`[API] Starting search: ${params.origin} → ${params.destination}`);
console.log(`[API] Marker: ***${marker.slice(-3)} | Token: ${token ? 'present' : 'missing'}`);
```

### Edge Function 403 Handling

**Lines 571-574 - Add specific 403 check:**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error(`[API] Start search failed: ${response.status}`);
  
  // Specific 403 handling - API access not enabled
  if (response.status === 403) {
    console.log('[API] 403 Forbidden - Flight Search API access pending');
    // Return null to trigger fallback with clear message
  }
  
  return null;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/search/FlightSearchFormPro.tsx` | Restore internal navigation, remove direct white label open |
| `src/pages/FlightResults.tsx` | Remove generated flight mixing when API pending |
| `src/components/results/ApiPendingNotice.tsx` | Update messaging per requirements |
| `supabase/functions/search-flights/index.ts` | Secure logging, better 403 handling |

---

## Secret Addition Required

Add `TRAVELPAYOUTS_MARKER` secret with the partner marker ID value. This allows easy updates without code changes if the partner account changes.

---

## Travelpayouts Support Email (Ready to Send)

**To:** support@travelpayouts.com  
**Subject:** Request Aviasales Flight Search API access for hizivo.com

**Body:**
```text
Hello Travelpayouts Team,

Please enable Aviasales Flight Search API access for our account.

Website: https://hizivo.com
Business model: Meta-search (we compare prices and redirect users to partners for booking)
We do not sell tickets directly.
We show "From/Approx" prices and disclose that booking is completed on partner sites.

We will use the API to display flight search results (airlines, schedules, prices) and redirect users via affiliate links.

Thank you.
Name: Kimlain
Email: Kimlain@hizovo.com
```

---

## Phase 2 Airline Display (When API Enabled)

Once API access is granted:

1. **Airline display format:** `{airline.name} ({airline.airlineCode})`
   - Example: "Qatar Airways (QR)"

2. **Airline logo source:** `https://pics.avs.io/100/100/{IATA}.png`
   - Fallback: Initials badge (already implemented)

3. **Price display:** "From $XXX" (already implemented)

4. **Same provider rule:** CTA links to the same agent/provider that provided the price

5. **Reprice on click:** Clicks endpoint already implemented for this

6. **Cache policy:** 5-minute staleTime already configured in hook

---

## Validation Checklist

After implementation:

- [ ] /flights search form navigates to /flights/results
- [ ] Results page shows ApiPendingNotice when API pending (no fake prices)
- [ ] "View Live Results" button opens white label in new tab
- [ ] Trust disclosure visible on both pages
- [ ] Edge function logs are secure (no tokens/signatures exposed)
- [ ] 403 errors trigger clean fallback with helpful message
- [ ] When API enabled: real prices display with "From $XXX" format
- [ ] When API enabled: airlines show as "Name (IATA)" format

