
# ZIVO Flights Final Content Update - OTA Language Cleanup

## Summary

Remove all remaining affiliate wording from Flights pages and update to OTA language. This covers How Booking Works sections, Trust Badges, FAQ content, Footer text, and ensures "compare" is not used for Flights.

---

## Components Requiring Updates

### 1. HowBookingWorks.tsx - Update Step Text

**File:** `src/components/flight/HowBookingWorks.tsx`

| Step | Current | New |
|------|---------|-----|
| 1 Title | "Search & compare flights" | "Search flights" |
| 1 Description | "Compare options from 500+ airlines" | "Browse real-time flight options from global airlines." |
| 2 Title | "Choose the best option" | "Select your flight" |
| 2 Description | "Select the best deal for your travel needs" | "View final prices, baggage, and fare rules before booking." |
| 3 Title | "Book directly on ZIVO" | Keep as-is |
| 3 Description | "Pay securely and receive your e-ticket instantly" | Keep as-is (already correct) |

---

### 2. HowItWorksSimple.tsx - Update for OTA Model

**File:** `src/components/home/HowItWorksSimple.tsx`

| Step | Current | New |
|------|---------|-----|
| 1 | "Search & compare prices" | "Search flights" |
| 1 Description | "Enter your travel details and compare options from 500+ airlines" | "Browse real-time flight options from global airlines." |
| 2 | "Choose the best option" | "Select your flight" |
| 2 Description | "Review prices, times, baggage..." | "View final prices, baggage, and fare rules before booking." |
| 3 | "Complete booking securely" | "Book on ZIVO" |
| 3 Description | "Book securely with our licensed travel partners" | "Pay securely on ZIVO and receive your e-ticket instantly." |

Also update reassurance text:
- Current: "We connect you to licensed partners for secure checkout"
- New: "Tickets issued by licensed airline ticketing providers."

---

### 3. TopTierHero.tsx - Update Flights Headline

**File:** `src/components/shared/TopTierHero.tsx`

| Current | New |
|---------|-----|
| `headline: "Search & Compare Flights Worldwide"` | `headline: "Search Flights Worldwide"` |
| `subheadline: "Compare 500+ airlines..."` | `subheadline: "Real-time prices from global airlines. Secure ZIVO checkout."` |

---

### 4. FlightFAQSection.tsx - Rewrite All Answers

**File:** `src/components/flight/FlightFAQSection.tsx`

**Q1: "How does ZIVO find cheap flights?" → "How does ZIVO find flight prices?"**
- Current: "ZIVO searches across 500+ airlines and travel sites in real-time to compare prices..."
- New: "ZIVO connects directly to airline ticketing systems to display real-time availability and final prices."

**Q2: "Does ZIVO sell tickets directly?"**
- Current: "No, ZIVO is a flight comparison platform. We help you find and compare the best prices, then redirect you..."
- New: "Yes. You book and pay directly on ZIVO. Tickets are issued by licensed ticketing partners under airline rules."

**Q3: "Are there hidden fees?"**
- Current: "We display all-in prices including taxes and basic fees. However, airlines may charge extra..."
- New: "No. Prices shown on ZIVO are final and confirmed before payment. Airline extras (bags, seats) are shown separately."

---

### 5. FlightFAQWithSchema.tsx - Rewrite for OTA

**File:** `src/components/seo/FlightFAQWithSchema.tsx`

Same updates as FlightFAQSection but this one affects SEO schema:

| Question | New Answer |
|----------|------------|
| How does ZIVO find cheap flights? → How does ZIVO find flight prices? | "ZIVO connects directly to airline ticketing systems to display real-time availability and final prices." |
| Does ZIVO sell tickets directly? | "Yes. You book and pay directly on ZIVO. Tickets are issued by licensed ticketing partners under airline rules." |
| Are there hidden fees? | "No. Prices shown on ZIVO are final and confirmed before payment." |
| Can I trust the prices shown? | "Yes. Prices shown on ZIVO are final and confirmed before payment." |

Remove references to "indicative prices", "partner's booking page", "redirect".

---

