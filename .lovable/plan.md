
# Fraud Protection Messaging — Implementation Plan

## Overview
Add high-risk order verification requirements at checkout and display the message: **"For security reasons, this order requires verification."** when risk scoring triggers phone or payment verification.

---

## Current State Analysis

### Existing Risk Assessment System
| Component | Location | Purpose |
|-----------|----------|---------|
| `useRiskAssessment` hook | `src/hooks/useRiskAssessment.ts` | Client-side risk scoring (0-100) |
| `RISK_THRESHOLDS` | `src/config/fraudPrevention.ts` | Thresholds: LOW=30, MEDIUM=60, HIGH=80 |
| `getRiskDecision()` | `src/config/fraudPrevention.ts` | Returns: approve / review / decline / 3ds_required |

### Existing Verification Infrastructure
| Component | Location | Purpose |
|-----------|----------|---------|
| `PhoneVerificationDialog` | `src/components/account/PhoneVerificationDialog.tsx` | OTP modal for phone verification |
| `send-otp-sms` | `supabase/functions/send-otp-sms/` | Sends 6-digit SMS code via Twilio |
| `verify-otp-sms` | `supabase/functions/verify-otp-sms/` | Verifies SMS OTP code |
| `FraudPreventionNotice` | `src/components/checkout/FraudPreventionNotice.tsx` | Displays fraud notices (checkout, review, declined, 3ds) |

### Current Checkout Flow (EatsCheckout.tsx)
```text
Form Validation → Submit Order → Redirect to Order Detail
                  (No risk check currently)
```

---

## Implementation Plan

### 1) Create HighRiskVerificationGate Component

**File to Create:** `src/components/checkout/HighRiskVerificationGate.tsx`

**Purpose:** Gating component that blocks checkout until verification is completed for high-risk orders.

**UI Design:**
```text
+------------------------------------------------------------------+
| [🛡️]  For security reasons, this order requires verification.   |
|                                                                  |
|  We detected unusual activity. Please verify to continue.        |
|                                                                  |
|  [ ] Phone Verification        [ Verify Phone ]                  |
|      ✓ Verified                                                  |
|                                                                  |
|  [Continue to Checkout]  (enabled when verified)                 |
+------------------------------------------------------------------+
```

**Props:**
```typescript
interface HighRiskVerificationGateProps {
  riskScore: number;
  phoneNumber?: string;
  phoneVerified?: boolean;
  onVerificationComplete: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}
```

**States:**
- Shows when `riskScore >= RISK_THRESHOLDS.MEDIUM_RISK` (60)
- Requires phone verification if `riskScore >= 60` and phone not verified
- Allows proceeding once verified

### 2) Create useCheckoutRiskAssessment Hook

**File to Create:** `src/hooks/useCheckoutRiskAssessment.ts`

**Purpose:** Specialized hook for checkout risk assessment that combines order data with user signals.

```typescript
interface CheckoutRiskResult {
  score: number;
  decision: 'approve' | 'review' | 'decline' | '3ds_required';
  requiresPhoneVerification: boolean;
  requiresPaymentVerification: boolean;
  blockers: string[];
  canProceed: boolean;
}

function useCheckoutRiskAssessment(options: {
  orderTotal: number;
  isFirstOrder: boolean;
  phoneVerified: boolean;
}): CheckoutRiskResult;
```

**Risk Logic:**
```text
Order Data
    ↓
Calculate base risk from useRiskAssessment()
    ↓
Add checkout-specific signals:
  - High value + first order: +20 points
  - Phone not verified: +15 points
  - New account: +10 points
    ↓
If score >= 60 (MEDIUM_RISK):
  → requiresPhoneVerification = !phoneVerified
    ↓
If score >= 80 (HIGH_RISK):
  → decision = 'decline' (block order)
    ↓
canProceed = (score < 60) OR (score >= 60 AND verified)
```

### 3) Update FRAUD_PREVENTION_COPY in Config

**File to Modify:** `src/config/fraudPrevention.ts`

**Add new copy:**
```typescript
export const FRAUD_PREVENTION_COPY = {
  // ... existing copy
  
  /** High risk verification required */
  highRiskVerification: "For security reasons, this order requires verification.",
  
  /** Phone verification prompt */
  phoneVerificationRequired: "Please verify your phone number to continue with this order.",
  
  /** Verification complete */
  verificationComplete: "Verification successful. You can now proceed with your order.",
} as const;
```

### 4) Create SecurityVerificationBanner Component

**File to Create:** `src/components/checkout/SecurityVerificationBanner.tsx`

**Purpose:** Prominent banner with the exact customer message.

**UI Design:**
```text
+------------------------------------------------------------------+
| [🛡️]  For security reasons, this order requires verification.   |
|                                                                  |
|       This helps protect your account and ensure a secure        |
|       transaction. Verification typically takes less than        |
|       a minute.                                                  |
+------------------------------------------------------------------+
```

