

# Admin Panel for Zone Pricing Rates

## Overview

Create a dedicated admin page to manage the `zone_pricing_rates` table without requiring direct database access. Admins will be able to view, edit, create, and delete pricing rates for each ride type within each pricing zone.

## Current State

| Component | Status |
|-----------|--------|
| `zone_pricing_rates` table | 15+ rate entries across multiple zones |
| `pricing_zones` table | 7 zones including Default US, Baton Rouge, New Orleans |
| Admin pattern | Existing `AdminPricingControls` uses `usePricing` hook pattern |
| Settings integration | `SettingsHub.tsx` has Fees & Pricing tab |

## Implementation Plan

### Step 1: Create Zone Pricing Rates Hook
**File**: `src/hooks/useZonePricingAdmin.ts` (NEW)

Create a hook with CRUD operations:
- `useZonePricingRates(zoneId)` - Fetch rates for a zone
- `useAllZones()` - Fetch all pricing zones
- `useUpdateZonePricingRate()` - Update a rate
- `useCreateZonePricingRate()` - Add new rate
- `useDeleteZonePricingRate()` - Remove a rate

### Step 2: Create Admin Page Component
**File**: `src/pages/admin/ZonePricingRatesPage.tsx` (NEW)

Features:
- Zone selector dropdown (filter by zone)
- Table showing all rates for selected zone
- Inline editing for rate values
- Add new ride type button
- Delete rate with confirmation
- Quick stats cards (zone count, rate count, avg multiplier)
- Fare calculator preview

### Step 3: Add Route to App.tsx
**File**: `src/App.tsx`

Add route:
```text
/admin/zone-pricing → ZonePricingRatesPage
```

### Step 4: Link from Settings Hub
**File**: `src/pages/admin/settings/SettingsHub.tsx`

Add navigation card in "Fees & Pricing" tab linking to the new page.

## UI Design

### Header
```text
┌─────────────────────────────────────────────────────────────────┐
│  📍 Zone Pricing Rates                                          │
│  Manage ride pricing by geographic zone                          │
│                                                                   │
│  [Zone: Default US ▼]              [+ Add Rate] [Bulk Import]    │
└─────────────────────────────────────────────────────────────────┘
```

### Stats Cards
```text
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Total Zones   │ │ Rates in Zone │ │ Lowest Base   │ │ Highest Multi │
│      7        │ │      15       │ │    $2.50      │ │    4.00×      │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

### Rates Table
```text
┌─────────────────────────────────────────────────────────────────┐
│ Ride Type │ Base  │ /Mile │ /Min  │ Booking │ Min Fare │ Multi │
├───────────────────────────────────────────────────────────────────┤
│ standard  │ $3.50 │ $1.75 │ $0.35 │  $2.50  │  $7.00   │ 1.00× │ [✏️][🗑️]
│ black     │ $5.00 │ $2.30 │ $0.38 │  $2.50  │ $14.00   │ 1.65× │ [✏️][🗑️]
│ lux       │$15.00 │ $6.00 │ $1.00 │  $5.00  │ $75.00   │ 3.50× │ [✏️][🗑️]
│ secure    │$25.00 │ $8.00 │ $1.25 │ $10.00  │$100.00   │ 4.00× │ [✏️][🗑️]
└─────────────────────────────────────────────────────────────────┘
```

### Edit Dialog
```text
┌──────────────────────────────────────┐
│  Edit Rate: Black                    │
├──────────────────────────────────────┤
│  Base Fare ($)      [5.00      ]     │
│  Per Mile ($)       [2.30      ]     │
│  Per Minute ($)     [0.38      ]     │
│  Booking Fee ($)    [2.50      ]     │
│  Minimum Fare ($)   [14.00     ]     │
│  Multiplier         [1.65      ]     │
│                                      │
│  Preview: 10mi / 25min = $66.00      │
├──────────────────────────────────────┤
│           [Cancel]    [Save]         │
└──────────────────────────────────────┘
```

### Add New Rate Dialog
```text
┌──────────────────────────────────────┐
│  Add New Ride Type Rate              │
├──────────────────────────────────────┤
│  Ride Type ID     [___________]      │
│  (e.g., economy, black, lux)         │
│                                      │
│  [Copy from existing ▼]              │
│                                      │
│  Base Fare ($)      [3.50      ]     │
│  Per Mile ($)       [1.75      ]     │
│  Per Minute ($)     [0.35      ]     │
│  Booking Fee ($)    [2.50      ]     │
│  Minimum Fare ($)   [7.00      ]     │
│  Multiplier         [1.00      ]     │
├──────────────────────────────────────┤
│           [Cancel]    [Create]       │
└──────────────────────────────────────┘
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useZonePricingAdmin.ts` | Create | CRUD hooks for zone pricing rates |
| `src/pages/admin/ZonePricingRatesPage.tsx` | Create | Main admin page component |
| `src/App.tsx` | Modify | Add route for new page |
| `src/pages/admin/settings/SettingsHub.tsx` | Modify | Add link to new page |

## Technical Details

### Hook API

```text
// Fetch all zones for dropdown
useAllZones() → { zones: PricingZone[], isLoading, error }

// Fetch rates for a specific zone
useZoneRates(zoneId) → { rates: ZonePricingRate[], isLoading, error }

// Update a rate
useUpdateZoneRate() → { mutate: (rate) => void, isPending }

// Create a new rate
useCreateZoneRate() → { mutate: (rate) => void, isPending }

// Delete a rate
useDeleteZoneRate() → { mutate: (id) => void, isPending }
```

### Validation Rules

- Base fare: 0-100
- Per mile: 0-50
- Per minute: 0-10
- Booking fee: 0-25
- Minimum fare: 0-200
- Multiplier: 0.5-10.0
- Ride type: lowercase, alphanumeric, underscores only

### Fare Preview Calculator

Live preview calculation:
```text
preview = max(
  (base + (miles × per_mile) + (mins × per_minute) + booking_fee),
  minimum_fare
) × multiplier
```

Default preview: 10 miles, 25 minutes

## Testing Checklist

1. Navigate to `/admin/zone-pricing`
2. Select different zones from dropdown
3. Verify rates load correctly for each zone
4. Edit a rate and verify changes persist
5. Add a new rate for a zone
6. Delete a rate with confirmation
7. Verify fare preview updates live
8. Test validation for invalid inputs

