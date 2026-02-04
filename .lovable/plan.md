
# ZIVO Launch, Operations & Risk Control Implementation

## Overview

This plan prepares ZIVO for public launch with comprehensive refund/dispute handling, booking management, fraud protection, chargeback safety, partner trust pages, currency support, and launch control infrastructure.

## Current State Assessment

### Already Implemented (Existing)

| Feature | Status | Location |
|---------|--------|----------|
| **Flight Confirmation Page** | Complete | `FlightConfirmation.tsx` with PNR, ticket status, support contact |
| **Refund Policy Page** | Complete | `Refunds.tsx` with clear partner routing, service-specific handling |
| **Partner Disclosure Page** | Complete | `legal/PartnerDisclosure.tsx` with hybrid model explanation |
| **Affiliate Disclosure Page** | Complete | `AffiliateDisclosure.tsx` with commission transparency |
| **Public Status Page** | Complete | `Status.tsx` with service health, incidents, third-party dependencies |
| **Fraud Detection System** | Complete | `AdminFraudDashboard.tsx`, `useFraudData.ts`, fraud_assessments table |
| **Beta Mode / Launch Control** | Complete | `useRenterBetaSettings.ts`, `useProductionLaunch.ts`, soft/full launch phases |
| **Footer with Legal Notices** | Complete | `Footer.tsx` with Seller of Travel, sub-agent disclosure, mobility separation |
| **Contact Page** | Complete | `Contact.tsx` with support/payments/business emails |
| **MultiCurrency Component** | Complete | `MultiCurrency.tsx` with USD/EUR/GBP toggle, conversion display |
| **Security Pages** | Complete | `Security.tsx`, `DisasterRecovery.tsx`, `SecurityIncident.tsx` |
| **System Status (Admin)** | Complete | `SystemStatusPage.tsx`, `FlightStatusPage.tsx` |
| **Cancellation Policy** | Complete | `legal/CancellationPolicy.tsx` |

### Missing/Needs Enhancement

| Feature | Status | Required |
|---------|--------|----------|
| **Booking Management Page** | Missing | User-facing page to view/manage bookings with all details |
| **Booking Rules Section (Results)** | Missing | Change/cancel/refund policy preview on booking cards |
| **Chargeback Prevention Copy** | Partial | Needs explicit PCI compliance and dispute handling notice |
| **How ZIVO Makes Money Page** | Missing | Dedicated page (currently section in About) |
| **Press/Media Contact Page** | Missing | Dedicated press page with media inquiries form |
| **Currency Selector (Global)** | Partial | Need header-level currency toggle |
| **Location Auto-Detect** | Missing | Geo-IP based currency/locale detection |
| **Launch Mode Banner** | Partial | Need visible user-facing soft launch/invite-only banner |
| **Duplicate Booking Prevention UI** | Missing | Warning when user attempts duplicate booking |
| **Payment Verification Step UI** | Missing | Visual indicator for high-risk verification |

---

## Implementation Phases

### Phase 1: Booking Management Page

Create a comprehensive user-facing booking management page at `/bookings/:bookingId` or `/my-trips/:bookingId`.

**New Page:** `src/pages/BookingManagement.tsx`

Features:
- Booking reference (PNR / confirmation code)
- Airline/provider confirmation code
- Provider contact info with click-to-call/email
- Ticket status badge (Issued / Pending / Changed / Cancelled)
- Download e-ticket button (PDF placeholder)
- Trip details (dates, passengers, itinerary)
- "Request Support" button linking to help center
- Booking rules accordion (change policy, cancel policy, refund eligibility)

Route: `/bookings/:bookingId`

**Integration:**
- Add link from FlightConfirmation page
- Add link from CustomerDashboard trips tab

### Phase 2: Booking Rules Section (Results Pages)

Add booking rules preview to flight/hotel/car result cards before selection.

**New Component:** `src/components/shared/BookingRulesPreview.tsx`

```text
Booking Rules Preview:
+--------------------------------------------------+
| 📋 Booking Rules                                  |
+--------------------------------------------------+
| ✓ Refundable with $50 fee (before 24h)          |
| ✓ Changes allowed ($75 fee)                      |
| ⚠️ Non-refundable after departure                |
| ℹ️ Airline rules apply for all changes            |
+--------------------------------------------------+
```

**Update:** Add to `FlightResultCard.tsx`, `HotelMultiProviderCard.tsx`

Compliance copy in results:
```text
"Refunds and changes are governed by the airline or travel provider's rules.
ZIVO facilitates the booking but does not control fare conditions."
```

### Phase 3: Chargeback & Payment Safety

Enhance payment safety messaging and add explicit chargeback prevention copy.

