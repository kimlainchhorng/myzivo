

## Replace Villa amenities with the exact Booking.com room spec you pasted

Right now the Villa has the broad 60+ "kitchen sink" amenity set. You want it to match this specific room spec exactly:

> 323 ft² · Balcony · Garden view · Air conditioning · Private bathroom · Terrace · Minibar
> 1 queen bed
> In your private bathroom: Free toiletries, Shower, Bathrobe, Bidet, Toilet, Towels, Slippers, Hairdryer, Towels/Sheets (extra fee), Toilet paper
> View: Garden view
> Facilities: Balcony, Terrace, Air conditioning, Socket near the bed, Desk, Sitting area, Minibar, Carpeted, Electric kettle, Wardrobe or closet, Dining area, Clothes rack, Drying rack for clothing
> Smoking: No smoking

### What I'll do (single migration)

Update the Villa room (`69dfd9e2-…`) and store amenity catalog (`7322b460-…`) with exactly these values:

**1. Room fields**
- `size_sqm` = **30** (323 ft² ≈ 30 m²)
- `bed_config` = `[{ type: "Queen", qty: 1 }]` (replaces King + Sofa bed)
- `max_guests` = 2 (queen sleeps 2)
- `amenities` = the exact 24-item list from your spec

**2. Store amenity catalog (`lodge_amenities.categories`)** — overwritten to only these groups so the editor + customer modal show only what you pasted:
- **Private bathroom**: Free toiletries, Shower, Bathrobe, Bidet, Toilet, Towels, Slippers, Hairdryer, Toilet paper
- **View**: Garden view
- **Facilities**: Balcony, Terrace, Air conditioning, Socket near the bed, Desk, Sitting area, Minibar, Carpeted, Electric kettle, Wardrobe or closet, Dining area, Clothes rack, Drying rack for clothing
- **Accessibility & policy**: No smoking

**3. Extra-charge keys** — add `"Towels/Sheets"` to `extra_charge_keys` so it renders with the "(extra fee)" badge like Booking.com.

### Files to touch
- New migration: `supabase/migrations/<ts>_villa_exact_booking_spec.sql` — single transaction with the UPDATE on `lodge_rooms` and UPSERT on `lodge_amenities`.

### Not changing
- Pricing, photos, room name, taxes & fees
- Other rooms in this store
- Any code

### Verification
After it runs I'll re-query the row to confirm the 24 amenities, the queen bed, 30 m², and the extra-charge key are stored correctly. You then refresh the property page → open Villa → it will match the Booking.com spec word-for-word.

