

# Multi-City Support for Customers

## Overview
Enable city-based content filtering for the Eats service so customers only see restaurants, drivers, and promotions available in their selected or detected city. The system will detect location on first visit, allow manual city selection, and filter all relevant data accordingly.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `cities` table | Complete | Has id, name, country, currency, is_active |
| `eats_zones` table | Complete | Has city_name, zone_code, delivery fees, tax rates (6 zones: NYC, LAX, CHI, MIA, SFO, DEFAULT) |
| `zones` table | Complete | Has city_id FK to cities, delivery pricing |
| `restaurants.city` column | Complete | Text field for city name |
| `restaurants.region_id` column | Complete | UUID FK to regions |
| `food_orders.zone_code` column | Complete | Text field for zone |
| `food_orders.region_id` column | Complete | UUID FK to regions |
| `promotions.merchant_id` column | Complete | Can filter by restaurant's city |
| `useGeoDetection` hook | Complete | Detects country from timezone/language, caches to localStorage |
| `useCurrentLocation` hook | Complete | Browser geolocation + Mapbox reverse geocoding |
| `usePricingZone` hook | Complete | Finds pricing zone by lat/lng coordinates |
| `useEatsZones` hook | Complete | Fetches all active eats_zones |
| `useRestaurants` hook | Complete | Fetches restaurants (no city filter) |
| `AppHeader` component | Complete | Has location button placeholder |
| `MobileLocationBar` component | Complete | Location display with address |
| `RegionContext` | Complete | Admin region scoping |
| `CartContext` | Complete | Manages cart with localStorage |

### Missing
| Feature | Status |
|---------|--------|
| City-specific filtering for restaurants | Need to add |
| City selection dropdown in header | Need to create |
| City detection from device location | Need to implement |
| Save selected city to localStorage + profile | Need to add |
| Store city_id on food orders | Need to update |
| Customer city context | Need to create |
| First-visit city selection modal | Need to create |

---

## Database Changes

### Add city_id to Profiles
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_city_id UUID REFERENCES cities(id),
ADD COLUMN IF NOT EXISTS selected_city_name TEXT;
```

### Add city_id to Food Orders
```sql
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id),
ADD COLUMN IF NOT EXISTS city_name TEXT;
```

### Populate Cities Table
Currently the `cities` table appears empty. We should seed it from `eats_zones`:
```sql
INSERT INTO cities (name, country, currency, is_active) 
SELECT DISTINCT city_name, 'US', 'USD', true 
FROM eats_zones 
WHERE city_name != 'Default'
ON CONFLICT DO NOTHING;
```

### Link eats_zones to cities
```sql
ALTER TABLE eats_zones 
ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

UPDATE eats_zones ez
SET city_id = c.id
FROM cities c
WHERE c.name = ez.city_name;
```

---

## Implementation Plan

### 1) Create CustomerCityContext

**File to Create:** `src/contexts/CustomerCityContext.tsx`

**Purpose:** Manage customer's selected city across the app.

**State:**
- `selectedCity: City | null` - Current city selection
- `isDetecting: boolean` - Whether location detection is in progress
- `hasAsked: boolean` - Whether user has been prompted to select city

**Logic:**
```typescript
// On mount:
// 1. Check localStorage for saved city
// 2. If no saved city, check user profile (if logged in)
// 3. If still no city, try to detect from location
// 4. If detection fails, show city selection modal

interface City {
  id: string;
  name: string;
  zone_code: string;
  country: string;
}

interface CustomerCityContextType {
  selectedCity: City | null;
  isLoading: boolean;
  setCity: (city: City) => void;
  clearCity: () => void;
  detectCity: () => Promise<void>;
  cities: City[];
}
```

### 2) Create useCities Hook

**File to Create:** `src/hooks/useCities.ts`

**Purpose:** Fetch available cities from eats_zones and detect city from coordinates.

```typescript
// Fetch active cities
export function useActiveCities() {
  return useQuery({
    queryKey: ["active-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eats_zones")
        .select("id, city_name, zone_code")
        .eq("is_active", true)
        .neq("zone_code", "DEFAULT")
        .order("city_name");
      
      if (error) throw error;
      return data.map(z => ({
        id: z.id,
        name: z.city_name,
        zoneCode: z.zone_code,
      }));
    },
  });
}

