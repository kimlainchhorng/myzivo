

# Lodging polish: lock dates after add-ons, audit templates, live cover preview, richer legend, cancellation reasons

Five focused refinements on the booking drawer, room editor, and admin reservation detail.

## 1. Lock date pickers after leaving the Stay step (`LodgingBookingDrawer.tsx`)

Once the user advances past Step 1 ("Your stay") into Add-ons or Guest Info, dates and guests must not change — otherwise the price/add-on totals they're reviewing become stale.

- Pass a new `locked` prop into `LodgingStaySelector` (true when `step !== "stay"`).
- When locked: render the stay bar in a read-only state — popovers disabled, buttons get `pointer-events-none opacity-70`, a small `Lock` icon + "Go back to change dates" hint appears below.
- Re-validate on every breakdown recompute: if `hasUnavailableNight` flips to `invalid` while the user is on Add-ons/Guest steps (e.g. a cached availability refresh), surface the existing red `AlertTriangle` banner with a new line: **"Tap Back to pick new dates."** Continue/Submit are already disabled via `rangeIssue.invalid`.

## 2. Quick-select audit note templates (`AdminLodgingReservationDetailPage.tsx`)

Inside the pending-transition panel (above the Textarea):

- Render a horizontally-scrollable row of `Badge`-style chips from a context-aware template list keyed by `pendingStatus`:
  - **confirmed** → "Confirmed by admin", "Payment received", "Phone-verified"
  - **checked_in** → "Guest arrived on time", "Early check-in approved", "ID verified at desk"
  - **checked_out** → "Standard check-out", "Late check-out (fee applied)", "Damages noted"
  - **cancelled** → "Customer cancellation request", "Reschedule requested", "Overbooking"
  - **no_show** → "Customer no-show", "Unreachable by phone", "Late arrival cut-off"
- Tapping a chip appends (with `\n` separator if note already has text) into `note`. Chips are additive so admins can stack a template + free text.

## 3. Required cancellation/no-show reason field

When `pendingStatus` is `cancelled` or `no_show`, the inline transition form gains a required **Reason** select above the audit note:

- Cancelled options: `guest_request`, `payment_failed`, `overbooking`, `property_unavailable`, `policy_violation`, `other`
- No-show options: `no_arrival`, `unreachable`, `late_beyond_cutoff`, `other`
- Save is disabled until both `reason` and `note` are filled.
- On submit, the reason is prepended into the audit note string as `[Reason: <label>] <note>` so it's visible in the existing audit log without a schema change. (Append-only log preserved.)
- Toast message confirms: `"Cancelled — reason: Guest request"`.

## 4. Live cover-image preview in the room editor header (`LodgingRoomsSection.tsx` dialog)

Add a small preview strip at the top of the Edit/Add Room dialog, above the photo uploader:

- 96px tall banner showing `photos[cover_photo_index]` with object-cover. Empty state: dashed placeholder with `BedDouble` icon + "Cover preview".
- Live: the existing `onCoverChange` handler already updates `editing.cover_photo_index`, so the preview re-renders instantly when a star is tapped.
- Below the preview, small caption: "Cover photo · shown on room cards & booking pages".
- Reuses current state — no extra effects.

## 5. Per-date legend + tooltip text under the booking date pickers (`LodgingStaySelector.tsx` + drawer)

The current legend is minimal ("Unavailable / Selected"). Make it richer **only when used inside the booking drawer** (room-scoped availability):

- Add a `showReasonLegend?: boolean` prop on `LodgingStaySelector`. Drawer passes `true`; the public store-profile selector keeps the simple legend.
- When true, render a compact two-line legend strip below the date row:
  - Line 1 (swatches): `■ Sold out` (muted-foreground/40), `■ Restricted` (destructive/30), `■ Selected` (primary), `■ Today` (accent ring).
  - Line 2 (helper text): "Hover or long-press a date to see why it's unavailable."
- Tooltips: extend the existing `DayContent` aria/title to differentiate — `"Sold out · already booked"` vs `"Restricted · blocked by host"` (already wired through `availabilityMap.reason`, just refine the text).

## Files

**Edit**
- `src/components/lodging/LodgingBookingDrawer.tsx` — pass `locked` + `showReasonLegend` to the selector; tweak invalid-range banner copy.
- `src/components/lodging/LodgingStaySelector.tsx` — `locked` (read-only mode), `showReasonLegend` (richer legend + clearer tooltips).
- `src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx` — template chips, required Reason select for cancel/no-show, prepend reason into audit note.
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx` — live cover preview banner inside the room dialog.

## Out of scope

- Persisting cancellation reason as a structured column on `lodge_reservations` (kept inline in audit note for now; can be promoted to a dedicated `cancellation_reason text` column later if needed for analytics).
- Editing already-saved audit notes (still append-only).
- Allowing the public selector to surface room-specific reasons (it spans many rooms).

