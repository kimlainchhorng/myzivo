
# SMS + Email Fallback Notifications for Critical Events

## Overview
Implement a multi-channel notification system that sends SMS (Twilio) and Email (Resend) as fallbacks when push notifications are disabled or fail. The system includes user notification preferences management, phone number verification via OTP, a unified notification outbox, and an admin monitoring dashboard.

---

## Current State Analysis

### Already Exists ✅
| Feature | Status | Location |
|---------|--------|----------|
| `notification_preferences` table | Complete | user_id, email_enabled, sms_enabled, in_app_enabled, phone_number, phone_verified |
| `notifications` table | Complete | Unified outbox with channel, status, provider_message_id, error_message |
| `notification_templates` table | Complete | template_key, body_html, body_text, supports_email/sms/in_app |
| `send-notification` edge function | Complete | Handles email via Resend, SMS via Twilio |
| `send-push-notification` edge function | Complete | VAPID web push + FCM/APNs |
| `process-order-notifications` edge function | Complete | Batch processor for queued SMS/email |
| `send-otp-email` edge function | Complete | 6-digit OTP via email with rate limiting |
| `profiles` table | Complete | phone, phone_e164, phone_verified, phone_verified_at, sms_consent |
| Push in `useUpdateFoodOrder` | Complete | Sends push on order status change |
| Push in `useAddTicketMessage` | Complete | Sends push on support reply |
| Twilio secrets | Configured | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN |
| Resend secrets | Configured | RESEND_API_KEY |
| NotificationSettings page | Complete | Push toggle and category preferences |

### Missing ❌
| Feature | Status |
|---------|--------|
| `TWILIO_FROM_NUMBER` secret | Not configured (needed for SMS) |
| SMS OTP verification flow | Need to create |
| Enhanced NotificationSettings UI | Need SMS/Email toggles, phone input |
| `useNotificationPreferences` hook | Need to create |
| Fallback logic in event handlers | Need to add SMS/Email after push fails |
| `notification_outbox` view/table enhancement | Already exists as `notifications` table |
| Admin notifications outbox page | Need to create |
| SMS rate limiting | Need to add |
| Twilio delivery webhook | Need to create |

---

## Database Schema

### Use Existing `notification_preferences` Table
Already has the required columns:
```sql
-- Existing columns (no changes needed):
-- email_enabled, sms_enabled, in_app_enabled
-- phone_number, phone_verified
-- marketing_enabled, operational_enabled
```

### Add SMS Rate Limiting Table
```sql
CREATE TABLE sms_daily_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  sms_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE INDEX idx_sms_daily_limits_date ON sms_daily_limits(date);
```

### Add SMS OTP Table
```sql
CREATE TABLE sms_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  phone_e164 TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_otp_phone ON sms_otp_codes(phone_e164);
CREATE INDEX idx_sms_otp_user ON sms_otp_codes(user_id);
```

---

## Implementation Plan

### 1) User Notification Preferences Hook

**File to Create:** `src/hooks/useNotificationPreferences.ts`

```typescript
export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  marketingEnabled: boolean;
  operationalEnabled: boolean;
  phoneNumber: string | null;
  phoneVerified: boolean;
}

export function useNotificationPreferences()
export function useUpdateNotificationPreferences()
export function useSendPhoneOTP()
export function useVerifyPhoneOTP()
```

**Logic:**
- Fetch from `notification_preferences` table
- If no row exists, create with defaults on first update
- Sync `sms_enabled` with profile's `sms_consent`

---

### 2) Enhanced NotificationSettings Page

**File to Modify:** `src/pages/account/NotificationSettings.tsx`

**New Sections:**

**SMS Notifications:**
```text
+--------------------------------------------------+
| 📱 SMS Notifications                              |
+--------------------------------------------------+
| [Toggle: Enable SMS]                              |
|                                                   |
| Phone Number: [+1 (555) 123-4567] [Verify]        |
| Status: ✅ Verified / ⚠️ Not Verified              |
|                                                   |
| Rate: Max 5 SMS/day for critical updates only    |
+--------------------------------------------------+
```

**Email Notifications:**
```text
+--------------------------------------------------+
| 📧 Email Notifications                            |
+--------------------------------------------------+
| [Toggle: Enable Email]                            |
|                                                   |
| Email: user@example.com (from auth)              |
|                                                   |
| Types:                                            |
| [x] Order receipts & confirmations               |
| [x] Support ticket updates                       |
| [ ] Marketing & promotions                       |
+--------------------------------------------------+
```

**Components to Create:**
- `PhoneVerificationDialog.tsx` - OTP input modal
- `NotificationChannelCard.tsx` - Reusable channel toggle card

---

### 3) SMS OTP Edge Function

**File to Create:** `supabase/functions/send-otp-sms/index.ts`

**Logic:**
1. Accept `{ phone_e164, user_id }`
2. Rate limit: max 5 OTP requests per phone per hour
3. Generate 6-digit code, expires in 10 minutes
4. Invalidate previous codes for this phone
5. Send SMS via Twilio
6. Store in `sms_otp_codes` table

**SMS Template:**
```
Your ZIVO verification code is 123456. Expires in 10 minutes. Reply STOP to opt out.
```

