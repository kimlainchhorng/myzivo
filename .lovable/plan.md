

# Update All Mock/Fallback Addresses to Real US Locations

## Overview
Replace all hardcoded Baton Rouge, Louisiana mock addresses and coordinates with real, recognizable addresses from major US cities. This affects fallback suggestions, default map centers, and demo mode data across ~17 files.

## What Changes

### 1. New Centralized Mock Data (`src/data/mockLocations.ts`) -- New File
A single source of truth for all fallback/demo addresses and coordinates, covering major US cities:

| Address | City | Coordinates |
|---------|------|-------------|
| 350 Fifth Avenue, New York, NY | NYC (Empire State Bldg) | 40.7484, -73.9857 |
| 1 World Trade Center, New York, NY | NYC | 40.7127, -74.0134 |
| 200 Santa Monica Pier, Santa Monica, CA | LA | 34.0094, -118.4973 |
| 6801 Hollywood Blvd, Los Angeles, CA | LA | 34.1015, -118.3391 |
| 1600 Pennsylvania Ave NW, Washington, DC | DC | 38.8977, -77.0365 |
| 233 S Wacker Dr, Chicago, IL | Chicago (Willis Tower) | 41.8789, -87.6359 |
| 1 Infinite Loop, Cupertino, CA | SF Bay Area | 37.3318, -122.0312 |
| 401 Biscayne Blvd, Miami, FL | Miami | 25.7751, -80.1868 |
| 600 Bourbon St, New Orleans, LA | New Orleans | 29.9584, -90.0654 |
| 1000 Ala Moana Blvd, Honolulu, HI | Honolulu | 21.2907, -157.8440 |

Default center changes from Baton Rouge (30.45, -91.19) to **New York City** (40.7128, -73.9857) as the national default.

### 2. Files to Update

| File | Change |
|------|--------|
| `src/data/mockLocations.ts` | **New** -- centralized mock addresses, coords, and default center |
| `src/hooks/useGoogleMapsGeocode.ts` | Import and use new mock suggestions |
| `src/hooks/useMapboxGeocode.ts` | Import and use new mock suggestions |
| `src/hooks/useServerGeocode.ts` | Import and use new mock suggestions + coords |
| `src/pages/ride/RidePage.tsx` | Update default pickup text |
| `src/pages/ride/RideTripPage.tsx` | Update DEFAULT_PICKUP / DEFAULT_DESTINATION coords |
| `src/pages/ride/RideDriverPage.tsx` | Update DEFAULT_PICKUP / DEFAULT_DRIVER_START coords |
| `src/pages/Rides.tsx` | Update fallback center and fallback location coords |
| `src/components/maps/MapboxMap.tsx` | Update default center |
| `src/components/ride/RideLocationCard.tsx` | Update fallback geolocation coords |
| `src/components/ride/RidesMapBackground.tsx` | Update default center |
| `src/components/dispatch/DispatchLiveMap.tsx` | Update DEFAULT_CENTER |
| `src/components/analytics/DeliveryHeatmap.tsx` | Update default center |
| `src/pages/track/OrderTrackingPage.tsx` | Update default center |
| `src/pages/EatsDeliveryReplay.tsx` | Update fallback coords |
| `src/hooks/useGoogleMapsRoute.ts` | Update mock fallback coords |
| `src/hooks/useMapboxRoute.ts` | Update mock fallback coords |
| `src/hooks/useDriverApp.ts` | Update simulation fallback coords |
| `src/services/googleMaps.ts` | Update default center |
| `src/services/mapbox.ts` | Update default center |
| `src/lib/cityUtils.ts` | Expand suburb mapping to include major US cities |

### 3. Approach
- Create `src/data/mockLocations.ts` with exported constants: `MOCK_ADDRESSES`, `MOCK_COORDS`, `DEFAULT_CENTER`, `DEFAULT_PICKUP_COORDS`, `DEFAULT_DROPOFF_COORDS`
- All 17+ files will import from this single source instead of having inline duplicates
- This makes future address updates a single-file change

## Technical Notes
- No API changes -- these are only offline/demo fallbacks
- Real geocoding via Google Places API continues to work as before
- The live app experience is unchanged for users with location services enabled
- Default map center moves to NYC as a nationally recognizable default

