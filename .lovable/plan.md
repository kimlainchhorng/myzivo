

## Upgrade Flight Card: Real Airlines, Route Details, Visual Differentiation

### What Changes

**1. Edge function: Rich airline data instead of "Multiple airlines" (backend)**

In `supabase/functions/duffel-flights/index.ts`, the `transformOffer` function currently sets `airline: "Multiple airlines"` when carriers differ. Instead:

- Build an array of unique carrier objects from all segments: `[{ name, code }]`
- Set `airline` to formatted string: `"Qatar Airways + Alaska Airlines"` (max 2 names, then "+ N more")
- Add new fields to the offer response:
  - `carriers: [{ name, code, isOperating }]` — all unique airlines
  - `operatedBy: string | null` — if marketing carrier differs from operating carrier on any segment, e.g. "Operated by QantasLink"
  - `stopDetails: [{ code, city, layoverDuration }]` — layover city + duration between segments
- Compute layover durations by diffing `segments[i+1].departing_at - segments[i].arriving_at`

**2. Update DuffelOffer type (frontend)**

In `src/hooks/useDuffelFlights.ts`, add to `DuffelOffer`:
```
carriers: { name: string; code: string; isOperating: boolean }[]
operatedBy: string | null
stopDetails: { code: string; city: string; layoverDuration: string }[]
```

**3. Redesign DuffelFlightCard (frontend)**

In `src/components/flight/DuffelFlightCard.tsx`:

- **Airline row**: Show stacked logos (max 2) using existing `AirlineLogo` component side-by-side with slight overlap. Display real carrier names (e.g. "Qatar Airways + Alaska Airlines"). Show "Operated by X" in small muted text if codeshare.
- **Route timeline**: Replace the simple stop dots with labeled stop cities. Show the full route as `MSY → SEA → DOH → KTI` with layover durations below each stop (e.g. "2h 15m").
- **Tags row**: Already shows cabin class, baggage, refundable badges. Add a non-refundable badge when `isRefundable` is false. Add "Codeshare" or "Operated by" badge when applicable.
- **Visual differentiation**: The card already receives `isLowest` and `isFastest` props with badge rendering. No additional highlighting logic needed — the existing badge system handles cheapest/fastest/best.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/duffel-flights/index.ts` | Replace "Multiple airlines" with real carrier names array, add `carriers`, `operatedBy`, `stopDetails` with layover durations |
| `src/hooks/useDuffelFlights.ts` | Add `carriers`, `operatedBy`, `stopDetails` to `DuffelOffer` interface |
| `src/components/flight/DuffelFlightCard.tsx` | Stacked airline logos, real carrier names, route city labels with layover times, codeshare badge, non-refundable badge |

### Scope

- No new components needed — extends existing card and types
- Edge function redeploy required after changes
- Mobile-first (390px viewport) — all layout fits current card width