**File to Create:** `supabase/functions/verify-otp-sms/index.ts`

**Logic:**
1. Accept `{ phone_e164, code, user_id }`
2. Find matching unexpired code with < 3 attempts
3. If valid:
   - Mark as verified
   - Update `notification_preferences.phone_verified = true`
   - Update `profiles.phone_verified = true`, `phone_verified_at = now()`
4. If invalid: increment attempts, return error

---

### 4) Unified Send Notification Function

**File to Modify:** `supabase/functions/send-notification/index.ts`

Add multi-channel cascade logic:

```typescript
async function sendMultiChannelNotification({
  user_id,
  title,
  body,
  action_url,
  priority = 'normal', // 'critical' | 'normal' | 'low'
  event_type, // 'order_status', 'support_reply', 'chat_message'
}) {
  // 1. Get user preferences
  const prefs = await getNotificationPreferences(user_id);
  const profile = await getProfile(user_id);
  
  // 2. Determine channels based on priority
  let channels = [];
  
  if (priority === 'critical') {
    // Try push first
    if (prefs.in_app_enabled) channels.push('push');
    // Fallback to SMS if push fails or no subscription
    if (prefs.sms_enabled && prefs.phone_verified) channels.push('sms');
    // Always email for receipts
    if (prefs.email_enabled) channels.push('email');
  } else {
    // Normal: push + in-app only
    if (prefs.in_app_enabled) channels.push('push');
    // Email for certain types
    if (['receipt', 'refund'].includes(event_type) && prefs.email_enabled) {
      channels.push('email');
    }
  }
  
  // 3. Execute in order with fallback
  let pushSuccess = false;
  
  for (const channel of channels) {
    if (channel === 'push') {
      const result = await sendPush(user_id, title, body, action_url);
      pushSuccess = result.success;
      if (!pushSuccess && prefs.sms_enabled && prefs.phone_verified) {
        // Fallback to SMS
        await sendSMS(profile.phone_e164, body);
      }
    } else if (channel === 'sms') {
      if (!pushSuccess) {
        await sendSMS(profile.phone_e164, body);
      }
    } else if (channel === 'email') {
      await sendEmail(profile.email, title, body);
    }
  }
}
```

---

### 5) Event Handler Integration

**Modify `useUpdateFoodOrder`:**

```typescript
// After push notification attempt
if (updates.status && currentOrder?.customer_id) {
  const isCritical = ['out_for_delivery', 'delivered', 'cancelled'].includes(updates.status);
  
  try {
    await supabase.functions.invoke("send-notification", {
      body: {
        user_id: currentOrder.customer_id,
        title: pushMessage.title,
        body: pushMessage.body,
        action_url: `/eats/orders/${id}`,
        priority: isCritical ? 'critical' : 'normal',
        event_type: 'order_status',
        order_id: id,
      },
    });
  } catch (err) {
    console.warn("Notification send failed:", err);
  }
}
```

**Modify `useAddTicketMessage`:**

```typescript
// After agent reply
if (ticket?.user_id) {
  await supabase.functions.invoke("send-notification", {
    body: {
      user_id: ticket.user_id,
      title: "Support Team Replied 💬",
      body: `Re: ${ticket.subject?.substring(0, 50)}`,
      action_url: `/support/tickets/${ticketId}`,
      priority: 'critical', // Support replies are critical
      event_type: 'support_reply',
    },
  });
}
```

---

### 6) Twilio Webhook for Delivery Status

**File to Create:** `supabase/functions/twilio-sms-status/index.ts`

**Handles:**
- `delivered` - Update notification status to 'sent'
- `failed` - Update notification status to 'failed', store error
- `undelivered` - Same as failed

```typescript
serve(async (req) => {
  const formData = await req.formData();
  const messageSid = formData.get("MessageSid");
  const status = formData.get("MessageStatus");
  const errorCode = formData.get("ErrorCode");
  
  await supabase
    .from("notifications")
    .update({
      status: status === "delivered" ? "sent" : "failed",
      error_message: errorCode ? `Twilio error: ${errorCode}` : null,
      sent_at: status === "delivered" ? new Date().toISOString() : null,
    })
    .eq("provider_message_id", messageSid);
    
  return new Response("OK", { status: 200 });
});
```

---

### 7) Admin Notifications Outbox Page

**File to Create:** `src/pages/admin/NotificationsOutboxPage.tsx`

**Route:** `/admin/notifications/outbox`

