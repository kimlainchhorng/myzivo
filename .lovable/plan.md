

# Automated Marketing Messages — Implementation Plan

## Overview
Create backend automation triggers for abandoned carts, re-engagement (no orders in 7 days), and birthday/special event coupons. Add an "Automated Messages" preference category to the existing `/account/notifications` page so users can opt in/out.

---

## Current State

### Already Built
| Component | Status |
|-----------|--------|
| `/account/notifications` page | Full Push/SMS/Email toggles + category toggles |
| `notification_preferences` table | Has `marketing_enabled`, `email_enabled`, `sms_enabled`, `in_app_enabled` |
| `automation_rules` table | Exists with `trigger_type`, `action_type`, `conditions`, `trigger_config`, `action_config` |
| `marketing_campaigns` table | Supports campaign types, push/email flags |
| `execute-campaign` edge function | Sends notifications to targeted users |
| `campaign-scheduler` edge function | Polls for scheduled campaigns |
| `notification_templates` table | Templates with `template_key`, `category`, channel support flags |

### What's Missing
- No `abandoned_cart_events` tracking table
- No edge function for automated trigger evaluation
- No "Automated Messages" toggle in notification settings UI
- No birthday field on profiles (need to check)

---

## Implementation Plan

### 1) Database Migration — Add Supporting Tables and Seed Rules

**New table: `automated_message_log`**
Tracks which automated messages were sent to prevent duplicates.

```text
id              uuid PK
user_id         uuid FK -> auth.users
trigger_type    text  -- 'abandoned_cart', 'reengagement', 'birthday'
trigger_ref     text  -- order_id or date reference
channel         text  -- 'push', 'email', 'sms'
sent_at         timestamptz
message_preview text
```

**Add `date_of_birth` column to `profiles`** (if not already present — will verify).

**Seed automation_rules** with three trigger rules:
1. `abandoned_cart` — trigger_type: "schedule", action_type: "notification", trigger_config: `{ delay_minutes: 30 }`
2. `reengagement_7d` — trigger_type: "schedule", action_type: "notification_with_promo", trigger_config: `{ inactive_days: 7 }`
3. `birthday_coupon` — trigger_type: "schedule", action_type: "coupon", trigger_config: `{ days_before: 0 }`

**Add `automated_messages_enabled` column to `notification_preferences`**
Default: `true` — users can opt out.

### 2) Create Edge Function: `process-automated-triggers`

**File:** `supabase/functions/process-automated-triggers/index.ts`

**Purpose:** Cron-callable function that evaluates all three trigger types and sends messages to eligible users.

**Logic:**

```text
1. ABANDONED CART
   - Query food_orders with status = 'cart' or 'pending'
     where created_at is 30-60 min ago
   - Check automated_message_log to avoid duplicates
   - Check user's notification_preferences.automated_messages_enabled
   - Send push/email reminder: "You left items in your cart!"

2. RE-ENGAGEMENT (7 days inactive)
   - Find users whose latest order (any service) is > 7 days ago
   - Exclude users already messaged for reengagement in past 14 days
   - Check preferences
   - Send push/email with promo: "We miss you! Here's 10% off"

3. BIRTHDAY COUPON
   - Query profiles where date_of_birth month/day = today
   - Exclude already-sent this year
   - Check preferences
   - Create promo code and send: "Happy Birthday! Enjoy a treat on us"

4. Log all sent messages to automated_message_log
```

**Respects user preferences:**
- Checks `automated_messages_enabled` flag
- Checks individual channel toggles (`push_enabled`, `email_enabled`, `sms_enabled`)
- Respects quiet hours

### 3) Update Notification Settings UI

**File to Modify:** `src/pages/account/NotificationSettings.tsx`

**Changes:**
- Add new category "Automated Messages" to `NOTIFICATION_CATEGORIES` array
- Add a dedicated card section for automated message types with sub-toggles

**New category entry:**
```text
{
  id: "automated_messages",
  label: "Automated Reminders",
  description: "Cart reminders, re-engagement offers, and birthday rewards",
  icon: Sparkles,
  defaultEnabled: true,
}
```

**New section below "Notification Types":**
```text
+----------------------------------------------+
|  Automated Messages                          |
+----------------------------------------------+
|  Cart Reminders                              |
|  Remind me about unfinished orders    [ON]   |
|                                              |
|  Re-engagement Offers                        |
|  Special offers when I haven't ordered [ON]  |
|                                              |
|  Birthday & Special Events                   |
|  Birthday coupons and seasonal gifts  [ON]   |
+----------------------------------------------+
```

