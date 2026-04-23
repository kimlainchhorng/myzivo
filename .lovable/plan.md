

## Goal
Pre-fill the **VILLA A** room with all the detailed Booking.com-style information you provided ($89/night, taxes, breakfast add-on, free cancellation, 323 ft², bathroom, view, facilities, smoking).

## What you'll see
When you open **Rooms & Rates → VILLA A → Edit**, a new **"Apply Villa A preset"** button (next to the existing Deluxe preset) will fill every field in one tap:

- **Price:** $89.00/night base rate, weekend $95
- **Fees:** 10% VAT, 2% city tax
- **Size:** 323 ft² (≈ 30 m²)
- **Beds:** 1 Queen bed (sleeps 2)
- **View:** Garden view
- **Cancellation:** Flexible — Free cancellation, no prepayment (pay at property)
- **Smoking:** No smoking
- **Bathroom amenities:** Free toiletries, Shower, Bathrobe, Bidet, Toilet, Towels, Slippers, Hairdryer, Towels/Sheets (extra fee), Toilet paper
- **Facilities:** Balcony, Terrace, Air conditioning, Socket near the bed, Desk, Sitting area, Minibar, Carpeted, Electric kettle, Wardrobe or closet, Dining area, Clothes rack, Drying rack for clothing
- **Description:** "Comfy 323 ft² villa with garden view, balcony & terrace. 1 queen bed, sleeps 2. Private bathroom. Air-conditioned. Rated 9.4 for comfy beds (10 reviews)."
- **Add-ons:** Exceptional breakfast ($12/guest/night), 15% off food & drink, Late check-in, High-speed internet

You can then click **Save** to persist it to the database.

## Technical Summary
- Edit `src/components/admin/store/lodging/LodgingRoomsSection.tsx`
- Add `applyVillaAPreset()` function modeled on existing `applyDeluxeSeaViewPreset()`
- Add a second **"Villa A preset"** button in the edit dialog header (next to current preset button)
- Uses existing schema fields: `base_rate_cents`, `weekend_rate_cents`, `size_sqm`, `bed_config`, `view`, `fees.vat_pct`, `fees.city_tax_cents`, `amenities[]`, `addons[]`, `cancellation_policy`, `description`
- No DB migration required — all fields already exist on `lodge_rooms`

## Files Modified
- `src/components/admin/store/lodging/LodgingRoomsSection.tsx`

