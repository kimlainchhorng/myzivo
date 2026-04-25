# Plan — Facebook-style Notifications Panel in Account

## Goal
Replace the current mid-page notifications card on the Profile/Account screen with a polished, Facebook-style notifications popover that opens directly under the bell icon in the sticky header, stays inside the Account context, and feels native on mobile.

## Problems with current behavior
- Panel renders far below the header (inserted between Stories and Content Tabs), so tapping the bell visually "jumps" the user mid-page.
- Items are minimal (title + body), no avatar, no timestamp, no read state.
- Tapping any item closes the panel and navigates away to `/notifications` — defeats the "stay in account" feel.
- Footer has redundant "View All / Close" buttons (modal-like), unlike Facebook's quick popover.
- No "Mark all as read", no per-item read styling, no grouping (Today / Earlier).

## What we'll build (`src/pages/Profile.tsx`)

1. **Anchor the panel to the bell**
   - Move the `<AnimatePresence>` notif panel out of the `ParallaxSection` between Stories and Tabs.
   - Render it as a fixed/absolute popover positioned directly under the sticky header bell, with a small caret pointing up at the bell.
   - Width: `min(92vw, 380px)`, right-aligned to the bell icon. On lg+ screens render as a normal dropdown.

2. **Facebook-style header**
   - Title row: "Notifications" (bold, 16px) + small "Mark all as read" text-button on the right (only when unread > 0).
   - Optional segmented chips: `All` | `Unread` (defaults to All).

3. **Rich notification rows**
   - Each row: avatar (actor or themed icon bubble) · 2-line title/body · relative timestamp (e.g. "3m", "1h", "Yesterday") · unread blue dot on the far right.
   - Unread rows have subtle `bg-primary/5` tint; read rows are transparent.
   - Long-press / kebab menu (3-dot) per row: "Mark as read", "Hide this notification" (UI only for now; mark-as-read wired to `markAsRead([id])`).

4. **Smart routing on tap**
   - Tap a row: call `markAsRead([id])`, then route to the notification's deep link if present (use `n.data?.deepLink` / type-based fallback similar to `useRideNotifications.defaultDeepLink`).
   - If the notification target is an in-account surface (friend requests, profile views, comments on own posts), navigate within the account stack so user stays in the Account tab.
   - Friend Requests row keeps its dedicated entry pointing at `/notifications?tab=requests`.

5. **Empty + loading states**
   - Empty: small bell illustration, "You're all caught up" copy.
   - Loading: 3 skeleton rows.

6. **Footer**
   - Single subtle link: "See all notifications" → `/notifications` (replaces the View All / Close buttons).

7. **Dismiss behavior (in-account feel)**
   - Click outside / Escape closes the panel (use a lightweight outside-click handler).
   - Bell tap toggles open/close.
   - Panel persists across re-renders within the page (already using `sessionStorage` key `zivo:profile:notif-panel`).
   - Removes the inline `ParallaxSection index={2.1}` wrapper so the page layout no longer reflows when opening.

8. **Bell affordances**
   - Keep unread dot/count badge on the bell.
   - When panel is open, bell gets `bg-primary/15` ring to indicate active state (already partially implemented).

9. **Accessibility**
   - `role="dialog"` + `aria-label="Notifications"` on the popover container.
   - Focus trap while open; return focus to bell on close.
   - Each row is a real `<button>` with `aria-label` describing actor + action.

## Technical notes
- All work in `src/pages/Profile.tsx`. No new files needed.
- Use existing `useNotifications(20)` hook — already exposes `markAsRead`, `markAllAsRead`, `notifications`, `unreadCount`.
- Reuse `formatDistanceToNowStrict` from `date-fns` (already in deps) for relative time.
- Position the popover with `absolute top-full right-0 mt-2` inside a `relative` wrapper around the bell button in the sticky header (the header is already `fixed`, so the popover will follow it during scroll — bonus Facebook-like behavior).
- Add `useEffect` outside-click listener tied to a ref on the popover + bell.
- Keep current scroll-based `overCover` styling intact; popover always uses solid `bg-card` regardless of cover state for legibility.

## Files to edit
- `src/pages/Profile.tsx` — replace mid-page notif `ParallaxSection` with header-anchored popover; refactor item rendering; wire `markAsRead`.

## Out of scope
- No DB migrations.
- No changes to the dedicated `/notifications` page or `useNotifications` hook.
- No new routes.
