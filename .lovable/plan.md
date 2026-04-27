# Show weekend price + discount badges on villa cards

## Why nothing changed visually
The database update worked (weekend prices and weekly/monthly discounts are now stored correctly), but the storefront villa card (`LodgingRoomCard`) only displays the **weekday price** — it never reads `weekend_rate_cents`, `weekly_discount_pct`, or `monthly_discount_pct`. So the page looks identical even though the data is correct underneath.

The values only appear inside the booking modal after a guest taps "Reserve" and picks dates.

## Fix
Make the new pricing visible directly on each villa card, Booking.com-style.

### 1. `src/components/lodging/LodgingRoomCard.tsx`
Add 3 new optional props: `weekendRateCents`, `weeklyDiscountPct`, `monthlyDiscountPct`.

- **In the dark image overlay** (where "WEEKDAY US$65" sits): add a second line right under it — `WEEKEND US$77` — so guests immediately see both rates.
- **Under the footer price** (`$65.00 /night`): add a small emerald pill row showing `−10% weekly` and `−20% monthly` when those discounts are > 0. Same lightweight chip style already used for amenities.

### 2. `src/pages/StoreProfilePage.tsx` (line ~825)
Pass the 3 new fields from the room record into `<LodgingRoomCard>`:
```tsx
weekendRateCents={r.weekend_rate_cents}
weeklyDiscountPct={r.weekly_discount_pct}
monthlyDiscountPct={r.monthly_discount_pct}
```

## Result
Each of the 14 Koh Sdach villa cards will now visibly show:
- Weekday price (existing)
- Weekend price (new, on hero overlay)
- "−10% weekly" / "−20% monthly" discount pills (new, under the footer price)

No database changes needed — the data is already there.
