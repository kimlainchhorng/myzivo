
# Seller of Travel Registration Update

## Overview

Update ZIVO's compliance text and legal documentation to reflect official Seller of Travel registration status, including state-specific pending registrations for California and Florida.

---

## New Registration Information

```text
ZIVO is registered as a Seller of Travel where required by law.
California Seller of Travel Registration: pending
Florida Seller of Travel Registration: pending
ZIVO sells air travel as a sub-agent of licensed ticketing providers.
Airline tickets are issued by authorized partners and subject to airline rules.
```

---

## Files to Modify

### 1. `src/config/flightMoRCompliance.ts`

Add seller of travel registration constants:

```typescript
// NEW SECTION: SELLER OF TRAVEL REGISTRATION
export const ZIVO_SOT_REGISTRATION = {
  status: "ZIVO is registered as a Seller of Travel where required by law.",
  california: "California Seller of Travel Registration: pending",
  florida: "Florida Seller of Travel Registration: pending",
  fullDisclosure: `ZIVO is registered as a Seller of Travel where required by law. California Seller of Travel Registration pending. Florida Seller of Travel Registration pending.`,
} as const;
```

Update `FLIGHT_MOR_DISCLAIMERS.footer` to include registration status.

---

### 2. `src/config/flightCompliance.ts`

Add matching registration constants and update footer disclaimer to reference SOT registration.

---

### 3. `src/pages/legal/FlightTerms.tsx`

Enhance "ZIVO as Seller of Travel" section with:
- Registration status statement
- State-specific pending registrations (CA, FL)
- Note that additional state registrations will be added as obtained

---

### 4. `src/components/Footer.tsx`

Update the "Unified Partner Disclosure" section:

Replace:
```text
⚠️ Hizivo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers.
Hizivo does not issue airline tickets. Flight, Hotel, and Car Rental bookings...
```

With:
```text
✓ ZIVO is registered as a Seller of Travel where required by law.
California SOT: pending | Florida SOT: pending
ZIVO sells air travel as a sub-agent of licensed ticketing providers.
Airline tickets are issued by authorized partners and subject to airline rules.
```

---

### 5. `src/components/flight/FlightSellerDisclaimer.tsx`

Add new `registration` variant that shows SOT status:
- "Registered Seller of Travel" badge
- State registration notes on hover/expand

Update `checkout` variant to include registration badge.

---

### 6. `src/pages/FlightCheckout.tsx`

Add subtle registration badge near payment button:
- "Licensed Seller of Travel" trust badge
- SOT registration tooltip on hover

---

### 7. `src/components/lp/LPComplianceFooter.tsx`

Update ad landing page footer to reflect MoR model:
- Remove "Hizivo may earn a commission" (affiliate language)
- Add "ZIVO is registered as a Seller of Travel"
- Update ticketing disclaimer to match MoR language

---

## New Compliance Text Matrix

| Location | New Text |
|----------|----------|
| Global Footer | "ZIVO is registered as a Seller of Travel where required by law." |
| State Registration | "California SOT: pending · Florida SOT: pending" |
| Sub-Agent | "ZIVO sells air travel as a sub-agent of licensed ticketing providers." |
| Ticketing | "Airline tickets are issued by authorized partners and subject to airline rules." |
| Trust Badge | "Licensed Seller of Travel" |

---

## Implementation Summary

1. **Config files**: Add `ZIVO_SOT_REGISTRATION` constants to both MoR and general compliance configs
2. **Flight Terms page**: Expand legal disclosure with registration details
3. **Global Footer**: Replace affiliate language with MoR/SOT disclosure
4. **LP Footer**: Update for ad compliance with MoR language
5. **Checkout**: Add registration trust badge
6. **Disclaimer component**: New `registration` variant

This ensures all customer-facing pages display accurate Seller of Travel registration status.
