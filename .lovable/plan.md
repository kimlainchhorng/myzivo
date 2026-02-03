
# ZIVO Flights LIVE Operation Readiness

## Summary

This plan prepares ZIVO Flights for Duffel LIVE access and Seller of Travel compliance by:
1. Creating a dedicated Seller of Travel legal page
2. Enhancing checkout compliance with fare rules consent
3. Adding environment-aware guards (sandbox vs. live)
4. Strengthening passenger data validation for live booking
5. Implementing Stripe + Duffel failure safety with auto-refund
6. Creating an Admin Flights Status/Readiness panel

---

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Seller of Travel disclosure | Partial | Footer has SOT text, but no dedicated legal page |
| Checkout consent | Basic | Terms checkbox exists, but doesn't mention "fare rules" explicitly |
| Environment switching | Implemented | `DUFFEL_ENV` in edge function, `duffelConfig.ts` on frontend |
| Passenger validation | Basic | Required fields checked, but no strict format validation |
| Failure safety | Implemented | Auto-refund exists in `issue-flight-ticket/index.ts` |
| Admin status panel | Missing | FlightDebugPage exists but no "readiness" overview |

---

## Implementation Plan

### Phase 1: Seller of Travel Legal Page

**Goal:** Create `/legal/seller-of-travel` page with required disclosures.

**File:** `src/pages/legal/SellerOfTravel.tsx` (NEW)

Content sections:
- ZIVO business name and registered address
- Customer support contact (email)
- Registration status (California pending, Florida pending)
- Sub-agent disclosure statement
- Ticketing partner explanation
- Link to Flight Terms for detailed policies

This page will be professionally formatted with cards for each section and clear legal language.

**Also update:**
- `src/components/Footer.tsx` - Add "Seller of Travel" link in Legal section
- `src/pages/FlightCheckout.tsx` - Link to SOT page in footer trust badges
- `src/App.tsx` - Add route for `/legal/seller-of-travel`

---

### Phase 2: Checkout Compliance Enhancement

**Goal:** Strengthen the checkout consent to explicitly mention airline fare rules.

**File:** `src/pages/FlightCheckout.tsx`

Current checkbox text:
> "I agree to the Terms and Conditions and Airline Rules."

Enhanced checkbox:
> "I agree to the airline's fare rules and ZIVO's Terms & Conditions" with links to:
> - `/terms` (ZIVO Terms)
> - `/legal/flight-terms` (Flight Terms with fare rules)
> - Fare rules section of booking (if available from Duffel)

**Additional changes:**
- Show explicit fare conditions (refundable/non-refundable badge)
- Display tax breakdown more prominently
- Ensure button is disabled when checkbox unchecked (already implemented)

**File:** `src/config/flightMoRCompliance.ts`

Update consent text constant:
```typescript
termsCheckbox: "I agree to the airline's fare rules and ZIVO's Terms & Conditions"
```

---

### Phase 3: Environment Guard System

**Goal:** Conditionally show/hide features based on `DUFFEL_ENV` (sandbox vs. live).

**File:** `src/config/duffelConfig.ts` (MODIFY)

Add functions:
```typescript
export function isLiveMode(): boolean {
  const stored = sessionStorage.getItem('duffel_env');
  return stored === 'live';
}

export function shouldShowDebugUI(): boolean {
  // Only show debug UI in sandbox mode
  return isSandboxMode();
}

export function shouldEnforceStrictValidation(): boolean {
  // Enforce strict validation in live mode
  return isLiveMode();
}
```

**UI Changes:**

1. **Test Mode Badge** (Admin-only visibility)
   - Show small "Test Mode" badge in header for admins when `isSandboxMode()` is true
   - File: `src/components/Header.tsx` - Add conditional badge

2. **Sandbox Helpers**
   - `SandboxTestHelper.tsx` already checks `isSandboxMode()` - no change needed
   - `NoFlightsFound.tsx` already shows sandbox routes only in test mode

3. **Debug UI**
   - FlightDebugPage already shows "Sandbox Mode" badge
   - Add guard to hide certain debug features in live mode

---

### Phase 4: Passenger Data Validation (Live Safe)

**Goal:** Strict validation before allowing checkout to proceed.

