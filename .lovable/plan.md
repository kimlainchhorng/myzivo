# Recalculate Koh Sdach Resort prices + add stay discounts

## What's wrong now

1. **Original 4 villas have inconsistent weekend prices** — all set to $172, which is way out of line with their $77–$109 weekday rates.
2. **No long-stay discount** — every room has `weekly_discount_pct = 0` and `monthly_discount_pct = 0`, so guests staying a week or month see no savings.

## Pricing rules I'll apply (Booking.com-style)

- **Weekend rate = weekday × 1.18** (rounded to nearest $1) — typical Fri/Sat surcharge.
- **Weekly discount = 10%** on every room (auto-applied for stays of 7+ nights).
- **Monthly discount = 20%** on every room (auto-applied for stays of 28+ nights).
- Weekday base rates kept as-is (already low → high, $65 → $259).

## New per-room values

| Room | Weekday | New Weekend | Weekly −10% | Monthly −20% |
|---|---|---|---|---|
| Garden Bungalow | $65 | $77 | $58.50 | $52 |
| Twin Garden Bungalow | $69 | $81 | $62.10 | $55.20 |
| VILLA | $77 | $91 | $69.30 | $61.60 |
| VILLA A | $89 | $105 | $80.10 | $71.20 |
| VILLA Class | $91 | $107 | $81.90 | $72.80 |
| VILLA Class A | $109 | $129 | $98.10 | $87.20 |
| Sea View Villa | $119 | $140 | $107.10 | $95.20 |
| Sea View Villa Class | $139 | $164 | $125.10 | $111.20 |
| Family Villa | $145 | $171 | $130.50 | $116 |
| Beachfront Villa | $159 | $188 | $143.10 | $127.20 |
| Family Villa Class | $169 | $199 | $152.10 | $135.20 |
| Beachfront Villa Class | $179 | $211 | $161.10 | $143.20 |
| Honeymoon Suite | $199 | $235 | $179.10 | $159.20 |
| Two-Bedroom Pool Villa | $259 | $306 | $233.10 | $207.20 |

## How
Single migration: one UPDATE that recomputes `weekend_rate_cents = ROUND(base_rate_cents * 1.18)` and sets `weekly_discount_pct = 10`, `monthly_discount_pct = 20` for all 14 rooms.

The booking flow already reads these fields (it picks weekend rate on Fri/Sat and applies the % discount for long stays), so guests will immediately see correct totals at checkout. No UI change needed.
