
# P2P Car Rental Legal Pages Implementation Plan

## Overview
Create four new legal pages specifically for the ZIVO P2P Car Rental Marketplace, update the footer to include these pages, and add required disclosures to the booking flow.

---

## Files to Create

### 1. Renter Terms of Service (`/terms/renter`)
**File**: `src/pages/legal/RenterTerms.tsx`

Content sections:
- ZIVO marketplace role (connects renters with vehicle owners)
- ZIVO is NOT the vehicle owner
- Renter requirements:
  - Valid driver's license
  - Minimum age requirements (21+, or 25+ for luxury vehicles)
  - Clean driving record
  - Follow all traffic laws
- Payment processing (handled by ZIVO via Stripe)
- Cancellation and refund policy:
  - 48+ hours: Full refund
  - 24-48 hours: 75% refund
  - Under 24 hours: 50% refund
  - No-show: No refund
- Renter responsibilities:
  - Traffic violations, tickets, tolls
  - Report damage immediately
  - No unauthorized drivers
  - Vehicle condition at return
- Insurance coverage (applies during booked rental period only)
- Damage handling and dispute resolution
- Limitation of liability for ZIVO
- Governing law (State of Delaware, USA)

---

### 2. Owner Terms of Service (`/terms/owner`)
**File**: `src/pages/legal/OwnerTerms.tsx`

Content sections:
- Owner eligibility and listing requirements
- Vehicle requirements:
  - Model year 2018 or newer
  - Valid registration and insurance
  - Safe, roadworthy condition
  - Accurate photos and descriptions
- Authorization granted to ZIVO:
  - Market and display vehicle on platform
  - Collect payments from renters
  - Deduct platform commission (20%)
  - Deduct insurance fees if applicable
  - Process refunds per policy
- Payout terms:
  - Paid after trip completion (24-48 hours post-trip)
  - Requires connected Stripe account
  - Subject to payout holds for disputes
- Insurance and protection:
  - Owner agrees to platform insurance terms
  - Personal insurance may not apply during rentals
  - Report incidents immediately
- ZIVO rights:
  - Suspend or remove listings
  - Reject vehicles that don't meet standards
  - Hold payouts during disputes
- Accurate disclosure requirements
- Governing law and dispute resolution

---

### 3. Insurance Disclosure (`/insurance`)
**File**: Update existing `src/pages/legal/InsurancePolicy.tsx`

Add new P2P-specific section (new tab for "P2P Rental"):
- Third-party commercial insurance arrangement
- Coverage during active rental period only
- Coverage includes:
  - Liability protection ($1,000,000)
  - Physical damage protection
  - Uninsured motorist coverage
- Subject to insurer terms and limits
- Owner personal insurance exclusion
- Incident reporting requirements (immediate)
- Claims process

Required disclaimer block:
> "Insurance coverage is provided by third-party insurers and is subject to policy terms. ZIVO does not act as an insurance provider."

---

### 4. Damage and Incident Policy (`/damage-policy`)
**File**: `src/pages/legal/DamagePolicy.tsx`

Content sections:
- How to report damage:
  - During rental: Call emergency support line
  - At return: Document with photos before leaving
  - Within 24 hours if discovered later
- Photo documentation requirements:
  - Pre-trip walkthrough photos
  - Post-trip condition photos
  - Date/time stamped evidence
- Inspection process:
  - Owner and renter both inspect
  - Any damage noted in app/photos
  - Owner has 48 hours to report damage post-return
- Claim review timeline:
  - Initial review: 48 hours
  - Investigation: Up to 7 days
  - Resolution: Within 14 days
- Resolution options:
  - Insurance claim (if covered)
  - Direct owner compensation
  - Partial/full renter charge
  - Dispute escalation
- Dispute handling process:
  - Formal dispute filing
  - Evidence submission window (72 hours)
  - ZIVO mediation
  - Final decision within 14 days
- Payout delays:
  - During active dispute
  - Pending damage assessment
  - Admin review required

---

## Files to Modify

### 5. Footer Update
**File**: `src/components/Footer.tsx`

Add new "P2P Rental" section with links:
- Renter Terms (`/terms/renter`)
- Owner Terms (`/terms/owner`)
- Insurance & Protection (`/insurance`)
- Damage Policy (`/damage-policy`)

---

### 6. Booking Disclosure Update
**File**: `src/pages/p2p/P2PVehicleDetail.tsx`

Update the terms checkbox area (lines 498-517) to include:
- Link to Renter Terms (`/terms/renter`)
- Link to Insurance Policy (`/insurance`)
- Link to Damage Policy (`/damage-policy`)

New disclosure text:
> "By booking, you agree to the Renter Terms of Service and acknowledge the Insurance & Damage Policy."

---

### 7. App.tsx Routes
**File**: `src/App.tsx`

Add new routes:
```
/terms/renter → RenterTerms
/terms/owner → OwnerTerms
/damage-policy → DamagePolicy
```

Note: `/insurance` route already exists for InsurancePolicy.tsx

---

## Technical Implementation

### Page Structure
All legal pages will follow the existing pattern from `CancellationPolicy.tsx`:
- NavBar or Header component
- SEOHead with title and description
- Back button to home
- Centered heading with last updated date
- Card-based content sections with icons
- Contact section with email link
- Related links footer
- Footer component

### Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle` from shadcn/ui
- `Badge` for status indicators
- `Button` for back navigation
- Lucide icons: `Car`, `Shield`, `AlertCircle`, `CheckCircle`, `Mail`, `Scale`, `FileText`, `Camera`, `Clock`

### SEO
Each page will have proper:
- Title tags
- Meta descriptions
- Canonical URLs

---

## Summary of Changes

| Action | File | Description |
|--------|------|-------------|
| Create | `src/pages/legal/RenterTerms.tsx` | Renter Terms of Service |
| Create | `src/pages/legal/OwnerTerms.tsx` | Owner Terms of Service |
| Create | `src/pages/legal/DamagePolicy.tsx` | Damage and Incident Policy |
| Modify | `src/pages/legal/InsurancePolicy.tsx` | Add P2P-specific insurance tab |
| Modify | `src/components/Footer.tsx` | Add P2P legal links section |
| Modify | `src/pages/p2p/P2PVehicleDetail.tsx` | Update booking terms disclosure |
| Modify | `src/App.tsx` | Add new routes |
