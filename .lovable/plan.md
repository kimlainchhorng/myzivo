# Reorder Koh Sdach Resort villas: low → high price

## What changes
Update `sort_order` on all 14 rooms for store `7322b460-2c23-4d3d-bdc5-55a31cc65fab` so the customer page lists them cheapest first.

## New order (by weekday rate)

| sort | Room | US$/night |
|---|---|---|
| 0 | Garden Bungalow | 65 |
| 1 | Twin Garden Bungalow | 69 |
| 2 | VILLA | 77 |
| 3 | VILLA A | 89 |
| 4 | VILLA Class | 91 |
| 5 | VILLA Class A | 109 |
| 6 | Sea View Villa | 119 |
| 7 | Sea View Villa Class | 139 |
| 8 | Family Villa | 145 |
| 9 | Beachfront Villa | 159 |
| 10 | Family Villa Class | 169 |
| 11 | Beachfront Villa Class | 179 |
| 12 | Honeymoon Suite | 199 |
| 13 | Two-Bedroom Pool Villa | 259 |

## How
Single migration with one `UPDATE ... FROM (ROW_NUMBER() OVER ORDER BY base_rate_cents ASC)` — no schema change, no new rows.