**File:** `src/pages/FlightTravelerInfo.tsx` (MODIFY)

Enhanced validation rules:
```typescript
const validatePassenger = (p: PassengerForm, index: number): string | null => {
  // Full legal name validation
  if (!p.given_name.trim() || p.given_name.length < 2) {
    return `Passenger ${index + 1}: First name must be at least 2 characters`;
  }
  if (!p.family_name.trim() || p.family_name.length < 2) {
    return `Passenger ${index + 1}: Last name must be at least 2 characters`;
  }
  // Only letters and hyphens allowed in names
  if (!/^[a-zA-Z\s\-']+$/.test(p.given_name)) {
    return `Passenger ${index + 1}: First name can only contain letters`;
  }
  if (!/^[a-zA-Z\s\-']+$/.test(p.family_name)) {
    return `Passenger ${index + 1}: Last name can only contain letters`;
  }
  
  // Date of birth validation
  if (!p.born_on) {
    return `Passenger ${index + 1}: Date of birth is required`;
  }
  const dob = new Date(p.born_on);
  const now = new Date();
  if (dob >= now) {
    return `Passenger ${index + 1}: Invalid date of birth`;
  }
  
  // Gender validation (required for airlines)
  if (!p.gender || !['m', 'f'].includes(p.gender)) {
    return `Passenger ${index + 1}: Gender is required`;
  }
  
  // Email validation (stricter)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(p.email)) {
    return `Passenger ${index + 1}: Please enter a valid email address`;
  }
  
  return null; // No errors
};
```

**File:** `supabase/functions/create-flight-checkout/index.ts` (MODIFY)

Add server-side validation before creating Stripe session:
```typescript
// Validate passenger data
for (const p of passengers) {
  if (!p.given_name || !p.family_name || !p.born_on || !p.email) {
    throw new Error('Missing required passenger information');
  }
  if (!p.gender || !['m', 'f'].includes(p.gender)) {
    throw new Error('Invalid passenger gender');
  }
}
```

---

### Phase 5: Stripe + Duffel Failure Safety

**Current implementation review:**

The `issue-flight-ticket/index.ts` already has auto-refund logic:
```typescript
// Auto-refund on ticketing failure
console.log("[IssueTicket] Triggering auto-refund for booking:", bookingId);
await fetch(`${supabaseUrl}/functions/v1/process-flight-refund`, {
  method: 'POST',
  body: JSON.stringify({
    bookingId,
    reason: `Ticketing failed: ${error.message}`,
    action: 'auto',
  }),
});
```

**Enhancements needed:**

1. **Admin notification on failure**
   - File: `supabase/functions/issue-flight-ticket/index.ts`
   - Add entry to a `flight_admin_alerts` table when ticketing fails
   - Fields: booking_id, alert_type, message, created_at, resolved

2. **Update booking status more clearly**
   - Set `payment_status = 'refunded'` and `ticketing_status = 'failed'` atomically
   - Already done in `process-flight-refund/index.ts`

3. **Database table for alerts**
   - Create `flight_admin_alerts` table for dashboard visibility

---

### Phase 6: Admin Flights Readiness Panel

**Goal:** Create `/admin/flights/status` showing system health and readiness.

**File:** `src/pages/admin/FlightStatusPage.tsx` (NEW)

Dashboard sections:

1. **Environment Status**
   - Current mode: Sandbox / Live
   - API health check (last successful Duffel call)
   - Stripe connection status

2. **Booking Stats (Last 24h)**
   - Total bookings attempted
   - Successful tickets issued
   - Failed/refunded bookings
   - Zero-result searches

3. **Compliance Checklist**
   - [ ] Seller of Travel page exists
   - [ ] Terms checkbox includes fare rules
   - [ ] Footer has SOT disclosure
   - [ ] Auto-refund on failure enabled
   - [ ] Passenger validation enforced

4. **Recent Alerts**
   - Failed ticketing attempts
   - Refund triggers
   - API errors

5. **Environment Switch Controls** (For future - locked for now)
   - Display current DUFFEL_ENV (read-only)
   - Note: "Switch to LIVE requires updating environment variable in Supabase"

