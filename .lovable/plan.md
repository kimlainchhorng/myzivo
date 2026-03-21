

## Fix: Duplicate Blue Check Icons in Fare Carousel

### Root Cause Analysis

After auditing the code, the check icon is rendered in exactly one place (line 480-496) and is gated by `isSelected = variant.id === selectedFareId`. The logic is correct. The duplicate check is caused by one of two things:

1. **AnimatePresence exit overlap**: Each card has its own `<AnimatePresence>` wrapping the check. When switching selection, the old card's check plays an exit animation (spring with stiffness 500, damping 22 — can take ~300ms+) while the new card's check plays an enter animation. During this window, two checks are visible simultaneously.

2. **Possible duplicate variant IDs in the array**: The `mergeFareVariants` dedup has two passes (content-key then ID) but edge cases in the recovery/stored/live merge could still produce duplicates if `buildFareVariantKey` produces different keys for variants that share the same `id`.

### Plan

#### 1. Eliminate AnimatePresence exit overlap on check icon (`FareVariantsCard.tsx`)
- Remove `AnimatePresence` around the check icon entirely
- Use a simple conditional render: `{isSelected && <div>...</div>}` — no exit animation
- This guarantees zero frames where two checks coexist
- Keep the enter animation if desired via a simple `motion.div` with `initial`/`animate` but no `exit`

#### 2. Final dedup safety in the render loop (`FareVariantsCard.tsx`)
- Before mapping `filteredVariants`, add a final dedup by `variant.id`:
  ```
  const uniqueVariants = filteredVariants.filter(
    (v, i, arr) => arr.findIndex(x => x.id === v.id) === i
  );
  ```
- Map over `uniqueVariants` instead of `filteredVariants`
- Use `key={`fare-${variant.id}`}` (drop the index suffix since IDs are now guaranteed unique)

#### 3. Also remove AnimatePresence from the shine and glow bar
- The shine effect (line 413-427) and glow bar (line 430-444) also use AnimatePresence with exit animations
- These can also briefly show on two cards during transitions
- Replace with simple conditional renders gated only by `isSelected`

#### Files
- `src/components/flight/review/FareVariantsCard.tsx` — all changes are here

