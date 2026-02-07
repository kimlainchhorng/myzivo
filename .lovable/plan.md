
# Server-Side Google Maps + Pricing + Arrival Detection

## Summary

Migrate Google Maps API calls from client-side to server-side edge functions for security and billing control. Add automatic driver arrival detection based on GPS proximity to pickup/dropoff locations.

---

## Current State Analysis

| Component | Current | Issue |
|-----------|---------|-------|
| Autocomplete | Client-side via `getAddressSuggestions()` | API key exposed in browser |
| Place Details | Client-side via `geocodeAddress()` | API key exposed |
| Route/Directions | Client-side via `getRoute()` | API key exposed |
| Pricing | Uses mock distance via `calculateMockTrip()` | Not using real route data |
| Driver Arrival | Manual button tap only | No automatic detection |
| API Key | `GOOGLE_MAPS_API_KEY` secret exists ✅ | Ready to use server-side |

---

## New Edge Functions

### 1. `maps-autocomplete` - Address Autocomplete

Places API autocomplete for pickup/dropoff search.

```text
POST /maps-autocomplete
Body: { input: "123 Main St", proximity?: { lat, lng } }
Response: { ok: true, suggestions: [{ description, place_id }] }
```

### 2. `maps-place-details` - Geocode Place ID to Coordinates

Get lat/lng from a selected place_id.

```text
POST /maps-place-details
Body: { place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4" }
Response: { ok: true, address, lat, lng }
```

### 3. `maps-route` - Route with Distance, Duration, Polyline

Get driving route between two coordinates.

```text
POST /maps-route
Body: { origin_lat, origin_lng, dest_lat, dest_lng }
Response: { ok: true, distance_miles, duration_minutes, polyline }
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/maps-autocomplete/index.ts` | Create | Places Autocomplete edge function |
| `supabase/functions/maps-place-details/index.ts` | Create | Place Details (geocode) edge function |
| `supabase/functions/maps-route/index.ts` | Create | Directions API edge function |
| `supabase/config.toml` | Modify | Add new function configs |
| `src/services/mapsApi.ts` | Create | Client wrapper for edge functions |
| `src/hooks/useServerGeocode.ts` | Create | Hook using server-side autocomplete |
| `src/hooks/useServerRoute.ts` | Create | Hook using server-side routing |
| `src/components/ride/RideLocationCard.tsx` | Modify | Use server-side autocomplete |
| `src/pages/ride/RidePage.tsx` | Modify | Use server-side route + pricing |
| `src/hooks/useDriverApp.ts` | Modify | Add arrival detection logic |
| `src/components/driver/ActiveTripCard.tsx` | Modify | Show proximity-based arrival prompt |

---

## Technical Details