### 4) Update Notification Preferences Hook

**File to Modify:** `src/hooks/useNotificationPreferences.ts`

**Changes:**
- Add `automatedMessagesEnabled` to `NotificationPreferences` interface
- Add mapping in `mapToPreferences` for `automated_messages_enabled`
- Add to `UpdatePreferencesInput` interface
- Add to mutation logic

### 5) Update Notification Preferences Hook for Sub-Categories

**File to Modify:** `src/hooks/useNotificationPreferences.ts`

Add three sub-preference fields to support granular control:

```text
automatedCartReminders: boolean;
automatedReengagement: boolean;
automatedBirthday: boolean;
```

These will be stored in the `notification_preferences` table as new columns.

---

## File Summary

### Database Changes (1 migration)
| Change | Description |
|--------|-------------|
| New table | `automated_message_log` for deduplication |
| New columns on `notification_preferences` | `automated_messages_enabled`, `automated_cart_reminders`, `automated_reengagement`, `automated_birthday` |
| New column on `profiles` | `date_of_birth` (date, nullable) |
| Seed data | 3 rows in `automation_rules` for the triggers |

### New Files (1)
| File | Purpose |
|------|---------|
| `supabase/functions/process-automated-triggers/index.ts` | Evaluates and sends automated messages |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/account/NotificationSettings.tsx` | Add "Automated Messages" section with sub-toggles |
| `src/hooks/useNotificationPreferences.ts` | Add automated message preference fields |

---

## Data Flow

```text
Cron / Manual Invoke
       |
       v
process-automated-triggers (Edge Function)
       |
       ├── Query food_orders for abandoned carts (30-60 min old)
       ├── Query profiles for inactive users (7+ days)
       ├── Query profiles for birthdays (today)
       |
       v
  For each eligible user:
       |
       ├── Check notification_preferences.automated_messages_enabled
       ├── Check sub-preferences (cart/reengagement/birthday)
       ├── Check channel preferences (push/email/sms)
       ├── Check automated_message_log for duplicates
       |
       v
  Send notification via preferred channel(s)
       |
       v
  Log to automated_message_log
```

---

## Notification Settings Page — Updated Layout

```text
+----------------------------------------------+
|  <- Notifications                            |
+----------------------------------------------+
|                                              |
|  [Push Notifications]          [Enabled]     |
|  [SMS Notifications]           [Toggle]      |
|  [Email Notifications]         [Toggle]      |
|                                              |
|  --- Notification Types ---                  |
|  Order Updates                 [ON]          |
|  Chat & Support                [ON]          |
|  Price Alerts                  [ON]          |
|  Deals & Promotions            [OFF]         |
|                                              |
|  --- Automated Messages ---  (NEW)           |
|  Cart Reminders                [ON]          |
|  Re-engagement Offers          [ON]          |
|  Birthday & Events             [ON]          |
|                                              |
|  [Quiet Hours]                               |
|  [Install App CTA]                           |
+----------------------------------------------+
```

---

## Edge Function: Trigger Details

### Abandoned Cart
| Field | Value |
|-------|-------|
| Delay | 30 minutes after cart created |
| Max sends | 1 per cart session |
| Message | "You left items in your cart! Complete your order before prices change." |
| Channel | Push (primary), Email (fallback) |

### Re-engagement
| Field | Value |
|-------|-------|
| Trigger | No orders in 7 days |
| Cooldown | 14 days between messages |
| Message | "We miss you! Here's a special offer to welcome you back." |
| Channel | Push + Email |

### Birthday
| Field | Value |
|-------|-------|
| Trigger | `date_of_birth` matches today |
| Frequency | Once per year |
| Message | "Happy Birthday! Enjoy a special treat on us." |
| Channel | Push + Email |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User opts out of automated messages | No automated messages sent |
| User opts out of specific sub-type | Only that type skipped |
| Cart completed before reminder | Check order status before sending |
| No birthday on file | Skip birthday trigger |
| User already received reengagement this week | Skip (14-day cooldown) |
| Quiet hours active | Defer to next allowed window |

---

## Summary

1. **Database** — Add `automated_message_log` table, preference columns, and `date_of_birth` to profiles
2. **Edge Function** — `process-automated-triggers` evaluates abandoned carts, inactive users, and birthdays
3. **UI** — New "Automated Messages" section on `/account/notifications` with sub-toggles
4. **Preferences Hook** — Extended with automated message fields
5. **User Control** — Full opt-in/opt-out at both category and sub-category level

