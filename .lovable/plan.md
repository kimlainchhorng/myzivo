
# Fix /flights/results to Display Live Flight Prices

## Overview

The flight results page is currently not displaying live prices from the Aviasales/Travelpayouts API due to authentication issues. The edge function is returning a **403 "access denied"** error, which indicates the MD5 signature generation is incorrect. This plan fixes the API integration to deliver real-time flight prices.

---

## Current State Analysis

### Issues Identified

1. **Signature Generation is Broken**
   - The current `createSignature()` function uses a simple JavaScript hash, NOT proper MD5
   - The API requires an actual MD5 hash of the token + marker + sorted parameter values
   - Error in logs: `[API] Start search failed: 403 - access denied`

2. **Request Structure Issues**
   - Body includes `signature` field but must match exact API format
   - Headers need proper token in `x-affiliate-user-id`
   - The `x-signature` header may need proper MD5 calculation

3. **Missing TRAVELPAYOUTS_MARKER Secret**
   - Only `TRAVELPAYOUTS_API_TOKEN` is configured
   - The marker (partner ID) should also be stored or hardcoded consistently

### What's Already Correct
- IATA codes are properly parsed via `parseFlightSearchParams()`
- URL params use 3-letter codes (`from=MSY&to=PNH`)
- UI components show "From $XXX" pricing
- Fallback to whitelabel URL works
- Caching strategy is correct (5-10 min)

---

## Implementation Plan

### Step 1: Fix MD5 Signature Generation

Update `supabase/functions/search-flights/index.ts` to use proper MD5:

**Current (Broken):**
```typescript
// Uses a simple JavaScript hash - NOT MD5!
let hash = 0;
for (let i = 0; i < signatureString.length; i++) {
  const char = signatureString.charCodeAt(i);
  hash = ((hash << 5) - hash) + char;
}
```

**Fixed (Proper MD5):**
```typescript
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

async function createMd5Signature(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  return encodeHex(new Uint8Array(hashBuffer));
}
```

### Step 2: Fix Signature String Construction

According to the API docs, the signature must:
1. Sort ALL parameter values alphabetically (including nested)
2. Join values with colons
3. Prepend the API token
4. Calculate MD5

**Fix the signature building:**
```typescript
function buildSignatureString(token: string, marker: string, params: SearchParams): string {
  // Sorted alphabetically as per API requirements
  const values: string[] = [];
  
  // Top-level params (alphabetical)
  values.push('USD');           // currency_code
  values.push('en-us');         // locale
  values.push(marker);          // marker
  values.push('US');            // market_code
  
  // search_params.directions (array, each object sorted)
  for (const dir of params.directions) {
    values.push(dir.date);
    values.push(dir.destination);
    values.push(dir.origin);
  }
  
  // search_params.passengers (sorted: adults, children, infants)
  values.push(String(params.passengers.adults));
  values.push(String(params.passengers.children));
  values.push(String(params.passengers.infants));
  
  // search_params.trip_class
  values.push(params.trip_class);
  
  // Build final string: token:value1:value2:...
  return `${token}:${values.join(':')}`;
}
```

### Step 3: Update Request Headers

According to the API documentation, headers must include:
- `x-real-host` - Your website address
- `x-user-ip` - User's IP address
- `x-signature` - MD5 signature
- `x-affiliate-user-id` - API token
- `Content-Type: application/json`

### Step 4: Fix Request Body Structure

The body should match the exact API format:
```json
{
  "signature": "MD5_HASH",
  "marker": "618730",
  "locale": "en-us",
  "currency_code": "USD",
  "market_code": "US",
  "search_params": {
    "trip_class": "Y",
    "passengers": { "adults": 1, "children": 0, "infants": 0 },
    "directions": [
      { "origin": "MSY", "destination": "PNH", "date": "2026-02-03" },
      { "origin": "PNH", "destination": "MSY", "date": "2026-02-24" }
    ]
  }
}
```

### Step 5: Add Booking Link Generation

When user clicks "View Deal", we need to get the booking URL from the API:
```
POST https://[results_url]/searches/[search_id]/clicks/[proposal_id]
```

This returns the actual partner booking URL with affiliate tracking.

### Step 6: Update Results Page Integration

Modify `FlightResults.tsx` to:
- Store `search_id` and `results_url` from API response
- Pass `proposal_id` to booking link generator
- Show "Live Price" badge when `isRealPrice: true`
- Handle loading states properly (30-60 second search time)

---

## Files to Create/Modify

### Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/search-flights/index.ts` | Fix MD5 signature, update request structure, add booking link endpoint |
| `src/hooks/useAviasalesFlightSearch.ts` | Store search_id/results_url, add booking link generation |
| `src/pages/FlightResults.tsx` | Update View Deal handler to use proper booking links |

---

## Technical Details

### Proper MD5 Signature Example

For search: MSY → PNH on 2026-02-03 with return 2026-02-24:

**Input string:**
```
TOKEN:USD:en-us:618730:US:2026-02-03:PNH:MSY:2026-02-24:MSY:PNH:1:0:0:Y
```

**MD5 hash:** (calculated from above)

### API Flow

```text
1. User searches MSY → PNH
   ↓
2. Edge function calls /search/affiliate/start
   ↓
3. Receive search_id + results_url
   ↓
4. Poll /search/affiliate/results until is_over=true
   ↓
5. Transform & cache results (5-10 min TTL)
   ↓
6. Return enriched flight data to UI
   ↓
7. User clicks "View Deal"
   ↓
8. Call /searches/{search_id}/clicks/{proposal_id}
   ↓
9. Redirect to partner booking URL
```

### Error Handling

- **403 Access Denied**: Signature is incorrect
- **429 Rate Limit**: Show "Too many requests" message
- **No results**: Show fallback whitelabel link
- **Timeout**: Gracefully fall back to partner search

---

## Caching Strategy (Already Correct)

- `staleTime: 5 * 60 * 1000` (5 minutes)
- `gcTime: 15 * 60 * 1000` (15 minutes)
- Force refresh on Edit Search (invalidate cache)
- In-memory cache in edge function: 10 minutes TTL

---

## Testing Checklist

After implementation:

- [ ] Search MSY → PNH returns live prices
- [ ] "Live Price" badge appears on results
- [ ] Prices match partner site (within 10%)
- [ ] "View Deal" opens partner booking page
- [ ] UTM params preserved in redirect
- [ ] Affiliate clicks logged to database
- [ ] Fallback works if API fails
- [ ] Loading skeleton shows during 30-60s search
- [ ] Filters work on live results
- [ ] Sorting works correctly

---

## Affiliate Compliance

All existing compliance measures are preserved:
- "From $XXX" price labeling ✓
- "Prices are indicative..." disclaimer ✓
- "View Deal" CTA (not "Book Now") ✓
- Redirect through /out for tracking ✓
- UTM/creator params preserved ✓
- Partner booking page opens in new tab ✓
