

# Add Floating Card Navigation + Address Validation

## Problem
1. The `>` arrow on the floating pickup/dropoff cards on the map does nothing when tapped -- the click handlers (`onPickupClick`, `onDropoffClick`) are never connected.
2. There is no address validation -- users can type partial text like "7475" and proceed to ride selection without a valid, geocoded address.

## Changes

### 1. Wire Up Floating Card Click Handlers (Rides.tsx)

When the user taps the `>` on the floating pickup or dropoff card, scroll the bottom sheet to the corresponding input field and focus it for editing.

- Pass `onPickupClick` and `onDropoffClick` props to `RidesMapView` from `RidesInner`
- `onPickupClick`: expand the bottom sheet and focus the pickup input
- `onDropoffClick`: expand the bottom sheet and focus the dropoff input
- Add `ref` attributes to the pickup and dropoff input elements so they can be focused programmatically

### 2. Address Validation Before Proceeding (Rides.tsx)

Add validation to ensure both pickup and dropoff are properly geocoded addresses (have coordinates) before allowing the user to proceed:

- Update `handleFindRides` to check that both `pickupCoords` and `dropoffCoords` exist (not just non-empty strings)
- Show a toast error if the user tries to proceed with an incomplete address (e.g., "Please select a valid pickup address from the suggestions")
- Disable the "Choose [Ride]" CTA button when coordinates are missing
- Add a subtle warning indicator on the address input when text is entered but no coordinates are set (indicating the address hasn't been validated via autocomplete)

### 3. Visual Feedback for Unvalidated Addresses

Add a small warning icon or red border on the input field when:
- The user has typed text but hasn't selected from autocomplete suggestions
- The address string exists but coordinates are null

This helps the user understand they need to pick a suggestion, not just type freeform text.

## Technical Details

### File: `src/pages/Rides.tsx`

**RidesMapView call (around line 732):**
- Add `onPickupClick` and `onDropoffClick` handlers that expand the sheet and focus the respective inputs

**Input refs:**
- Add `useRef<HTMLInputElement>` for pickup and dropoff inputs
- Attach refs to the `<input>` elements (lines 783 and 933)

**handleFindRides (line 573):**
```
Before:  if (pickup && dropoff) setStep("options");
After:   if (!pickupCoords) { toast.error("Please select a valid pickup address"); return; }
         if (!dropoffCoords) { toast.error("Please select a valid destination"); return; }
         setStep("options");
```

**CTA button (line 1282):**
- Add visual disabled state when `!pickupCoords || !dropoffCoords`

**Address warning indicators:**
- Show a small `AlertCircle` icon next to inputs where text exists but coords are null
- Orange/amber color to indicate "needs selection from suggestions"

## No New Files
All changes are in `src/pages/Rides.tsx` only.

