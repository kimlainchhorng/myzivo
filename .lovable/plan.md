# Plan — Notifications Panel Polish (Account)

The Facebook-style popover in `src/pages/Profile.tsx` is already live with: bell-anchored dropdown, in-place rendering, filter chips, mark-all action, rich rows with icon + relative time, unread dots, tap-to-mark-read, smart deep-link routing, and outside-click/Escape close. This plan adds the remaining polish requested.

## Changes (all in `src/pages/Profile.tsx`)

### 1. Smarter deep-link routing
Expand `resolveNotifLink` to cover all common Account notification types and use IDs from `metadata`:
- `friend`/`follow` → `/notifications?tab=requests`
- `message`/`chat` → `/chat/{thread_id}` or `/chat`
- `comment`/`like`/`reaction`/`mention`/`post` → `/post/{post_id}` or `/feed`
- `ride`/`trip`/`driver` → `/ride/track/{job_id}` or `/rides`
- `order`/`delivery` → `/orders/{order_id}` or `/account/orders`
- `wallet`/`payout`/`payment` → `/wallet`
- `verification`/`verify` → `/account/verification`
- `security`/`login` → `/account/security`
- `promo`/`coupon` → `/wallet/promos`
- Falls back to `n.action_url` first, then `metadata.deepLink/deep_link/url`.

### 2. Visible "Mark all read" confirmation
- Wrap `markAllAsRead()` in a `handleMarkAllRead` callback.
- On success: `toast.success("All notifications marked as read")`.
- On error: `toast.error("Couldn't mark all as read")`.
- Button hidden once `notifUnreadCount === 0` (already gated).

### 3. Actor avatars in rows
- For each notification, prefer `metadata.actor_avatar_url` / `metadata.avatar_url` / `metadata.image_url` and render a real `<Avatar>` with fallback initials from `metadata.actor_name` or the title.
- When no actor image is available, keep the current category-coloured icon bubble (transactional/operational/marketing/account) so the row never feels empty.

### 4. Smooth in-place read transitions
- Wrap the row list in `<AnimatePresence initial={false}>` and key each row by `n.id`.
- Animate `bg-primary/[0.06] → transparent` and the unread dot's `opacity/scale` with a 180ms spring when `is_read` flips, so tapping a row visually "settles" without re-mounting.
- Unread → read transition keeps the row in place; only the dot fades and the background tint relaxes.

### 5. Consistent spacing and density
- Standardize row padding to `p-2.5`, gap `gap-3`, avatar `h-10 w-10`, body `text-xs line-clamp-2`, time `text-[10px]` — matches Facebook's compact dropdown.
- Sticky header inside the popover (`sticky top-0 bg-card`) so the title + Mark all read stay visible while scrolling long lists.

### 6. Minor a11y / UX
- Add `aria-live="polite"` region around the count badge so screen readers announce unread changes.
- Friend Requests pinned row already has its own deep link (`/notifications?tab=requests`) — keep as-is.

## Files to edit
- `src/pages/Profile.tsx` — only file touched.

## Out of scope
- No DB / hook / route changes.
- No new components.