**Update:** `src/pages/FlightCheckout.tsx`

Add payment safety section:
```text
"All payments are processed by PCI-compliant providers.
ZIVO does not store card details.

In case of disputes, documentation is shared with payment providers and partners."
```

**New Component:** `src/components/checkout/PaymentSafetyNotice.tsx`

Features:
- PCI-DSS compliance badge
- "No card data stored" statement
- Dispute handling notice
- Contact support before disputing message

**Update:** `src/components/checkout/TravelInsuranceSelector.tsx`
- Add verification notice: "To protect users, some transactions may require verification."

### Phase 4: How ZIVO Makes Money Page

Create dedicated transparency page explaining the business model.

**New Page:** `src/pages/HowZivoMakesMoney.tsx`

Route: `/how-zivo-makes-money` or `/transparency`

Content:
- Hero: "Transparency Matters to Us"
- Revenue Sources:
  - Flight bookings (commissions from partners)
  - Hotel bookings (MoR margin)
  - Car rentals (MoR margin)
  - Insurance/add-ons (partner commissions)
- "Your Price = Partner Price" statement
- "No hidden fees" commitment
- FAQ section
- Link to affiliate disclosure

### Phase 5: Press & Business Contact Pages

Create dedicated pages for press inquiries and business partnerships.

**New Page:** `src/pages/Press.tsx`

Route: `/press`

Content:
- Hero: "Press & Media Inquiries"
- Press kit download (placeholder)
- Media contact: press@hizivo.com
- Company facts/stats (placeholder)
- Recent coverage (placeholder)
- Brand guidelines link (placeholder)

**Update:** `src/pages/Contact.tsx`

Add additional contact categories:
- press@hizivo.com (Media inquiries)
- partners@hizivo.com (Business partnerships)
- business@hizivo.com (Corporate accounts)

### Phase 6: Global Currency Selector

Add header-level currency selector with auto-detection.

**New Component:** `src/components/shared/CurrencySelector.tsx`

Features:
- Dropdown with USD / EUR / GBP / JPY + more
- Persist selection to localStorage
- Update all displayed prices

**New Hook:** `src/hooks/useGlobalCurrency.ts`

Features:
- Get/set global currency preference
- Auto-detect from browser locale
- Provide formatting utilities

**Integration:**
- Add to `Header.tsx` near user menu
- Use in all price display components

### Phase 7: Launch Mode Banner

Create user-facing launch mode indicators.

**New Component:** `src/components/shared/LaunchModeBanner.tsx`

Variants:
- Soft launch: "We're in early access. Some features may be limited."
- Invite-only: "Currently invite-only. Request access below."
- Public launch: No banner (hidden)

**Integration:**
- Add below Header in main layout
- Controlled by admin launch settings

### Phase 8: Fraud & Duplicate Prevention UI

Add user-facing notices for fraud prevention and duplicate booking detection.

**New Component:** `src/components/checkout/DuplicateBookingWarning.tsx`

Shows when:
- Same route + dates within 24 hours
- Same hotel + dates within 24 hours

Content:
```text
"It looks like you may have already booked this trip. Please check your bookings before proceeding."
[View My Bookings] [Continue Anyway]
```

**New Component:** `src/components/checkout/VerificationNotice.tsx`

Shows for high-risk transactions:
```text
"To protect your payment, we may request additional verification."
```

### Phase 9: Footer Hardening

Enhance footer with complete legal notices and service separation.

**Update:** `src/components/Footer.tsx`

Ensure includes:
- Seller of Travel notice with registration numbers
- Sub-agent disclosure for flights
- Mobility services separation notice (already exists)
- Security notice (already exists)
- Add: "Payment disputes - contact support before disputing"

### Phase 10: Status Page Enhancements

Enhance public status page with partner uptime indicators.

**Update:** `src/pages/Status.tsx`

Add:
- Partner availability section (Duffel, Hotelbeds, etc.)
- Uptime percentage display
- Historical uptime chart (placeholder)
- Notice: "We monitor partner availability to ensure reliable bookings."

---

## File Changes Summary

### New Files to Create

| File | Description |
|------|-------------|
| `src/pages/BookingManagement.tsx` | User booking management page |
| `src/pages/HowZivoMakesMoney.tsx` | Revenue transparency page |
| `src/pages/Press.tsx` | Press/media contact page |
| `src/components/shared/BookingRulesPreview.tsx` | Fare rules preview |
| `src/components/checkout/PaymentSafetyNotice.tsx` | PCI/chargeback notice |
| `src/components/checkout/DuplicateBookingWarning.tsx` | Duplicate detection |
| `src/components/checkout/VerificationNotice.tsx` | High-risk verification |
| `src/components/shared/CurrencySelector.tsx` | Global currency toggle |
| `src/components/shared/LaunchModeBanner.tsx` | Launch mode indicator |
| `src/hooks/useGlobalCurrency.ts` | Currency preference hook |

