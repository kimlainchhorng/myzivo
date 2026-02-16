

# Fix Map Loading + Improve Elite/Premium Ride Visuals

## 1. Fix Map Not Loading

**Problem:** The `GoogleMapProvider` only fetches the API key via edge function when authenticated, but the `VITE_GOOGLE_MAPS_API_KEY` env var (client-side) is also set as a secret. The map shows a dark placeholder because the client env var is empty at build time.

**Fix:** Update the provider to also try fetching from the `maps-api-key` edge function without requiring auth first (public read of the key), and add a retry mechanism. If the edge function requires auth, show a "Sign in to view map" message instead of a blank dark screen. Also ensure the fallback placeholder looks cleaner.

## 2. Fix Elite Tier Colors (Hard to See)

**Problem:** Elite uses `from-zinc-900 to-zinc-800` background with `border-purple-500/30` and purple accents — on the cream/light bottom sheet background, the dark cards with low-opacity purple borders look muddy and hard to read.

**Changes to `ZivoRideRow.tsx`:**
- **Elite (unselected):** Change to a richer look — darker card with brighter purple/gold border glow, brighter text contrast. Use `bg-gradient-to-br from-[#1a1025] to-[#0f0a1a]` with `border-purple-400/50` and lighter text
- **Elite (selected):** More vivid purple glow — `border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)]`
- **Elite text colors:** Use `text-purple-200` for meta info instead of `text-zinc-400` so it stands out
- **Elite price:** Use `text-purple-300` or bright gold `text-amber-300` for better visibility
- **Elite badge pill:** Brighter background `bg-purple-500/30 text-purple-200` instead of `bg-purple-100 text-purple-700` (light mode colors on dark cards)

## 3. Improve Premium Tier Contrast

**Changes to `ZivoRideRow.tsx`:**
- **Premium badge pill:** Fix to use dark-appropriate colors: `bg-amber-500/20 text-amber-200` instead of `bg-amber-100 text-amber-700`
- Ensure gold accents pop more against the charcoal background

## 4. Polish Tab Styling in `Rides.tsx`

- Elite inactive tab: Brighten text from `text-purple-300` to `text-purple-200` for better tap target visibility
- Add subtle icon styling improvements (Crown icon for Elite, Star for Premium)

## 5. Map Fallback Improvements

Update `RidesMapView` in `Rides.tsx`:
- Show a cleaner fallback with a "Map loading..." label or "Sign in to view map" if auth is needed
- Add a subtle map-like pattern instead of plain dark green

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/components/ride/ZivoRideRow.tsx` | Fix Elite/Premium color contrast: brighter borders, better text colors on dark backgrounds, fix badge pills for dark cards |
| `src/pages/Rides.tsx` | Improve Elite tab visibility, cleaner map fallback message |
| `src/components/maps/GoogleMapProvider.tsx` | Add unauthenticated fallback attempt, better loading/error state communication |

