# Booking.com-style Property Enhancements for Lodge Admin

You shared a Booking.com property page (Bamboo Cottage / Koh Sdach Resort) and asked to add similar features to your store `7322b460-2c23-4d3d-bdc5-55a31cc65fab`. The lodge admin already has Rooms, Rates, Reservations, Property Profile, Gallery, Policies, etc. — but several of the "shop window" pieces that make a Booking.com listing feel complete are missing or thin.

## What already exists (no rebuild needed)
- Rooms & rate plans (your 4 villas), Reservations, Front Desk
- Property Profile: hero badges, included highlights, languages, facilities, meal plans, house rules, check-in/out times, cancellation policy, pet/child policy, contact, payment methods
- Gallery section
- Policies & Amenities sections

## What's missing vs. the Booking.com page (the gaps to fill)

1. **Rich "About this property" description** — Booking shows multi-paragraph storytelling (Comfortable Accommodations, Exceptional Facilities, Dining Experience, Prime Location, Couples favorite). We have hero badges and chips but no long-form description fields.
2. **Property highlights side card** — "Perfect for a 1-night stay", "Top location: highly rated by guests (8.6)", "Breakfast info" mini-card. Needs a dedicated `property_highlights` JSON block.
3. **Most popular amenities row** — A curated, icon-led "top 8" surfacing of the best amenities (Non-smoking rooms, Restaurant, Free WiFi, Room service, Family rooms, Bar, Private beach, Breakfast). Today only the full chip grid exists.
4. **Reviews summary & guest quote** — "Good 7.8 (50 reviews)" + a featured guest quote + sub-scores (Great location 8.6). Needs a reviews summary aggregator surfaced on overview.
5. **Genius / member savings banner** — A "Sign in, save money" promo block. We have promotions but not a flagged "member discount" type.
6. **Distance-from-landmarks (nearby) UX** — `nearby` exists in the schema, but there's no clean editor to add Shianouk International Airport (114 mi), beach (1 min walk), etc. with mode icons.
7. **Per-room rich attribute chips** — Booking shows per-room icons: bed type, m², balcony, garden view, A/C, private bathroom, terrace, minibar, plus an expandable feature list (toiletries, bidet, towels, slippers, hairdryer, etc.). Our rooms section has basic fields but no structured amenity chips per room.
8. **Rate-plan offer labels** — Booking decorates each rate row with badges: "Non-refundable", "Free cancellation before May 2", "No prepayment needed", "Genius discount may be available", "Getaway Deal -20%", "Exceptional breakfast included". We have rate plans but no badge/labels system.

## Proposed scope (one focused phase)

Group the work into a single shippable phase rather than 8 small ones:

### A. Property storefront content (Profile section)
- Add `description_sections` JSONB to `lodge_property_profile` — array of `{title, body}` blocks (Accommodations, Facilities, Dining, Location, etc.) with a rich-text editor.
- Add `property_highlights` JSONB — `{perfect_for, top_location_score, breakfast_info, rooms_with[]}` for the right-side highlights card.
- Add `popular_amenities` text[] (max 8, ordered) — curated from the full facilities list with a drag-to-reorder picker.
- Add `nearby` editor UI (already in schema, just needs a proper editor with label / minutes / km / mode dropdown).

### B. Room amenity chips
- Add `amenities` text[] and `expandable_features` text[] to `lodge_rooms` (or a sibling `lodge_room_amenities` table if multi-select needs categorization).
- New chip-group editor in the room detail drawer with the same icon set Booking uses (Bed, Ruler, Balcony, View, AC, Bathroom, Terrace, Minibar…).

### C. Rate plan badges
- Add `badges` text[] to `lodge_rate_plans` with a fixed catalog: `non_refundable`, `free_cancellation`, `no_prepayment`, `genius_discount`, `getaway_deal`, `breakfast_included`, `late_checkout`, `high_speed_internet`.
- Render badges on the public room/rate UI (not in scope to rebuild storefront — only emit data + admin editor).

### D. Reviews summary (read-only roll-up)
- New `LodgingReviewsSummaryCard` on Overview — aggregates existing `lodging_reviews` into average score, count, top-rated tag, and one featured quote (highest-rated recent review with reply allowed).

### E. Member savings flag
- Add `member_only` boolean to `lodging_promotions` so a promo can be marked as Genius-style and surface a "Sign in, save 10%+" banner on the storefront.

## Files to create / change

**Migrations**
- Add columns: `lodge_property_profile.description_sections`, `property_highlights`, `popular_amenities`; `lodge_rooms.amenities`, `expandable_features`; `lodge_rate_plans.badges`; `lodging_promotions.member_only`.

**Hooks**
- Extend `useLodgePropertyProfile` typings.
- Extend `useLodgeRooms` and `useLodgeRatePlans` typings.
- New `useLodgeReviewsSummary(storeId)`.

**Components**
- `src/components/admin/store/lodging/property-profile/DescriptionSectionsCard.tsx`
- `src/components/admin/store/lodging/property-profile/PropertyHighlightsCard.tsx`
- `src/components/admin/store/lodging/property-profile/PopularAmenitiesPicker.tsx`
- `src/components/admin/store/lodging/property-profile/NearbyEditorCard.tsx` (replace inline)
- `src/components/admin/store/lodging/RoomAmenityChipsEditor.tsx` (used inside room drawer)
- `src/components/admin/store/lodging/RatePlanBadgesEditor.tsx` (used inside rate plan drawer)
- `src/components/admin/store/lodging/LodgingReviewsSummaryCard.tsx` (mounted in `LodgingOverviewSection`)
- Wire `member_only` toggle into existing promotions form.

**No changes** to navigation/tabs — everything plugs into existing Overview / Profile / Rooms / Rates / Promotions sections.

## Out of scope
- Rebuilding the public storefront listing page
- Channel-manager pushes of new fields to OTAs
- Translating descriptions (i18n) — single-language for now

After approval I'll run the migration and ship A–E in one pass. Confirm and I'll proceed.
