

# Fix: Back Button Not Working on Rides Page

## Problem Analysis

The back button on the Rides page is not responding to clicks. Two issues are causing this:

### Issue 1: Map Container Blocking Touch Events
The map container (`<div className="absolute inset-0">`) covers the entire viewport including the back button area. Even though the button has `z-[60]`, the parent div of the map can intercept touch/click events before they reach the button.

### Issue 2: Unwanted Navigation Behavior
Currently on the `request` step, clicking back calls `navigate(-1)` which leaves the Rides page. You confirmed you want "step back only" — the back button should only navigate within the ride flow and never leave `/rides`.

---

## Solution

### 1. Add `pointer-events-none` to Map Container
Make the map container pass-through for pointer events, then re-enable events only on interactive map elements.

**File:** `src/pages/Rides.tsx` (lines 715-727)

```tsx
{/* Full-height Map - Takes remaining space above sheet */}
<div className="absolute inset-0 pointer-events-none">
  <div className="w-full h-full pointer-events-auto">
    <RidesMapView
      userLocation={userLocation}
      pickupCoords={pickupCoords}
      dropoffCoords={dropoffCoords}
      pickup={pickup}
      dropoff={dropoff}
      etaMinutes={selectedOption?.eta ?? (routeData?.duration ? Math.round(routeData.duration) : undefined)}
      routeData={routeData}
      onLocateMe={handleUseCurrentLocation}
    />
  </div>
</div>
```

This creates a pass-through wrapper so the back button can receive clicks, while the inner map remains interactive.

### 2. Fix Back Button Logic for "Step Back Only"
When on the `request` step, do nothing (or show a toast) instead of navigating away.

**File:** `src/pages/Rides.tsx` (lines 695-713)

```tsx
{/* Back button - steps back within ride flow only */}
<button
  onClick={() => {
    if (step === "request") {
      // Do nothing or show guidance - we don't leave /rides
      return;
    } else if (step === "options") {
      setStep("request");
    } else if (step === "confirm") {
      setStep("options");
    } else if (step === "checkout") {
      setStep("confirm");
    } else if (step === "success") {
      handleReset();
    }
  }}
  className={cn(
    "absolute top-4 left-4 z-[60] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform",
    step === "request" && "opacity-0 pointer-events-none" // Hide on first step
  )}
  style={{ pointerEvents: step === "request" ? 'none' : 'auto' }}
  aria-hidden={step === "request"}
>
  <ChevronLeft className="w-5 h-5 text-zinc-700" />
</button>
```

**Key changes:**
- When on `request` step: hide the back button (opacity-0, pointer-events-none)
- When on other steps: show it and step back within the flow
- Never call `navigate(-1)` — stays on `/rides`

---

## Optional: Add Home Button for First Step
If you want a way to leave the Rides page from the first step, add a separate Home button:

```tsx
{/* Home button - only visible on request step */}
{step === "request" && (
  <button
    onClick={() => navigate("/")}
    className="absolute top-4 left-4 z-[60] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
  >
    <Home className="w-5 h-5 text-zinc-700" />
  </button>
)}
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Rides.tsx` | Add `pointer-events-none` to map wrapper, fix back button logic |

---

## Testing Checklist

- [ ] On `request` step: back button is hidden or disabled
- [ ] On `options` step: back button goes to `request`
- [ ] On `confirm` step: back button goes to `options`
- [ ] On `checkout` step: back button goes to `confirm`
- [ ] On `success` step: back button resets flow
- [ ] Map remains fully interactive (panning, zooming, location button)

