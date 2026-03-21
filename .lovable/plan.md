

## Fix Duffel Fare Options Parsing and UI

### Problem
The fare variant cards have issues:
1. **Labels**: `formatFareName` returns "Standard" when fareBrandName matches cabin class, but the backend already sets `fareBrandName` to the cabin class as fallback (line 949: `g.fareBrandName || g.cabinClass`), causing all unlabeled fares to show "Standard" instead of being intelligently labeled (Basic/Standard/Flex).
2. **Baggage display**: Shows "No carry-on bag" / "No checked bag" even when data is just missing — should say "Not included" for clarity.
3. **Price**: Currently using `pricePerPerson` which is `total_amount / passengers`. The user wants `total_amount` (the full Duffel offer price) shown directly.
4. **No "Fare Options" section header after price** — user wants a clear comparison layout matching the reference image.

### Plan

#### 1. Smart fare auto-labeling (FareVariantsCard.tsx)
Update `formatFareName` to auto-label based on fare conditions instead of just name manipulation:
- If refundable AND changeable → "Flex"
- If carry-on OR checked bag included → "Standard"  
- Else → "Basic"

Only apply auto-labeling when the fareBrandName is generic (equals cabin class or null). If Duffel provides a real brand name (e.g., "Economy Light", "Main Cabin"), keep it.

#### 2. Fix baggage display labels (FareVariantsCard.tsx)
Update `getCarryOnLabel` and `getCheckedBagLabel`:
- When not included: show "No carry-on bag" / "No checked bag" (current behavior is fine per the reference image which shows exactly this)
- Remove any "No data" text — replace with "Not included" anywhere it appears

#### 3. Fix price display (FareVariantsCard.tsx)
- Use `variant.price` (total Duffel offer amount) as the displayed price, not `pricePerPerson`
- "Lowest fare" badge on the cheapest variant
- Delta shows difference from cheapest: `+$X.XX`
- Add subline: "This is the lowest Duffel fare for this flight" on cheapest, price delta text on others

#### 4. Ensure backend passes correct data (duffel-flights edge function)
The backend parsing at lines 690-840 already correctly:
- Reads `conditions.change_before_departure.allowed` and `conditions.refund_before_departure.allowed`
- Reads baggage from `segment.passengers[0].baggages` with type `checked` / `carry_on`
- Falls back to `Personal item only` when no bags found

No backend changes needed — the parsing is correct. The issue is purely frontend labeling.

#### 5. Files to modify

**`src/components/flight/review/FareVariantsCard.tsx`**:
- Rewrite `formatFareName` to accept the variant's conditions and baggageDetails, auto-label as Basic/Standard/Flex when brand name is generic
- Update price display to use `variant.price` (total amount) instead of `pricePerPerson`
- Update cheapest price calculation accordingly
- Ensure "No data" text never appears — use "Not included" as fallback
- Keep the existing 3D card layout, feature rows, and baggage summary panel