// Detect city from coordinates using reverse geocoding
export function useDetectCityFromCoords() {
  return useMutation({
    mutationFn: async (coords: { lat: number; lng: number }) => {
      // Use Mapbox reverse geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?types=place&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const cityName = data.features[0].text;
        // Match to our zones
        return cityName;
      }
      return null;
    },
  });
}

// Save city to profile (for logged-in users)
export function useSaveCityToProfile() {
  return useMutation({
    mutationFn: async ({ userId, cityId, cityName }: { 
      userId: string; 
      cityId: string; 
      cityName: string 
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          selected_city_id: cityId,
          selected_city_name: cityName,
        })
        .eq("user_id", userId);
      
      if (error) throw error;
    },
  });
}
```

### 3) Create City Selector Component

**File to Create:** `src/components/city/CitySelector.tsx`

**Purpose:** Dropdown component for header to select city.

**UI:**
```text
+--------------------------------+
| 📍 New York ▼                  |
+--------------------------------+
     ↓ (on click)
+--------------------------------+
| Select Your City               |
+--------------------------------+
| 📍 Detect My Location          |
+--------------------------------+
| ○ New York                     |
| ○ Los Angeles                  |
| ○ Chicago                      |
| ○ Miami                        |
| ○ San Francisco                |
+--------------------------------+
```

**Features:**
- Shows current city with MapPin icon
- Dropdown with all available cities
- "Detect My Location" button that uses geolocation
- Saves selection to localStorage + profile

### 4) Create First-Visit City Selection Modal

**File to Create:** `src/components/city/CitySelectionModal.tsx`

**Purpose:** Prompt new users to select or detect their city.

**UI:**
```text
+------------------------------------------+
|                                          |
|        📍 Where are you ordering?        |
|                                          |
|  We'll show you restaurants that deliver |
|              to your area                |
|                                          |
|  +------------------------------------+  |
|  | [📍] Use My Current Location      |  |
|  +------------------------------------+  |
|                                          |
|  Or select a city:                       |
|                                          |
|  [New York    ▼]                         |
|                                          |
|  [Continue]                              |
|                                          |
+------------------------------------------+
```

**Logic:**
- Show on first visit (no city in localStorage)
- Allow location detection or manual selection
- Save preference and dismiss
- Can be skipped but will default to closest match

### 5) Update useRestaurants Hook

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Add city filtering:**
```typescript
export function useRestaurants(cityName: string | null, onlyOpen: boolean = false) {
  return useQuery({
    queryKey: ["restaurants", cityName, onlyOpen],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false });

      // Filter by city if provided
      if (cityName) {
        query = query.eq("city", cityName);
      }

      if (onlyOpen) {
        query = query.eq("is_open", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Restaurant[];
    },
  });
}
```

### 6) Update AppHeader Component

**File to Modify:** `src/components/app/AppHeader.tsx`

**Replace static "Current Location" button with CitySelector:**
```typescript
// Import context and component
import { useCustomerCity } from "@/contexts/CustomerCityContext";
import CitySelector from "@/components/city/CitySelector";

// In header center section:
{title ? (
  <h1>...</h1>
) : !hideLocation && (
  <CitySelector />
)}
```

### 7) Update MobileEatsPremium Component

**File to Modify:** `src/components/eats/MobileEatsPremium.tsx`

**Add city filtering:**
```typescript
import { useCustomerCity } from "@/contexts/CustomerCityContext";

export default function MobileEatsPremium() {
  const { selectedCity } = useCustomerCity();
  
  // Pass city name to useRestaurants
  const { data: restaurants, isLoading, error } = useRestaurants(
    selectedCity?.name || null
  );
  
  // Show city selector if no city selected
  if (!selectedCity) {
    return <CitySelectionModal />;
  }
  
  // ... rest of component
}
```

### 8) Update Order Creation

**File to Modify:** `src/hooks/useEatsOrders.ts`

**Add city_id and zone_code to order:**
```typescript
// In useCreateFoodOrder mutation:
const { data: order, error: orderError } = await supabase
  .from(EATS_TABLES.orders)
  .insert({
    restaurant_id: input.restaurant_id,
    customer_id: customerId,
    items: itemsJson,
    // ... existing fields
    
    // New city fields
    city_id: input.city_id,
    city_name: input.city_name,
    zone_code: input.zone_code,
  })
