

# Social Sharing — Implementation Plan

## Overview
Add a reusable social sharing component for restaurants and meals, integrate it into the restaurant menu page, log all share events to the existing `share_events` table, and add referral sharing with tracking for link opened and order attribution.

---

## Current State

| What Exists | Where |
|-------------|-------|
| `share_events` DB table | `entity_id`, `entity_type`, `platform`, `user_id` |
| `ReferralCard` component | Full referral share UI (copy, email, WhatsApp, native) |
| `FlightSocialShare` component | Social share for flights (Twitter, FB, copy link) |
| `useReferrals` hook | `shareReferral`, `copyReferralLink`, `getShareUrl` |
| `navigator.share` pattern | Used in 4+ components already |

### What's Missing
- No share button on restaurant pages
- No reusable share sheet component for Eats
- No share event logging (table exists but nothing writes to it)
- No tracking for "link opened" or "order from shared link"

---

## Implementation Plan

### 1) Create Reusable `SocialShareSheet` Component

**File to Create:** `src/components/shared/SocialShareSheet.tsx`

A bottom-sheet style share dialog usable across Eats, restaurants, and referrals. Options:
- **Copy Link** — clipboard copy with toast
- **WhatsApp** — `https://wa.me/?text=...`
- **SMS** — `sms:?body=...`
- **Facebook** — `https://facebook.com/sharer/sharer.php?u=...`
- **Native Share** — `navigator.share()` fallback for mobile

Props:
```text
{
  title: string;          // "Check out Burger Palace on ZIVO!"
  text: string;           // Share message body
  url: string;            // The shareable URL
  entityId: string;       // For tracking (restaurant ID, menu item ID)
  entityType: string;     // "restaurant" | "menu_item" | "referral"
  trigger?: ReactNode;    // Custom trigger button
}
```

Uses a Radix Dialog/Sheet (vaul) for mobile-friendly bottom sheet.

### 2) Create `useShareTracking` Hook

**File to Create:** `src/hooks/useShareTracking.ts`

Logs share events to the existing `share_events` table.

```text
logShare({ entityId, entityType, platform })
  → INSERT into share_events (user_id, entity_id, entity_type, platform)
```

Also handles UTM-tagged share URLs:
- Generates shareable URLs with `?utm_source=share&utm_medium={platform}&utm_content={entityId}`
- These UTM params enable "link opened" tracking via existing `initUTMTracking` on page load

### 3) Add Share Button to Restaurant Menu Page

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

Add a Share button next to the `RestaurantAvailabilityBadge` in the restaurant header area (line ~350). When tapped, opens the `SocialShareSheet` with:
- Title: restaurant name
- URL: `/eats/restaurant/{id}`
- Entity type: `restaurant`

### 4) Add Referral CTA to Share Sheet

When sharing a restaurant, include a secondary section: "Invite friends and earn credits" with the user's referral link (from `useReferrals`). This reuses the existing referral code system.

### 5) Track "Link Opened" via UTM Parameters

**File to Modify:** `src/pages/EatsRestaurantMenu.tsx`

On page mount, check for `utm_source=share` in URL params. If present, log a "link_opened" event to `share_events` with entity_type "restaurant_view".

### 6) Track "Order from Shared Link"

**File to Modify:** `src/pages/EatsCheckout.tsx`

When placing an order, check if the session has share UTM attribution (from `getPersistedUTMParams`). If `utm_source=share`, include `shared_entity_id` in the order metadata or log a "share_conversion" event.

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/components/shared/SocialShareSheet.tsx` | Reusable share bottom sheet with platform options |
| `src/hooks/useShareTracking.ts` | Log share/open/conversion events to `share_events` table |

### Modified Files (2)
| File | Changes |
|------|---------|
| `src/pages/EatsRestaurantMenu.tsx` | Add Share button in header, track link opens |
| `src/pages/EatsCheckout.tsx` | Track order conversion from shared links |

---

## Share Flow

```text
User taps "Share" on restaurant page
       |
       v
SocialShareSheet opens (bottom sheet)
       |
       ├── Copy Link → clipboard + log share_event (platform: "copy")
       ├── WhatsApp → wa.me link + log share_event (platform: "whatsapp")
       ├── SMS → sms: link + log share_event (platform: "sms")
       ├── Facebook → fb sharer + log share_event (platform: "facebook")
       └── Native → navigator.share + log share_event (platform: "native")
       |
       v
Shared URL includes: ?utm_source=share&utm_medium=whatsapp&utm_content=restaurant_123
       |
       v
Recipient opens link
       |
       ├── Restaurant page detects utm_source=share → logs "link_opened" event
       └── UTM params persisted in sessionStorage
       |
       v
If recipient places order
       └── Checkout detects share attribution → logs "share_conversion" event
```

---

## Share Sheet Design

```text
+----------------------------------------------+
|  Share Burger Palace                         |
|                                              |
|  [Copy Link]  [WhatsApp]  [SMS]  [Facebook]  |
|                                              |
|  ─────────────────────────────────────────── |
|                                              |
|  Invite friends & earn credits               |
|  Share your referral link:                   |
|  [Copy Referral Link]  [Share Referral]      |
+----------------------------------------------+
```

---

## Tracking Events Logged

| Event | When | Fields |
|-------|------|--------|
| `share` | User shares a restaurant/meal | entity_id, entity_type, platform |
| `link_opened` | Someone opens a shared link | entity_id, entity_type=restaurant_view, platform=web |
| `share_conversion` | Order placed from shared link | entity_id=order_id, entity_type=share_conversion |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Not logged in | Share still works; event logged without user_id |
| Native share unavailable | Button hidden, other options remain |
| Facebook blocked/unavailable | Button still renders, opens in new tab |
| No referral code | Referral section hidden in share sheet |

