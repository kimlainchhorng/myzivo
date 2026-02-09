
# Notification Center — Implementation Plan

## Overview
Create a unified `/notifications` page where customers can view all their notifications in one place, including order updates, promotions, support messages, and delay alerts. The page will support filtering by category, mark as read functionality, and integrate with the existing notification hooks.

## Current State Analysis

### What Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| Core notifications hook | Complete | `src/hooks/useNotifications.ts` |
| Eats-specific alerts hook | Complete | `src/hooks/useEatsAlerts.ts` |
| NotificationBell dropdown (desktop) | Complete | `src/components/notifications/NotificationBell.tsx` |
| EatsAlerts page (Eats-only) | Complete | `src/pages/EatsAlerts.tsx` |
| Notification Settings page | Complete | `src/pages/account/NotificationSettings.tsx` |
| Real-time subscriptions | Complete | In both hooks |
| Category types in DB | Complete | `transactional`, `account`, `operational`, `marketing` |
| Bell icon in ZivoSuperAppLayout | Partial | Links to `/notifications` (page missing) |
| Bell icon in Header | Complete | Shows NotificationBell dropdown |

### What's Missing
| Feature | Status | Description |
|---------|--------|-------------|
| Unified /notifications page | Missing | Full-page notification center |
| Category filter tabs | Missing | Filter by order/promo/support/delay |
| Bell icon in AppHeader | Missing | Consistent bell across mobile headers |
| Route registration | Missing | Add route to App.tsx |
| Unified hook combining sources | Optional | Could merge general + eats alerts |

---

## Implementation Plan

### 1) Create Unified Notifications Page

**File to Create:** `src/pages/NotificationsPage.tsx`

**Purpose:** Full-page notification center accessible at `/notifications`.

**Features:**
- Filter tabs: All, Orders, Promotions, Support, Delays
- Unread count badge on tabs
- Mark as read (single + all)
- Empty state per category
- Click to navigate to action_url
- Real-time updates via existing hook

**UI Design:**
```text
┌─────────────────────────────────────────────────┐
│ ← Notifications               [Mark all read ✓] │
│    12 unread                                    │
├─────────────────────────────────────────────────┤
│ [All] [Orders] [Promos] [Support] [Delays]     │
├─────────────────────────────────────────────────┤
│ ● Order Confirmed                         2m   │
│   Your order from Burger Palace is...          │
│                                                 │
│   Your ZIVO+ membership renewed           1h   │
│   Payment of $9.99 processed                   │
│                                                 │
│ ● Price Drop Alert!                       3h   │
│   NYC-Paris flights dropped to $450            │
└─────────────────────────────────────────────────┘
```

**Category Mapping:**
| Category | Filter Tab | Icon |
|----------|------------|------|
| transactional | Orders | Package |
| marketing | Promotions | Gift |
| operational | Support | Headphones |
| account | Account | User |
| delay alerts (template contains "delay") | Delays | Clock |

---

### 2) Create Notification Item Component

**File to Create:** `src/components/notifications/NotificationItem.tsx`

**Purpose:** Reusable notification list item with consistent styling.

**Props:**
- notification object
- onMarkAsRead callback
- onClick navigation handler

**Features:**
- Unread indicator dot
- Category badge with color
- Relative timestamp
- Action arrow if has action_url
- Tap to mark read + navigate

---

### 3) Update AppHeader with Bell Icon

**File to Modify:** `src/components/app/AppHeader.tsx`

**Changes:**
- Add Bell icon button with unread badge
- Use `useNotifications` hook for count
- Navigate to `/notifications` on click
- Show badge only when unread > 0

**New Default Right Action:**
```tsx
<button onClick={() => navigate('/notifications')} className="relative ...">
  <Bell className="w-5 h-5" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px]">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</button>
```

---

### 4) Add Route to App.tsx

**File to Modify:** `src/App.tsx`

**Changes:**
- Import `NotificationsPage` (lazy load)
- Add route: `/notifications` with ProtectedRoute wrapper

**Route Definition:**
```tsx
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
```

---

### 5) Enhanced useNotifications Hook (Optional Enhancement)

**File to Modify:** `src/hooks/useNotifications.ts`

**Potential Changes:**
- Add category filter parameter
- Return grouped counts by category
- Support pagination/infinite scroll

**New Return Values:**
```typescript
interface UseNotificationsResult {
  // Existing...
  categoryCounts: {
    orders: number;
    promos: number;
    support: number;
    delays: number;
  };
  filterByCategory: (category: string | null) => void;
}
```

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/pages/NotificationsPage.tsx` | Unified notification center page |
| `src/components/notifications/NotificationItem.tsx` | Reusable notification list item |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add /notifications route |
| `src/components/app/AppHeader.tsx` | Add bell icon with unread badge |

---

## Notification Categories

| Category | Display Name | Color | Icon |
|----------|--------------|-------|------|
| transactional | Orders | Primary (blue) | Package |
| marketing | Promotions | Emerald (green) | Gift |
| operational | Support | Amber (orange) | Headphones |
| account | Account | Blue | User |

**Special Handling:**
- Delay alerts: Identified by `template` containing "delay" or `title` containing "Delayed"
- Shows in dedicated "Delays" tab with Clock icon and red styling

---

## Filter Tabs Logic

```text
All: Show all notifications
Orders: category = 'transactional'
Promos: category = 'marketing'  
Support: category = 'operational'
Delays: template LIKE '%delay%' OR title LIKE '%Delayed%'
```

---

## Empty States

| Tab | Empty Message |
|-----|---------------|
| All | "No notifications yet. You'll see updates here." |
| Orders | "No order updates yet. Place an order to get started." |
| Promos | "No promotions right now. Check back for deals!" |
| Support | "No support messages. Need help? Contact us." |
| Delays | "No delay alerts. Your orders are on time!" |

---

## Real-Time Updates

The page will leverage existing real-time subscriptions:
- `useNotifications` already subscribes to INSERT events
- New notifications appear at top of list instantly
- Unread count updates automatically
- Toast shown for incoming notifications

---

## Navigation Integration

| Entry Point | Action |
|-------------|--------|
| Header NotificationBell dropdown | "View all" → `/notifications` |
| AppHeader bell icon | Click → `/notifications` |
| ZivoSuperAppLayout bell | Click → `/notifications` |
| Push notification tap | Deep link to `/notifications` or specific order |

---

## Accessibility

- Proper aria-labels on bell icons
- Focus management for tab navigation
- Screen reader announcements for new notifications
- Keyboard navigation support

---

## Summary

This implementation creates a unified notification center that:

1. **Consolidates all notifications** — Orders, promotions, support, delays in one view
2. **Category filtering** — Easy tab-based filtering by notification type
3. **Mark as read** — Single item and bulk mark as read actions
4. **Unread badge** — Consistent bell icon with count across app headers
5. **Real-time updates** — New notifications appear instantly
6. **Mobile-first design** — Touch-friendly interface matching ZIVO design system
7. **Deep linking** — Click to navigate to relevant content

The feature provides customers with a central hub to stay informed about all their ZIVO activity.
