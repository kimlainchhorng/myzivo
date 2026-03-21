
Goal: eliminate duplicate selected checks by making fare-card selection derive from one source of truth only, independent of carousel visibility.

What I found:
- `FareVariantsCard` already computes `isSelected` from local `selectedId`, and the blue check currently renders only from that value.
- The carousel state (`activeIndex`, scroll position, snap) is only used for progress dots, not selection UI.
- The likely real bug is state churn between parent and child:
  - `FlightReview` passes `offer={reviewOffer}` into `FareVariantsCard`
  - `reviewOffer.id` is overwritten with the selected variant id
  - `onSelectVariant` also mutates stored offer/session state
  - this can cause the card list to rehydrate/reconcile in a way that makes selection appear duplicated during animation/re-render
- Keys are `key={variant.id}` now, but I will harden them to `key={\`fare-\${variant.id}\`}` as requested.

Implementation plan:
1. Stabilize the data source for the carousel
- Pass the base multi-variant offer into `FareVariantsCard`, not `reviewOffer`
- Keep `reviewOffer` only for downstream summary/checkout display
- This prevents the carousel’s source object from changing identity/id when the user selects a fare

2. Lift fare selection to a single source of truth
- Make `FlightReview` own the selected fare id entirely
- Change `FareVariantsCard` to receive:
  - `selectedFareId`
  - `lowestFareId`
  - `onSelectFare(id or variant)`
- Remove the component-local `selectedId` state so selection cannot diverge between parent and child

3. Enforce strict card state model
- In each card compute only:
  - `const isSelected = fare.id === selectedFareId`
  - `const isLowest = fare.id === lowestFareId`
- Bind all selected UI exclusively to `isSelected`:
  - blue check
  - strong border
  - selected shadow
  - full opacity
- Bind “Lowest fare” badge exclusively to `isLowest`
- No carousel/scroll/active/centered state will affect selection styling

4. Harden rendering against reuse artifacts
- Use `key={\`fare-\${fare.id}\`}` on slide wrappers
- Audit the fare-card tree to ensure the blue check is rendered in exactly one place
- Keep `activeIndex` only for dots/arrows; do not let it influence card visuals

5. Fix default and fallback selection behavior
- In `FlightReview`, compute cheapest fare by numeric `price`
- Auto-select cheapest on initial load
- If fare list changes and selected fare no longer exists, reset to cheapest
- Keep cheapest badge independent from current selection

6. Keep pricing/payload tied to selected fare only
- Bottom total, sticky footer, session storage, and continue payload should all derive from the parent’s selected variant
- Each card continues to render its own `variant.price`
- Delta remains relative only to the cheapest fare

7. Add temporary debug validation
- Add per-card logs during render:
  - fare id
  - selectedFareId
  - isSelected
  - isLowest
  - index
- Add parent log when selected fare changes
- After confirming the bug is gone, remove the temporary logs

Files to update:
- `src/pages/FlightReview.tsx`
  - own `selectedFareId` + `lowestFareId`
  - pass stable base offer to carousel
  - keep `reviewOffer` derived from selected fare only
- `src/components/flight/review/FareVariantsCard.tsx`
  - remove local selection state
  - consume parent-controlled `selectedFareId`
  - hard-bind all selection UI to `fare.id === selectedFareId`
  - use stable `fare-${fare.id}` keys
  - keep carousel state separate from selection

Acceptance criteria:
- only one blue check is visible at any time
- swiping does not move the check
- centered/adjacent slides never appear selected unless their id matches `selectedFareId`
- lowest fare badge stays on the cheapest fare only
- clicking another fare moves the single check and updates total/payload correctly
- no duplicate selection appears during re-render or animation
