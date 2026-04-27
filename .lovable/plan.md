# Expand Koh Sdach Resort to 14 villas + full Booking.com amenities on the public page

## Findings

1. **The public storefront (/grocery/shop/koh-sdach-resort-by-ehm)** already renders `LodgingAmenitiesPanel`. It reads from a **different table** — `lodge_amenities` (with a `categories` jsonb keyed by canonical amenity keys) — NOT the `lodge_property_profile.facilities` array I populated last turn. That's why the public page's amenities still look thin.
2. **Rooms**: Today there are 4 villas (VILLA, VILLA Class, VILLA A, VILLA Class A). To reach 14 we add 10 new room types, varied across price/style.

## What I'll do (single migration)

### A) Expand public-facing amenities → `lodge_amenities`

Rebuild the `categories` jsonb using canonical keys from `amenityCatalog.ts` so they render correctly. Curated to match the Booking.com reference for an island beach resort:

- **popular** (8): outdoor_pool, non_smoking_rooms, restaurant, wifi, fitness_centre, beachfront, family_rooms, private_beach
- **great_for_stay** (5): private_bathroom, ac, breakfast, watersports, free_shuttle
- **bathroom** (11): toilet_paper, towels, bidet, extra_linen, private_bathroom, toilet, shower, hairdryer, bathrobe, slippers, free_toiletries
- **bedroom** (2): linens, wardrobe
- **outdoors** (5): beachfront, private_beach, terrace, garden, outdoor_furniture
- **room_amenities** (4): socket_near_bed, drying_rack, fan, mosquito_net
- **activities** (5): bicycle_rental, themed_dinners, beach, watersports, evening_entertainment
- **food_drink** (4): bar, restaurant, kids_meals, special_diet_meals
- **transportation** (2): airport_shuttle, bicycle_hire
- **services** (6): daily_housekeeping, baggage_storage, tour_desk, laundry, front_desk_24h, currency_exchange
- **front_desk** (1): invoice_provided
- **entertainment_family** (3): board_games, playground, family_rooms
- **safety_security** (5): fire_extinguishers, cctv_common, smoke_alarms, security_24h, safe
- **general** (5): non_smoking_rooms, ac, soundproof, soundproof_rooms, designated_smoking
- **pool** (3): pool_open_year, loungers, pool_towels
- **spa** (3): fitness_centre, beach_umbrellas, massage
- **languages** (2): english, khmer

Plus singleSelects: `internet_mode = 'free_all'`, `parking_mode = 'none'`. `extra_charge_keys` includes laundry, watersports, kids_meals, themed_dinners, bicycle_rental, airport_shuttle, massage, extra_linen.

Result: ~14 visible categories, ~74 amenity items on the public page — matches your Booking.com screenshots.

### B) Add 10 new villa types → `lodge_rooms`

Reusing the same photo URLs already on the existing villas (so they render immediately). Variety in beds/size/price:

| # | Name | Bed | Sleeps | m² | Weekday US$ | Breakfast |
|---|---|---|---|---|---|---|
| 5 | Sea View Villa | 1 King | 2 | 32 | 119 | yes |
| 6 | Sea View Villa Class | 1 King | 2 | 34 | 139 | yes |
| 7 | Beachfront Villa | 1 King | 2 | 38 | 159 | yes |
| 8 | Beachfront Villa Class | 1 King | 2 | 40 | 179 | yes |
| 9 | Family Villa | 1 Queen + 1 Single | 3 | 42 | 145 | yes |
| 10 | Family Villa Class | 1 Queen + 2 Single | 4 | 48 | 169 | yes |
| 11 | Garden Bungalow | 1 Queen | 2 | 26 | 65 | no |
| 12 | Twin Garden Bungalow | 2 Single | 2 | 26 | 69 | no |
| 13 | Honeymoon Suite | 1 King | 2 | 36 | 199 | yes |
| 14 | Two-Bedroom Pool Villa | 1 King + 1 Queen | 4 | 60 | 259 | yes |

Each gets the same `amenities`, `badges` (Free cancellation, No prepayment needed), and `expandable_features` already standard on your existing rooms.

### C) Idempotent
- `lodge_amenities` upsert on `store_id` (unique constraint expected; if not present, will use `INSERT ... ON CONFLICT DO UPDATE`).
- New rooms inserted only if a room with that exact name doesn't already exist for the store.

## After approval
- Open `/grocery/shop/koh-sdach-resort-by-ehm` — you'll see all 14 villa cards in Rooms & Rates and a full Booking.com-style "Amenities of this property" section with Most popular row + ~14 grouped sections.
