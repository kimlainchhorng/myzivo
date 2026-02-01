
# Filters UX Upgrade for Travel Results Pages

## Overview

This plan upgrades the filtering experience across all three travel results pages (`/flights/results`, `/hotels/results`, `/rent-car/results`) with a unified, premium UX that includes active filter chips, URL synchronization, debounced updates, and consistent mobile/desktop patterns.

---

## What Will Be Upgraded

### 1. Active Filter Chips Above Results
Visual display of currently applied filters with immediate removal capability:
- Price: $200-$500
- Stops: Nonstop
- Airline: Qatar Airways
- Rating: 4★+
- Car type: SUV
- "Clear all" button appears when 2+ filters active

### 2. URL Synchronization
Filters sync to URL parameters for shareable links:
```
/flights/results?origin=MSY&destination=PNH&...&price_max=500&stops=0&airline=QR
```
All UTM and tracking params are preserved.

### 3. Desktop Sidebar Improvements
- Sticky positioning with scroll area
- Immediate filter application (no Apply button needed)
- Clear visual feedback on active selections
- Service-specific accent colors

### 4. Mobile Bottom Sheet Improvements
- Fixed "Apply" and "Clear all" buttons at bottom
- Larger touch-friendly inputs
- Smooth scroll behavior
- Results count preview before applying

### 5. Filter Preservation Logic
- Filters persist when sorting changes
- Filters persist when Edit Search updates dates/passengers
- Filters reset only if search invalidates them (e.g., changing route on flights)

### 6. Performance Optimizations
- Debounced filter changes (300ms) to prevent excessive re-renders
- Skeleton loaders during filter updates
- Scroll position maintained after filter application

---

## Implementation Steps

### Step 1: Create Unified Filter Hooks
Create `src/hooks/useResultsFilters.ts`:
- Generic hook for managing filter state with URL sync
- Debounced state updates
- UTM parameter preservation
- Filter-to-chips conversion utilities
- Service-specific configurations

### Step 2: Enhance ActiveFiltersChips Component
Update `src/components/results/ActiveFiltersChips.tsx`:
- Add animation on chip add/remove
- Improve chip styling with icons per filter category
- Add "X of Y results" preview
- Ensure immediate result update on chip removal

### Step 3: Create Unified Desktop Filters Sidebar
Create `src/components/results/DesktopFiltersSidebar.tsx`:
- Reusable wrapper with service-specific styling
- Header with filter count and "Clear all" button
- ScrollArea for long filter lists
- Consistent section spacing and typography

### Step 4: Create Flight Filters Component
Create `src/components/results/FlightFiltersContent.tsx`:
- Extracted from inline code in FlightResults.tsx
- Price range slider
- Stops checkboxes (Nonstop / 1 Stop / 2+ Stops)
- Airlines multi-select with logos
- Departure time grid buttons
- Duration slider (optional)

### Step 5: Update Hotel Filters Component
Refactor `src/components/hotels/HotelFilters.tsx`:
- Remove built-in mobile sheet (use shared FiltersSheet)
- Export just the filter content for consistency
- Add Seats/Bags filters per specification
- Add distance slider

### Step 6: Create Car Filters Component
Create `src/components/results/CarFiltersContent.tsx`:
- Extracted from inline code in CarResultsPage.tsx
- Price range slider
- Car category checkboxes (Economy, Compact, Midsize, SUV, Luxury)
- Seats filter (4+, 5+, 7+)
- Bags filter (2+, 3+)
- Transmission toggle (Automatic/Manual)
- Supplier multi-select

### Step 7: Update FiltersSheet Component
Update `src/components/results/FiltersSheet.tsx`:
- Add results count preview ("Show X results")
- Improve footer with proper spacing
- Add loading state during apply
- Ensure proper z-index stacking

### Step 8: Update ResultsHeader Component
Update `src/components/results/ResultsHeader.tsx`:
- Add slot for active filter chips display
- Integrate chips into header layout
- Ensure proper mobile/desktop responsiveness

### Step 9: Integrate into Flight Results Page
Update `src/pages/FlightResults.tsx`:
- Use new useResultsFilters hook
- Replace inline FiltersContent with FlightFiltersContent
- Add ActiveFiltersChips below header
- Wire up URL sync for filters
- Add debouncing for slider changes

### Step 10: Integrate into Hotel Results Page
Update `src/pages/HotelResultsPage.tsx`:
- Use new useResultsFilters hook
- Use refactored HotelFilters component
- Add ActiveFiltersChips below header
- Wire up URL sync

### Step 11: Integrate into Car Results Page
Update `src/pages/CarResultsPage.tsx`:
- Use new useResultsFilters hook
- Replace inline FiltersContent with CarFiltersContent
- Add ActiveFiltersChips below header
- Wire up URL sync

### Step 12: Add Empty Filter State
Update `src/components/results/EmptyResults.tsx`:
- Add variant for "no results with filters"
- Clear filters button more prominent
- Helpful message about broadening search

---

## Filter Sets by Product

