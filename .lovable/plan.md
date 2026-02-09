

# Phone Verification (OTP) & Compliance-Safe Messaging Implementation Plan

## Overview
Enhance the existing phone verification flow with stricter compliance controls, SMS consent tracking, opt-out keyword handling, and a dedicated notification audit log for legal compliance. The system will ensure SMS/calls are only sent to verified numbers with explicit consent.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `profiles` table | Complete | Has `phone_e164`, `phone_verified`, `phone_verified_at`, `sms_consent`, `sms_opted_out`, `sms_opted_out_at` |
| `notification_preferences` table | Complete | Has `email_enabled`, `sms_enabled`, `in_app_enabled`, `phone_number`, `phone_verified` |
| `sms_otp_codes` table | Complete | Has `id`, `user_id`, `phone_e164`, `code`, `expires_at`, `verified_at`, `attempts` |
| `sms_daily_limits` table | Complete | Rate limiting for SMS sends |
| `send-otp-sms` edge function | Complete | Sends 6-digit OTP via Twilio with rate limiting |
| `verify-otp-sms` edge function | Complete | Verifies OTP, updates profile and preferences |
| `twilio-sms-status` edge function | Complete | Handles delivery status callbacks |
| `PhoneVerificationDialog` component | Complete | OTP input modal with 6-digit entry |
| `NotificationChannelCard` component | Complete | Reusable toggle card with verification badge |
| `useNotificationPreferences` hook | Complete | CRUD for preferences + OTP hooks |
| `NotificationSettings` page | Complete | Push, SMS, Email toggles with phone verification |
| `audit_logs` table | Complete | Generic audit logging (admin actions) |
| `notifications` table | Complete | Has `channel`, `status`, `provider_message_id`, `error_message`, `event_type`, `to_value` |
| `send-notification` edge function | Complete | Multi-channel with push → SMS → email fallback |

### Missing/Needs Enhancement
| Feature | Status |
|---------|--------|
| Inbound SMS webhook (STOP/UNSUBSCRIBE) | Need to create |
| SMS consent checkbox in UI | Need to add |
| Quiet hours support | Need to add fields + logic |
| OTP lockout after max wrong codes | Exists (5 attempts), may need UI feedback |
| Masked phone display | Need to enhance |
| Notification audit table | Can use existing `notifications` table or extend |
| Admin audit log for notification sends | Need to integrate |

---

## Implementation Plan

### 1) Database Migration

**Enhancements Needed:**

```sql
-- Add quiet hours to notification_preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00',
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sms_consent_text TEXT;

-- Add notification audit log table for compliance
CREATE TABLE notification_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  channel TEXT NOT NULL, -- 'push', 'sms', 'email', 'call'
  event_type TEXT NOT NULL, -- 'order_status', 'support_reply', 'otp', 'marketing', etc.
  destination_masked TEXT, -- '***-***-1234' or 'j***@example.com'
  provider_id TEXT, -- Twilio SID, Resend ID, etc.
  status TEXT NOT NULL, -- 'sent', 'failed', 'skipped', 'opted_out'
  error TEXT,
  skip_reason TEXT, -- 'not_verified', 'opted_out', 'rate_limited', 'quiet_hours'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_audit_user ON notification_audit(user_id);
CREATE INDEX idx_notification_audit_channel ON notification_audit(channel);
CREATE INDEX idx_notification_audit_created ON notification_audit(created_at);

-- RLS for notification_audit (admin read, system write)
ALTER TABLE notification_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view notification audit"
  ON notification_audit FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'operations', 'support')
    )
  );

CREATE POLICY "Service role can insert notification audit"
  ON notification_audit FOR INSERT
  WITH CHECK (true);
```

---

### 2) Inbound SMS Webhook (STOP/UNSUBSCRIBE Handler)

**File to Create:** `supabase/functions/twilio-sms-inbound/index.ts`

**Purpose:** Handle inbound SMS messages from users to process opt-out keywords.

**Logic:**
1. Parse Twilio webhook payload (From, Body)
2. Check if Body contains STOP, UNSUBSCRIBE, CANCEL, END, QUIT
3. If opt-out keyword found:
   - Find user by phone_e164
   - Set `profiles.sms_opted_out = true`, `sms_opted_out_at = now()`
   - Set `notification_preferences.sms_enabled = false`
   - Log to `notification_audit` with event_type = 'opt_out'
   - Reply with confirmation TwiML: "You have been unsubscribed from ZIVO SMS notifications. Reply START to re-subscribe."
