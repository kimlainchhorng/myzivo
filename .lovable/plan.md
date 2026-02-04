

# Flight UI Upgrades for Duffel-Based Search

## Overview
Upgrade the Flights results page and related components to meet OTA standards, using Duffel API data with proper airline logos, enhanced result cards, comprehensive filters, and compliance copy.

---

## 1. Airline Logo Service with Fallback

### New Utility: `src/lib/airlineLogo.ts`
Create a robust airline logo utility with multi-source fallback:

```text
+-------------------------------------------+
|  getAirlineLogo(iataCode, size)           |
+-------------------------------------------+
         |
         v
+-------------------------------------------+
| Primary: AirHex CDN                        |
| https://content.airhex.com/content/logos/ |
| airlines_{size}/{CODE}.png                 |
+-------------------------------------------+
         |
         | (on error)
         v
+-------------------------------------------+
| Fallback 1: Try lowercase code             |
| airlines_{size}/{code}.png                 |
+-------------------------------------------+
         |
         | (on error)
         v
+-------------------------------------------+
| Fallback 2: Duffel SVG                     |
| assets.duffel.com/img/airlines/.../{CODE} |
+-------------------------------------------+
         |
         | (on error)
         v
+-------------------------------------------+
| Fallback 3: Default Plane Icon             |
| Render <Plane /> Lucide icon               |
+-------------------------------------------+
```

Features:
- Primary: AirHex CDN at `https://content.airhex.com/content/logos/airlines_64/{IATA}.png`
- Fallback 1: Lowercase code attempt
- Fallback 2: Duffel SVG logos
- Fallback 3: Generic airplane icon (Lucide `Plane`)
- Memoized for performance
- Size variants: 32, 64, 100, 200

---

## 2. Enhanced Flight Result Card

### File: `src/components/results/FlightResultCard.tsx`

#### Card Structure Updates:

```text
+------------------------------------------------------------------+
| [Best Value] [Cheapest] [Fastest] badges                          |
+------------------------------------------------------------------+
| +--------+ | DEP --> ARR Timeline           | From $XXX           |
| |  LOGO  | | 08:30    5h 30m    14:00       | per person          |
| | Airline| | JFK  ----●----→    LHR         | [Cabin Class]       |
| +--------+ | [Nonstop] / [1 stop via DXB]   | [Refundable badge]  |
|            |                                  |                     |
| UA 123     | 🧳 Carry-on ✓ | 🛄 Checked ✓   | [ Select ]          |
+------------------------------------------------------------------+
| Fare rules, baggage, and refund policies vary by airline.         |
+------------------------------------------------------------------+
```

Key Display Elements:
- **Airline logo** using new utility with fallback chain
- **Airline name + flight number**
- **Value badges**: Best Value (default sort), Cheapest, Fastest
- **Timeline**: Departure → Duration → Arrival with airport codes
- **Stops indicator**: Nonstop (green) or "1 stop via {city}" (amber)
- **Cabin class**: Economy, Premium Economy, Business, First
- **Baggage summary**: Icons for carry-on and checked with checkmark/strikethrough
- **Refundable indicator**: Green shield for refundable, gray for non-refundable
- **Price**: Total price with currency, "per person" label
- **Select button**: Primary CTA to expand details

---

## 3. Expandable Flight Details Panel

### New Component: `src/components/flight/FlightDetailsExpanded.tsx`

When user clicks "Select", expand inline to show:

```text
+------------------------------------------------------------------+
| SEGMENT LIST                                                       |
|   Segment 1: JFK → LHR                                            |
|   - Flight: UA 123                                                 |
|   - Depart: 08:30 Terminal 4 | Arrive: 20:00 Terminal 5           |
|   - Duration: 7h 30m                                               |
|   - Aircraft: Boeing 787-9 Dreamliner                              |
|   - Operated by: United Airlines                                   |
+------------------------------------------------------------------+
| FARE RULES SUMMARY                                                 |
|   ✓ Changes allowed (fee may apply)                               |
|   ✗ Non-refundable                                                |
|   ℹ Fare rules confirmed at checkout                              |
+------------------------------------------------------------------+
| SEAT SELECTION                                                     |
|   [Choose seats] button (if available)                             |
|   OR: "Seat selection available after ticketing with airline"     |
+------------------------------------------------------------------+
|                            [ Continue to Checkout ]               |
+------------------------------------------------------------------+
```

Features:
- **Segment list**: Each leg with full details
- **Aircraft info**: Display if available, fallback text if not
- **Fare rules summary**: Change/refund conditions from Duffel
- **Seat selection**: CTA if Duffel provides seat map, fallback message if not
- **Continue to Checkout**: Routes to `/flights/checkout/{offerId}`

---

## 4. Filters & Sorting Enhancement

### Update: `src/components/results/FlightFiltersContent.tsx`

#### Sorting Options (update `SortSelect`):
```text
Best Value (default) - Price + duration score
Cheapest            - Lowest price first
Fastest             - Shortest duration first  
Fewest Stops        - Nonstop → 1 stop → 2+ stops
```

