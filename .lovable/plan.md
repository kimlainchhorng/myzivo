

# PWA Infrastructure Implementation (VAPID Deferred)

## Overview
Implement all PWA enhancements and Web Push infrastructure now. VAPID keys will be configured in a future update - the system will be ready to activate once secrets are added.

---

## Implementation Scope

### ✅ Implementing Now
| Feature | Description |
|---------|-------------|
| Database migration | `user_id` on `push_subscriptions`, notification triggers |
| Custom service worker | Push handler, click routing, caching |
| Vite config updates | Manifest "hiZIVO", injectManifest strategy |
| `useWebPush` hook | Permission management, subscription logic |
| Permission banner | UI prompt for enabling notifications |
| Notification settings | User preference page at `/account/notifications` |
| Edge functions | `register-web-push`, updated `send-push-notification` |
| Safe area CSS | iOS PWA bottom spacing |

### ⏸️ Deferred to Next Update
| Secret | Purpose |
|--------|---------|
| `VAPID_PUBLIC_KEY` | Client subscription key |
| `VAPID_PRIVATE_KEY` | Server push signing |
| `VAPID_SUBJECT` | Contact email identifier |

---

## Database Migration

```sql
-- 1. Extend push_subscriptions for all users
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE push_subscriptions 
ALTER COLUMN driver_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON push_subscriptions(user_id);

-- 2. RLS policy for user subscriptions
CREATE POLICY "Users can manage own push subscriptions"
ON push_subscriptions FOR ALL
USING (user_id = auth.uid() OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));

-- 3. Trigger: Order status notifications
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      NEW.customer_id,
      'push',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Order Confirmed! 🎉'
        WHEN 'preparing' THEN 'Your order is being prepared 👨‍🍳'
        WHEN 'ready_for_pickup' THEN 'Order ready for pickup! 📦'
        WHEN 'out_for_delivery' THEN 'Your order is on the way! 🚗'
        WHEN 'delivered' THEN 'Order delivered! ✅'
        ELSE 'Order Update'
      END,
      'Order #' || NEW.order_number,
      jsonb_build_object('type', 'order_status', 'order_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_order_status
AFTER UPDATE ON food_orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_status_change();

-- 4. Trigger: Support reply notifications
CREATE OR REPLACE FUNCTION notify_ticket_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket support_tickets%ROWTYPE;
BEGIN
  SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
  
  IF NEW.is_admin AND v_ticket.user_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, channel, title, body, data)
    VALUES (
      v_ticket.user_id,
      'push',
      'Support Reply 💬',
      LEFT(NEW.message, 100),
      jsonb_build_object('type', 'chat_message', 'ticket_id', NEW.ticket_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_ticket_reply
AFTER INSERT ON ticket_replies
FOR EACH ROW
EXECUTE FUNCTION notify_ticket_reply();
```

---

## New Files

### 1. Custom Service Worker
**File:** `public/sw.js`

```javascript
// hiZIVO Service Worker
// Handles push notifications and caching

// Import Workbox from CDN (injected by vite-plugin-pwa)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precache manifest (injected by vite-plugin-pwa)
self.__WB_MANIFEST;

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || '',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'hiZIVO', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  let urlToOpen = '/';
  
  // Route based on notification type
  switch (data?.type) {
    case 'order_status':
      urlToOpen = `/eats/orders/${data.order_id}`;
      break;
    case 'chat_message':
      urlToOpen = `/support/tickets/${data.ticket_id}`;
      break;
    case 'driver_assigned':
      urlToOpen = `/eats/orders/${data.order_id}`;
      break;
    default:
      urlToOpen = data?.url || '/';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if possible
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});
```

### 2. Web Push Hook
**File:** `src/hooks/useWebPush.ts`

- Check browser support for PushManager
- Track permission state (`default`, `granted`, `denied`)
- Subscribe to push with VAPID public key
- Register subscription via edge function
- Unsubscribe and remove from database
- Placeholder for VAPID key (will work once configured)

