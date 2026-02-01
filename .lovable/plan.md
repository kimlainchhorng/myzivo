

# Implementation Plan: Proper Aviasales Flight Search API Integration

## Overview

This plan refactors the existing flight search implementation to properly follow the Aviasales API specification, including the critical **clicks endpoint** for generating booking links. The current implementation is functional but missing the proper deep link generation and some display polish.

---

## Current State vs. Required State

| Feature | Current | Required |
|---------|---------|----------|
| IATA Codes | Working (MSY, LAX, etc.) | No change |
| Search Flow (POST /start) | Working | No change |
| Polling (/results) | Working | Minor fixes |
| Airline Name + IATA | Missing IATA display | Show "Qatar Airways (QR)" |
| Airline Logo | Using CDN fallback | Use API URL + IATA fallback |
| Clicks Endpoint | Not implemented | Add for booking links |
| Reprice on Click | Not implemented | Add toast notification |
| Price Display | Shows raw price | Show "From $XXX" |

---

## Implementation Scope

### Phase 1: Edge Function - Add Clicks Endpoint

Add a new endpoint handler to the edge function that generates booking links on demand.

**New Endpoint:**
- `POST /search-flights` with `action: 'getBookingLink'`
- Calls: `https://[results_url]/searches/[search_id]/clicks/[proposal_id]`
- Returns the partner booking URL with click tracking

**Response Format:**
```json
{
  "url": "https://agency.com/booking?...",
  "agentId": 70,
  "clickId": "2603625159552466848",
  "expireAt": 1689958526
}
```

### Phase 2: Edge Function - Store and Return Search Metadata

Modify the response to include essential metadata for booking link generation:

- `searchId` - Required for clicks endpoint
- `resultsUrl` - Required for clicks endpoint  
- Each flight includes `proposalId` - Required for clicks endpoint

### Phase 3: Client Hook - Add Booking Link Generation

Modify `useAviasalesFlightSearch.ts` to:

1. Store `searchId` and `resultsUrl` from search response
2. Add `getBookingLink(proposalId)` function that:
   - Calls edge function with action: 'getBookingLink'
   - Shows loading state
   - Returns partner URL

### Phase 4: UI - Display Formatting

Update `FlightResultCard.tsx` and related components:

1. **Airline Display**: Show name + IATA code format
   - Before: "Qatar Airways"
   - After: "Qatar Airways (QR)"

2. **Airline Logo**: 
   - Primary: API CDN (`https://pics.avs.io/100/100/QR.png`)
   - Fallback: Initials badge (already implemented)

3. **Price Display**: Already shows "From $XXX" - no change needed

### Phase 5: View Deal - Reprice on Click Flow

When user clicks "View Deal":

1. Show toast: "Checking latest price..."
2. Call `getBookingLink(proposalId)` edge function
3. The API returns the current booking URL with live price
4. If price changed significantly (>5%), show toast: "Price updated — redirecting to live availability."
5. If price unchanged, show: "Redirecting to partner..."
6. Open partner URL in new tab

---

## Technical Details

### Edge Function Changes

**File: `supabase/functions/search-flights/index.ts`**

Add action routing in the request handler:

```typescript
const { searchParams, action, searchId, resultsUrl, proposalId } = await req.json();

if (action === 'getBookingLink') {
  // Generate booking link via clicks endpoint
  return await getBookingLink(searchId, resultsUrl, proposalId, token);
}

// Existing search flow
```

New function for booking link:

```typescript
async function getBookingLink(
  searchId: string,
  resultsUrl: string,
  proposalId: string,
  token: string
): Promise<Response> {
  const baseUrl = resultsUrl.startsWith('http') ? resultsUrl : `https://${resultsUrl}`;
  const clicksUrl = `${baseUrl}/searches/${searchId}/clicks/${proposalId}`;
  
  const response = await fetch(clicksUrl, {
    method: 'GET',
    headers: {
      'x-affiliate-user-id': token,
      'marker': AFFILIATE_MARKER
    }
  });
  
  const data = await response.json();
  return new Response(JSON.stringify({
    url: data.url,
    agentId: data.agent_id,
    clickId: data.str_click_id,
    expireAt: data.expire_at_unix_sec
  }), { headers: corsHeaders });
}
```

### Client Hook Changes

**File: `src/hooks/useAviasalesFlightSearch.ts`**

Add booking link generation:

```typescript
export function useBookingLink() {
  const getBookingLink = async (
    searchId: string,
    resultsUrl: string,
    proposalId: string
  ): Promise<{ url: string; priceChanged?: boolean }> => {
    const { data, error } = await supabase.functions.invoke('search-flights', {
      body: {
        action: 'getBookingLink',
        searchId,
        resultsUrl,
        proposalId
      }
    });
    
    if (error) throw error;
    return { url: data.url, priceChanged: false };
  };
  
  return { getBookingLink };
}
```

### UI Component Changes

**File: `src/components/results/FlightResultCard.tsx`**

Update airline display (around line 115-117):

```tsx
// Current
<p className="font-semibold truncate text-sm">{flight.airline}</p>
<p className="text-xs text-muted-foreground">{flight.flightNumber}</p>

// Updated
<p className="font-semibold truncate text-sm">
  {flight.airline} <span className="text-muted-foreground">({flight.airlineCode})</span>
</p>
<p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
```

**File: `src/pages/FlightResults.tsx`**

Update handleViewDeal to use the clicks endpoint:

```typescript
const handleViewDeal = async (flight: FlightCardData) => {
  // Show loading toast
  toast({
    title: "Checking latest price...",
    description: "Please wait while we confirm availability.",
  });
  
  try {
    // Get booking link from API (if we have search metadata)
    if (apiResponse?.searchId && apiResponse?.resultsUrl && flight.proposalId) {
      const { data } = await supabase.functions.invoke('search-flights', {
        body: {
          action: 'getBookingLink',
          searchId: apiResponse.searchId,
          resultsUrl: apiResponse.resultsUrl,
          proposalId: flight.proposalId
        }
      });
      
      if (data?.url) {
        toast({
          title: "Price updated — redirecting to live availability.",
          duration: 2000,
        });
        
        // Track click then redirect
        trackAffiliateClick({ ... });
        window.open(data.url, "_blank", "noopener,noreferrer");
        return;
      }
    }
    
    // Fallback to existing /out flow
    // ... existing code ...
  } catch (error) {
    // Fallback on error
    window.open(`/out?${outParams.toString()}`, "_blank", "noopener,noreferrer");
  }
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/search-flights/index.ts` | Add getBookingLink action handler |
| `src/hooks/useAviasalesFlightSearch.ts` | Add useBookingLink hook |
| `src/pages/FlightResults.tsx` | Update handleViewDeal with clicks endpoint |
| `src/components/results/FlightResultCard.tsx` | Display airline name + IATA code |

---

## Data Flow

```text
User clicks "View Deal"
       ↓
[Toast: "Checking latest price..."]
       ↓
Edge Function: POST /search-flights { action: 'getBookingLink' }
       ↓
Aviasales API: GET /searches/{search_id}/clicks/{proposal_id}
       ↓
Returns: { url: "https://partner.com/...", clickId: "...", expireAt: ... }
       ↓
[Toast: "Price updated — redirecting to live availability."]
       ↓
window.open(url, "_blank")
```

---

## Validation Checklist

After implementation:

- [ ] Search MSY → LAX returns live prices with searchId/resultsUrl
- [ ] Airlines show as "Qatar Airways (QR)" format
- [ ] Airline logos display from IATA code
- [ ] Missing logos fall back to initials badge
- [ ] "View Deal" fetches fresh booking link
- [ ] Toast shows "Price updated" message
- [ ] Partner site opens in new tab
- [ ] Fallback to /out works if clicks endpoint fails
- [ ] Click tracking still logs to database

---

## Compliance Notes

All existing affiliate compliance measures remain intact:
- "From $XXX" indicative pricing
- "View Deal" CTA (not "Book Now")
- Partner redirect toast notification
- Affiliate disclosure visible
- Opens in new tab with proper rel attributes

