

# Partner Disclosure (Travel Bookings) Page

## Overview
Create a new dedicated Partner Disclosure page at `/partner-disclosure` that explains the travel booking handoff relationship. This page will provide detailed transparency about how ZIVO works with third-party travel partners as the merchant of record for bookings.

---

## Page Structure

### Header Section
- Badge: "Travel Bookings"
- Headline: "Partner Disclosure"
- Subheadline: "How ZIVO works with travel partners"
- Last updated date

### Content Sections

**1. Introduction Card**
> ZIVO provides travel search and referral services that help you compare flight, hotel, and car rental options. When you choose an offer and continue to checkout, you will be redirected to (or complete checkout with) a third-party travel provider ("Travel Partner") that processes your payment, issues tickets or confirmations, and fulfills your reservation.

**2. Merchant of Record**
Icon-led card explaining:
- ZIVO is NOT the merchant of record
- Travel Partner handles: pricing, payment processing, booking fulfillment, customer service, changes/cancellations, ticket issuance

**3. Pricing & Availability**
> Prices and availability may change between the time you view results on ZIVO and the time you complete checkout with the Travel Partner. Final pricing and booking terms are shown on the Travel Partner's checkout page.

**4. Booking Terms**
> Your booking is subject to the Travel Partner's terms and conditions, privacy policy, and cancellation/refund rules. Please review these carefully during checkout.

**5. Information Sharing**
Important callout box:
> If you proceed to checkout, certain information you provide (such as traveler/guest details and contact information) may be shared with the Travel Partner to complete your booking. We will ask for your consent when required.

**6. Support**
Two-column layout:
- **Reservation Support**: Travel Partner contact (shown in confirmation email)
- **Website Issues**: support@hizivo.com

---

## Technical Details

### File to Create
`src/pages/legal/PartnerDisclosure.tsx`

### Routing
Add route in `App.tsx`:
```typescript
const PartnerDisclosure = lazy(() => import("./pages/legal/PartnerDisclosure"));
// ...
<Route path="/partner-disclosure" element={<PartnerDisclosure />} />
```

### Design Pattern
- Follow existing legal page structure (PrivacyPolicy.tsx, TermsOfService.tsx)
- Sticky header with back button
- Icon-led section cards
- Service-specific color accents (sky for flights, amber for hotels, primary for cars)
- Contact card at the bottom

### Components Used
- `Card`, `CardContent` from UI library
- Icons: `Plane`, `Hotel`, `Car`, `CreditCard`, `RefreshCw`, `Mail`, `Shield`, `ExternalLink`, `FileText`
- `Badge` for categorization
- Accordion for expandable sections (optional)

### Links to Update
The `/partner-disclosure` route is already referenced in:
- `TravelerInfoForm.tsx` (consent section)
- Footer and navigation menus (already have affiliate-disclosure links)

---

## Visual Design

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Back    [✈️] Partner Disclosure                          │
│           How ZIVO works with travel partners              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ZIVO provides travel search and referral...        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💳 Merchant of Record                                │   │
│  │ For travel bookings, ZIVO is NOT the merchant...    │   │
│  │                                                      │   │
│  │ ✓ Pricing & payment processing                      │   │
│  │ ✓ Booking fulfillment                               │   │
│  │ ✓ Customer service for reservations                 │   │
│  │ ✓ Changes & cancellations                           │   │
│  │ ✓ Ticket/confirmation issuance                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📊 Pricing & Availability                           │   │
│  │ Prices may change between ZIVO and partner...      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📄 Booking Terms                                     │   │
│  │ Subject to Travel Partner's terms and conditions... │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🔒 Information Sharing                    [Important] │ │
│  │ Traveler details may be shared with partners...      │ │
│  │ We will ask for your consent when required.          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📧 Need Help?                                        │   │
│  │                                                      │   │
│  │  Reservation Issues → Travel Partner support         │   │
│  │  Website Issues → support@hizivo.com                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/legal/PartnerDisclosure.tsx` | Create | New partner disclosure page with all content |
| `src/App.tsx` | Modify | Add route for `/partner-disclosure` |