### 6. ResultsFAQ.tsx - Update Flights FAQ Section

**File:** `src/components/results/ResultsFAQ.tsx`

Update the `flights` section in `faqContent`:

| Question | Current Answer | New Answer |
|----------|----------------|------------|
| How does ZIVO find flight prices? | "ZIVO searches across multiple trusted airline partners and travel agencies..." | "ZIVO connects directly to airline ticketing systems to display real-time availability and final prices." |
| Are prices final? | "Prices shown are indicative and may change. The final price will be confirmed when you complete your booking on our partner's website." | "Yes. Prices shown on ZIVO are final and confirmed before payment." |
| Do I book on ZIVO or another site? | "ZIVO is a search and comparison platform. When you click 'View Deal,' you'll be redirected to our partner's website..." | "You book and pay directly on ZIVO. Tickets are issued by licensed ticketing partners under airline rules." |
| Is my payment secure? | "All payments are processed securely on our partner's websites. ZIVO never handles your payment information." | "All payments are processed securely on ZIVO using bank-grade encryption. Your payment data is protected." |

---

### 7. Footer.tsx - Update Description & Remove Affiliate Link

**File:** `src/components/Footer.tsx`

**Update brand description (line 125-127):**
- Current: "Search & compare flights, hotels, and car rentals from trusted partners."
- New: "Book flights, hotels, and car rentals directly on ZIVO with secure checkout and licensed fulfillment."

**Remove Affiliate Disclosure link from legal (line 48):**
```tsx
// REMOVE this line:
{ name: "Affiliate Disclosure", href: "/affiliate-disclosure" },
```

