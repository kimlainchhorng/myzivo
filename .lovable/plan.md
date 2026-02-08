
# PWA Enhancement with Web Push Notifications

## Overview
Enhance the existing PWA setup to support **Web Push notifications** for all users (customers, drivers, merchants), improve the service worker with better caching strategies, and add notification permission prompts throughout the app.

---

## Current State Analysis

### Already Exists ✅
| Feature | Status | Location |
|---------|--------|----------|
| PWA manifest | ✅ Complete | `vite.config.ts` (vite-plugin-pwa) |
| PWA icons | ✅ Complete | `public/pwa-icons/` (192x192, 512x512) |
| Install page | ✅ Complete | `/install` → `src/pages/Install.tsx` |
| Install banner | ✅ Complete | `MobileInstallBanner.tsx` |
| Mobile app hook | ✅ Complete | `useMobileApp.ts` (install, platform detect) |
| Push hook (native) | ✅ Complete | `usePushNotifications.ts` (Capacitor only) |
| Device tokens table | ✅ Complete | `device_tokens` table |
| Push send function | ⚠️ Partial | `send-push-notification/index.ts` (placeholder for web) |
| Register token function | ✅ Complete | `register-push-token/index.ts` |
| Notification prefs UI | ✅ Complete | `PushNotificationPreferences.tsx` |

### Missing / Needs Update ❌
| Feature | Status |
|---------|--------|
| Web Push subscription (VAPID) | ❌ Not implemented |
| User-linked push subscriptions | ❌ Only `drivers` linked, need `user_id` |
| Custom service worker | ❌ Using vite-plugin-pwa auto-generated |
| Permission prompt flow | ❌ No web permission request |
| Notification on order status | ❌ Need trigger on `food_orders` status change |
| Notification on chat message | ❌ Need trigger on `support_tickets` reply |
| Disable notifications setting | ⚠️ Partial (UI exists, not wired) |

---

## Implementation Plan

### A) Database: Extend Push Subscriptions for Web Users

**Migration:** Update `push_subscriptions` table to support all user types

```sql
-- Add user_id column (optional, for general users)
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update constraint to allow either driver_id or user_id
ALTER TABLE push_subscriptions 
DROP CONSTRAINT IF EXISTS push_subscriptions_driver_id_fkey;

-- Allow nullable driver_id
ALTER TABLE push_subscriptions 
ALTER COLUMN driver_id DROP NOT NULL;

-- Add index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON push_subscriptions(user_id);

-- RLS: Users can manage their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
ON push_subscriptions
FOR ALL
USING (user_id = auth.uid() OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));
```

### B) Secrets Required

| Secret | Purpose |
|--------|---------|
| `VAPID_PUBLIC_KEY` | Web Push public key (shared with client) |
| `VAPID_PRIVATE_KEY` | Web Push private key (server only) |
| `VAPID_SUBJECT` | Contact email (e.g., `mailto:push@hizivo.com`) |

**Generate VAPID keys:**
```bash
npx web-push generate-vapid-keys
```

### C) Hook: `useWebPush`

Create a new hook for web push subscriptions (separate from Capacitor).

**File to Create:** `src/hooks/useWebPush.ts`

```typescript
export function useWebPush() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  // Check support on mount
  useEffect(() => {
    const supported = 'PushManager' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);
  
  // Request permission and subscribe
  const subscribe = async () => {
    if (!isSupported) return null;
    
    const perm = await Notification.requestPermission();
    setPermission(perm);
    
    if (perm !== 'granted') return null;
    
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    // Save to database
    await supabase.functions.invoke('register-web-push', {
      body: {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!)))
        }
      }
    });
    
    setSubscription(sub);
    return sub;
  };
  
  const unsubscribe = async () => {...};
  
  return { isSupported, permission, subscription, subscribe, unsubscribe };
}
```

### D) Edge Function: `register-web-push`

Save web push subscriptions to database.

**File to Create:** `supabase/functions/register-web-push/index.ts`

```typescript
// Accepts: { endpoint, keys: { p256dh, auth } }
// Stores in push_subscriptions with user_id = auth.uid()
```

### E) Update: `send-push-notification` with Real Web Push

Implement actual web-push sending.

**File to Modify:** `supabase/functions/send-push-notification/index.ts`

```typescript
import webpush from 'npm:web-push';

// Configure VAPID
webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

async function sendWebPush(subscription, payload) {
  try {
    await webpush.sendNotification(
      JSON.parse(subscription), // { endpoint, keys: { p256dh, auth } }
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/pwa-icons/icon-192x192.png',
        badge: '/pwa-icons/icon-192x192.png',
        data: payload.data
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### F) Custom Service Worker

Create a custom service worker for notifications and caching.

**File to Create:** `public/sw.js`

```javascript
// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || '',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'ZIVO', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = getUrlForNotification(event.notification.data);
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing tab or open new
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

