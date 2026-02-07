
# Show Commission + Earnings on Receipt

## Summary

Add driver earnings and platform fee display to the ride receipt screen when a trip is completed. The values will be calculated using the existing 15%/85% commission split defined in `adminConfig.ts`, or use the `platform_fee` column if it's already stored on the trip record.

---

## Approach

Since the database already has a `platform_fee` column on the `trips` table, we have two options:

**Option A (Recommended)**: Calculate driver earnings and platform fee dynamically in the frontend using the fare amount and the defined commission rates (15%/85% split). This avoids database migrations and uses the existing config.

**Option B**: Add `driver_earning_amount` column via migration. However, this adds complexity and the values can easily be derived from `fare_amount`.

We'll go with **Option A** - calculate in the frontend using the ride price and commission rates.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ride/RideReceiptModal.tsx` | Modify | Add commission/earnings display, import rates from adminConfig |

---

## Implementation Details

### RideReceiptModal.tsx Changes

Import the commission rates:

```typescript
import { PLATFORM_COMMISSION_RATE, DRIVER_SHARE_RATE } from "@/config/adminConfig";
```

Calculate the amounts from the total price:

```typescript
// Calculate platform and driver amounts
const platformFee = price * PLATFORM_COMMISSION_RATE; // 15%
const driverEarnings = price * DRIVER_SHARE_RATE; // 85%
```

Add display section after the "Total" row (inside the fare breakdown area):

```typescript
{/* Commission Breakdown - only show for completed trips */}
<div className="pt-3 mt-3 border-t border-white/10 space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-white/60">Driver earned</span>
    <span className="text-green-400">${driverEarnings.toFixed(2)}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-white/60">Platform fee</span>
    <span className="text-white/40">${platformFee.toFixed(2)}</span>
  </div>
</div>
```

---

## Visual Placement

The commission breakdown will appear below the "Total" line in the fare breakdown section:

```text
┌─────────────────────────────────────┐
│         ✓ Trip Complete!            │
├─────────────────────────────────────┤
│  Base fare               $2.50      │
│  Time (5:30)             $1.65      │
│  Distance (3.2 mi)       $4.85      │
│  Service fee             $1.50      │
│  ─────────────────────────────────  │
│  Tip                     $3.00      │
│  Total                  $13.50      │
│  ─────────────────────────────────  │  ← NEW SECTION
│  Driver earned          $11.48      │  ← green text
│  Platform fee            $2.02      │  ← muted text
├─────────────────────────────────────┤
│  ⭐ ⭐ ⭐ ⭐ ⭐  Rate your driver  │
│  [Feedback textarea...]             │
│  [Submit Rating]                    │
├─────────────────────────────────────┤
│  Add a tip: [$1] [$3] [$5]          │
├─────────────────────────────────────┤
│           [  DONE  ]                │
└─────────────────────────────────────┘
```

---

## Calculation Details

Using the existing constants from `src/config/adminConfig.ts`:

| Rate | Value | Calculation |
|------|-------|-------------|
| Platform Fee | 15% | `price × 0.15` |
| Driver Earnings | 85% | `price × 0.85` |

Example for a $20.00 ride:
- Platform fee: $3.00
- Driver earnings: $17.00

---

## No Database Changes Required

The calculation is performed client-side using:
- `price` prop (already passed to the modal)
- `PLATFORM_COMMISSION_RATE` (0.15) from adminConfig
- `DRIVER_SHARE_RATE` (0.85) from adminConfig

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Price is 0 | Show $0.00 for both values |
| Price includes tip | Tip is added separately and not included in commission calculation (tip goes 100% to driver) |
| Decimal precision | Format to 2 decimal places with `.toFixed(2)` |

---

## No Changes To

- Database schema
- Receipt modal layout structure
- Rating functionality
- Tip selection
- Other pages
