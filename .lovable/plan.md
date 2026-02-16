

# Add More Real Locations to Address Search

## Problem
When typing in the pickup/destination fields, the Google Places autocomplete may not return results (due to authentication state, API key issues, or network errors). The fallback mock suggestions only contain 10 addresses from a few cities, so typing most city names or addresses returns nothing -- making it seem like the search is broken.

## Solution
Expand the mock/fallback address list from 10 to 30+ real addresses covering all major US metro areas. This ensures users can always find a relevant suggestion when typing, even when the Google API is unavailable.

## New Addresses to Add

Current 10 addresses will be expanded to 30+, adding:

| Address | City |
|---------|------|
| 30 Rockefeller Plaza, New York, NY | NYC |
| 100 Central Park West, New York, NY | NYC |
| 3700 Wilshire Blvd, Los Angeles, CA | LA |
| 1111 S Figueroa St, Los Angeles, CA | LA |
| 500 N Michigan Ave, Chicago, IL | Chicago |
| 875 N Michigan Ave, Chicago, IL | Chicago |
| 1 Hartsfield Center Pkwy, Atlanta, GA | Atlanta |
| 225 Peachtree St NE, Atlanta, GA | Atlanta |
| 2600 Benjamin Mays Dr SW, Atlanta, GA | Atlanta |
| 600 Congress Ave, Austin, TX | Austin |
| 1100 Congress Ave, Austin, TX | Austin |
| 2101 NASA Pkwy, Houston, TX | Houston |
| 1001 Avenida de las Americas, Houston, TX | Houston |
| 1901 Main St, Dallas, TX | Dallas |
| 300 Alamo Plaza, San Antonio, TX | San Antonio |
| 1600 Arch St, Philadelphia, PA | Philadelphia |
| 1 N Broad St, Philadelphia, PA | Philadelphia |
| 200 E Pratt St, Baltimore, MD | Baltimore |
| 300 E Pratt St, Baltimore, MD | Baltimore |
| 700 Clark Ave, St. Louis, MO | St. Louis |
| 1000 Chopper Cir, Denver, CO | Denver |
| 1701 Bryant St, Denver, CO | Denver |
| 400 Broad St, Seattle, WA | Seattle |
| 1000 4th Ave, Seattle, WA | Seattle |
| 750 E Pratt St, Phoenix, AZ | Phoenix |
| 2701 E Camelback Rd, Phoenix, AZ | Phoenix |
| 100 Aquarium Way, Long Beach, CA | Long Beach |
| 3799 Las Vegas Blvd S, Las Vegas, NV | Las Vegas |
| 1 Caesars Palace Dr, Las Vegas, NV | Las Vegas |
| 1 Busch Gardens Blvd, Tampa, FL | Tampa |

## Files to Change

| File | Change |
|------|--------|
| `src/data/mockLocations.ts` | Expand MOCK_ADDRESSES from 10 to 30+ entries, add matching MOCK_COORDS for each |
| `src/lib/cityUtils.ts` | Add suburb mappings for new cities (Atlanta, Austin, Houston, Dallas, Denver, Seattle, Phoenix, Las Vegas, Tampa, etc.) |

## Technical Details

- MOCK_ADDRESSES array grows from 10 to ~40 entries
- Each new address gets a corresponding entry in MOCK_COORDS with real GPS coordinates
- MOCK_PLACE_SUGGESTIONS and MOCK_ADDRESS_STRINGS auto-derive from MOCK_ADDRESSES (no changes needed)
- All hooks (useGoogleMapsGeocode, useMapboxGeocode, useServerGeocode) automatically pick up the expanded list
- The substring filter in each hook will now match many more city/address queries
- No edge function or API changes needed

