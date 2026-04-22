

# Hotels & Resort — Fix RLS save bug + Booking.com-grade amenities

Two focused fixes that unblock saves across all property panels and bring the amenity catalog up to industry-standard depth.

## 1. Fix the "row violates RLS" save error (Property Profile, and audit the rest)

**Root cause** — the RLS policies on `lodge_property_profile` reference the wrong owner table:

```
EXISTS (SELECT 1 FROM restaurants r
        WHERE r.id = lodge_property_profile.store_id
          AND r.owner_id = auth.uid())
```

But lodging stores live in `store_profiles`, not `restaurants`. Confirmed: store `Koh Sdach Resort` exists in `store_profiles` with the logged-in owner — so the check always fails and every insert/update returns "new row violates row-level security policy."

A correct helper already exists (`public.is_lodge_store_owner(uuid)`), and the sibling table `lodge_amenities` already uses it correctly.

**Fix (migration)**

- Drop the four broken policies on `lodge_property_profile` and recreate them mirroring `lodge_amenities`:
  - `FOR ALL USING (is_lodge_store_owner(store_id) OR has_role(auth.uid(),'admin')) WITH CHECK (same)`
  - Keep the public read policy as-is.
- Audit & repair every other `lodge_*` table that joins `restaurants` instead of `store_profiles`. Tables to verify and fix in the same migration if affected: `lodge_rooms`, `lodge_reservations`, `lodge_room_blocks`, `lodge_guests`, `lodge_housekeeping`, `lodge_maintenance`, `lodge_reservation_audit`, `lodge_reservation_charges`. Each gets the same `is_lodge_store_owner(store_id)` pattern.
- Add a new wiring-check entry `rls.lodge_owner_table_consistency` that flags any future policy referencing `restaurants` for a `lodge_*` table, so this regression can't sneak back.

**Client side**

- `useLodgePropertyProfile.upsert` — already uses upsert + onConflict `store_id`, so once RLS is fixed saves go through. Add a friendlier error toast that explains "You must be the store owner to edit this property" when a 401/403 leaks through, instead of the raw Postgres message currently shown in the screenshot.

## 2. Bring Amenities up to Booking.com-grade depth & polish

Today's `LodgingAmenitiesSection` only ships **16 flat amenities** + a handful of policy fields. The reference shows a richly categorized catalog. Replace the flat list with a category-driven editor.

**New canonical catalog** (`src/components/lodging/amenityCatalog.ts`, ~150 amenities across 14 groups, matching the reference image):

```text
Most Popular        Outdoor pool · Non-smoking rooms · Free Wi-Fi · Restaurant · Fitness centre · Beachfront · Bar · Private beach
Great for stay      Restaurant · Private bathroom · A/C · Free Wi-Fi · Adults only · Fitness centre · Free shuttle · Outdoor pool · Watersports …
Bathroom            Toilet paper · Towels · Bidet · Towels/Sheets (extra) · Private bathroom · Toilet · Shower · Hairdryer · Bathrobe · Slippers
Bedroom             Linens · Wardrobe · Alarm clock
Outdoors            Picnic area · Outdoor furniture · Beachfront · Sun deck · Private beach area · Terrace · BBQ · Garden
Room amenities      Socket near bed · Drying rack · Iron · Fan · Mosquito net
Activities          Bicycle rental* · Bingo · Live sports broadcast · Happy hour · Themed dinners* · Beach · Evening entertainment · Watersports* …
Food & Drink        Wine/Champagne · Special diet meals (req) · Snack bar · Bar · Restaurant · Kids' meals · Breakfast in the room
Internet            Wi-Fi all areas (free) · Wired internet
Parking             No parking | Free public parking | Paid private parking on-site | EV charging | Valet
Transportation      Public transit tickets* · Airport shuttle · Car hire · Bicycle hire
Services            Shuttle · Daily housekeeping · Lockers · Baggage storage · Tour desk · Laundry* · 24-hour front desk · Concierge · Currency exchange
Front Desk          Invoice provided · Express check-in/out · Private check-in
Entertainment & Family   Board games/Puzzles · Kids' club · Babysitting · Playground · Family rooms
Safety & Security   Fire extinguishers · CCTV common areas · Smoke alarms · Security alarm · Key-card access · Key access · 24-hour security · Safe
General             Adults only · Designated smoking area · Soundproof · Soundproof rooms · Non-smoking rooms · A/C · Lift · Heating
Accessibility       Entire unit on ground floor · Wheelchair accessible · Roll-in shower · Braille signage · Visual alarm
Pool detail         Open all year · Adults only · Beach chairs/Loungers · Pool towels · Heated pool
Spa                 Fitness · Beach umbrellas · Hot tub/Jacuzzi · Sauna · Steam room · Massage · Body treatments
Languages spoken    English · Khmer · French · Spanish · German · Italian · Chinese · Japanese · Korean · Russian · Arabic · Hindi · Thai · Vietnamese · Portuguese
```

