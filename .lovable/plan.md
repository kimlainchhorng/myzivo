

## Add Promo Codes to Travel Checkouts

The Promo Codes and Discounts system is already 95% built across ZIVO. Here is what exists and what needs to be added.

### Already Exists (no changes needed)

| Feature | Location |
|---------|----------|
| Promotions page (coupons, offers, referrals, loyalty) | `src/pages/Promotions.tsx` |
| Promo code input for Rides | `src/components/ride/PromoCodeInput.tsx` |
| Promo code input for Eats (with inline variant) | `src/components/eats/PromoCodeInput.tsx` + `EatsCheckout.tsx` |
| Unified promo validation hook (RPC-based) | `src/hooks/usePromotionValidation.ts` |
| Ride-specific promo validation | `src/hooks/useRidePromoValidation.ts` |
| Eats promo hook | `src/hooks/useEatsPromo.ts` |
| General promo code hook | `src/hooks/usePromoCode.ts` |
| Promo code service (validate, calculate discount) | `src/lib/promoCodeService.ts` |
| Admin promotions CRUD | `src/components/admin/AdminPromotions.tsx` |
| Dispatch promotions management | `src/pages/dispatch/DispatchPromotions.tsx` |
| Promo banner for homepage | `src/components/shared/PromoCodeBanner.tsx` |
| Marketing promo banner | `src/components/marketing/PromoBanner.tsx` |
| Automatic promotions on restaurants | Already shown via restaurant cards with promo badges |
| Discount types (percentage, fixed, free delivery) | Supported in `promotions` table and validation RPC |

### What Will Be Added

Promo code input sections on the three travel checkout pages that currently lack them: **Flights**, **Hotels/Travel**, and **Cars**.

---

**1. Flight Checkout (`src/pages/FlightCheckout.tsx`)**

- Import `usePromotionValidation` hook with `serviceType: 'flights'`
- Add a promo code input section in the price breakdown area (before the total)
- When a valid promo is applied, show the discount as a line item and adjust the total
- Pass the promo code to the checkout function for server-side re-validation

**2. Travel Checkout (`src/pages/TravelCheckoutPage.tsx`)**

- Import `usePromotionValidation` hook with `serviceType: 'hotels'`
- Add a promo code input section in the order summary before the total line
- Adjust the `total` calculation to subtract the discount amount
- Show applied promo badge with remove button

**3. Car Checkout (`src/pages/CarCheckoutPage.tsx`)**

- Import `usePromotionValidation` hook with `serviceType: 'cars'`
- Add a promo code input section before the "Proceed to Partner" button
- Display discount amount in the summary
- Note: since car checkout redirects to a partner, the discount is informational (the promo would need partner integration to actually apply)

---

### Technical Details

**Files modified (3):**

| File | Change |
|------|--------|
| `src/pages/FlightCheckout.tsx` | Add promo input, discount line item, adjusted total |
| `src/pages/TravelCheckoutPage.tsx` | Add promo input, discount line item, adjusted total |
| `src/pages/CarCheckoutPage.tsx` | Add promo input, discount display |

**Shared hook used:** `usePromotionValidation` from `src/hooks/usePromotionValidation.ts` -- the same RPC-based validation already used in Eats checkout. Each page passes its own `serviceType` ('flights', 'hotels', 'cars') so the backend can enforce service-specific promo restrictions.

**Promo input UI pattern** (consistent across all three pages):

```text
+------------------------------------------+
| [Tag icon] Promo code     [  Apply  ]    |
+------------------------------------------+
```

When applied:

```text
+------------------------------------------+
| [Check] SUMMER20  -$15.00        [X]     |
| "20% off summer travel"                  |
+------------------------------------------+
```

Styled with emerald green success state (`bg-emerald-500/10 border-emerald-500/20`), matching the existing Eats checkout promo pattern.

**No new files, hooks, or database changes needed.** All validation, discount types, and admin management already exist.

