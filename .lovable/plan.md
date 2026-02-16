

# Expand Real Locations -- Phase 2

## What's Changing
Adding 30+ new real addresses covering major US cities that are currently missing from the fallback search. This means when you type any major US city name, you'll always see relevant address suggestions.

## New Cities Being Added

| City | Addresses to Add |
|------|-----------------|
| **Boston, MA** | Faneuil Hall, Fenway Park |
| **Detroit, MI** | Comerica Park, Renaissance Center |
| **Minneapolis, MN** | Target Center, US Bank Stadium |
| **Nashville, TN** | Broadway downtown, Grand Ole Opry |
| **Charlotte, NC** | Bank of America Stadium, Uptown |
| **Portland, OR** | Pioneer Courthouse Square, Pearl District |
| **San Diego, CA** | Gaslamp Quarter, Balboa Park |
| **Orlando, FL** | International Drive, Convention Center |
| **Indianapolis, IN** | Monument Circle, Lucas Oil Stadium |
| **Columbus, OH** | Ohio Statehouse, Nationwide Arena |
| **Kansas City, MO** | Union Station, Country Club Plaza |
| **Milwaukee, WI** | Fiserv Forum, Milwaukee Art Museum |
| **Sacramento, CA** | State Capitol, Golden 1 Center |
| **Raleigh, NC** | NC State Capitol, PNC Arena |
| **Salt Lake City, UT** | Temple Square, Vivint Arena |

Plus major **airports**: JFK, LAX, ORD, ATL, DFW, DEN, SFO, SEA, MIA, BOS

## Files to Change

| File | Change |
|------|--------|
| `src/data/mockLocations.ts` | Add ~35 new addresses to MOCK_ADDRESSES and matching coordinates to MOCK_COORDS (mock-41 through mock-75) |
| `src/lib/cityUtils.ts` | Add suburb-to-city mappings for all new metro areas (Boston, Detroit, Nashville, Portland, San Diego, Orlando, etc.) |

## Technical Details

- MOCK_ADDRESSES grows from 40 to ~75 entries
- Each new address gets a MOCK_COORDS entry with real GPS coordinates
- MOCK_PLACE_SUGGESTIONS and MOCK_ADDRESS_STRINGS auto-derive (no extra changes needed)
- All geocode hooks automatically pick up the expanded list via substring filtering
- No edge function or API changes required