4. If START keyword found:
   - Set `profiles.sms_opted_out = false`, `sms_opted_out_at = null`
   - Reply: "Welcome back! You will now receive ZIVO SMS notifications."
5. Return TwiML response

```typescript
// Opt-out keywords per CTIA guidelines
const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
const OPT_IN_KEYWORDS = ['start', 'subscribe', 'yes', 'unstop'];
```

---

### 3) Enhanced SMS Consent UI

**File to Modify:** `src/pages/account/NotificationSettings.tsx`

**Add Consent Checkbox:**
When user enables SMS and has verified phone, show consent checkbox:

```text
+--------------------------------------------------+
| 📱 SMS Notifications                              |
+--------------------------------------------------+
| [Toggle: Enable SMS]                              |
|                                                   |
| Phone Number: [+1 (555) 123-4567] ✅ Verified      |
|                                                   |
| ☐ I agree to receive SMS notifications from ZIVO  |
|   for order updates, support, and alerts.         |
|   Standard message rates may apply. Reply STOP    |
|   to unsubscribe at any time.                     |
|                                                   |
| Rate: Max 5 SMS/day for critical updates only     |
+--------------------------------------------------+
```

**Logic:**
- SMS toggle disabled until phone verified AND consent checked
- When consent given, record `sms_consent = true`, `sms_consent_at = now()`, `sms_consent_text = "..."`
- Show warning if `sms_opted_out = true`: "You previously unsubscribed. Reply START to your last ZIVO message or re-enable below."

---

### 4) Quiet Hours Support

**File to Modify:** `src/pages/account/NotificationSettings.tsx`

**Add Quiet Hours Section:**

```text
+--------------------------------------------------+
| 🌙 Quiet Hours (Optional)                         |
+--------------------------------------------------+
| [Toggle: Enable Quiet Hours]                      |
|                                                   |
| During quiet hours, we'll hold non-urgent SMS     |
| and push notifications.                           |
|                                                   |
| Start: [10:00 PM ▼]  End: [8:00 AM ▼]            |
+--------------------------------------------------+
```

**Logic:**
- If quiet hours enabled and current time is within range, skip non-critical SMS
- Critical events (order cancellation, fraud alerts) still send immediately
- Store in `notification_preferences.quiet_hours_enabled`, `quiet_hours_start`, `quiet_hours_end`

---

### 5) Update send-notification Edge Function

**File to Modify:** `supabase/functions/send-notification/index.ts`

**Add Compliance Checks:**

```typescript
// Before sending SMS
async function canSendSMS(supabase, userId: string, priority: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // 1. Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_e164, phone_verified, sms_consent, sms_opted_out")
    .eq("user_id", userId)
    .single();

  if (!profile?.phone_e164) {
    return { allowed: false, reason: "no_phone" };
  }

  if (!profile.phone_verified) {
    return { allowed: false, reason: "not_verified" };
  }

  if (!profile.sms_consent) {
    return { allowed: false, reason: "no_consent" };
  }

  if (profile.sms_opted_out) {
    return { allowed: false, reason: "opted_out" };
  }

  // 2. Check quiet hours (skip for critical)
  if (priority !== "critical") {
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("quiet_hours_enabled, quiet_hours_start, quiet_hours_end")
      .eq("user_id", userId)
      .single();

    if (prefs?.quiet_hours_enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      const start = prefs.quiet_hours_start;
      const end = prefs.quiet_hours_end;

      // Simple quiet hours check
      if (isWithinQuietHours(currentTime, start, end)) {
        return { allowed: false, reason: "quiet_hours" };
      }
    }
  }

  // 3. Check rate limit
  const withinLimit = await checkSMSRateLimit(supabase, userId);
  if (!withinLimit) {
    return { allowed: false, reason: "rate_limited" };
  }

  return { allowed: true };
}
```

**Add Audit Logging:**