#### Filter Categories:
| Filter | Type | Notes |
|--------|------|-------|
| Price | Slider | $0 - $5,000 range |
| Stops | Checkbox | Nonstop, 1 Stop, 2+ Stops |
| Airline | Checkbox + Logo | Dynamic from results |
| Departure Time | 4 buttons | Morning/Afternoon/Evening/Night |
| Arrival Time | 4 buttons | Same time slots |
| Duration | Slider | 2h - 24h max |
| Cabin Class | Checkbox | Economy, Prem Economy, Business, First |
| Baggage Included | Toggle | Show only flights with checked bag |

---

## 5. Aircraft & Seat Information

### Aircraft Display Logic:
```typescript
// In FlightDetailsExpanded
const aircraftDisplay = segment.aircraft 
  ? segment.aircraft 
  : "Aircraft info shown at confirmation";
```

### Seat Selection Logic:
```typescript
// Check if Duffel offer has seat services
const hasSeatSelection = offer.available_services?.some(
  s => s.type === 'seat'
);

// Render conditionally
{hasSeatSelection ? (
  <Button onClick={() => navigate(`/flights/seats/${offerId}`)}>
    Choose Seats
  </Button>
) : (
  <p className="text-sm text-muted-foreground">
    Seat selection available after ticketing with the airline.
  </p>
)}
```

---

## 6. Compliance Copy Updates

### Update: `src/config/flightCompliance.ts`

Add new OTA-mode copy:

```typescript
export const FLIGHT_RESULTS_COMPLIANCE = {
  // Results page header
  header: "Select your itinerary and complete your booking with ZIVO.",
  
  // Below results small text
  fareRulesNote: "Fare rules, baggage, and refund policies vary by airline and fare.",
  
  // Seat selection fallback
  seatSelectionFallback: "Seat selection available after ticketing with the airline.",
  
  // Aircraft fallback
  aircraftFallback: "Aircraft info shown at confirmation.",
} as const;
```

### Update: `src/pages/FlightResults.tsx`

Add header compliance copy:
```tsx
<section className="py-4 border-b border-border/50">
  <div className="container mx-auto px-4">
    <p className="text-sm text-center font-medium">
      {FLIGHT_RESULTS_COMPLIANCE.header}
    </p>
    <p className="text-xs text-center text-muted-foreground mt-1">
      {FLIGHT_RESULTS_COMPLIANCE.fareRulesNote}
    </p>
  </div>
</section>
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/airlineLogo.ts` | **Create** | Robust logo utility with AirHex + fallbacks |
| `src/components/flight/FlightDetailsExpanded.tsx` | **Create** | Expandable segment/fare details panel |
| `src/components/results/FlightResultCard.tsx` | **Modify** | Enhanced card with badges, baggage, refund indicator |
| `src/components/results/SortSelect.tsx` | **Modify** | Add "Best Value" as default, rename options |
| `src/components/results/FlightFiltersContent.tsx` | **Modify** | Add arrival time, cabin class, baggage filters |
| `src/config/flightCompliance.ts` | **Modify** | Add OTA results page compliance copy |
| `src/pages/FlightResults.tsx` | **Modify** | Add header compliance, integrate expanded details |
| `src/hooks/useResultsFilters.ts` | **Modify** | Add new filter types for cabin, baggage |
| `src/data/airlines.ts` | **Modify** | Update to use AirHex as primary CDN |

---

## Technical Details

### Airline Logo Component Pattern
```tsx
// Usage in FlightResultCard
<AirlineLogo 
  iataCode={flight.airlineCode}
  size={48}
  className="w-12 h-12"
/>

// Internal implementation with useState for error tracking
const [logoSrc, setLogoSrc] = useState(getAirlineLogoUrl(iataCode, size));
const [fallbackIndex, setFallbackIndex] = useState(0);

const handleError = () => {
  const nextFallback = FALLBACK_SOURCES[fallbackIndex + 1];
  if (nextFallback) {
    setLogoSrc(nextFallback(iataCode, size));
    setFallbackIndex(i => i + 1);
  } else {
    setLogoSrc(null); // Show Plane icon
  }
};
```

### Best Value Score Calculation
```typescript
// Already exists in FlightResults.tsx, ensure it's default sort
const bestValueScore = (flight) => {
  return flight.price + (flight.durationMinutes * 0.5);
};
```

---

## Acceptance Criteria

1. Airline logos load from AirHex with graceful fallbacks to Duffel then Plane icon
2. Result cards show all required elements: logo, badges, timeline, baggage, refund status
3. "Select" expands inline details with segments, aircraft, fare rules, and checkout CTA
4. Filters include all specified options with working filtering logic
5. "Best Value" is default sort option
6. Compliance header displays on results page
7. Seat selection shows CTA or fallback message based on Duffel data
8. Aircraft shows real data or "Aircraft info shown at confirmation"