### Flights
| Filter | Type | Options |
|--------|------|---------|
| Price range | Slider | $100 - $5000 |
| Stops | Checkbox | Nonstop, 1 Stop, 2+ Stops |
| Airlines | Multi-select | Dynamic from results |
| Departure time | Grid buttons | Morning, Afternoon, Evening, Night |
| Duration | Slider | Up to 24h (optional) |

### Hotels
| Filter | Type | Options |
|--------|------|---------|
| Price range | Slider | $0 - $500/night |
| Star rating | Buttons | 1-5 stars |
| Guest rating | Checkbox | 6+, 7+, 8+, 9+ |
| Amenities | Checkbox | WiFi, Parking, Pool, Breakfast |
| Property type | Checkbox | Hotel, Apartment, Resort, Villa, Hostel |
| Distance | Slider | 1km, 3km, 5km, 10km |

### Cars
| Filter | Type | Options |
|--------|------|---------|
| Price range | Slider | $20 - $500/day |
| Car type | Checkbox | Economy, Compact, Midsize, SUV, Luxury |
| Seats | Checkbox | 4+, 5+, 7+ |
| Bags | Checkbox | 2+, 3+ |
| Transmission | Toggle | Automatic, Manual |
| Supplier | Multi-select | Dynamic from results |

---

## URL Parameter Schema

### Flights
```
price_max=500
stops=0,1          (comma-separated)
airline=QR,EK      (comma-separated IATA codes)
time=morning,afternoon
```

### Hotels
```
price_min=50
price_max=200
stars=4,5
rating=8
amenities=wifi,pool
type=hotel,resort
distance=5
```

### Cars
```
price_max=100
category=suv,luxury
seats=5
bags=2
transmission=automatic
```

---

## Visual Design

### Filter Chips Bar
```text
+----------------------------------------------------------+
| Price: $200-$500 [✕]  Nonstop [✕]  Qatar Airways [✕]     |
|                                           [Clear all]    |
+----------------------------------------------------------+
```
- Positioned between ResultsHeader and results list
- Horizontally scrollable on mobile
- Service-specific colors

### Desktop Sidebar
```text
+-------------------+
| Filters         X |
| Clear all         |
+-------------------+
| Max Price: $500   |
| [===========o---] |
|                   |
| Stops             |
| [✓] Nonstop       |
| [ ] 1 Stop        |
| [ ] 2+ Stops      |
|                   |
| Airlines          |
| [✓] Qatar Airways |
| [✓] Emirates      |
| [ ] Lufthansa     |
+-------------------+
```

### Mobile Bottom Sheet
```text
+------------------------------------------+
|  Filters                      Reset All  |
+------------------------------------------+
|                                          |
|  [Scrollable filter content]             |
|                                          |
|                                          |
+------------------------------------------+
|  [Cancel]        [Show 24 Results]       |
+------------------------------------------+
```

---

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `src/hooks/useResultsFilters.ts` | Generic filter state + URL sync hook |
| `src/components/results/FlightFiltersContent.tsx` | Flights filter UI |
| `src/components/results/CarFiltersContent.tsx` | Cars filter UI |
| `src/components/results/DesktopFiltersSidebar.tsx` | Reusable sidebar wrapper |

### Files Modified
| File | Changes |
|------|---------|
| `src/components/results/ActiveFiltersChips.tsx` | Add animations, icons, improved styling |
| `src/components/results/FiltersSheet.tsx` | Add results count preview, loading state |
| `src/components/results/ResultsHeader.tsx` | Add chips slot |
| `src/components/results/EmptyResults.tsx` | Add filter-specific empty state |
| `src/components/hotels/HotelFilters.tsx` | Extract content, remove built-in sheet |
| `src/pages/FlightResults.tsx` | Integrate new filter system |
| `src/pages/HotelResultsPage.tsx` | Integrate new filter system |
| `src/pages/CarResultsPage.tsx` | Integrate new filter system |
| `src/components/results/index.ts` | Export new components |

### Dependencies
- All existing packages (no new dependencies)
- Uses existing shadcn/ui Slider, Checkbox, Badge components

### Debounce Strategy
- Slider changes: 300ms debounce before URL update and result filter
- Checkbox changes: Immediate (no debounce needed)
- Mobile sheet: Updates only on "Apply" click

### Performance Considerations
- Filter state stored in React state for immediate UI feedback
- URL sync happens after debounce to prevent history spam
- Results filtering uses useMemo with proper dependency tracking
- Skeleton loaders shown during filter processing

---

## Edge Cases

### No Results After Filtering
- Show friendly message: "No results match your filters"
- Display "Clear filters" button prominently
- Show "Search on partner site" fallback

### Filter Invalidation
- When search changes route (flights): reset airline filter
- When search changes city (hotels): reset all filters
- When search changes location (cars): reset supplier filter
- Keep price/category filters if applicable

### URL Parsing
- Invalid filter values are silently ignored
- Missing filters use defaults
- UTM params always preserved during filter updates
