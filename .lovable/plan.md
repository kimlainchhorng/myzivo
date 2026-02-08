
# Web Push Notifications End-to-End Implementation Plan

## Overview
Complete the Web Push notification system by adding missing VAPID secrets, fixing database constraints, implementing real push triggers for order/chat events, and enhancing the unsubscribe flow to clean up server-side subscriptions.

---

## Current State Analysis

### Already Exists ✅
| Feature | Status | Location |
|---------|--------|----------|
| `push_subscriptions` table | Available | id, user_id, endpoint, p256dh, auth, created_at |
| `send-push-notification` edge function | Complete | Full VAPID web push with web-push npm package |
| `register-web-push` edge function | Complete | Saves subscription with upsert on endpoint |
| `useWebPush` hook | Complete | Subscribe/unsubscribe/test methods |
| `NotificationSettings.tsx` | Complete | Toggle push on/off, test button, category preferences |
| `public/sw.js` | Complete | Push handler, notification click routing |
| `/eats/alerts` page | Complete | Full alerts UI with real-time updates |
| `EatsBottomNav` | Complete | Unread badge on Alerts tab |
| Real-time subscriptions | Complete | `useEatsAlerts` with postgres_changes |

### Missing ❌
| Feature | Status |
|---------|--------|
| VAPID secrets (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT) | Not configured |
| `VITE_VAPID_PUBLIC_KEY` env variable | Not in .env |
| Unique constraint on (user_id, endpoint) | Only (driver_id, endpoint) exists |
| `is_active` column in push_subscriptions | Needs verification |
| Push triggers for order status changes | Not implemented |
| Push triggers for chat messages | Not implemented |
| Push triggers for support ticket replies | Not implemented |
| Server-side test notification | Only local browser test |
| Unsubscribe cleanup on Supabase | Not deleting server subscription |

---

## Implementation Plan

### 1) Database Schema Updates

**Add missing columns and constraints to `push_subscriptions`:**

```sql
-- Add is_active and platform columns if missing
ALTER TABLE push_subscriptions 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add unique constraint on (user_id, endpoint) for upserts
ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_id_endpoint_key 
  UNIQUE (user_id, endpoint);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active 
  ON push_subscriptions(user_id, is_active) 
  WHERE is_active = true;
```

### 2) VAPID Keys Configuration

**Required secrets to add via Edge Functions secrets UI:**

| Secret | Value | Description |
|--------|-------|-------------|
| `VAPID_PUBLIC_KEY` | (generated) | Base64 VAPID public key |
| `VAPID_PRIVATE_KEY` | (generated) | Base64 VAPID private key |
| `VAPID_SUBJECT` | `mailto:info@hizivo.com` | Contact for push service |

**Also add to `.env`:**
```
VITE_VAPID_PUBLIC_KEY="<public_key_here>"
```

**Generate VAPID keys using:**
```bash
npx web-push generate-vapid-keys
```

### 3) Unsubscribe Cleanup Edge Function

**Create:** `supabase/functions/unregister-web-push/index.ts`

Deletes the subscription from Supabase when user disables push:

```typescript
// Accept endpoint or subscription_id
// Delete from push_subscriptions where user_id matches
// Return success
```

**Update `useWebPush.ts`:**
- Call `unregister-web-push` edge function in `unsubscribe()` method
- Pass the endpoint to delete the correct subscription

### 4) Push Notification Triggers

**A) Order Status Changes**

Modify `useUpdateFoodOrder` hook to send push after status update:

```typescript
// After successful status update, call send-push-notification
const statusMessages = {
  confirmed: "Your order has been confirmed!",
  preparing: "Your order is being prepared",
  ready_for_pickup: "Your order is ready for pickup",
  out_for_delivery: "Your order is on the way!",
  completed: "Your order has been delivered",
};

await supabase.functions.invoke("send-push-notification", {
  body: {
    user_id: order.customer_id,
    notification_type: "order_status",
    title: `Order ${newStatus.replace(/_/g, " ")}`,
    body: statusMessages[newStatus],
    data: { type: "order_status", order_id: order.id },
  },
});
```

**B) New Chat Messages**

Modify `useOrderChat` hook to send push on new message:

```typescript
// After inserting chat message
await supabase.functions.invoke("send-push-notification", {
  body: {
    user_id: recipientId,
    notification_type: "chat_message",
    title: `New message from ${senderName}`,
    body: message.substring(0, 100),
    data: { type: "chat_message", order_id: orderId },
  },
});
```

**C) Support Ticket Replies**

Modify support ticket reply flow to send push:

```typescript
// After agent replies to ticket
await supabase.functions.invoke("send-push-notification", {
  body: {
    user_id: ticketOwnerId,
    notification_type: "support_reply",
    title: "Support team replied",
    body: `Re: ${ticketSubject}`,
    data: { type: "support_reply", ticket_id: ticketId },
  },
});
```

### 5) Server-Side Test Notification

**Update `useWebPush.ts` `sendTestNotification` method:**