### 3. Permission Banner
**File:** `src/components/notifications/NotificationPermissionBanner.tsx`

- Animated banner at top of screen
- Shows when: logged in + permission = 'default' + not dismissed
- "Enable" button triggers `useWebPush.subscribe()`
- "Not now" stores dismissal in localStorage
- Auto-hides after 10 seconds

### 4. Notification Settings Page
**File:** `src/pages/account/NotificationSettings.tsx`

- Route: `/account/notifications`
- Toggles for notification types:
  - Order updates
  - Chat/support messages
  - Price alerts
  - Promotions (opt-in)
- Current permission status display
- "Enable Notifications" button if not granted
- Instructions for browser settings
- Test notification button

### 5. Edge Function: Register Web Push
**File:** `supabase/functions/register-web-push/index.ts`

- Accepts: `{ endpoint, keys: { p256dh, auth } }`
- Validates authenticated user
- Upserts to `push_subscriptions` with `user_id`
- Returns subscription ID

### 6. Edge Function: Send Push (Updated)
**File:** `supabase/functions/send-push-notification/index.ts`

- Import `web-push` npm package
- Configure VAPID (uses env vars, will work when secrets added)
- Query `push_subscriptions` for user
- Send notification via web-push
- Handle subscription expiration

---

## Modified Files

### 1. Vite Config
**File:** `vite.config.ts`

Changes:
- Update manifest `name` and `short_name` to "hiZIVO"
- Switch to `injectManifest` strategy
- Configure `srcDir: 'public'`, `filename: 'sw.js'`
- Keep existing runtime caching rules

### 2. Index CSS
**File:** `src/index.css`

Add safe area utilities:
```css
/* iOS PWA safe area support */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
.pb-safe {
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
}
```

### 3. App Routes
**File:** `src/App.tsx`

Add route:
```typescript
const NotificationSettings = lazy(() => import("./pages/account/NotificationSettings"));
// Route: /account/notifications
```

### 4. Mobile Account Page
**File:** `src/pages/mobile/MobileAccount.tsx`

Add menu item:
```typescript
{ icon: Bell, label: "Push Notifications", path: "/account/notifications" }
```

---

## File Summary

### New Files (6)
| File | Purpose |
|------|---------|
| `public/sw.js` | Custom service worker with push handling |
| `src/hooks/useWebPush.ts` | Web push subscription management |
| `src/components/notifications/NotificationPermissionBanner.tsx` | Enable notifications prompt |
| `src/pages/account/NotificationSettings.tsx` | User notification preferences |
| `supabase/functions/register-web-push/index.ts` | Save push subscriptions |
| Migration SQL | Database changes |

### Modified Files (4)
| File | Changes |
|------|---------|
| `vite.config.ts` | Manifest name, injectManifest strategy |
| `src/index.css` | Safe area CSS utilities |
| `src/App.tsx` | Add `/account/notifications` route |
| `src/pages/mobile/MobileAccount.tsx` | Add notifications menu item |
| `supabase/functions/send-push-notification/index.ts` | Implement web-push sending |

---

## Activation Flow

After this implementation:

```text
1. All infrastructure ready
2. UI shows permission banner (will request but fail without VAPID)
3. Settings page accessible at /account/notifications
4. Database triggers queue notifications

When VAPID secrets added later:
5. useWebPush.subscribe() succeeds
6. Subscriptions stored in database
7. Order/chat triggers → send-push-notification → web-push delivery
8. Service worker shows notification
9. Click opens correct app route
```

---

## VAPID Keys (For Future Reference)

Generate with:
```bash
npx web-push generate-vapid-keys
```

Add as secrets:
- `VAPID_PUBLIC_KEY` - Also embed in client code
- `VAPID_PRIVATE_KEY` - Server only
- `VAPID_SUBJECT` - `mailto:push@hizivo.com`