```typescript
// After each send attempt
async function logNotificationAudit(supabase, {
  userId,
  channel,
  eventType,
  destination,
  providerId,
  status,
  error,
  skipReason,
}: {
  userId: string;
  channel: 'push' | 'sms' | 'email' | 'call';
  eventType: string;
  destination: string;
  providerId?: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
  skipReason?: string;
}) {
  // Mask destination
  let maskedDestination = destination;
  if (channel === 'sms' || channel === 'call') {
    maskedDestination = maskPhone(destination);
  } else if (channel === 'email') {
    maskedDestination = maskEmail(destination);
  }

  await supabase.from("notification_audit").insert({
    user_id: userId,
    channel,
    event_type: eventType,
    destination_masked: maskedDestination,
    provider_id: providerId,
    status,
    error,
    skip_reason: skipReason,
  });
}

function maskPhone(phone: string): string {
  // +15551234567 → ***-***-4567
  if (phone.length >= 4) {
    return "***-***-" + phone.slice(-4);
  }
  return "***";
}

function maskEmail(email: string): string {
  // john@example.com → j***@example.com
  const [local, domain] = email.split("@");
  if (local.length > 1) {
    return local[0] + "***@" + domain;
  }
  return "***@" + domain;
}
```

---

### 6) Update send-otp-sms Edge Function

**File to Modify:** `supabase/functions/send-otp-sms/index.ts`

**Enhancements:**
1. Add audit logging for OTP sends
2. Return rate limit status to UI
3. Ensure OTP lockout info is returned

Already has rate limiting (5 per hour per phone). Add:

```typescript
// Log OTP send to audit
await supabase.from("notification_audit").insert({
  user_id,
  channel: "sms",
  event_type: "otp",
  destination_masked: maskPhone(phone_e164),
  provider_id: smsResult.sid,
  status: smsResult.success ? "sent" : "failed",
  error: smsResult.error,
});
```

---

### 7) Enhanced UI Hook

**File to Modify:** `src/hooks/useNotificationPreferences.ts`

**Add:**

```typescript
export interface NotificationPreferences {
  // ... existing fields
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  smsConsentAt: string | null;
}

export interface UpdatePreferencesInput {
  // ... existing fields
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  smsConsentAt?: string;
  smsConsentText?: string;
}

// Add opt-out re-enable hook
export function useReenableSMS() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Clear opt-out flag
      await supabase
        .from("profiles")
        .update({
          sms_opted_out: false,
          sms_opted_out_at: null,
          sms_consent: true,
        })
        .eq("user_id", user.id);

      await supabase
        .from("notification_preferences")
        .update({ sms_enabled: true })
        .eq("user_id", user.id);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("SMS notifications re-enabled");
    },
  });
}
```

---

### 8) Phone Masking in UI

**File to Modify:** `src/pages/account/NotificationSettings.tsx`

**Update display logic:**

```typescript
// Mask phone for display in sensitive contexts
function maskPhoneForDisplay(phone: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 4) {
    return "***-***-" + cleaned.slice(-4);
  }
  return "•••";
}

// Show full number only when editing, masked when verified
{prefs?.phoneVerified ? (
  <span className="font-mono">***-***-{phoneInput.slice(-4)}</span>
) : (
  <Input value={phoneInput} onChange={...} />
)}
```

---

### 9) Admin Notification Audit Page

**File to Create:** `src/pages/admin/NotificationAuditPage.tsx`

**Route:** `/admin/notifications/audit`

**Features:**
- Table of all notification send attempts
- Filter by channel, status, date range
- Show masked destinations
- Show provider IDs for debugging
- Export for compliance reporting

**Layout:**
```text
+----------------------------------------------------------+
|  Notification Audit Log                    [Export CSV]   |
+----------------------------------------------------------+
|                                                           |
|  Filters: [All Channels ▼] [All Status ▼] [Last 7 days ▼]|
|                                                           |
|  +------------------------------------------------------+|
|  | Time       | User     | Channel | Event    | Status  ||
|  +------------------------------------------------------+|
|  | 12:34 PM   | usr_123  | SMS     | otp      | sent    ||
|  |            | ***-***-4567       | sid_abc...          ||
|  +------------------------------------------------------+|
|  | 12:30 PM   | usr_456  | SMS     | order    | skipped ||
|  |            | ***-***-7890       | Reason: opted_out   ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

---

### 10) Routes Configuration

**File to Modify:** `src/App.tsx`

Add route for audit page:

```typescript
const NotificationAuditPage = lazy(() => import("./pages/admin/NotificationAuditPage"));