```typescript
const sendTestNotification = useCallback(async () => {
  if (!user?.id) {
    // Fallback to local notification
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("hiZIVO Test", { ... });
    return;
  }

  // Send real push via edge function
  await supabase.functions.invoke("send-push-notification", {
    body: {
      user_id: user.id,
      notification_type: "test",
      title: "hiZIVO Push Test 🔔",
      body: "Push notifications are working end-to-end!",
      data: { type: "test", url: "/account/notifications" },
    },
  });
}, [user]);
```

### 6) Service Worker Enhancements

**Update `public/sw.js` notification click handler:**

Add handling for support ticket clicks:

```javascript
case 'support_reply':
  urlToOpen = `/support/tickets/${data.ticket_id}`;
  break;
```

Already handles:
- `order_status` → `/eats/orders/${order_id}`
- `chat_message` → `/support/tickets/${ticket_id}`
- `price_drop` → `/flights` or custom URL
- `booking_update` → `/trips/${booking_id}`

### 7) Enhanced Alerts Page

The `/eats/alerts` page already exists and works. Ensure it handles all notification types:

- Order status updates ✅
- Chat messages (add icon differentiation)
- Support ticket replies (add icon differentiation)
- Price alerts
- Promotional notifications

### 8) Unread Badge in Bottom Nav

Already implemented in `EatsBottomNav.tsx`:
- Uses `useEatsAlerts().unreadCount`
- Displays badge on Alerts tab when > 0

---

## File Summary

### Database Migration
| Change | Purpose |
|--------|---------|
| Add `is_active`, `platform` columns | Track subscription status |
| Add unique constraint `(user_id, endpoint)` | Enable upsert behavior |
| Add index on `(user_id, is_active)` | Fast subscription lookups |

### Secrets to Add
| Secret | Purpose |
|--------|---------|
| `VAPID_PUBLIC_KEY` | Client subscription creation |
| `VAPID_PRIVATE_KEY` | Server-side push signing |
| `VAPID_SUBJECT` | Push service contact |

### New Files (1)
| File | Purpose |
|------|---------|
| `supabase/functions/unregister-web-push/index.ts` | Delete subscription on unsubscribe |

### Modified Files (4)
| File | Changes |
|------|---------|
| `.env` | Add `VITE_VAPID_PUBLIC_KEY` |
| `src/hooks/useWebPush.ts` | Call unregister function, use server-side test push |
| `src/hooks/useEatsOrders.ts` | Add push trigger on order status change |
| `src/hooks/useOrderChat.ts` | Add push trigger on new message |

---

## Data Flow

```text
User Enables Push Notifications
        ↓
Browser requests permission
        ↓
Service Worker subscribes with VAPID key
        ↓
register-web-push edge function
        ↓
Save to push_subscriptions table
        ↓
Event occurs (order status / chat message)
        ↓
App code calls send-push-notification
        ↓
Edge function reads push_subscriptions
        ↓
Sends VAPID-signed push via web-push library
        ↓
Service Worker receives push event
        ↓
Shows native notification
        ↓
User clicks → SW opens correct URL
```

---

## Push Trigger Integration Points

| Event | Location | Trigger |
|-------|----------|---------|
| Order placed | `useCreateFoodOrder` | After successful insert |
| Order status change | `useUpdateFoodOrder` | After status update |
| New chat message | `useOrderChat` → send | After message insert |
| Support ticket reply | Admin ticket panel | After agent reply |
| Price drop | Price monitoring job | Scheduled edge function |

---

## Testing Checklist

1. **VAPID Setup**
   - [ ] Generate VAPID keys
   - [ ] Add secrets to Supabase Edge Functions
   - [ ] Add `VITE_VAPID_PUBLIC_KEY` to .env

2. **Subscribe Flow**
   - [ ] User enables notifications on `/account/notifications`
   - [ ] Browser permission granted
   - [ ] Subscription saved to `push_subscriptions`

3. **Unsubscribe Flow**
   - [ ] User disables notifications
   - [ ] Browser subscription unregistered
   - [ ] Row deleted from `push_subscriptions`

4. **Test Notification**
   - [ ] Click "Send Test" button
   - [ ] Receive native push notification
   - [ ] Clicking opens `/account/notifications`

5. **Real Event Triggers**
   - [ ] Order status change → customer receives push
   - [ ] Chat message → recipient receives push
   - [ ] Support reply → customer receives push

6. **Notification Click Actions**
   - [ ] Order notification → opens order detail
   - [ ] Chat notification → opens chat
   - [ ] Support notification → opens ticket

---

## Summary

This implementation completes the Web Push notification system by:

1. **Configuring VAPID secrets** for server-side push signing
2. **Adding database constraints** for proper subscription management
3. **Creating unregister function** to clean up on unsubscribe
4. **Integrating push triggers** into order, chat, and support flows
5. **Enhancing test notification** to use real server-side push
6. **Leveraging existing UI** (`/eats/alerts`, bottom nav badge, settings page)

All integrated with existing `push_subscriptions` table, `send-push-notification` edge function, and `sw.js` service worker.