### Edge Function: maps-autocomplete

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, proximity } = await req.json();
    if (!input) {
      return new Response(JSON.stringify({ error: "Missing input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(input)}` +
      `&types=geocode` +
      `&key=${encodeURIComponent(key)}`;

    if (proximity?.lat && proximity?.lng) {
      url += `&location=${proximity.lat},${proximity.lng}&radius=50000`;
    }

    const res = await fetch(url);
    const data = await res.json();

    const suggestions = (data.predictions ?? []).slice(0, 6).map((p: any) => ({
      description: p.description,
      place_id: p.place_id,
      main_text: p.structured_formatting?.main_text,
    }));

    return new Response(JSON.stringify({ ok: true, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### Edge Function: maps-place-details

```typescript
Deno.serve(async (req) => {
  // CORS handling...
  
  const { place_id } = await req.json();
  const key = Deno.env.get("GOOGLE_MAPS_API_KEY");

  const url = `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(place_id)}` +
    `&fields=formatted_address,geometry/location` +
    `&key=${encodeURIComponent(key)}`;

  const res = await fetch(url);
  const data = await res.json();
  const r = data.result;

  return Response.json({
    ok: true,
    address: r?.formatted_address,
    lat: r?.geometry?.location?.lat,
    lng: r?.geometry?.location?.lng,
  });
});
```

### Edge Function: maps-route

```typescript
Deno.serve(async (req) => {
  // CORS handling...
  
  const { origin_lat, origin_lng, dest_lat, dest_lng } = await req.json();
  const key = Deno.env.get("GOOGLE_MAPS_API_KEY");

  const url = `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin_lat},${origin_lng}` +
    `&destination=${dest_lat},${dest_lng}` +
    `&mode=driving` +
    `&key=${encodeURIComponent(key)}`;

  const res = await fetch(url);
  const data = await res.json();

  const route = data.routes?.[0];
  const leg = route?.legs?.[0];

  if (!route || !leg) {
    return Response.json({ ok: false, error: "No route found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    distance_miles: Number((leg.distance.value / 1609.344).toFixed(2)),
    duration_minutes: Math.max(1, Math.round(leg.duration.value / 60)),
    polyline: route.overview_polyline?.points ?? null,
  });
});
```

### Client Wrapper: src/services/mapsApi.ts

```typescript
import { supabase } from "@/integrations/supabase/client";

export interface PlaceSuggestion {
  description: string;
  place_id: string;
  main_text?: string;
}

export interface PlaceDetails {
  address: string;
  lat: number;
  lng: number;
}

export interface RouteResult {
  distance_miles: number;
  duration_minutes: number;
  polyline: string | null;
}

export async function getAutocompleteSuggestions(
  input: string,
  proximity?: { lat: number; lng: number }
): Promise<PlaceSuggestion[]> {
  const { data, error } = await supabase.functions.invoke("maps-autocomplete", {
    body: { input, proximity },
  });

  if (error || !data?.ok) {
    console.error("Autocomplete error:", error || data?.error);
    return [];
  }

  return data.suggestions;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const { data, error } = await supabase.functions.invoke("maps-place-details", {
    body: { place_id: placeId },
  });

  if (error || !data?.ok) {
    console.error("Place details error:", error || data?.error);
    return null;
  }

  return {
    address: data.address,
    lat: data.lat,
    lng: data.lng,
  };
}

export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  const { data, error } = await supabase.functions.invoke("maps-route", {
    body: {
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      dest_lat: destination.lat,
      dest_lng: destination.lng,
    },
  });

  if (error || !data?.ok) {
    console.error("Route error:", error || data?.error);
    return null;
  }

  return {
    distance_miles: data.distance_miles,
    duration_minutes: data.duration_minutes,
    polyline: data.polyline,
  };
}
```

---

## Maps → Pricing Integration

### Updated Ride Flow

```text
1. User enters pickup → calls maps-autocomplete
2. User selects suggestion → calls maps-place-details → get pickupCoords
3. User enters dropoff → calls maps-autocomplete  
4. User selects suggestion → calls maps-place-details → get dropoffCoords
5. App calls maps-route → get distance_miles, duration_minutes, polyline
6. App calculates prices using real data:
   calculateRidePrice(rideId, distance_miles, duration_minutes)
7. User confirms → create ride with real route data
```

### RidePage.tsx Integration

```typescript
// When both pickup and dropoff have coordinates:
useEffect(() => {
  if (pickupCoords && dropoffCoords) {
    getRoute(pickupCoords, dropoffCoords).then(route => {
      if (route) {
        setTripDetails({
          distance: route.distance_miles,
          duration: route.duration_minutes,
        });
        setRoutePolyline(route.polyline);
      }
    });
  }
}, [pickupCoords, dropoffCoords]);
```

---

## Driver Arrival Detection

### Logic (0.10 mile threshold)

```typescript
const ARRIVAL_THRESHOLD_MILES = 0.10; // ~528 feet

function checkArrival(
  driverLat: number,
  driverLng: number,
  targetLat: number,
  targetLng: number
): boolean {
  const distance = haversineMiles(driverLat, driverLng, targetLat, targetLng);
  return distance <= ARRIVAL_THRESHOLD_MILES;
}
```

### Integration Points

**In `useDriverApp.ts` location tracking:**
```typescript
// After updating location, check proximity
if (activeTrip?.status === 'accepted' || activeTrip?.status === 'en_route') {
  const nearPickup = checkArrival(lat, lng, trip.pickup_lat, trip.pickup_lng);
  if (nearPickup) {
    // Show "Arrived" prompt or auto-update status
    onArrivalDetected?.('pickup');
  }
}

if (activeTrip?.status === 'in_progress') {
  const nearDropoff = checkArrival(lat, lng, trip.dropoff_lat, trip.dropoff_lng);
  if (nearDropoff) {
    // Show "Complete Trip" prompt
    onArrivalDetected?.('dropoff');
  }
}
```

**In `ActiveTripCard.tsx`:**
```typescript
// Show prominent arrival prompt
{isNearPickup && trip.status !== 'arrived' && (
  <motion.div className="bg-green-500 text-white text-center py-2">
    📍 You're at the pickup location
  </motion.div>
)}

{isNearDropoff && trip.status === 'in_progress' && (
  <motion.div className="bg-green-500 text-white text-center py-2">
    🏁 You've reached the destination
  </motion.div>
)}
```

---

## UI Flow Diagram

```text
Customer Flow:
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│ Type Pickup  │ ──► │ maps-autocomplete   │ ──► │ Show Suggestions│
└──────────────┘     └─────────────────────┘     └─────────────────┘
       │                                                │
       ▼                                                ▼
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│ Select Place │ ──► │ maps-place-details  │ ──► │ Store Coords    │
└──────────────┘     └─────────────────────┘     └─────────────────┘
       │                                                │
       ▼                                                ▼
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│ Both Selected│ ──► │ maps-route          │ ──► │ Calculate Fares │
└──────────────┘     └─────────────────────┘     └─────────────────┘

Driver Flow:
┌──────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│ GPS Update   │ ──► │ Check Distance to   │ ──► │ Auto-detect     │
│ (every 5s)   │     │ Pickup/Dropoff      │     │ Arrival         │
└──────────────┘     └─────────────────────┘     └─────────────────┘
```

---

## Benefits

1. **API Key Security** - No client-side exposure
2. **Billing Control** - Server-side rate limiting possible
3. **Real Pricing** - Uses actual distance/duration instead of mocks
4. **Route Preview** - Can decode polyline for map display
5. **Auto Arrival** - Better driver UX with proximity detection
6. **Consistent Data** - Same route data for pricing and navigation

---

## No Changes To

- Existing client-side `src/services/googleMaps.ts` (kept for backwards compatibility/map rendering)
- Driver location update edge function (already exists)
- Rate limiter edge function (already exists)
- Pricing formula constants (same multipliers)
