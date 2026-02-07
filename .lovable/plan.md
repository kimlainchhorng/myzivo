
# Rides Page Map & UX Enhancement Plan

## Overview
This plan enhances the /rides experience to match the clean, modern ride-hailing UX shown in your reference image. Key improvements include:

- **Both pickup & dropoff inputs visible** in the bottom sheet
- **Instant autocomplete suggestions** when inputs are focused (not just when typing)
- **Proper Google branding** visible on the map
- **Route line displayed** between pickup and destination
- **Cleaner card-style UI** for ride options

---

## Changes

### 1. Add Both Pickup and Dropoff Inputs in Bottom Sheet

**File: `src/pages/Rides.tsx`**

Update the "request" step to show:
- **Pickup input** with a circle icon (blue) and current address
- **Dropoff input** with a square icon (black)
- Both inputs will have their own autocomplete dropdowns

```text
┌─────────────────────────────────────────┐
│  ● 156 Hickory Street, Denham Springs  │  ← Pickup (editable)
├─────────────────────────────────────────┤
│  ■ Enter destination                   │  ← Dropoff (editable)
└─────────────────────────────────────────┘
```

### 2. Show Suggestions Immediately on Focus

**File: `src/hooks/useGoogleMapsGeocode.ts`**

- When user focuses an empty input, show **recent/popular locations** immediately
- When user types, filter with real Google autocomplete results
- Add a "Use current location" option at top of pickup suggestions

### 3. Enable Google Map Branding

**File: `src/components/maps/GoogleMap.tsx`**

- Remove `opacity-70` that dims the map
- Set `disableDefaultUI: false` for the bottom-right Google logo to appear naturally
- The standard Google Maps attribution will be visible

### 4. Fix Route Display Between Pickup & Dropoff

**File: `src/pages/Rides.tsx`**

Currently the map receives `routeData?.pickupCoords` but should receive the state coordinates directly:

```tsx
// Change from:
pickupCoords={routeData?.pickupCoords}
dropoffCoords={routeData?.dropoffCoords}

// To:
pickupCoords={pickupCoords}
dropoffCoords={dropoffCoords}
```

This ensures markers and route appear as soon as addresses are selected.

### 5. Improved Card UI for Ride Options

Update the ride option cards to match the reference design:
- Car icon on left
- Name + tag pill (e.g., "Save", "Green", "Faster")
- Time and ETA below
- Price on right, bold

---

## UI Flow After Changes

1. **User opens /rides**
   - Map loads with their current location (blue dot)
   - Bottom sheet shows "Where to?" with both inputs
   - Pickup auto-fills with detected address

2. **User taps destination input**
   - Suggestions appear immediately (popular places or recent)
   - As they type, Google autocomplete results appear

3. **User selects destination**
   - Route line draws on map between pickup & dropoff
   - Map auto-fits to show both points
   - Ride options update with calculated pricing

4. **User selects a ride type**
   - Taps "Choose [Ride Name]" to proceed

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Rides.tsx` | Add pickup input field, fix coords passed to map, improve card styling |
| `src/hooks/useGoogleMapsGeocode.ts` | Show popular suggestions on focus (empty query) |
| `src/components/maps/GoogleMap.tsx` | Remove opacity dimming, ensure Google branding visible |
| `src/components/ride/RidesMapBackground.tsx` | Remove opacity setting |

---

## Technical Details

### Pickup Input Addition
```tsx
{/* Pickup Input */}
<div className="relative">
  <div className="flex items-center gap-3 bg-zinc-100 rounded-lg px-4 py-3">
    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
    <input
      value={pickup}
      onChange={(e) => {
        setPickup(e.target.value);
        setShowPickupSuggestions(true);
        fetchPickupSuggestions(e.target.value, userLocation || undefined);
      }}
      onFocus={() => {
        setShowPickupSuggestions(true);
        // Show popular suggestions even if empty
        if (!pickup) fetchPickupSuggestions("", userLocation || undefined);
      }}
      placeholder="Enter pickup location"
      className="flex-1 bg-transparent outline-none"
    />
  </div>
  {/* Dropdown with suggestions + "Use current location" option */}
</div>
```

### Immediate Suggestions on Focus
```tsx
// In useGoogleMapsGeocode.ts
if (!query.trim() || query.length < 2) {
  // Instead of clearing, show default popular suggestions
  setSuggestions(MOCK_SUGGESTIONS.slice(0, 5).map((s, i) => ({
    id: `popular-${i}`,
    placeName: s,
    text: s.split(",")[0],
  })));
  return;
}
```

### Google Branding Fix
The Google logo appears automatically when using the standard Maps API. We just need to:
1. Ensure the map container isn't dimmed with opacity
2. Keep `disableDefaultUI: false` or only disable specific controls

---

## Expected Result

After implementation:
- Full-screen Google Map with visible branding
- Both pickup/dropoff inputs in bottom sheet
- Autocomplete suggestions appear on focus
- Route line displays when both addresses are set
- Clean, modern ride option cards with pricing