### Files to Update

| File | Changes |
|------|---------|
| `src/pages/FlightCheckout.tsx` | Add payment safety, verification notices |
| `src/pages/FlightConfirmation.tsx` | Link to booking management |
| `src/components/results/FlightResultCard.tsx` | Add booking rules preview |
| `src/components/Footer.tsx` | Add chargeback prevention copy |
| `src/pages/Contact.tsx` | Add press/partners/business emails |
| `src/pages/Status.tsx` | Add partner uptime section |
| `src/components/Header.tsx` | Add currency selector |
| `src/App.tsx` | Add new routes |

---

## Detailed Component Specifications

### BookingManagement.tsx Structure

```text
+--------------------------------------------------+
| BOOKING MANAGEMENT                                |
+--------------------------------------------------+
| Booking Reference: ABC123         Status: ISSUED  |
+--------------------------------------------------+
| FLIGHT DETAILS                                    |
| NYC → LAX | Feb 10, 2024 | 2 Adults              |
| Delta DL1234 | Economy | Direct                   |
+--------------------------------------------------+
| BOOKING RULES                          [Expand ▼] |
| • Change Policy: $75 fee, 24h before              |
| • Cancel Policy: Refundable with $50 fee          |
| • Baggage: 1 carry-on included                    |
+--------------------------------------------------+
| PROVIDER CONTACT                                  |
| Airline: Delta Air Lines                          |
| Phone: 1-800-XXX-XXXX | Email: support@delta.com  |
+--------------------------------------------------+
| ACTIONS                                           |
| [📄 Download E-Ticket]  [📞 Request Support]      |
+--------------------------------------------------+
| Important: For changes or refunds, contact the    |
| airline directly using the details above.         |
+--------------------------------------------------+
```

### CurrencySelector.tsx Structure

```text
+------------------+
| $ USD       [▼]  |
+------------------+
| $ USD (US Dollar)|
| € EUR (Euro)     |
| £ GBP (Pound)    |
| ¥ JPY (Yen)      |
| ─────────────────|
| Auto-detect      |
+------------------+
```

### PaymentSafetyNotice.tsx Content

```text
+--------------------------------------------------+
| 🔒 SECURE PAYMENT                                 |
+--------------------------------------------------+
| ✓ PCI-DSS compliant payment processing           |
| ✓ Card data encrypted, not stored by ZIVO        |
| ✓ Protected by industry-standard security        |
+--------------------------------------------------+
| In case of disputes, contact ZIVO support before |
| disputing with your bank. We're here to help.    |
+--------------------------------------------------+
```

---

## Routes to Add

| Route | Component | Description |
|-------|-----------|-------------|
| `/bookings/:bookingId` | BookingManagement | User booking management |
| `/how-zivo-makes-money` | HowZivoMakesMoney | Revenue transparency |
| `/transparency` | HowZivoMakesMoney | Alias route |
| `/press` | Press | Media contact page |
| `/media` | Press | Alias route |

---

## Technical Considerations

### Currency Auto-Detection
- Use browser `navigator.language` for initial locale
- Fall back to USD for unsupported locales
- Store preference in localStorage with key `zivo_currency`
- Sync with user preferences if logged in

### Duplicate Booking Detection
- Check session storage for recent bookings
- Compare route + dates within 24-hour window
- Allow user to bypass with confirmation

### Launch Mode Control
- Read from existing `useProductionLaunch` hook
- Map phases to banner visibility:
  - `pre_launch`: Show invite-only
  - `soft_launch`: Show early access
  - `full_launch`: Hide banner

### Chargeback Prevention
- Keep prominent support contact on all confirmation pages
- Add "Contact us before disputing" to checkout and confirmation
- Log all user actions for evidence trail (existing infrastructure)

---

## Compliance Checklist

After implementation:
- Booking rules visible before purchase
- Clear refund/change policy per service
- PCI compliance notice on checkout
- Chargeback prevention messaging
- Partner support routing clear
- Currency preference persisted
- Launch mode communicated to users
- Press/business contacts available
- Duplicate booking prevention active

---

## Success Metrics

After implementation:
- Chargeback rate target: < 0.1%
- Support ticket clarity: Fewer "who do I contact?" tickets
- User trust: Clear payment safety messaging
- Partner compliance: All required disclosures visible
- Launch readiness: All checklist items complete
