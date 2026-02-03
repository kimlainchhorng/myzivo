
# Customer-Facing Clarity & Legal Alignment for ZIVO Flights

## Summary

This plan implements final customer-facing messaging to clearly explain ZIVO's OTA role across all flight pages. Updates include header microcopy, enhanced checkout disclosures, improved confirmation messaging, My Trips support guidance, updated FAQ content, and standardized footer legal text.

---

## Current State Analysis

| Requirement | Status | Details |
|-------------|--------|---------|
| **Flights header microcopy** | ❌ Missing | No "You book on ZIVO..." subtitle on search pages |
| **Checkout confirmation clarity** | ⚠️ Partial | Consent exists but needs "I understand ZIVO sells flights as sub-agent" |
| **Booking confirmation messaging** | ⚠️ Partial | Shows status but needs explicit "Booking confirmed" block |
| **My Trips support expectations** | ❌ Missing | No support guidance or email in trips dashboard |
| **FAQ content alignment** | ⚠️ Needs Update | Current FAQ has some affiliate-era language |
| **Footer legal consistency** | ✅ Good | Footer already has correct OTA text |

---

## Implementation Plan

### Phase 1: Add Flights Header Microcopy

**Goal:** Display "You book and pay on ZIVO. Tickets are issued by licensed airline ticketing partners." on all flight pages.

**File:** `src/config/flightCompliance.ts` (MODIFY)

Add new microcopy constant:
```typescript
export const FLIGHT_HEADER_MICROCOPY = {
  /** Standard header subtitle for all flight pages */
  standard: "You book and pay on ZIVO. Tickets are issued by licensed airline ticketing partners.",
  
  /** Shorter version for mobile */
  short: "Book on ZIVO · Licensed ticketing partners",
} as const;
```

**File:** `src/components/flight/FlightSearchHero.tsx` (MODIFY)

Add microcopy below the page title in the hero section:
```typescript
import { FLIGHT_HEADER_MICROCOPY } from "@/config/flightCompliance";

// Below the "Search Flights" title:
<p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
  {FLIGHT_HEADER_MICROCOPY.standard}
</p>
```

**File:** `src/pages/FlightResults.tsx` (MODIFY)

Add microcopy in the sticky search summary area. Update the StickySearchSummary component or add a subtitle below the route display:
```typescript
// After the route title, add:
<p className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
  {FLIGHT_HEADER_MICROCOPY.short}
</p>
```

**File:** `src/pages/FlightCheckout.tsx` (MODIFY)

Add microcopy in the checkout header section:
```typescript
// Below the "Checkout" or page title:
<p className="text-sm text-muted-foreground text-center mt-1">
  {FLIGHT_HEADER_MICROCOPY.standard}
</p>
```

---

### Phase 2: Enhanced Checkout Confirmation Clarity

**Goal:** Add pre-payment messaging and update consent checkbox.

**File:** `src/config/flightMoRCompliance.ts` (MODIFY)

Add new checkout clarity text:
```typescript
export const FLIGHT_CHECKOUT_CLARITY = {
  /** Pre-payment message - above Pay button */
  prePayment: "Your payment will be processed securely by ZIVO. After payment, your airline ticket will be issued instantly.",
  
  /** Updated consent checkbox */
  consent: "I understand ZIVO sells flights as a sub-agent and airline rules apply.",
  
  /** Full consent with links */
  consentFull: "I understand ZIVO sells flights as a sub-agent of licensed ticketing providers and that airline fare rules, conditions of carriage, and ZIVO's Terms of Service apply to this booking.",
} as const;
```

**File:** `src/pages/FlightCheckout.tsx` (MODIFY)

Update the checkout page with:
1. Pre-payment clarity message above the Pay button
2. Updated consent checkbox text

```typescript
// Above the Pay button in the sidebar:
<div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
  <p className="text-sm text-center text-muted-foreground">
    {FLIGHT_CHECKOUT_CLARITY.prePayment}
  </p>
</div>

// Update the checkbox label:
<label htmlFor="terms">
  {FLIGHT_CHECKOUT_CLARITY.consent} *
</label>
```

---

### Phase 3: Improve Booking Confirmation Page

**Goal:** Add explicit confirmation block with all key details.

**File:** `src/pages/FlightConfirmation.tsx` (MODIFY)

Add a prominent confirmation block when ticket is issued:
```typescript
// Replace/enhance the success header section:
{isIssued && (
  <Card className="mb-6 border-emerald-500/30 bg-emerald-500/5">
    <CardContent className="p-6 text-center">
      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
      <h2 className="text-xl font-bold mb-2">Booking Confirmed ✅</h2>
      <p className="text-muted-foreground mb-4">
        Your ticket has been issued. Your e-ticket and itinerary have been sent to your email.
      </p>
      
      {/* Key details grid */}
      <div className="grid grid-cols-3 gap-4 mt-4 text-left max-w-md mx-auto">
        <div>
          <p className="text-xs text-muted-foreground">Airline</p>
          <p className="font-medium">{offerDetails?.airline || booking.airline}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <p className="font-mono font-bold">{booking.pnr || booking.booking_reference}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ticket Number</p>
          <p className="font-mono text-sm">
            {booking.ticket_numbers?.[0] || 'Pending'}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

### Phase 4: My Trips Support Expectations

**Goal:** Add support info box in the flights trips dashboard.

**File:** `src/config/flightCompliance.ts` (MODIFY)

Add support expectation text:
```typescript
export const FLIGHT_SUPPORT_INFO = {
  /** My Trips support box title */
  title: "Need to change or cancel your flight?",
  
  /** Description */
  description: "Requests are handled by ZIVO according to airline fare rules.",
  
  /** Support email */
  email: "support@hizivo.com",
  
  /** Full message */
  full: "Need to change or cancel your flight? Requests are handled by ZIVO according to airline fare rules. Contact support@hizivo.com for assistance.",
} as const;
```

**File:** `src/components/flight/MyTripsDashboard.tsx` (MODIFY)

Add a support info card at the top of the trips list:
```typescript
import { FLIGHT_SUPPORT_INFO } from "@/config/flightCompliance";
import { HelpCircle, Mail } from "lucide-react";

