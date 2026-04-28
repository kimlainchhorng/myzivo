# Polish Pass — Hotel Detail Page

Fixing the issues called out from the screenshot. All edits are confined to `src/pages/lodging/HotelResortDetailPage.tsx`. No DB changes.

## What gets fixed

### 1. Phone number formatting (`81577875` → `+855 81 577 875`)
Add a small `formatPhone()` helper near `formatPrice()`. If a number is already international (`+...`) it gets light spacing; if it looks like a Cambodia local number (7–9 digits, optional leading `0`), prepend `+855` and group as `+855 XX XXX XXX`. Used in both the Contact list and the booking sheet "Call property" button label.

### 2. Rooms rail clipping (mobile)
The current rail starts a second card half-cut at the right edge with no visual hint there's more. Two changes:
- Bump rail padding so the last card has breathing room: `pr-10` instead of `pr-6`.
- Add a right-edge fade (gradient mask via a tiny absolute overlay inside the Section) on `< md` only, so users see content fading into more content.

### 3. "Rooms · 14" vs only 8 in the rail
Currently `.slice(0, 8)` silently drops 6 rooms. Add a "See all 14" pill that opens a simple full-screen rooms sheet (re-using the existing room-card layout in a vertical list) when `activeRooms.length > 8`. On `md+` the grid already shows up to 8; same "See all" pill applies.

### 4. Star icon without a number reads as decoration
Replace the lone amber star on each room card with either:
- A "Top pick" badge when the room is the cheapest of the property (deterministic, no rating data needed), OR
- Hide the star entirely if the room isn't a top pick.
This removes ambiguous chrome until real ratings exist.

### 5. Languages chips low contrast
Switch from `bg-muted text-foreground` to a light emerald pill on light theme and emerald-tinted on dark: `bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20`. Matches the brand emerald accent.

### 6. Sticky CTA overlapping Owner tools
Add `mb-4` to the Owner-tools `Section` so on short screens the Admin button doesn't sit right under the sticky bar. Also bump the page's mobile bottom padding from `pb-28` to `pb-32` to give one extra row of clearance.

### 7. Amenities section top clipping (visible in screenshot)
The Section's `mt-5` becomes `mt-6 md:mt-8` so the first amenities row never gets visually pinched against the header card on small viewports when the user scrolls in mid-section.

### 8. `isOwner` clarification (no code change needed, just confirming)
Re-checked `useOwnerStoreProfile`: it requires an authenticated user and matches by `owner_id`. The "You manage this property" band only appears for the actual owner. The screenshot user IS the owner — that's correct, not a bug.

## Out of scope
- No new tables, RLS, or migrations.
- Not redesigning `LodgingRoomCard` (different component used elsewhere).
- Real ratings/reviews wiring — needs a separate feature pass.

## Files touched
- `src/pages/lodging/HotelResortDetailPage.tsx`
