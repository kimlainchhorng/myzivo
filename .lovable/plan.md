

# ZIVO Unified Hotel Property Schema Implementation

## Overview

Implement the `ZivoProperty` unified schema to normalize hotel data from multiple suppliers (Hotelbeds, RateHawk) into a single, consistent format. This enables ZIVO to compare prices across providers, display the cheapest option, and track inventory status for each property.

---

## Current State Analysis

The project already has:
- **Existing Types**: `NormalizedHotel`, `NormalizedRoom`, `NormalizedRate` in `src/types/hotels.ts`
- **Hotelbeds Types**: `HotelbedsHotel`, `ZivoHotel` in `src/types/hotelbeds.ts`
- **Normalizer Service**: `src/services/hotelNormalizer.ts` with functions for Hotelbeds, TripAdvisor, and legacy data
- **Pricing Config**: Markup rules for `hotelbeds` (8%) and `ratehawk` (10%) in `src/config/pricing.ts`

The provided `ZivoProperty` schema is a simplified version focused on:
1. **Source attribution** (`HOTELBEDS` | `RATEHAWK`)
2. **Meta information** (name, stars, coordinates)
3. **Pricing with comparison logic** (`isCheapest` flag)
4. **Inventory status tracking**

---

## Implementation Approach

### Phase 1: Define the ZivoProperty Types

**File**: `src/types/zivoProperty.ts` (new file)

```text
┌────────────────────────────────────────────────────────────────┐
│  ZivoProperty Schema                                            │
├────────────────────────────────────────────────────────────────┤
│  id: string                  // ZIVO internal UUID              │
│  source: "HOTELBEDS" | "RATEHAWK"                               │
│  meta: {                                                        │
│    name: string                                                 │
│    starRating: number                                           │
│    coordinates: { lat: number; lng: number }                    │
│  }                                                              │
│  pricing: {                                                     │
│    amount: number            // Net price after markup          │
│    currency: string                                             │
│    type: "PREPAID" | "PAY_AT_HOTEL"                             │
│    isCheapest: boolean       // Computed by comparison          │
│  }                                                              │
│  inventory: {                                                   │
│    providerId: string        // Original supplier ID            │
│    status: "AVAILABLE" | "ON_REQUEST" | "SOLD_OUT"              │
│  }                                                              │
└────────────────────────────────────────────────────────────────┘
```

### Phase 2: Extended ZivoProperty for Full Display

Since UI components need more data than the minimal schema, we'll extend it:

```typescript
interface ZivoPropertyExtended extends ZivoProperty {
  // Display fields
  imageUrl: string;
  images: string[];
  destination: string;
  zone?: string;
  address?: string;
  
  // Reviews
  reviewScore?: number;
  reviewCount?: number;
  
  // Amenities
  facilities: string[];
  
  // Rooms & Rates (for detailed view)
  rooms?: ZivoPropertyRoom[];
  
  // Booking flags
  hasFreeCancellation: boolean;
  cancellationDeadline?: string;
}
```

### Phase 3: Update Normalizer Service

**File**: `src/services/hotelNormalizer.ts`

Add new normalizer functions:

1. `normalizeToZivoProperty(source, data)` - Convert supplier data to ZivoProperty
2. `compareAndMarkCheapest(properties[])` - Set `isCheapest` flag by comparing prices
3. `mergeMultiSourceProperties(hotelbeds[], ratehawk[])` - Deduplicate and merge

The comparison logic:
- Group properties by name + coordinates proximity (within 100m)
- For each group, mark the lowest-priced property as `isCheapest: true`
- Return unified array sorted by price

### Phase 4: RateHawk Integration Preparation

**Files to create**:
- `src/types/ratehawk.ts` - RateHawk API response types
- `supabase/functions/ratehawk-hotels/index.ts` - Edge function for RateHawk API
- `src/hooks/useRateHawkSearch.ts` - Frontend hook

