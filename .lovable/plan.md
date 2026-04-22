

# Property Profile — Booking.com-grade overhaul + completeness meter

The RLS save bug is already fixed at the database layer (verified in `pg_policy`). What's missing is a polished, dense, client-friendly editor for Property Profile to match the new Amenities section. This plan also adds fields the form is missing today (check-in/out, deposits, pet policy, child policy, cancellation policy, contact, etc.) so the store profile is truly Booking-grade.

## 1. Friendlier section header + completeness meter

Top of `LodgingPropertyProfileSection.tsx`:

- Sticky header strip with:
  - Title "Property Profile" + sub-line "Make your storefront irresistible. Updates publish instantly."
  - **Completeness meter** — circular progress (0–100%) computed from 12 weighted fields (hero badges 10, included 10, languages 8, facilities 12, meals 6, house rules 12, accessibility 8, sustainability 6, nearby 10, check-in/out 8, contact 6, policies 4). Shows pill: `78% complete · 3 sections to finish`.
  - Live save indicator: `Saved · 2m ago` / `Unsaved changes` / `Saving…`.
- Replaces the raw bottom-only Save button with a **sticky footer save bar** (mirrors the Amenities pattern) that appears only when `dirty` is true.

## 2. Reorganized sections (collapsible accordion + search)

Current page is a long scroll of 9 cards with no grouping. Rework into 4 collapsible groups, each opens by default if incomplete:

1. **Storefront essentials** — Hero badges · Included highlights · Languages
2. **Facilities & dining** — Property facilities · Meal plans
3. **Stay rules & policies** — Check-in/out windows · House rules · Cancellation policy · Pet policy · Child policy
4. **Trust & location** — Accessibility · Sustainability · Nearby · Contact

Sticky search bar above the accordion filters chips/labels across all groups (matches Amenities UX).

## 3. Expanded data model (NEW fields)

Add to `lodge_property_profile` (migration):

- `check_in_from text` (e.g. "15:00"), `check_in_until text`, `check_out_from text`, `check_out_until text`
- `cancellation_policy text` (free text; one of templated presets via UI)
- `cancellation_window_hours int` (e.g. 48)
- `pet_policy jsonb` — `{ allowed: bool, fee_cents: int, max_weight_kg: int, notes: text }`
- `child_policy jsonb` — `{ allowed: bool, min_age: int, cot_available: bool, extra_bed_fee_cents: int, notes: text }`
- `contact jsonb` — `{ phone, email, whatsapp, website, emergency_phone }`
- `payment_methods text[]` — `["card","cash","aba","bank_transfer"]`
- `currencies_accepted text[]` — `["USD","KHR","THB"]`
- `deposit_required boolean default false` + `deposit_percent int` (0–100)

Extend `LodgePropertyProfile` TS interface and `EMPTY` defaults in `useLodgePropertyProfile.ts`.

## 4. UI upgrades per section

- **Hero badges**: cap at 3 visible on the storefront with live preview pill ("Visible: Beachfront · Free cancellation · Eco-stay").
- **Included highlights**: drag-to-reorder (uses native HTML5 drag, no new deps), max 6 enforced with a counter chip `4/6`.
- **House rules**: time pickers (native `type="time"`) for quiet hours start/end; switches grouped into a 2-col grid; `Security deposit` shows the converted KHR amount (`1 USD = 4,062.5 KHR`) inline.
- **Check-in/out**: 4 time pickers in a 2x2 grid + "Same as standard (15:00 / 11:00)" quick-fill button.
- **Cancellation policy**: 4 preset cards (Flexible / Moderate / Strict / Non-refundable) → click selects + auto-fills the window; advanced text override below.
- **Pet & Child policies**: each a compact row with allowed switch → reveals extra fields only when allowed.
- **Nearby**: distance row gains a small icon picker (walk/drive/boat) shown as Lucide chips instead of `<select>`; reorderable; auto-validates label is non-empty before save.
- **Contact**: 5 inputs (phone, email, whatsapp, website, emergency phone) with inline validation; phone uses `CountryPhoneInput` component already in the codebase.
- **Payment methods & currencies**: chip groups.

## 5. Validation, autosave hint, error UX

- Inline field-level validation (red ring + helper text) for: invalid email, malformed time, negative deposit, child min-age out of range.
- On save:
  - Friendly toast already in place — keep RLS-specific error message for safety.
  - On success, header pill flashes "Saved" with a check icon for 2s.
- Block save while validation errors exist; the sticky bar shows `2 fields need fixing` instead of disabling silently.
- Detect `dirty` via deep-equal vs server snapshot; warn on tab close (`beforeunload`) when dirty.

## 6. Guest-side reflection

- `LodgingHighlightsStrip.tsx` extended to surface check-in/out times and cancellation policy summary.
- New `LodgingPolicyPanel.tsx` rendered on `StoreProfilePage` between rooms and amenities — clean Booking-style grid: Check-in window · Check-out window · Cancellation · Pets · Children · Payment methods · Languages.

## File map

**Created**
- `src/components/admin/store/lodging/PropertyCompletenessMeter.tsx`
- `src/components/admin/store/lodging/property-profile/CheckInOutCard.tsx`
- `src/components/admin/store/lodging/property-profile/CancellationPolicyCard.tsx`
- `src/components/admin/store/lodging/property-profile/PetChildPolicyCard.tsx`
- `src/components/admin/store/lodging/property-profile/ContactCard.tsx`
- `src/components/lodging/LodgingPolicyPanel.tsx` — guest-side policy summary.

**Modified**
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` — full rewrite (accordion, search, sticky save, completeness meter, validation).
- `src/hooks/lodging/useLodgePropertyProfile.ts` — extended interface, EMPTY defaults, dirty/diff helper.
- `src/components/lodging/LodgingHighlightsStrip.tsx` — show check-in/out.
- `src/pages/StoreProfilePage.tsx` — render `<LodgingPolicyPanel/>`.

**Migration**
- Add the 11 new columns/fields to `lodge_property_profile` with safe defaults; backfill `check_in_from='15:00'`, `check_out_until='11:00'` for existing rows.

## Notes

- RLS save bug already resolved (verified) — saves to `lodge_property_profile` succeed end-to-end now.
- All UI keeps v2026 high-density tokens (`text-[11px]`, `rounded-xl`, semantic colors, Lucide-only icons).
- No new npm dependencies; native HTML5 drag-and-drop for reordering.
- Guest-side `LodgingPolicyPanel` reads new fields if present, hides cleanly when empty.