**Props:**
```typescript
interface SecurityVerificationBannerProps {
  onVerify: () => void;
  isVerifying?: boolean;
  className?: string;
}
```

### 5) Update EatsCheckout Page

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
1. Import `useCheckoutRiskAssessment`, `HighRiskVerificationGate`, `SecurityVerificationBanner`
2. Add risk assessment before order submission
3. Show verification gate for high-risk orders
4. Block submit button until verification complete

**Integration Flow:**
```text
Page Load
    ↓
useCheckoutRiskAssessment({
  orderTotal: total,
  isFirstOrder: user.booking_count === 0,
  phoneVerified: user.phone_verified,
})
    ↓
If requiresPhoneVerification:
  → Show SecurityVerificationBanner
  → Open PhoneVerificationDialog on click
  → Block form submission until verified
    ↓
If canProceed:
  → Enable "Place Order" button
```

**Code Structure:**
```typescript
// Before form
{riskAssessment.requiresPhoneVerification && (
  <SecurityVerificationBanner
    onVerify={() => setShowPhoneVerification(true)}
    isVerifying={isVerifyingPhone}
  />
)}

// Phone verification dialog
<PhoneVerificationDialog
  open={showPhoneVerification}
  onOpenChange={setShowPhoneVerification}
  phoneNumber={formData.customer_phone}
  onVerified={handlePhoneVerified}
/>

// Submit button
<Button
  disabled={!riskAssessment.canProceed || isSubmitting}
>
  {riskAssessment.requiresPhoneVerification && !phoneVerified
    ? "Verify to Continue"
    : "Place Order Request"
  }
</Button>
```

### 6) Update FraudPreventionNotice Component

**File to Modify:** `src/components/checkout/FraudPreventionNotice.tsx`

**Add new variant:**
```typescript
case "verification_required":
  return {
    icon: Shield,
    title: "Verification Required",
    message: FRAUD_PREVENTION_COPY.highRiskVerification,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
  };
```

---

## File Summary

### New Files (3)
| File | Purpose |
|------|---------|
| `src/components/checkout/HighRiskVerificationGate.tsx` | Gating component for high-risk order verification |
| `src/components/checkout/SecurityVerificationBanner.tsx` | Banner with "For security reasons..." message |
| `src/hooks/useCheckoutRiskAssessment.ts` | Specialized checkout risk assessment hook |

### Modified Files (3)
| File | Changes |
|------|---------|
| `src/config/fraudPrevention.ts` | Add `highRiskVerification` and related copy |
| `src/components/checkout/FraudPreventionNotice.tsx` | Add `verification_required` variant |
| `src/pages/EatsCheckout.tsx` | Integrate risk assessment and verification gate |

---

## Risk Scoring for Checkout

| Condition | Points Added | Threshold Effect |
|-----------|--------------|------------------|
| High-value order (>$100) + first order | +20 | May trigger verification |
| Phone not verified | +15 | Common trigger |
| New account (<24h) | +10 | Minor signal |
| Failed payment attempts (3+) | +35 | Strong signal |
| Bot behavior detected | +50 | Auto-decline |

**Combined Example:**
- New account (10) + Phone not verified (15) + High-value first order (20) = 45 → Verification required
- Bot detected (50) + New account (10) = 60 → Review
- Failed payments (35) + Phone unverified (15) + High value (20) = 70 → Verification required

---

## Verification Flow Diagram

```text
User fills checkout form
         ↓
Risk assessment runs on form data
         ↓
Score < 60?
   ├── YES → "Place Order" enabled (normal flow)
   └── NO ↓
       Score >= 60?
          ├── Show SecurityVerificationBanner
          ├── "For security reasons, this order requires verification."
          └── Phone verified?
                 ├── YES → Enable checkout
                 └── NO → Block + Show "Verify Phone" button
                           ↓
                      PhoneVerificationDialog opens
                           ↓
                      User enters 6-digit SMS code
                           ↓
                      verify-otp-sms edge function
                           ↓
                      On success: canProceed = true
                           ↓
                      "Place Order" enabled
```

---

## Customer-Facing Message

The exact message as requested:
> **"For security reasons, this order requires verification."**

This message appears:
1. As a banner at the top of the checkout form
2. In the verification dialog header
3. As a tooltip on the disabled submit button

The message is:
- Non-alarming (doesn't suggest fraud suspicion)
- Action-oriented (implies a simple fix)
- Security-focused (builds trust)

---

## Summary

This implementation provides:

1. **Risk-based verification**: Orders scoring >= 60 require phone verification before checkout
2. **Clear messaging**: Shows "For security reasons, this order requires verification."
3. **Non-blocking UX**: Users can still see their order; just need to verify to proceed
4. **Leverages existing infrastructure**: Uses existing `PhoneVerificationDialog`, SMS OTP functions, and risk scoring
5. **Configurable thresholds**: Uses existing `RISK_THRESHOLDS` from fraud prevention config

The flow blocks high-risk orders until verification is complete, reducing fraud while maintaining a good user experience for legitimate customers.