Keep Partner Disclosure (that's correct for partner ticketing disclosure).

---

### 8. TrustBadges & Trust Components - Update Text

**Files to update:**

| File | Current | New |
|------|---------|-----|
| `TrustBadges.tsx` | "Trusted Partners" | "Secure ZIVO Checkout" |
| `TrustCredibilityBar.tsx` | "Trusted Partners" | "Licensed Fulfillment" |
| `TrustSection.tsx` | "Trusted Partners" | "Licensed Ticketing Partners" |

---

### 9. SEOContentBlock.tsx - Update Flights Content

**File:** `src/components/seo/SEOContentBlock.tsx`

Update flights content block:
- Current h1: "Search & Compare Flights Worldwide"
- New h1: "Search Flights Worldwide"

- Current intro: "Compare flight prices from 500+ airlines and travel sites..."
- New intro: "Search real-time flight prices from global airlines. Book securely on ZIVO with instant e-tickets."

- Remove: "When you find a flight you like, you'll be redirected to our partner's website..."

---

### 10. adsCompliance.ts - Update Flight Config

**File:** `src/config/adsCompliance.ts`

| Current | New |
|---------|-----|
| `headline: 'Search & Compare Flights'` | `headline: 'Search Flights'` |
| `disclaimer: 'Hizivo does not issue airline tickets...'` | `disclaimer: 'ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.'` |

---

### 11. DestinationHero.tsx - Update Badge

**File:** `src/components/seo/DestinationHero.tsx`

| Current | New |
|---------|-----|
| `badge: "Search & Compare Flights"` | `badge: "Search Flights"` |

---

### 12. Landing Pages - Update Headlines

**Files:**
- `src/pages/FlightLanding.tsx`
- `src/pages/FlightSearch.tsx`
- `src/pages/creators/FlightsCreatorLanding.tsx`
- `src/pages/lp/FlightsLP.tsx`
- `src/pages/ads/FlightsAdLanding.tsx`

**Pattern to replace:**
- "Search & Compare Flights" → "Search Flights"
- "Compare flight prices from trusted partners" → "Search real-time flight prices"

---

### 13. LaunchAnnouncements.tsx - Update Social Copy

**File:** `src/components/home/LaunchAnnouncements.tsx`

| Current | New |
|---------|-----|
| "Search & compare flights, hotels, and car rentals..." | "Book flights, hotels, and car rentals directly on ZIVO..." |
| "Booking completed on partner sites." | "Secure checkout. Instant e-tickets." |

---

## File Changes Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/flight/HowBookingWorks.tsx` | MODIFY | Update step titles and descriptions |
| `src/components/home/HowItWorksSimple.tsx` | MODIFY | Remove "compare", update to OTA flow |
| `src/components/shared/TopTierHero.tsx` | MODIFY | "Search Flights Worldwide" |
| `src/components/flight/FlightFAQSection.tsx` | MODIFY | Rewrite all FAQ answers for OTA |
| `src/components/seo/FlightFAQWithSchema.tsx` | MODIFY | Rewrite FAQs for SEO schema |
| `src/components/results/ResultsFAQ.tsx` | MODIFY | Update flights section answers |
| `src/components/Footer.tsx` | MODIFY | Update description, remove Affiliate Disclosure link |
| `src/components/shared/TrustBadges.tsx` | MODIFY | "Secure ZIVO Checkout" |
| `src/components/home/TrustCredibilityBar.tsx` | MODIFY | Update badge text |
| `src/components/shared/TrustSection.tsx` | MODIFY | Update partner text |
| `src/components/seo/SEOContentBlock.tsx` | MODIFY | Remove "compare", update flights content |
| `src/config/adsCompliance.ts` | MODIFY | Update headline and disclaimer |
| `src/components/seo/DestinationHero.tsx` | MODIFY | Update badge text |
| `src/pages/FlightLanding.tsx` | MODIFY | Update headline |
| `src/pages/FlightSearch.tsx` | MODIFY | Update SEO title |
| `src/pages/creators/FlightsCreatorLanding.tsx` | MODIFY | Update headline |
| `src/pages/lp/FlightsLP.tsx` | MODIFY | Update headline |
| `src/pages/ads/FlightsAdLanding.tsx` | MODIFY | Update headline |
| `src/components/home/LaunchAnnouncements.tsx` | MODIFY | Update social copy |
| `src/utils/seoUtils.ts` | MODIFY | Update flight SEO defaults |

---

## New Text Standards (Flights Only)

### Headlines
- ❌ "Search & Compare Flights" 
- ✅ "Search Flights"

### How It Works Steps
1. **Search flights** - "Browse real-time flight options from global airlines."
2. **Select your flight** - "View final prices, baggage, and fare rules before booking."
3. **Book on ZIVO** - "Pay securely on ZIVO and receive your e-ticket instantly."

### FAQ Answers
| Topic | OTA Answer |
|-------|------------|
| How ZIVO finds prices | "ZIVO connects directly to airline ticketing systems to display real-time availability and final prices." |
| Are prices final? | "Yes. Prices shown on ZIVO are final and confirmed before payment." |
| Where do I book? | "You book and pay directly on ZIVO. Tickets are issued by licensed ticketing partners under airline rules." |

### Trust Badges
- ✅ "Secure ZIVO Checkout"
- ✅ "Tickets issued by licensed airline ticketing providers."
- ❌ "Secure Partner Checkout"
- ❌ "Trusted Partners" (for flights context)

### Footer
- ✅ "Book flights, hotels, and car rentals directly on ZIVO with secure checkout and licensed fulfillment."
- ❌ "Search & compare flights, hotels, and car rentals from trusted partners."

---

## Words to Remove from Flights Pages

| Forbidden | Replacement |
|-----------|-------------|
| "compare" | "search" or remove |
| "partner checkout" | "ZIVO checkout" |
| "partner site" | Remove or "ZIVO" |
| "indicative prices" | "final prices" |
| "redirected to" | Remove |
| "affiliate" | Remove from flights context |

---

## Verification Checklist

After implementation, confirm:
1. ✅ "compare" does NOT appear on any Flights page
2. ✅ No "partner checkout" or "partner site" for flights
3. ✅ All FAQ answers reflect OTA model
4. ✅ Footer says "Book...directly on ZIVO"
5. ✅ Affiliate Disclosure link removed from footer
6. ✅ Trust badges say "Secure ZIVO Checkout"
7. ✅ How Booking Works uses new 3-step text
8. ✅ All SEO titles/descriptions updated
