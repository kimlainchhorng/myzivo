

# Hotels & Resort — Next-level upgrades

The room editor and booking flow already cover photos, rates, amenities, 30+ add-on presets, cancellation, and check-in/out times. Here's what's still missing for a competitive hotel/resort listing — grouped so you can pick what to ship first.

## 1. Room-level upgrades (admin editor)

- **Bed configuration builder** — replace the free-text "Beds" field with a structured editor: `[+ King × 1] [+ Single × 2] [+ Sofa bed × 1]`. Drives "Sleeps X" automatically and shows clean badges on the public card.
- **View / floor / wing fields** — dropdowns for `View` (Sea, Garden, Pool, Mountain, City, Courtyard), `Floor`, and optional `Wing/Building name` for resorts with multiple buildings.
- **Children & extra-guest policy** — child age cutoff, free-stay age, extra-adult fee, extra-child fee. Used during booking total calculation.
- **Tax & fee breakdown** — per-stay city tax, per-night resort fee, cleaning fee, service charge %. Today only "Taxes calculated at booking" shows — replace with a transparent line-item breakdown in the drawer.
- **Seasonal / date-range pricing** — calendar-driven price overrides (e.g. "Dec 20 – Jan 5: $299/night"). Replaces the single weekend-rate toggle for high/low/peak seasons.
- **Min / max stay rules** — minimum nights, maximum nights, no-arrival weekdays.

## 2. New "Property profile" tab (resort-level, not per room)

A new admin section `LodgingPropertyProfileSection.tsx` holding what belongs to the whole resort, not a single room:

- **Languages spoken at reception** (multi-select chips).
- **Property-wide facilities & services** — pool, restaurant, bar, gym, spa, kids club, business center, conference room, laundry, 24h front desk, airport shuttle, EV charging. Separate from in-room amenities.
- **Meal plans offered** — Room only / Bed & Breakfast / Half board / Full board / All-inclusive. Shown as filter badges on the storefront.
- **House rules** — quiet hours, party policy, smoking zones, age requirement, ID at check-in, security deposit amount.
- **Accessibility** — step-free access, accessible bathroom, elevator, braille signage, hearing-loop.
- **Sustainability badges** — single-use plastic free, solar, towel reuse, EV-only fleet (purely informational chips).

## 3. Booking flow upgrades (guest-facing)

- **Guest details collection** — primary guest name, email, phone, optional special requests textarea, ETA dropdown ("Arriving around 6 PM"). Currently the drawer only collects dates and guest count.
- **Add-on cart** — checkbox list with quantity steppers (e.g. "2 × Spa massage"), live total update, persists into the reservation.
- **Price transparency panel** — itemised: room nights × rate, weekend uplift, add-ons, taxes, fees, discount, **Grand total**. Matches the new fee breakdown in the editor.
- **Multi-room booking** — let one guest reserve 2 rooms in the same trip (currently 1 room per drawer open).
- **Confirmation screen + email** — booking reference, QR code for check-in, ICS calendar attachment, host contact card.

## 4. Storefront polish

- **Property hero badges** — "Beachfront", "Free cancellation", "Breakfast included", "Pet-friendly" pulled from the new property profile + room flags.
- **"What's included in your stay" strip** — 4-icon row above Rooms & Rates summarizing top property facilities, so guests don't have to open a room to see "Pool / Wi-Fi / Breakfast / Airport pickup".
- **Map pin + nearby** — a small embedded map plus "5 min to beach · 15 min to airport" distance chips.
- **Reviews section** — pull existing store reviews into a dedicated lodging review block with category sub-scores (Cleanliness, Location, Value, Staff).

## Suggested first slice

If you want to ship one focused batch first, I'd recommend:

1. Bed-configuration builder + view/floor fields (room editor)
2. Tax & fee breakdown with itemised price panel in the booking drawer
3. New Property Profile tab with facilities, meal plans, house rules, languages
4. Guest details + add-on cart in the booking drawer

That bundle takes the listing from "room card" to a real bookable hotel page. Tell me which group(s) you want — or say "all of #1 and #3" — and I'll implement.

## Technical notes

- **DB**: needs migrations for `lodge_rooms` (bed_config jsonb, view, floor, wing, child_policy jsonb, fees jsonb, seasonal_rates jsonb, min_stay, max_stay) and a new `lodge_property_profile` table keyed by `store_id` (facilities[], meal_plans[], languages[], house_rules jsonb, accessibility[], sustainability[]).
- **Booking**: extend `lodge_reservations` (or equivalent) with `guest_details jsonb`, `addon_selections jsonb`, `fee_breakdown jsonb`.
- **No new dependencies** — all UI built from existing shadcn components and Lucide icons per project icon standard.

