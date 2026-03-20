

## Fix Duffel Flight Data Mapping

### Root Causes Identified

After reviewing the edge function (`supabase/functions/duffel-flights/index.ts`), the transformation logic has several bugs:

1. **Duration regex fails for some ISO 8601 formats** - `PT(\d+)H(\d+)?M?` doesn't handle durations without hours (e.g., `PT45M`), or with days/seconds (e.g., `P0DT20H44M0S`). This produces `0h 0m`.

2. **No deduplication** - 506 raw offers pass through with no filtering for near-identical routes at the same price.

3. **Baggage detection is wrong** - Uses `passenger_identity_documents_required` instead of actual baggage data from `passengers[].baggages`.

4. **Cabin class** pulled from offer level may be null; should fall back to segment-level cabin class.

5. **Airline name for multi-carrier offers** - Only uses the first segment's carrier, even when later segments have different airlines. Should show "Multiple airlines" when carriers differ.

---

### Plan

#### 1. Fix duration parsing in edge function (lines 542-546, 609-612)

Replace the regex with a robust ISO 8601 duration parser that handles all variants:
- `PT20H44M` / `PT5H` / `PT45M` / `P0DT20H44M0S`
- Fallback: calculate from `lastSegment.arriving_at - firstSegment.departing_at`

#### 2. Fix airline mapping for multi-carrier offers (lines 532-535)

After extracting the first segment carrier, check if all segments share the same carrier. If not, set airline to "Multiple airlines" and use the first segment's code for the logo.

#### 3. Fix baggage detection (lines 556-557)

Check `passengers[].baggages` array from Duffel response. Look for baggage entries with `type: "checked"` / `"carry_on"` to build an accurate baggage label (e.g., "1 checked bag", "Carry-on only", "No bags included").

#### 4. Add deduplication (line 641-644)

After transforming offers, deduplicate by creating a fingerprint key: `airlineCode + departure.time + arrival.time + stops + price`. Keep only the first occurrence of each fingerprint.

#### 5. Fix cabin class fallback (line 588)

If `o.cabin_class` is null/undefined, pull from first segment's passenger cabin class: `segments[0].passengers[0].cabin_class`.

#### 6. Add debug logging (in `transformOffer`)

Log per-offer: segments count, airline name, departure/arrival times, duration raw string, so issues are visible in edge function logs.

---

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/duffel-flights/index.ts` | Fix duration parser, airline multi-carrier logic, baggage detection, deduplication, cabin class fallback, debug logs |

No frontend changes needed -- the `DuffelFlightCard` component already renders whatever the edge function returns correctly. All fixes are in the data transformation layer.

After editing, the edge function will be redeployed and tested with a live search to verify correct results.

