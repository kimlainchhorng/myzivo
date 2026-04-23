

## Bulk-tick all Booking.com amenities for Villa

The fastest, cleanest way to give the Villa the full Booking.com-style amenity set is a one-line database update — equivalent to opening the editor and ticking ~80 checkboxes, but instant and reliable.

### What I'll do

Run a single SQL migration that overwrites the Villa's `amenities` array with the full curated baseline. After it runs, the customer modal will immediately render every grouped section (Private bathroom, Bedroom, View, Outdoors, Facilities, Food & drink, Media & technology, Family, Wellness, Services, Accessibility & policy) — exactly like Booking.com picture 1.

### Amenities being ticked (full list)

- **Private bathroom**: Free toiletries, Shower, Bathtub, Bathrobe, Slippers, Hairdryer, Bidet, Toilet, Toilet paper, Towels, Hot shower
- **Bedroom**: Linens, Wardrobe or closet, Alarm clock
- **View**: Sea view, Garden view, Pool view
- **Outdoors**: Balcony, Terrace, Patio, Outdoor furniture, Beach access, Beachfront
- **Facilities**: Electric kettle, Socket near the bed, Dining area, Desk, Clothes rack, Sitting area, Drying rack for clothing, Minibar, Tile/Marble floor, Soundproofing, Air conditioning, Fan, Iron, Ironing facilities, Safety deposit box, Private entrance
- **Food & drink**: Mini-fridge, Refrigerator, Coffee machine, Tea/Coffee maker, Dining table
- **Media & technology**: Wi-Fi, Free Wi-Fi, TV, Flat-screen TV, Cable channels, Telephone
- **Family**: Crib available, Family-friendly
- **Wellness**: Private pool
- **Services**: Daily housekeeping, Room service, 24h reception, Wake-up service, Laundry service
- **Accessibility & policy**: Non-smoking, Free parking, Private parking, Pet-friendly

### Why migration instead of UI clicks

Clicking ~80 toggle buttons one-by-one in the browser would take 80 separate automation calls (slow, error-prone, expensive). A single SQL `UPDATE` produces the exact same result — same column, same data shape — and the editor will show every box pre-ticked next time you open it.

### Files to touch
- New migration: `supabase/migrations/<timestamp>_seed_villa_amenities.sql` — single UPDATE on `lodge_rooms` for room id `69dfd9e2-a02e-48c6-82df-2d46e346b5a0`.

### Verification
- I'll re-query the row to confirm the 50+ amenities are stored.
- You then refresh the Hotels page → open Villa → all grouped sections visible.

### Not changing
- Any other room, store, photos, pricing, code, or schema.