**Layout:**
```text
+----------------------------------------------------------+
|  Notification Outbox                    [Refresh]         |
+----------------------------------------------------------+
|                                                           |
|  Filters: [All Channels ▼] [All Status ▼] [Last 24h ▼]   |
|                                                           |
|  +------------------+  +------------------+               |
|  | TOTAL SENT       |  | FAILED           |               |
|  | 1,234            |  | 23               |               |
|  +------------------+  +------------------+               |
|                                                           |
|  +------------------+  +------------------+               |
|  | SMS SENT         |  | EMAIL SENT       |               |
|  | 89               |  | 456              |               |
|  +------------------+  +------------------+               |
|                                                           |
|  Failed Notifications (click to expand)                   |
|  +------------------------------------------------------+|
|  | 12:34 | SMS  | +1555... | "Your order..." | Retry    ||
|  |       | Error: 30008 - Unknown error                 ||
|  +------------------------------------------------------+|
|  | 12:30 | Email| user@... | "Support reply" | Retry    ||
|  |       | Error: Invalid email format                   ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

**Features:**
- Filter by channel (push/sms/email)
- Filter by status (sent/failed/queued)
- Date range filter
- Retry failed notifications
- Show error details
- Export failed list

---

### 8) SMS Rate Limiting

**In `send-notification` function:**

```typescript
async function checkSMSRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from("sms_daily_limits")
    .select("sms_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();
  
  if (data && data.sms_count >= 5) {
    return false; // Rate limited
  }
  
  // Upsert count
  await supabase.rpc("increment_sms_count", {
    p_user_id: userId,
    p_date: today,
  });
  
  return true;
}
```

**RPC Function:**
```sql
CREATE OR REPLACE FUNCTION increment_sms_count(p_user_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO sms_daily_limits (user_id, date, sms_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET sms_count = sms_daily_limits.sms_count + 1;
END;
$$ LANGUAGE plpgsql;
```

---

## Events to Notify (MVP)

| Event | Push | SMS (if push fails) | Email |
|-------|------|---------------------|-------|
| Order confirmed | ✅ | ❌ | ✅ receipt |
| Order preparing | ✅ | ❌ | ❌ |
| Out for delivery | ✅ | ✅ critical | ❌ |
| Delivered | ✅ | ✅ critical | ✅ receipt |
| Order cancelled | ✅ | ✅ critical | ✅ |
| Support reply | ✅ | ✅ critical | ✅ |
| New chat message | ✅ | ❌ | ❌ |
| Refund processed | ✅ | ✅ critical | ✅ |
| Driver assigned | ✅ | ❌ | ❌ |

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Create `sms_daily_limits` table | Rate limiting |
| Create `sms_otp_codes` table | Phone verification |
| Create `increment_sms_count` RPC | Atomic counter |
| Add RLS policies | Security |

### Secrets to Add
| Secret | Purpose |
|--------|---------|
| `TWILIO_FROM_NUMBER` | SMS sender number |

### New Files (8)
| File | Purpose |
|------|---------|
| `src/hooks/useNotificationPreferences.ts` | Preferences hook |
| `src/components/account/PhoneVerificationDialog.tsx` | OTP input modal |
| `src/components/account/NotificationChannelCard.tsx` | Reusable toggle card |
| `src/pages/admin/NotificationsOutboxPage.tsx` | Admin outbox view |
| `supabase/functions/send-otp-sms/index.ts` | Send SMS OTP |
| `supabase/functions/verify-otp-sms/index.ts` | Verify SMS OTP |
| `supabase/functions/twilio-sms-status/index.ts` | Delivery webhook |
| Migration SQL file | Schema changes |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/pages/account/NotificationSettings.tsx` | Add SMS/Email sections |
| `supabase/functions/send-notification/index.ts` | Add multi-channel cascade |
| `src/hooks/useEatsOrders.ts` | Use unified send-notification |
| `src/hooks/useSupportTickets.ts` | Use unified send-notification |

---

## Data Flow

```text
Event Occurs (order status change)
        ↓
Hook calls send-notification edge function
        ↓
Load user notification_preferences
        ↓
Determine channels based on priority:
├── Critical: push → SMS fallback → email
└── Normal: push only (email for receipts)
        ↓
Try PUSH first
├── Success → Log to notifications (channel=push)
└── Failure → Try SMS if enabled
        ↓
Try SMS (if applicable)
├── Check rate limit (5/day)
├── Check phone_verified
├── Send via Twilio
├── Log to notifications (channel=sms)
└── Twilio webhook updates status
        ↓
Send EMAIL (if applicable)
├── Send via Resend
└── Log to notifications (channel=email)
        ↓
All results stored in notifications table
        ↓
Admin can view in /admin/notifications/outbox
```

---

## Safety Controls

### 1. SMS Rate Limiting (5/user/day)
Prevents abuse and controls costs.

### 2. Phone Verification Required
SMS only sent to verified phones.

### 3. Transactional Only
SMS reserved for critical events only (out for delivery, support replies).

### 4. Opt-Out Support
SMS includes "Reply STOP" and respects `sms_opted_out` flag.

### 5. Fallback Priority
Push first, then SMS, then email - avoids duplicate notifications.

---

## Summary

This implementation creates a robust multi-channel notification system:

1. **User Preferences** - Granular control over push, SMS, and email
2. **Phone Verification** - OTP-based verification for SMS eligibility
3. **Smart Fallback** - Push → SMS → Email with priority-based routing
4. **Rate Limiting** - 5 SMS/day max to control costs
5. **Delivery Tracking** - Twilio webhooks update notification status
6. **Admin Dashboard** - Monitor failed notifications, retry capability
7. **Existing Integration** - Uses existing `notifications` table and templates

All leveraging existing Twilio and Resend configurations with minimal new infrastructure.