<Route path="/admin/notifications/audit" element={
  <ProtectedRoute requireAdmin><NotificationAuditPage /></ProtectedRoute>
} />
```

---

## File Summary

### Database Migration (1)
| Change | Purpose |
|--------|---------|
| Add quiet hours columns | User preference for notification timing |
| Add sms_consent_at/text | Compliance tracking |
| Create `notification_audit` table | Legal/compliance audit trail |
| RLS policies | Admin read, service write |

### New Files (2)
| File | Purpose |
|------|---------|
| `supabase/functions/twilio-sms-inbound/index.ts` | STOP/UNSUBSCRIBE handler |
| `src/pages/admin/NotificationAuditPage.tsx` | Admin audit log viewer |

### Modified Files (5)
| File | Changes |
|------|---------|
| `supabase/functions/send-notification/index.ts` | Add compliance checks + audit logging |
| `supabase/functions/send-otp-sms/index.ts` | Add audit logging |
| `src/pages/account/NotificationSettings.tsx` | Add consent checkbox, quiet hours, masked display |
| `src/hooks/useNotificationPreferences.ts` | Add quiet hours fields, re-enable hook |
| `src/App.tsx` | Add audit page route |

---

## Data Flow

```text
User Enables SMS
        ↓
Check phone verified? → No → Show "Verify" button
        ↓ Yes
Show consent checkbox
        ↓
User checks consent → Record sms_consent=true, sms_consent_at=now()
        ↓
SMS toggle enabled

---

Event Triggers Notification
        ↓
send-notification edge function
        ↓
canSendSMS() check:
├── phone_verified? → No → Log audit (skipped: not_verified)
├── sms_consent? → No → Log audit (skipped: no_consent)
├── sms_opted_out? → Yes → Log audit (skipped: opted_out)
├── quiet_hours? → Yes + non-critical → Log audit (skipped: quiet_hours)
├── rate_limit? → Exceeded → Log audit (skipped: rate_limited)
└── All pass → Send SMS via Twilio
        ↓
Log to notification_audit (sent/failed)

---

User Replies STOP
        ↓
twilio-sms-inbound webhook
        ↓
Detect STOP keyword
        ↓
Update profiles: sms_opted_out=true, sms_opted_out_at=now()
Update notification_preferences: sms_enabled=false
Log to notification_audit (opt_out)
        ↓
Reply TwiML: "You have been unsubscribed..."
```

---

## Security Controls

### 1. Phone Verification Required
SMS only to `phone_verified = true`.

### 2. Explicit Consent
Require `sms_consent = true` with timestamp for legal compliance.

### 3. Opt-Out Handling
Process STOP/UNSUBSCRIBE keywords immediately per TCPA/CTIA guidelines.

### 4. Rate Limiting
Existing 5 SMS/day limit per user.

### 5. OTP Lockout
Existing 5 attempts per code, then code invalidated.

### 6. Masked Display
Phone numbers shown as `***-***-1234` in UI and audit logs.

### 7. Quiet Hours
Non-critical messages held during user-defined quiet period.

### 8. Complete Audit Trail
Every send attempt logged with channel, status, and reason.

---

## Compliance Notes

- **TCPA**: Requires prior express written consent for marketing SMS
- **CTIA**: Requires processing STOP/HELP keywords
- **Record Retention**: Audit logs should be retained for compliance period
- **Opt-Out**: Must honor within reasonable time (implementation is instant)

---

## Summary

This implementation enhances the existing phone verification system with:

1. **Inbound SMS Webhook** - Handle STOP/UNSUBSCRIBE keywords automatically
2. **Consent Tracking** - Record explicit consent with timestamp and text
3. **Quiet Hours** - User-controlled notification timing
4. **Complete Audit Trail** - Every notification attempt logged for compliance
5. **Masked Display** - Phone numbers masked in UI and logs
6. **Enhanced Checks** - All 5 conditions verified before SMS: verified, consent, not opted out, not quiet hours, not rate limited

Builds on existing infrastructure with minimal new tables and functions.

