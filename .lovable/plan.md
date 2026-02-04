
# ZIVO Legal & Security Pages Enhancement

## Overview
This plan implements comprehensive updates to ZIVO's legal and security infrastructure, adding new pages and enhancing existing ones to strengthen compliance, liability protection, and user trust.

## Scope of Changes

### Page Updates Summary
| Page | Action | Route |
|------|--------|-------|
| Security Page | Update | `/security` |
| Incident Response | Update | `/legal/security-incident` |
| Privacy Policy | Add sections | `/privacy-policy` |
| Terms of Service | Add clauses | `/terms` |
| Refund Policy | Update | `/refunds` |
| Partner Disclosure | Update | `/partner-disclosure` |
| Seller of Travel | Update | `/legal/seller-of-travel` |
| Acceptable Use | Update | `/legal/acceptable-use` |
| Footer | Add security line | All pages |

---

## Detailed Changes

### 1. Security Page (`/security`)
**File:** `src/pages/Security.tsx`

Current content already covers encryption, PCI-DSS, monitoring, and disclosure. Updates needed:

**Add to `securityPractices` array:**
- Tokenized payment data explanation
- Role-based access control for internal systems
- Continuous monitoring for unauthorized access
- Regular vulnerability scans

**Add new "Account Protection" section card:**
- Secure authentication
- Session monitoring
- Suspicious activity detection
- Forced logout on detected risks

**Update hero description:**
Change to: "At ZIVO, protecting your data and transactions is a top priority. We use industry-leading security standards to safeguard personal information, payments, and bookings."

**Add trust statement:**
"ZIVO does not sell or misuse personal data."

---

### 2. Incident Response Page (`/legal/security-incident`)
**File:** `src/pages/legal/SecurityIncident.tsx`

Current page is well-structured. Updates needed:

**Add new commitment item:**
- "Coordinate with payment providers and partners"
- "Report incidents to authorities when applicable"

**Update contact email prominently:**
Display `security@hizivo.com` with clear CTA.

**Ensure title matches user requirement:**
Current: "Security Incident Response Policy"
Keep as is (already appropriate)

---

### 3. Privacy Policy (`/privacy-policy`)
**File:** `src/pages/legal/PrivacyPolicy.tsx`

**Add new accordion section: "Data Minimization"**
Content: "ZIVO collects only the information necessary to provide travel services and comply with legal obligations."

**Add new accordion section: "Third-Party Data Sharing"**
Content: "User data is shared only with licensed travel providers strictly for booking fulfillment."

**Add new accordion section: "User Rights" (enhance existing):**
- Access to their data
- Data correction
- Data deletion (subject to legal retention)
- Opt-out of marketing communications

---

### 4. Terms of Service (`/terms`)
**File:** `src/pages/Terms.tsx`

**Add new section: "Platform Role"**
"ZIVO acts as a travel booking platform and sub-agent. ZIVO does not operate airlines, hotels, or transportation services."

**Add section: "Limitation of Liability" (enhance existing):**
"ZIVO is not responsible for delays, cancellations, overbookings, or service failures caused by third-party providers."

**Add section: "Force Majeure":**
"ZIVO is not liable for disruptions caused by events beyond reasonable control, including natural disasters, strikes, system outages, or government actions."

**Add section: "Fraud Prevention":**
"ZIVO reserves the right to cancel bookings, suspend accounts, or refuse service in cases of suspected fraud or abuse."

---

### 5. Refund Policy (`/refunds`)
**File:** `src/pages/Refunds.tsx`

**Add clarity section:**
"Refund eligibility depends on the fare rules, hotel policy, or rental provider terms."

**Add key points:**
- "ZIVO processes refunds only when authorized by the supplier"
- "Service fees may be non-refundable"
- "ZIVO is not responsible for provider-imposed penalties"

Note: Current page is affiliate-focused. Since ZIVO is now MoR for hotels/cars, update language accordingly.

---

### 6. Partner Disclosure (`/partner-disclosure`)
**File:** `src/pages/legal/PartnerDisclosure.tsx`

**Add compliance statement:**
"ZIVO works exclusively with licensed travel providers, payment processors, and technology partners."

**Add fulfillment note:**
"All bookings are fulfilled by authorized suppliers under their own terms and conditions."

---

### 7. Seller of Travel Disclosure (`/legal/seller-of-travel`)
**File:** `src/pages/legal/SellerOfTravel.tsx`

Current page is well-structured with pending CA/FL registrations.

**Verify text matches user requirement:**
- "ZIVO LLC operates as a Seller of Travel where required by law"
- "Registrations: California SOT: pending, Florida SOT: pending"
- "Registration numbers will be displayed once issued"

Already implemented. Minor verification only.

---

### 8. Acceptable Use Policy (`/legal/acceptable-use`)
**File:** `src/pages/legal/AcceptableUsePolicy.tsx`

**Ensure prohibitions include:**
- Attempt to access systems without authorization
- Scrape or abuse APIs
- Perform fraudulent bookings
- Use automated bots

**Ensure enforcement section includes:**
"Violations may result in account suspension, booking cancellation, and legal action."

Current implementation uses config from `legalContent.ts`. May need to update config.

---

### 9. Footer Enhancement
**File:** `src/components/Footer.tsx`

**Add security trust line in bottom bar:**
"ZIVO uses enterprise-grade security standards to protect user data and transactions."

Add to the Seller of Travel disclosure section (line ~275-290).

---

## Config Updates

### Update `src/config/legalContent.ts`

**Ensure `EXTENDED_LEGAL_POLICIES.acceptableUse.prohibitions` includes:**
- Unauthorized system access attempts
- API scraping/abuse
- Fraudulent bookings
- Automated bot usage

**Update enforcement text:**
"Violations may result in account suspension, booking cancellation, and legal action."

---

## Implementation Sequence

1. **Config updates** - Update `legalContent.ts` with new legal text
2. **Security.tsx** - Add sections and update content
3. **SecurityIncident.tsx** - Add partner coordination language
4. **PrivacyPolicy.tsx** - Add Data Minimization and User Rights sections
5. **Terms.tsx** - Add Platform Role, Force Majeure, Fraud Prevention sections
6. **Refunds.tsx** - Add clarity around eligibility and fees
7. **PartnerDisclosure.tsx** - Add licensed provider compliance text
8. **AcceptableUsePolicy.tsx** - Verify prohibitions match requirements
9. **Footer.tsx** - Add enterprise security statement

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/config/legalContent.ts` | Update - add new legal clauses |
| `src/pages/Security.tsx` | Update - add sections |
| `src/pages/legal/SecurityIncident.tsx` | Update - add commitments |
| `src/pages/legal/PrivacyPolicy.tsx` | Update - add accordion sections |
| `src/pages/Terms.tsx` | Update - add legal clauses |
| `src/pages/Refunds.tsx` | Update - add clarity sections |
| `src/pages/legal/PartnerDisclosure.tsx` | Update - add compliance text |
| `src/pages/legal/AcceptableUsePolicy.tsx` | Verify/update prohibitions |
| `src/components/Footer.tsx` | Update - add security line |

---

## Security Considerations

- All legal text is hardcoded (not user-editable)
- Contact emails match official ZIVO contacts (security@hizivo.com)
- SOT registration status clearly marked as "pending"
- No sensitive data exposed in legal pages
- RLS not applicable (static content pages)

---

## Compliance Alignment

These updates align with:
- FTC disclosure requirements
- State Seller of Travel regulations (CA, FL)
- PCI-DSS payment security standards
- GDPR/CCPA data protection requirements
- Standard legal liability protection practices