function getUrlForNotification(data) {
  switch (data?.type) {
    case 'order_status': return `/eats/orders/${data.order_id}`;
    case 'chat_message': return `/support/tickets/${data.ticket_id}`;
    case 'driver_assigned': return `/eats/orders/${data.order_id}`;
    default: return '/';
  }
}
```

### G) Update Vite Config for Custom SW

**File to Modify:** `vite.config.ts`

```typescript
VitePWA({
  // ... existing config
  strategies: 'injectManifest', // Use custom SW
  srcDir: 'public',
  filename: 'sw.js',
  injectManifest: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  },
})
```

### H) Component: `NotificationPermissionBanner`

Prompt users to enable notifications.

**File to Create:** `src/components/notifications/NotificationPermissionBanner.tsx`

**Show when:**
- User is logged in
- Permission is 'default' (not asked yet)
- User has placed at least one order

**UI:**
- Dismissible banner at top of page
- "Enable notifications for order updates?"
- "Enable" / "Not Now" buttons
- Dismiss stored in localStorage

### I) Trigger Notifications

#### 1. Order Status Change
**File to Modify:** Database trigger or edge function on `food_orders` status update

```sql
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Queue push notification
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      NEW.customer_id,
      'push',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Order Confirmed!'
        WHEN 'preparing' THEN 'Your order is being prepared'
        WHEN 'ready_for_pickup' THEN 'Order ready for pickup!'
        WHEN 'out_for_delivery' THEN 'Your order is on the way!'
        WHEN 'delivered' THEN 'Order delivered!'
      END,
      'Order #' || NEW.order_number,
      jsonb_build_object('type', 'order_status', 'order_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 2. New Chat Message / Support Reply
**File to Modify:** Trigger on `ticket_replies` insert

```sql
CREATE OR REPLACE FUNCTION notify_ticket_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket support_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
  
  -- Notify ticket owner if reply is from admin
  IF NEW.is_admin AND v_ticket.user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      v_ticket.user_id,
      'push',
      'Support Reply',
      LEFT(NEW.message, 100),
      jsonb_build_object('type', 'chat_message', 'ticket_id', NEW.ticket_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 3. Driver Assigned
Modify existing `eats-auto-dispatch` to send push to customer.

### J) Notification Settings Page

**File to Modify:** `src/pages/mobile/MobileAccount.tsx`

Add link to notification settings:
```typescript
{ icon: Bell, label: "Notification Settings", path: "/account/notifications" }
```

**File to Create:** `src/pages/account/NotificationSettings.tsx`

- Toggle: Order updates
- Toggle: Chat/Support messages
- Toggle: Price alerts
- Toggle: Promotions (opt-in)
- Button: Test notification
- Link: How to enable in browser settings

### K) Manifest Updates

**File to Modify:** `vite.config.ts` manifest section

```typescript
manifest: {
  name: "hiZIVO",
  short_name: "hiZIVO",
  start_url: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#0ea5e9",
  // ... rest same
}
```

### L) Safe Area Improvements

**File to Modify:** `src/index.css`

```css
/* iOS safe area for PWA */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top, 20px);
}
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useWebPush.ts` | Web Push subscription management |
| `src/components/notifications/NotificationPermissionBanner.tsx` | Permission prompt UI |
| `src/pages/account/NotificationSettings.tsx` | Notification preferences page |
| `supabase/functions/register-web-push/index.ts` | Save web push subscription |
| `public/sw.js` | Custom service worker for push handling |

### Modified Files
| File | Changes |
|------|---------|
| `vite.config.ts` | Update manifest name to "hiZIVO", configure custom SW |
| `supabase/functions/send-push-notification/index.ts` | Implement real web-push with VAPID |
| `src/pages/mobile/MobileAccount.tsx` | Add notification settings link |
| `src/index.css` | Add safe area CSS utilities |
| `src/App.tsx` | Add `/account/notifications` route |

### Database Migrations
| Migration | Purpose |
|-----------|---------|
| Extend `push_subscriptions` | Add `user_id` column, RLS policies |
| Add notification triggers | Order status + chat reply triggers |

---

## Notification Flow

```text
User opens app (first time or after login)
    ↓
NotificationPermissionBanner appears (if permission = 'default')
    ↓
User clicks "Enable"
    ↓
useWebPush.subscribe()
    ↓
Browser shows permission prompt
    ↓
User grants permission
    ↓
PushManager.subscribe() with VAPID key
    ↓
Call register-web-push edge function
    ↓
Store in push_subscriptions (user_id, endpoint, keys)
    ↓
Order status changes
    ↓
Database trigger → Insert to notifications
    ↓
Cron job / webhook calls send-push-notification
    ↓
web-push sends to endpoint
    ↓
Service worker receives push event
    ↓
Shows native notification
    ↓
User clicks notification
    ↓
Opens app to /eats/orders/{id}
```

---

## Security Considerations

1. **VAPID Keys**: Private key stored as secret, public key embedded in client
2. **User Validation**: Only authenticated users can register subscriptions
3. **RLS Policies**: Users can only manage their own subscriptions
4. **Notification Targeting**: Server validates user owns the order before sending
5. **Unsubscribe**: Users can disable in settings or browser

---

## Offline Support

The vite-plugin-pwa already provides:
- Precaching of static assets (JS, CSS, HTML, icons)
- Runtime caching for images and fonts
- Network-first for API calls

Enhanced with custom SW:
- Show cached order history when offline
- Queue actions (like rating) for when online
- Display "You're offline" banner

---

## Summary

This implementation adds:

1. **Web Push Notifications**: Full VAPID-based web push for all users
2. **Permission Flow**: Banner prompting users to enable notifications
3. **Order/Chat Triggers**: Automatic notifications on status changes
4. **Custom Service Worker**: Push handling + notification click navigation
5. **Settings Page**: User control over notification preferences
6. **Manifest Updates**: Rename to "hiZIVO", ensure standalone mode
7. **Safe Area CSS**: Proper spacing for iPhone notch/home indicator
