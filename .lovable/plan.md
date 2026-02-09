

# Smart Notifications — Add Missing Categories

## Current State

The `/account/notifications` page is already fully built with:
- Push, SMS, and Email channel controls
- Notification type toggles for: Order Updates, Chat & Support, Price Alerts, Deals & Promotions
- Automated Messages section (cart reminders, re-engagement, birthday)
- Quiet hours, phone verification, and consent flows

The order lifecycle notifications (confirmed, driver assigned, driver arriving, delivered) are already covered under "Order Updates."

## What's Missing

Two notification categories the user requested are not present:
1. **Rewards** — notifications about loyalty tier changes, points earned, referral rewards credited
2. **Announcements** — platform updates, new features, service area expansions

## Changes

### File: `src/pages/account/NotificationSettings.tsx` (Update)

Add two new entries to the `NOTIFICATION_CATEGORIES` array:

| Category | ID | Icon | Description | Default |
|---|---|---|---|---|
| Rewards & Loyalty | `rewards` | Crown | Points earned, tier upgrades, and referral rewards | Enabled |
| Announcements | `announcements` | Info | New features, service updates, and platform news | Disabled (opt-in) |

This adds the `Crown` icon import (already available in other files) and two new toggle rows in the existing "Notification Types" card. No new files, hooks, or pages needed — it's a single-file update adding roughly 15 lines.

### Updated category list after change

1. Order Updates (existing)
2. Chat & Support (existing)
3. Price Alerts (existing)
4. Rewards & Loyalty (new)
5. Deals & Promotions (existing)
6. Announcements (new)

