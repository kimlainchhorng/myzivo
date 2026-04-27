# Auto-populate Booking.com-style storefront for Koh Sdach Resort by EHM

Store `CBD7322B460` (id `7322b460-2c23-4d3d-bdc5-55a31cc65fab`) has empty storefront fields. I'll fill them using the screenshots from Booking.com, picking sensible defaults for anything missing.

## What I'll write to the database

### `lodge_property_profile`
**`description_sections`** (3 blocks based on the listing context — beachfront resort on Koh Sdach island):
1. **Welcome to Koh Sdach Resort by EHM** — one paragraph intro: beachfront private island setting, garden views, restaurant/bar on site, water sports.
2. **Things to do** — snorkeling, hiking, bike & walking tours, fishing, cultural tours, themed dinners, beach time.
3. **Good to know** — daily housekeeping, 24-hour front desk, family-friendly rooms, English & Khmer spoken, free Wi-Fi everywhere, no parking on-site.

**`property_highlights`** (mini-card on Booking.com top-right):
- `perfect_for: "Two travelers · Beach getaway"`
- `top_location_score: 9.0`
- `breakfast_info: "Cooked-to-order Asian, Vegetarian and Continental options available."`
- `rooms_with: ["Sea view", "Garden view", "Private bathroom", "Air conditioning"]`

**`popular_amenities`** (top 9 from screenshot — icon row):
`Outdoor swimming pool`, `Non-smoking rooms`, `Restaurant`, `Free Wifi`, `Fitness center`, `Beachfront`, `Family rooms`, `Private beach area`, `Breakfast`

**`facilities`** (full list from the screenshot — currently only "Bar"):
Add ~60 facilities across Bathroom, Bedroom, View, Outdoors, Kitchen, Activities, Living Area, Media & Technology, Food & Drink, Internet, Transportation, Front Desk Services, Cleaning Services, Business Facilities, Safety & security, General, Outdoor swimming pool, Spa, Languages Spoken (English, Khmer), Entertainment & Family Services.

### `lodge_rooms` (all 4 villas)
- **`badges`**: `["Free cancellation", "No prepayment needed"]` (standard Booking.com offer badges)
- **`expandable_features`**: `["Free toiletries", "Bidet", "Shower", "Bathrobe", "Slippers", "Hairdryer", "Towels"]` (Bathroom expandable group from screenshot)

## How

Single SQL migration that updates the one profile row + 4 room rows. Idempotent (safe to re-run; only fills if currently empty/default).

## After approval
Run the migration. You'll see all the new content immediately on the **Storefront preview** card I just added to the Dashboard, and fully editable in the Property Profile + Rooms tabs. You can tweak any wording afterward.
