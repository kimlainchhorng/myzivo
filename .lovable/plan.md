

# Add Address Autocomplete to Eats Address Page

## Problem
The address input on the Eats Address page (`/eats/address`) is a plain text field with no autocomplete. Customers must type the full address manually, and coordinates are hardcoded to `lat: 0, lng: 0` -- meaning saved addresses have no real location data.

## Solution
Replace the plain `<Input>` with the existing `AddressAutocomplete` component (already built at `src/components/shared/AddressAutocomplete.tsx`) which uses the Google Places API via the `maps-autocomplete` edge function. Also store actual coordinates when an address is selected.

---

## Changes

### 1) Modify `src/pages/EatsAddress.tsx`

- Import `AddressAutocomplete` from `@/components/shared/AddressAutocomplete.tsx`
- Add `lat` and `lng` fields to the `AddressFormData` interface
- Replace the plain `<Input>` for the "Full Address" field with the `<AddressAutocomplete>` component
- When a suggestion is selected, store address text + real lat/lng in form state
- Use those real coordinates in `handleSave` instead of hardcoded `0, 0`
- Style the autocomplete dropdown to match the dark theme (zinc-900 background, white text)

### 2) Modify `src/components/eats/AddDeliveryStopSheet.tsx`

- Import and use the same `AddressAutocomplete` component for the stop address input
- When a suggestion is selected, set `address`, `lat`, and `lng` from the result
- This ensures multi-stop delivery addresses also get real coordinates

### 3) Style fix for `AddressAutocomplete` dropdown in dark contexts

- Add dark-theme compatible class overrides so the dropdown renders correctly on the zinc-950 Eats pages (the component currently uses `bg-popover` which adapts to theme)

---

## What Customers Will Experience

| Before | After |
|--------|-------|
| Must type full address manually | Type a few characters, see suggestions |
| No address validation | Google Places validates real addresses |
| Coordinates saved as 0, 0 | Real lat/lng stored for routing and delivery |
| Easy to make typos | Select from dropdown, no typos |