**Also update:**
- `src/App.tsx` - Add route for `/admin/flights/status`
- `src/pages/admin/FlightDebugPage.tsx` - Add link to status page

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/legal/SellerOfTravel.tsx` | CREATE | New legal page with SOT disclosure |
| `src/components/Footer.tsx` | MODIFY | Add "Seller of Travel" link to legal section |
| `src/App.tsx` | MODIFY | Add routes for new pages |
| `src/config/flightMoRCompliance.ts` | MODIFY | Update consent text for fare rules |
| `src/pages/FlightCheckout.tsx` | MODIFY | Enhanced consent UI, SOT link in footer |
| `src/config/duffelConfig.ts` | MODIFY | Add `isLiveMode()`, `shouldEnforceStrictValidation()` |
| `src/components/Header.tsx` | MODIFY | Add "Test Mode" badge for admins |
| `src/pages/FlightTravelerInfo.tsx` | MODIFY | Stricter passenger validation |
| `supabase/functions/create-flight-checkout/index.ts` | MODIFY | Server-side passenger validation |
| `supabase/functions/issue-flight-ticket/index.ts` | MODIFY | Admin alert on failure |
| `src/pages/admin/FlightStatusPage.tsx` | CREATE | Admin readiness dashboard |
| `src/hooks/useFlightAdminStatus.ts` | CREATE | Hook for fetching admin stats |

---

## Database Migration

```sql
-- Admin alerts table for failed bookings
CREATE TABLE flight_admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES flight_bookings(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('ticketing_failed', 'refund_failed', 'api_error', 'payment_failed')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for unresolved alerts
CREATE INDEX idx_flight_admin_alerts_unresolved ON flight_admin_alerts(created_at DESC) WHERE resolved = FALSE;

-- RLS: Admin-only access
ALTER TABLE flight_admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to flight alerts"
ON flight_admin_alerts FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));
```

---

## Security Checklist

1. **Duffel API Key** - Server-only (edge function)
2. **No API URLs exposed** - All calls through edge functions
3. **Admin-only debug access** - RLS enforced
4. **Passenger data encrypted** - Via Supabase/Stripe
5. **Auto-refund on failure** - Protects customer

---

## Technical Details

### SellerOfTravel.tsx Structure

```tsx
// Key content sections:
1. Business Information Card
   - ZIVO LLC (legal name)
   - Business address placeholder (to be filled)
   - Support email: support@hizivo.com

2. Registration Status Card
   - California SOT: pending
   - Florida SOT: pending
   - Link to state registries

3. Sub-Agent Disclosure Card
   - "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers"
   - "Tickets are issued by authorized partners under airline rules"
   - Link to ticketing partner info

4. Customer Rights Card
   - Refund eligibility
   - Support contact
   - Complaint process
```

### FlightStatusPage.tsx Structure

```tsx
// Dashboard layout:
1. Header with environment badge (Sandbox/Live)
2. Stats grid (4 cards):
   - Bookings today
   - Success rate
   - Pending tickets
   - Active alerts

3. Compliance checklist (expandable card)
4. Recent alerts table (sortable)
5. Quick actions: Link to Debug page, Link to Logs
```

### Header.tsx Test Mode Badge

```tsx
// Add after logo, visible only to admins in sandbox mode
{isAdmin && isSandboxMode() && (
  <Badge 
    variant="outline" 
    className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30"
  >
    Test Mode
  </Badge>
)}
```

---

## Testing Requirements

1. **Seller of Travel Page**
   - Verify page loads at `/legal/seller-of-travel`
   - Confirm footer links to this page
   - Check all legal text is accurate

2. **Checkout Compliance**
   - Verify updated consent text appears
   - Confirm checkout button disabled when unchecked
   - Test fare rules link works

3. **Environment Guards**
   - Toggle `duffel_env` in sessionStorage
   - Verify sandbox helpers show/hide correctly
   - Confirm admin test mode badge appears

4. **Passenger Validation**
   - Test with invalid names (numbers, special chars)
   - Test with missing required fields
   - Verify server rejects invalid data

5. **Failure Safety**
   - Simulate Duffel order failure
   - Verify auto-refund triggers
   - Check admin alert is created

6. **Admin Status Page**
   - Access `/admin/flights/status` as admin
   - Verify all stats display correctly
   - Test alert resolution flow
