

# Ride Hub UI Overhaul — Uber-Style Layout

## Current State
The component already has a solid Uber-style structure with home/search/vehicle/confirm steps, an SVG map fallback, animated cars, and a bottom booking panel. The main issues are:
- No proper header bar (back arrow, title, bell icon)
- No floating ride mode tabs (Book/Reserve/Map/History)
- The map and bottom panel styling need polish to match the requested spec

## Plan

### 1. Add Top Header Bar
Add a fixed header above the map with:
- Left: Back arrow icon (navigates back or to previous page)
- Center: "Ride Hub" title text
- Right: Bell notification icon
- Semi-transparent background with backdrop blur so map shows through

### 2. Add Floating Ride Mode Tabs
Horizontal pill tabs floating between the map and bottom panel:
- **Book** (active, green highlight), **Reserve**, **Map**, **History**
- Positioned absolutely at the bottom of the map area
- Active tab gets `bg-primary text-primary-foreground`, inactive gets `bg-card/80`
- "Reserve" navigates to ZivoReserve, "History" to RideTripHistory, "Map" stays on map view

### 3. Refine Map Section
- Increase map height to fill top ~50% of screen
- Keep the SVG grid, animated cars, user location green dot, and zoom controls
- Remove the menu button (replaced by header)

### 4. Refine Bottom Booking Panel
- White card with rounded top corners (`rounded-t-3xl`), soft upward shadow
- Greeting: "Good evening, {User Name}" (use auth context for real name)
- "Where to?" search bar with "Now" time selector button on right
- Saved locations (Home/Work) with address below each, clickable to start booking
- Clean dividers between saved locations

### 5. Connect User Name from Auth
- Import `useAuth` to get the real user's name for the greeting instead of hardcoded "Anton"

### Files Modified
- `src/components/rides/RideBookingHome.tsx` — all changes in this single file

### Technical Details
- Header: new `<div>` at top of home view with `sticky top-0 z-30`
- Tabs: new state `activeTab` with values `book | reserve | map | history`; only `book` renders the booking flow, others navigate to existing components or show placeholders
- Bottom panel keeps existing "Where to?" → search → vehicle → confirm flow
- All styling uses theme tokens (no hardcoded colors)

