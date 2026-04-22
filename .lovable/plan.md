

# Lodging: prominent photo upload + room details view

Two things to fix based on your screenshots:

1. **IMG_2072 (Edit Room)** — empty cover preview is just decorative; users don't realize the small "Add" tile below is the upload. Make the cover preview itself the primary upload target.
2. **IMG_2074 (Public Villa card)** — no photo, no description visible, no way to "see all information about room" before reserving. Need a tap-to-expand details view.

## 1. Cover preview becomes the upload hero (`LodgingRoomsSection.tsx` + `LodgingRoomPhotoUploader.tsx`)

Replace the static 96px cover preview banner with an **interactive hero uploader**:

- 160px tall (taller than today's 96px) so it reads as a real action.
- When no photos: dashed border, large `ImagePlus` icon + "Tap to upload cover photo · up to 8 images" — clicking opens the file picker directly.
- When photos exist: shows the cover image full-bleed with a subtle gradient overlay + corner badge "Tap to change cover" (opens a small picker showing all uploaded photos as a grid where you tap one to set as cover).
- Existing thumbnail uploader below stays for managing the full set, but is renamed "All photos" with a smaller header so the hero is clearly the primary entry point.

This makes the upload flow obvious on first open and removes the "why is the preview empty?" confusion.

## 2. Room details modal — "See full details" before booking (`LodgingRoomCard.tsx` + new `LodgingRoomDetailsModal.tsx`)

Make the entire public room card tappable (except the Reserve button) → opens a `ResponsiveModal` with the complete room information:

- **Photo gallery** at top: swipeable carousel of all photos (cover first), pagination dots, fallback bed icon if none.
- **Header**: name, type badge, bed config, sleeps N, size m².
- **Description** (full, not truncated).
- **Amenities**: complete grid with icons (not just first 4 + count).
- **Add-ons preview**: list of available extras with prices (e.g. "Breakfast +$8/night") so guests know what's offered before booking.
- **Policies**: cancellation policy in plain English, check-in/out times, breakfast inclusion.
- **Sticky footer**: price + "Reserve" button (mirrors card so guests can book from inside the modal).

On the card itself, add a small **"View details"** affordance (chevron + text) next to the price so the tappability is discoverable.

## 3. Public card — better empty/no-photo state (`LodgingRoomCard.tsx`)

When a room has no photos uploaded yet, instead of a bare bed icon:

- Soft gradient background (`from-muted to-muted/50`) with the bed icon centered + caption "Photo coming soon" so the card doesn't look broken.
- Keep the existing photo rendering when photos are present.

## Files

**Edit**
- `src/components/lodging/LodgingRoomPhotoUploader.tsx` — split into "Cover hero" (large tap area, opens picker or change-cover sheet) + "All photos" thumbnail grid; expose `renderCoverHero` prop so the room dialog can mount only the hero up top.
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx` — replace the inline 96px preview block with the new hero uploader; tighten "All photos" section copy.
- `src/components/lodging/LodgingRoomCard.tsx` — add tappable wrapper opening details modal, "View details" affordance, improved empty-photo state.
- `src/pages/StoreProfilePage.tsx` — pass full room object to card (already does most of this), wire details modal state.

**Create**
- `src/components/lodging/LodgingRoomDetailsModal.tsx` — `ResponsiveModal` with photo carousel, full description, amenities grid, add-ons list, policies, sticky Reserve footer.

## Out of scope

- Editing photos from the public details modal (admin-only).
- Lightbox/full-screen photo zoom (carousel inside modal is enough for v1).
- Per-photo captions/alt text in the uploader.