RateHawk type mapping:
| RateHawk Field | ZivoProperty Field |
|----------------|-------------------|
| `id` | `inventory.providerId` |
| `name` | `meta.name` |
| `star_rating` | `meta.starRating` |
| `geo.lat/lon` | `meta.coordinates` |
| `rates[0].amount` | `pricing.amount` |
| `payment_options.payment_types` | `pricing.type` |
| `availability` | `inventory.status` |

### Phase 5: Multi-Provider Search Hook

**File**: `src/hooks/useMultiProviderHotelSearch.ts`

```text
┌─────────────────────────────────────────────────────────────┐
│  useMultiProviderHotelSearch                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Parallel fetch from Hotelbeds & RateHawk                │
│  2. Normalize each response to ZivoProperty[]               │
│  3. Merge and deduplicate by property match                 │
│  4. Compare prices and set isCheapest flags                 │
│  5. Apply filters and sorting                               │
│  6. Return unified results                                   │
└─────────────────────────────────────────────────────────────┘
```

### Phase 6: Update Result Cards

Modify `HotelResultCard` to show:
- Source badge ("Hotelbeds" | "RateHawk")
- "Best Price" badge when `isCheapest: true`
- Availability status indicator

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/zivoProperty.ts` | ZivoProperty interface + extended version |
| `src/types/ratehawk.ts` | RateHawk API response types |
| `supabase/functions/ratehawk-hotels/index.ts` | RateHawk API edge function |
| `src/hooks/useRateHawkSearch.ts` | RateHawk search hook |
| `src/hooks/useMultiProviderHotelSearch.ts` | Unified multi-source search |

## Files to Modify

| File | Changes |
|------|---------|
| `src/services/hotelNormalizer.ts` | Add ZivoProperty normalizers, comparison logic |
| `src/types/hotels.ts` | Add SupplierCode "ratehawk" if not present |
| `src/components/results/HotelResultCard.tsx` | Add source badge, best price indicator |
| `src/pages/HotelResultsPage.tsx` | Switch to multi-provider hook |

---

## Technical Details

### Price Comparison Algorithm

```typescript
function markCheapestProperties(properties: ZivoProperty[]): ZivoProperty[] {
  // Group by property (same name + nearby coordinates)
  const groups = groupByPropertyMatch(properties);
  
  return groups.flatMap(group => {
    // Find minimum price in group
    const minPrice = Math.min(...group.map(p => p.pricing.amount));
    
    // Mark cheapest
    return group.map(p => ({
      ...p,
      pricing: {
        ...p.pricing,
        isCheapest: p.pricing.amount === minPrice
      }
    }));
  });
}
```

### Property Matching (Deduplication)

Properties are considered the same if:
- Names match (case-insensitive, after removing common suffixes)
- Coordinates within 100 meters of each other

### Inventory Status Mapping

| Supplier Status | ZivoProperty Status |
|-----------------|---------------------|
| Hotelbeds `BOOKABLE` | `AVAILABLE` |
| Hotelbeds `RECHECK` | `ON_REQUEST` |
| RateHawk `available` | `AVAILABLE` |
| RateHawk `on_request` | `ON_REQUEST` |
| Any sold out | `SOLD_OUT` |

---

## Environment Variables Required

```env
# Existing
HOTELBEDS_HOTEL_API_KEY
HOTELBEDS_HOTEL_SECRET

# New (for RateHawk)
RATEHAWK_API_KEY
RATEHAWK_AFFILIATE_ID
```

---

## Implementation Order

1. Create `src/types/zivoProperty.ts` with full schema
2. Add RateHawk types in `src/types/ratehawk.ts`
3. Create RateHawk edge function `supabase/functions/ratehawk-hotels/`
4. Update `hotelNormalizer.ts` with:
   - `normalizeHotelbedsToZivoProperty()`
   - `normalizeRateHawkToZivoProperty()`
   - `compareAndMarkCheapest()`
   - `mergeMultiSourceProperties()`
5. Create `useMultiProviderHotelSearch` hook
6. Update result card with source/cheapest badges
7. Integrate into HotelResultsPage

