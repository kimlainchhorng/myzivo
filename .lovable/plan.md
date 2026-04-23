

## Why the Villa modal looks empty vs. Booking.com

The grouped-amenities UI is **already built and working** in both:
- Admin editor (`LodgingRoomsSection.tsx`) — shows all 11 grouped sections
- Customer modal (`LodgingRoomDetailsModal.tsx`) — renders any group that has saved items

The customer modal only shows **View / Facilities / Media & technology** because the Villa's database row only has 5 amenities saved: `Sea view`, `AC`, `Safe`, `Wi-Fi`, `TV`. There is no Free toiletries, Shower, Towels, Balcony, Terrace, Electric kettle, etc. saved for this room — so those sections correctly hide themselves.

This is a **data entry gap**, not a code bug. To match the Booking.com screenshot the property owner needs to open the Villa in admin and tick the rest. I can also tighten the code so this is easier going forward.

### What I'll change

**1. Unify amenity vocabulary (prevents drift)**
- Remove the duplicate `"AC"` from the modal's Facilities group. Keep only `"Air conditioning"` as the canonical label (matches the editor).
- Add a one-time data migration alias so any existing rooms that saved `"AC"` are displayed as `"Air conditioning"` in the modal.

**2. Improve the empty-state experience**
- When a group has zero saved items, the modal currently hides it entirely. That's correct — but I'll add a subtle helper line under the Amenities header for owners viewing their own listing: *"Tip: add more amenities in Admin → Rooms → Edit"*. Public visitors won't see this.

**3. Sync the editor's default starter set**
- When an owner creates a brand-new room, pre-tick a sensible Booking.com-style baseline (Free toiletries, Towels, Toilet, Shower, Wi-Fi, Air conditioning, Wardrobe or closet, Desk, Non-smoking) so new rooms aren't blank by default. Owners can untick anything they don't have.

**4. No changes to**
- The grouped layout (already matches picture 1)
- Database schema
- Booking flow, policies, photos, pricing

### Files to touch
- `src/components/lodging/LodgingRoomDetailsModal.tsx` — remove `"AC"` duplicate, add `"AC"` → `"Air conditioning"` alias, add owner-only tip line.
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx` — pre-tick baseline amenities on new room creation.

### What you need to do (no code involved)
Open **Admin → Property → Rooms → Villa → Edit**, scroll to the Amenities section, and tick the items you want shown (Free toiletries, Shower, Towels, Balcony, Terrace, Electric kettle, Socket near the bed, Dining area, Desk, Clothes rack, Drying rack for clothing, Minibar, Wardrobe or closet, etc.). Save. The customer modal will immediately show all those grouped sections — exactly like Booking.com picture 1.

