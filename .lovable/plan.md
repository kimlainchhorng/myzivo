

# Group Orders -- Share a Cart with Friends

## Overview

Allow a customer to start a "Group Order" session on a restaurant page, generate a shareable invite link, and let others join and add their own items to a shared cart. When everyone is ready, the host checks out and pays for the whole order.

## Database Changes

### New table: `group_order_sessions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| restaurant_id | uuid (FK) | Restaurant this group order is for |
| host_user_id | uuid (FK) | User who started the session |
| invite_code | text (unique) | 6-character shareable code |
| status | text | `open`, `locked`, `checked_out`, `cancelled` |
| deadline | timestamptz | Optional auto-lock timer |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### New table: `group_order_items`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| session_id | uuid (FK) | References group_order_sessions |
| user_id | uuid | Who added this item |
| user_name | text | Display name of the person |
| menu_item_id | uuid (FK) | References menu_items |
| item_name | text | Snapshot of item name |
| price | numeric | Snapshot of price |
| quantity | int | |
| notes | text | Special instructions |
| created_at | timestamptz | |

RLS policies will allow:
- Host can read/write all items in their session
- Participants can read all items but only write their own
- Anyone with the invite code can join (insert their items)

## New Files

### 1. `src/hooks/useGroupOrder.ts`

Central hook managing all group order logic:
- **`startGroupOrder(restaurantId)`** -- creates a session, generates an invite code, returns the code
- **`joinGroupOrder(inviteCode)`** -- validates code, returns session info (restaurant, host name, items so far)
- **`addGroupItem(sessionId, item)`** -- inserts item tagged with the current user's ID and name
- **`removeGroupItem(itemId)`** -- only allowed for the item's owner
- **`lockSession(sessionId)`** -- host-only; sets status to `locked`, preventing further additions
- **`useGroupSession(sessionId)`** -- real-time subscription to session status and all items via Supabase Realtime
- **`convertToCart(sessionId)`** -- for checkout: pulls all group items into the regular cart context

### 2. `src/pages/EatsGroupOrder.tsx`

Route: `/eats/group/:inviteCode`

The shared group order page that both host and participants see:
- **Header**: Restaurant name, group order status badge, invite code display
- **Invite section** (host only): Shareable link with copy button, plus a share sheet
- **Shared cart view**: Items grouped by person with each person's name as a section header, individual item prices, and a running total at the bottom
- **"Add Items" button**: Opens the restaurant menu (navigates to `/eats/restaurant/:id?group=SESSION_ID`) so users can browse and add
- **Timer** (optional): If host set a deadline, show countdown. When it hits zero, session auto-locks
- **Lock/Checkout button** (host only): Locks the session and navigates to regular checkout with all items loaded

### 3. `src/components/eats/GroupOrderBanner.tsx`

A banner shown on the restaurant menu page when the user is in an active group order session (detected via `?group=SESSION_ID` query param). Shows:
- "You're adding to [Host]'s group order"
- Item count badge for how many items the current user has added
- "Done Adding" button to go back to the group order page

### 4. `src/components/eats/StartGroupOrderButton.tsx`

Button shown on the restaurant menu page header area. When tapped:
- If user is not logged in, prompts login
- Creates a group order session
- Navigates to `/eats/group/:inviteCode`

## Modified Files

### 5. `src/pages/EatsRestaurantMenu.tsx`

- Add `StartGroupOrderButton` next to the restaurant name/header area
- Detect `?group=SESSION_ID` query param; if present, show `GroupOrderBanner` and route "Add to Cart" actions through the group order hook instead of the regular cart

### 6. `src/components/eats/MenuItemModal.tsx`

- When in group order mode (session ID in URL), the "Add to Cart" button calls `addGroupItem` instead of the regular `addItem`, tagging the item with the user's name
- Button text changes to "Add to Group Order"

### 7. `src/App.tsx`

- Register new route: `/eats/group/:inviteCode` pointing to `EatsGroupOrder`

### 8. `src/pages/EatsCheckout.tsx`

- When arriving from a group order (detected via session ID in state/params), show a "Group Order" badge at the top
- Display items grouped by person name in the order summary for clarity

## User Flow

```text
Host                              Friends
  |                                  |
  |-- Taps "Start Group Order" ----->|
  |                                  |
  |-- Shares invite link ----------->|
  |                                  |
  |   (everyone browses menu         |
  |    and adds their items)         |
  |                                  |
  |-- Sees all items in real-time -->|
  |                                  |
  |-- Taps "Lock & Checkout" ------->|
  |                                  |
  |-- Pays for entire order -------->|
  |                                  |
  |-- Order placed ----------------->|
```

## Real-Time Sync

The group order page subscribes to Supabase Realtime on both `group_order_sessions` (for status changes) and `group_order_items` (for item additions/removals). All participants see updates instantly without refreshing.

## Edge Cases

- **User not logged in**: Prompted to log in or sign up before joining/starting a group order
- **Wrong restaurant**: If a participant tries to add items from a different restaurant, they're blocked with a message
- **Session already locked/checked out**: Late joiners see a read-only view with a message that the order has been finalized
- **Host leaves page**: Session persists in the database; host can return via the same invite link
- **Empty group order**: Host cannot check out if total items is zero
- **Timer expires**: Session auto-locks via a `useEffect` interval check; participants see "Time's up" and can no longer add items

## Split Payment (Future)

The plan includes a "One person pays" flow only. The checkout page will show a subtle "Split payment coming soon" label as a placeholder for a future iteration.