Each amenity has a key, label, optional `extraCharge: boolean`, and a Lucide icon (re-using `getAmenityIcon`).

**Schema additions** (migration)

- `lodge_amenities.categories jsonb default '{}'::jsonb` — stores `{ "bathroom": ["towels","bidet"], "outdoors": ["sun_deck"] , … }` so each category persists independently.
- `lodge_amenities.extra_charge_keys text[] default '{}'::text[]` — list of amenity keys that are offered but at extra charge, so the UI can render the small "Additional charge" tag like Booking.
- `lodge_amenities.parking_mode text` — one of `none|free_public|paid_private|paid_public|free_private` (radio, mirrors Booking).
- `lodge_amenities.internet_mode text` — `free_all|free_some|paid|none`.
- Keep the legacy `amenities jsonb` column as a write-through compatibility shim (auto-derived on save by flattening categories to `{ key: true }`), so guest-side code that reads `amenities` keeps working.

**New host-side editor** (`LodgingAmenitiesSection.tsx`, full rewrite)

- Sticky search bar at the top: free-text filter across all categories (case-insensitive).
- Category accordion (collapsed by default except "Most Popular"); each panel:
  - Two-column grid on desktop, single on mobile.
  - Each row = checkbox + Lucide icon + label + small "Extra charge" toggle (only visible when amenity is selected). Rows are 32 px tall = high-density v2026.
  - Per-category `Select all / Clear` micro-buttons in the header.
- Special category renderers:
  - **Parking** & **Internet**: radio groups (single choice) instead of checkboxes — matches Booking pattern.
  - **Languages spoken**: chip group, max 12 visible + "More" expander.
- Live counter chip in the page header: `48 / 152 selected · 6 with extra charge`.
- Sticky footer save bar (matches the booking-drawer pattern from the previous round): shows unsaved-changes count + Save button. Disabled until something changes.
- Optimistic update via `useLodgeAmenities.save`; toast + auto-collapse all categories on success.

**New guest-side renderer** (`LodgingAmenitiesPanel.tsx`, used inside `StoreProfilePage`)

- Renders the same Booking-style "Most popular" hero strip + 3-column categorized grid below (image 226 layout).
- Each amenity row = check icon · label · optional "Additional charge" pill.
- Empty categories are hidden. "Missing some information? Yes / No" footer link writes a row to a new `lodge_amenity_feedback` table (admin-only read) so hosts get nudged to complete their profile.

**Policies section** stays intact but moves into its own card below the amenities accordion (cleaner separation; today they're awkwardly stacked).

## File map

**Created**
- `src/components/lodging/amenityCatalog.ts` — the 152-amenity catalog (categories + icons + extra-charge metadata).
- `src/components/lodging/LodgingAmenitiesPanel.tsx` — guest-side renderer.

**Modified**
- `src/components/admin/store/lodging/LodgingAmenitiesSection.tsx` — full rewrite (categorized accordion, search, sticky footer, parking/internet radios, language chips, extra-charge toggles).
- `src/hooks/lodging/useLodgeAmenities.ts` — extend the type with `categories`, `extra_charge_keys`, `parking_mode`, `internet_mode`; auto-derive the legacy flat `amenities` map on save.
- `src/pages/StoreProfilePage.tsx` — render `<LodgingAmenitiesPanel/>` between the highlights strip and the room list.
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` — friendlier error toast on RLS failure.

**Migration**
- Drop & recreate `lodge_property_profile` policies using `is_lodge_store_owner` (keeps public read).
- Audit & fix any other `lodge_*` policy still pointing at `restaurants`.
- Add `categories jsonb`, `extra_charge_keys text[]`, `parking_mode text`, `internet_mode text` to `lodge_amenities` with safe defaults.
- Create `lodge_amenity_feedback (id, store_id, message text, created_at)` with admin-only RLS.
- Add a new wiring-check `rls.lodge_owner_table_consistency` to the `lodging_wiring_report()` RPC that flags any `lodge_*` policy whose `pg_get_expr(polqual)` mentions `restaurants`.

## Notes

- No new npm dependencies. All icons via existing `getAmenityIcon` (already supports the canonical names; we'll add ~20 missing mappings).
- All UI follows v2026 high-density tokens (`text-[11px]`, `rounded-xl`, semantic colors, Lucide-only).
- Guest-side `LodgingAmenitiesPanel` reads the new `categories` jsonb when present, falls back to the legacy `amenities` map otherwise — zero downtime for stores that haven't re-saved.
- Run the security linter after the migration; if it flags the new `lodge_amenity_feedback` table, lock down inserts to authenticated users only.

