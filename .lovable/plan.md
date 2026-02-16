

# Fix Map Display + Upgrade Premium Ride Options

## Issue 1: Map Not Loading

**Root Cause:** The `VITE_GOOGLE_MAPS_API_KEY` env variable is empty in `.env`. The `GoogleMapProvider` falls back to fetching the key via the `maps-api-key` edge function, but that requires authentication. If the user isn't logged in (or the session hasn't loaded yet), the map shows the dark green placeholder with a pulsing dot instead of an actual Google Map.

**Fix:**
- Update `GoogleMapProvider` to handle the "not yet authenticated" case more gracefully -- show a loading state while checking auth, and retry fetching the API key once auth is ready
- Add a Supabase auth state listener so the provider re-attempts key fetching when the user signs in
- Ensure the `GOOGLE_MAPS_API_KEY` secret is properly set in Supabase (already confirmed it exists)
- Show a clearer fallback message when the map can't load due to auth

## Issue 2: Premium Tab - Visual Upgrade

**Current State:** The Premium tab uses the same `ZivoRideRow` component as Economy -- simple rows with inline SVG car icons. This doesn't differentiate the Premium tier visually.

**Upgrade Plan -- Make Premium look more luxurious:**

1. **Enhanced ZivoRideRow for Premium/Elite tiers:**
   - Add a subtle gradient background (dark charcoal/gold for Premium, deep purple/gold for Elite)
   - Show a premium badge/icon (Star icon for Premium, Crown for Elite)
   - Use a different, more refined car SVG for premium vehicles (sleeker sedan silhouette)
   - Add a subtle shimmer/glow effect on selected state

2. **Premium-specific visual enhancements in Rides.tsx:**
   - When Premium tab is active, show a subtle gold accent on the category tab
   - Add a "Premium Experience" header with a star icon
   - Differentiate card borders (gold for Premium, purple for Elite)

3. **Ride option data improvements:**
   - Add descriptive subtitles that convey luxury (e.g., "Leather seats, quiet ride")
   - Show vehicle class indicator (sedan icon vs SUV icon)

---

## Technical Changes

### File 1: `src/components/maps/GoogleMapProvider.tsx`
- Add `onAuthStateChange` listener to re-fetch API key when user signs in
- Show a proper loading indicator while auth is being checked
- Add retry logic if the first fetch fails due to auth timing

### File 2: `src/components/ride/ZivoRideRow.tsx`
- Accept a new `category` prop ("economy" | "premium" | "elite")
- Apply tier-specific styling:
  - Economy: current cream/emerald style (unchanged)
  - Premium: dark charcoal background with gold accents, refined car SVG
  - Elite: deep black background with purple/gold gradient, crown badge
- Add a premium car SVG variant (sleeker silhouette)
- Add subtle shimmer effect for selected premium cards

### File 3: `src/pages/Rides.tsx`
- Pass the `category` (activeTab) to each `ZivoRideRow`
- Add a premium section header when Premium or Elite tabs are active
- Enhance the tab styling with tier-appropriate colors

### File 4: Ride categories data (in `Rides.tsx`)
- Update Premium/Elite ride subtitles with luxury-focused descriptions
- Add category-aware descriptions