// Add inside the component, before the trips list:
<Card className="mb-4 border-primary/20 bg-primary/5">
  <CardContent className="p-4 flex items-start gap-3">
    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-medium text-sm">{FLIGHT_SUPPORT_INFO.title}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {FLIGHT_SUPPORT_INFO.description}
      </p>
    </div>
    <a 
      href={`mailto:${FLIGHT_SUPPORT_INFO.email}`}
      className="text-xs text-primary hover:underline flex items-center gap-1"
    >
      <Mail className="w-3 h-3" />
      {FLIGHT_SUPPORT_INFO.email}
    </a>
  </CardContent>
</Card>
```

---

### Phase 5: Update Flight FAQ Content

**Goal:** Align FAQ answers with OTA model.

**File:** `src/components/flight/FlightFAQSection.tsx` (MODIFY)

Replace the FAQ content with accurate OTA messaging:
```typescript
const faqs = [
  {
    question: "Do I book on ZIVO or another site?",
    answer: "You book and pay directly on ZIVO. Your entire booking is processed securely on our platform."
  },
  {
    question: "Who issues my ticket?",
    answer: "Tickets are issued by licensed airline ticketing partners under airline rules. ZIVO operates as a sub-agent of these licensed providers."
  },
  {
    question: "Are prices final?",
    answer: "Yes. Prices shown are final before payment. All taxes and fees are included. There are no hidden charges."
  },
  {
    question: "Who do I contact for support?",
    answer: "Contact ZIVO support at support@hizivo.com for booking changes, cancellations, or any questions. We handle all support requests according to airline fare rules."
  },
  {
    question: "How do I get my e-ticket?",
    answer: "After payment, your e-ticket is issued instantly and sent to the email address provided for each passenger. You'll typically receive it within minutes."
  },
  {
    question: "Can I change or cancel my booking?",
    answer: "Changes and cancellations are subject to airline fare rules. Contact ZIVO support to request modifications. Fees may apply based on the airline's policy."
  },
];
```

---

### Phase 6: Verify Footer Legal Consistency

**Goal:** Ensure footer matches the required legal text exactly.

**Current footer text (src/components/Footer.tsx lines 279-280):**
```
ZIVO sells air travel as a sub-agent of licensed ticketing providers. 
Airline tickets are issued by authorized partners and subject to airline rules.
```

**Required text:**
```
ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.
Tickets are issued by authorized partners under airline rules.
```

**File:** `src/components/Footer.tsx` (MODIFY)

Update lines 279-280 to match the required text exactly:
```typescript
<p className="text-xs text-muted-foreground max-w-2xl mx-auto">
  ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. 
  Tickets are issued by authorized partners under airline rules.
</p>
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/config/flightCompliance.ts` | MODIFY | Add header microcopy and support info constants |
| `src/config/flightMoRCompliance.ts` | MODIFY | Add checkout clarity text |
| `src/components/flight/FlightSearchHero.tsx` | MODIFY | Add microcopy below title |
| `src/pages/FlightResults.tsx` | MODIFY | Add microcopy in sticky header |
| `src/pages/FlightCheckout.tsx` | MODIFY | Add pre-payment message and update consent |
| `src/pages/FlightConfirmation.tsx` | MODIFY | Enhance confirmation block with key details |
| `src/components/flight/MyTripsDashboard.tsx` | MODIFY | Add support info card |
| `src/components/flight/FlightFAQSection.tsx` | MODIFY | Update FAQ content for OTA model |
| `src/components/Footer.tsx` | MODIFY | Minor text adjustment for consistency |

---

## Key Messaging Reference

### Header Microcopy (All Flight Pages)
> "You book and pay on ZIVO. Tickets are issued by licensed airline ticketing partners."

### Pre-Payment Message (Checkout)
> "Your payment will be processed securely by ZIVO. After payment, your airline ticket will be issued instantly."

### Consent Checkbox (Checkout)
> "I understand ZIVO sells flights as a sub-agent and airline rules apply."

### Confirmation Block (Post-Booking)
> "Booking confirmed ✅ Your ticket has been issued. Your e-ticket and itinerary have been sent to your email."

### My Trips Support Box
> "Need to change or cancel your flight? Requests are handled by ZIVO according to airline fare rules."

### Footer Legal Text
> "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under airline rules."

---

## FAQ Content Summary

| Question | Answer |
|----------|--------|
| Do I book on ZIVO or another site? | You book and pay directly on ZIVO. |
| Who issues my ticket? | Tickets are issued by licensed airline ticketing partners under airline rules. |
| Are prices final? | Yes. Prices shown are final before payment. |
| Who do I contact for support? | ZIVO support at support@hizivo.com |
| How do I get my e-ticket? | Issued instantly after payment, sent via email. |
| Can I change or cancel my booking? | Subject to airline fare rules. Contact ZIVO support. |

---

## Benefits

1. **Customer Clarity** - Users understand exactly who they're booking with
2. **Legal Protection** - Clear sub-agent disclosure reduces chargeback risk
3. **Trust Building** - Consistent messaging across all touchpoints
4. **Support Efficiency** - Clear support expectations reduce confusion
5. **Compliance** - Aligned with seller-of-travel disclosure requirements
