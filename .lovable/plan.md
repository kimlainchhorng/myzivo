

# Flight Results White Label Integration Plan

## Overview

Replace the redirect-only JetRadar flow with an embedded flight results experience that shows airline comparison, price tiers, and filters directly on `/flights/results`. Booking redirects will continue to partner sites with marker 700031.

## Current State Analysis

The codebase already has:
- **Aviasales API integration** via edge function with search-poll-clicks flow
- **FlightResultCard** components displaying airline, price, duration
- **Filter system** (stops, airlines, price, departure time) with URL sync
- **ApiPendingNotice** fallback when API returns 403 or no results
- **White label URL builder** using marker 700031

Current flow:
1. User searches on `/flights` → navigates to `/flights/live` (iframe)
2. Iframe embeds JetRadar white label
3. If blocked, auto-opens in new tab

**Issue**: The `/flights/live` iframe page bypasses our `/flights/results` page entirely, losing the embedded ZIVO experience with filters and cross-sell.

---

## Proposed Solution

### Part 1: Update Search Form Navigation

**File**: `src/components/search/FlightSearchFormPro.tsx`

Change the search handler to navigate to `/flights/results` instead of `/flights/live`:

```text
Current flow:  /flights → /flights/live (iframe embed)
New flow:      /flights → /flights/results (API results with fallback)
```

The `/flights/results` page already handles both API results and fallback states.

### Part 2: Add Quick Stats Comparison Bar

**File**: `src/pages/FlightResults.tsx`

Add a prominent comparison bar showing best deals when results are available:

| Label | Display | Logic |
|-------|---------|-------|
| Cheapest option | $138 (Aviasales) | Lowest price flight |
| Fastest option | $162 (JetRadar) | Shortest duration flight |
| Best value | $149 (Kiwi) | Score = price + (duration_hours × 20) |

This bar appears between the trust banner and results list.

### Part 3: Enhance ApiPendingNotice Component

**File**: `src/components/results/ApiPendingNotice.tsx`

When the API is pending/blocked, show an enhanced notice with:
- Partner logos showing example price ranges
- Clear messaging about real-time prices
- Primary CTA: "View Live Results" (opens white label in new tab)
- Trust disclosure

### Part 4: Partner Attribution on Result Cards

**File**: `src/components/results/FlightResultCard.tsx`

The card already supports `partnerName` and `agentName` fields. Ensure these display when available from the API response:
- Format: "via Aviasales" or "via Kiwi.com"
- Position: Below the price

---

## Technical Implementation

### 1. FlightSearchFormPro.tsx Changes

Update `handleSearch()` to navigate to `/flights/results`:

```text
Before:
  navigate(`/flights/live?${liveParams.toString()}`);

After:
  navigate(`/flights/results?${params.toString()}`);
```

The results page already parses these params and calls the API hook.

### 2. FlightResults.tsx - Add QuickStats Component

Create a new `QuickStatsBar` component above the results:

```tsx
{/* Quick Stats Comparison */}
{!isLoading && isRealPrice && flights.length > 0 && (
  <QuickStatsBar
    cheapest={{ price: lowestPrice, partner: cheapestFlight?.agentName || "Aviasales" }}
    fastest={{ price: fastestFlight?.price, duration: fastestFlight?.duration, partner: fastestFlight?.agentName || "JetRadar" }}
    bestValue={{ price: bestValueFlight?.price, partner: bestValueFlight?.agentName || "Kiwi" }}
  />
)}
```

Design:
```text
┌─────────────────────────────────────────────────────────────────┐
│  Compare prices from multiple airlines and trusted partners    │
├───────────────────┬───────────────────┬───────────────────────┤
│ ✈️ Cheapest       │ ⚡ Fastest         │ ⭐ Best value         │
│ $138 (Aviasales)  │ $162 (JetRadar)   │ $149 (Kiwi)          │
└───────────────────┴───────────────────┴───────────────────────┘
│  Prices update in real time. Final booking on partner sites.  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. ApiPendingNotice.tsx Enhancement

When API is pending, show a more engaging fallback:

```tsx
<Card>
  <div className="flex gap-4 justify-center">
    <PartnerLogo name="Aviasales" />
    <PartnerLogo name="JetRadar" />
    <PartnerLogo name="Kiwi" />
  </div>
  
  <h2>Compare prices from multiple airlines and trusted travel partners.</h2>
  <p>Prices update in real time. Final booking is completed securely on partner websites.</p>
  
  <Button>View Live Results</Button>
</Card>
```

### 4. Calculate Best Value Flight

Add logic to determine "Best Value" using a weighted score:

```typescript
const bestValueFlight = useMemo(() => {
  if (flights.length === 0) return null;
  return flights.reduce((best, flight) => {
    const hours = parseInt(flight.duration.match(/(\d+)h/)?.[1] || "0");
    const bestHours = parseInt(best.duration.match(/(\d+)h/)?.[1] || "0");
    const score = flight.price + (hours * 20);
    const bestScore = best.price + (bestHours * 20);
    return score < bestScore ? flight : best;
  });
}, [flights]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/search/FlightSearchFormPro.tsx` | Change navigation from `/flights/live` to `/flights/results` |
| `src/pages/FlightResults.tsx` | Add QuickStatsBar component, calculate best value flight |
| `src/components/results/ApiPendingNotice.tsx` | Enhanced UI with partner logos and comparison messaging |
| `src/components/results/FlightResultCard.tsx` | Ensure agent/partner name displays when available |

### New Component

| File | Description |
|------|-------------|
| `src/components/flight/QuickStatsBar.tsx` | Comparison bar showing Cheapest/Fastest/Best Value |

---

## Validation Checklist

After implementation:

- [x] Search form navigates to `/flights/results` (not `/flights/live`)
- [x] When API returns results: QuickStatsBar shows Cheapest/Fastest/Best Value
- [x] Each flight card shows partner attribution when available
- [x] When API is pending: Enhanced ApiPendingNotice with partner comparison messaging
- [x] "View Live Results" opens white label URL with marker 700031 in new tab
- [ ] All filter functionality preserved (stops, airlines, price, time)
- [ ] Trust/compliance disclosures visible
- [ ] Cross-sell sections render below results