```

### 9) Update CartContext

**File to Modify:** `src/contexts/CartContext.tsx`

**Store city context with cart:**
```typescript
interface CartContextType {
  // ... existing fields
  cityId: string | null;
  cityName: string | null;
  zoneCode: string | null;
  setCityContext: (city: { id: string; name: string; zoneCode: string }) => void;
}
```

### 10) Wrap App with CustomerCityProvider

**File to Modify:** `src/App.tsx`

```typescript
import { CustomerCityProvider } from "@/contexts/CustomerCityContext";

// Wrap the app
<CustomerCityProvider>
  <CartProvider>
    {/* ... existing providers */}
  </CartProvider>
</CustomerCityProvider>
```

---

## File Summary

### Database Migration (1)
| Change | Purpose |
|--------|---------|
| Add `selected_city_id`, `selected_city_name` to profiles | Store user preference |
| Add `city_id`, `city_name` to food_orders | Record order location |
| Add `city_id` to eats_zones | Link zones to cities |
| Seed cities table from eats_zones | Populate available cities |

### New Files (5)
| File | Purpose |
|------|---------|
| `src/contexts/CustomerCityContext.tsx` | City state management |
| `src/hooks/useCities.ts` | City data + detection hooks |
| `src/components/city/CitySelector.tsx` | Header dropdown |
| `src/components/city/CitySelectionModal.tsx` | First-visit modal |
| Migration SQL file | Schema changes |

### Modified Files (5)
| File | Changes |
|------|---------|
| `src/hooks/useEatsOrders.ts` | Add city filter to useRestaurants, city fields to order creation |
| `src/components/app/AppHeader.tsx` | Replace static location with CitySelector |
| `src/components/eats/MobileEatsPremium.tsx` | Use city context for filtering |
| `src/contexts/CartContext.tsx` | Add city context to cart |
| `src/App.tsx` | Wrap with CustomerCityProvider |

---

## Data Flow

```text
User Opens App
        ↓
CustomerCityProvider mounts
        ↓
Check localStorage for saved city
├── Found → Use saved city
└── Not found → Check profile (if logged in)
    ├── Found → Use profile city
    └── Not found → Show CitySelectionModal
            ↓
User selects city or detects location
        ↓
Save to localStorage + profile (if logged in)
        ↓
useRestaurants(cityName) filters restaurants
        ↓
User browses & orders
        ↓
Order includes city_id, city_name, zone_code
        ↓
Zone pricing applied based on zone_code
```

---

## UI Components Detail

### CitySelector (Header)
- Compact pill button showing current city
- Opens popover with city list
- "Detect Location" option at top
- Closes on selection

### CitySelectionModal (First Visit)
- Full-screen modal on mobile
- Dialog on desktop
- Large "Use My Location" button
- City dropdown as alternative
- Cannot be dismissed without selection (or user clicks "Maybe Later" defaulting to nearest major city)

### City Badge in Eats
- Shows current city at top of restaurant list
- "Change" link to open selector
- If no restaurants in city: "No restaurants in [City] yet. Browse nearby cities?"

---

## Storage Strategy

| Location | Purpose | Expiry |
|----------|---------|--------|
| localStorage `zivo-customer-city` | Quick access, works for guests | None |
| profiles.selected_city_id | Sync across devices for logged-in users | None |
| CartContext.cityContext | Ensure order matches selected city | Session |

---

## Summary

This implementation enables:

1. **City Detection** - Auto-detect from device location using Mapbox
2. **City Selection** - Manual dropdown in header
3. **First-Visit Prompt** - Modal for new users to select city
4. **Restaurant Filtering** - Only show restaurants in selected city
5. **Zone-Based Pricing** - Apply correct delivery fees/taxes per zone
6. **Order Tracking** - Store city_id and zone_code on each order
7. **Cross-Device Sync** - Save preference to profile for logged-in users

Leverages existing `eats_zones` table as the source of available cities, reuses `useCurrentLocation` for geolocation, and integrates with the existing `CartContext` for order placement.

