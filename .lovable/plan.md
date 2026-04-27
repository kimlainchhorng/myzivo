## Polish the `/flights` desktop hero

The current page has visual mismatches and readability issues. Fixes are scoped to two files.

### Issues to fix
1. **"Search Flights" button text is washed out** — sky/cloud gradient behind the label kills contrast.
2. **Hotel-themed headlines** appear in a flights page ("Dream Destinations / Best prices guaranteed", "Travel Your Way") — recycled from a multi-vertical hero slider.
3. **"Departure → Return" label** looks awkward and is redundant since each field has its own label.
4. **Inputs feel flat / placeholders too light** — "From where?", "To where?", "Select date" are barely visible.
5. **Card has an oversized cyan blur glow** that washes out the search form on light backgrounds.
6. **Slide indicators (3 dashes)** under the headline are unlabeled and look accidental.
7. **Trust strip dots/icons** alignment is loose.

### Changes

**`src/pages/FlightLanding.tsx`**
- Replace the 3-slide rotating hero copy with flight-only headlines:
  - "Search & Compare Flights" / "500+ airlines, one search"
  - "Find Your Next Trip" / "Best fares, real-time pricing"
  - "Fly Smarter with ZIVO" / "Trusted licensed partners"
- Remove the slide indicator dots (or hide unless 2+ slides intentionally shown).
- Reduce the outer card glow opacity from `opacity-40` to `opacity-20` and tighten blur.
- Tighten trust strip spacing (`gap-4` instead of `gap-6`, smaller separator dots).

**`src/components/flight/FlightSearchFormPro.tsx`** (the actual form rendered on desktop)
- Search button: replace cloudy gradient with solid `bg-primary` (or sky-600 → blue-700) + white bold text, add `shadow-md`, stronger hover state. Ensure `text-primary-foreground` not muted.
- Replace "Departure → Return" group label with two clear field labels ("Departure date" / "Return date") that stay above each input individually.
- Increase placeholder contrast: `placeholder:text-foreground/55` instead of muted/30.
- Field backgrounds: `bg-muted/70` with `border-border` (not `border-border/30`) so fields read as inputs on light hero.

### Out of scope
- Mobile hero (different component path)
- Flight results page styling
- Header/nav (already polished separately)

### Files touched
- `src/pages/FlightLanding.tsx`
- `src/components/flight/FlightSearchFormPro.tsx`
