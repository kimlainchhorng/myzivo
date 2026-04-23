

## Notification Polish: Deep Links, Haptics, Dedup & Contrast

Tighten the notification system so every ride alert, chat ping, and tap behaves consistently and looks crisp on both mobile platforms.

### What you'll see

- **Tap "Track" on a ride alert** → opens the live ride screen for that exact job.
- **Tap "Reply" on a chat toast** → opens that conversation directly.
- **Tap "View" on a promo** → opens the promo/wallet page.
- **Subtle haptic tick** when you tap any action button on a toast (light impact on iOS/Android, no-op on web).
- **No more duplicate chat alerts** — multiple messages from the same person collapse into one notification on iOS/Android (web push), and ride events from the same job replace prior ones instead of stacking.
- **Cleaner colors in dark mode**: rings and icon pills use stronger contrast (15% → 25% opacity rings, foreground-aware icon backgrounds), text stays legible on Safari's translucent dark backdrop.

### Technical Plan

**1. `src/hooks/useRideNotifications.ts`** — accept job/ride context + deep link
- Extend `notify()` signature: `notify(event, { body?, userId?, jobId?, onAction? })`.
- Build default deep links per event:
  - `driver_assigned`/`driver_en_route`/`driver_arrived`/`trip_started` → `/ride/track/{jobId}`
  - `trip_completed` → `/ride/summary/{jobId}` (fallback `/rides/history`)
  - `trip_cancelled` → `/rides`
  - `surge_alert` → `/rides`
  - `promo_available` → `/wallet/promos`
- Pass `actionLabel` ("Track", "Rate", "View") + `onAction` (navigate via a stored `navigate` ref from `useNavigate()`).
- Remove the existing `showNotification.ride(...)` call duplication and route everything through `notify.ride(event, { ..., actionLabel, onAction, onBodyClick })`. No raw `toast.*` calls left.
- Add `tag`-style dedup for native `LocalNotifications`: use deterministic `id` derived from `hash(jobId + event)` so the same event for the same job replaces instead of stacking.

**2. `src/lib/notify.ts`** — wire haptics into action taps
- Import `Haptics` lazily (mirror `useHaptics.ts` lazy-loader pattern; cannot use the hook here since this is a plain module).
- In `NotificationToastCard`, when `onAction` fires, call `Haptics.impact({ style: Light })` before invoking the callback. Same lighter tick for `onBodyClick`. Web stays silent (try/catch).
- Add an optional `href?: string` shortcut: if no `onAction` is given but `href` is, `notify` builds a default handler that navigates via `window.location.assign` (used by callers outside React, e.g., service-worker fallbacks).

**3. `src/components/notifications/NotificationToastCard.tsx`** — contrast pass
- Bump variant `ring` opacity from `/15` → `/25` and add `dark:ring-{color}/35` so rings remain visible on dark glass.
- Replace `bg-background/95` with `bg-background/92 dark:bg-background/85` for better blur read on Safari.
- Icon pill: add `dark:bg-{color}/20` for stronger fill in dark mode.
- Action button: add `dark:shadow-{color}/40` and `ring-1 ring-white/10` so the pill pops on dark backgrounds.
- Title: ensure `text-foreground` (already correct); body bumps from `text-muted-foreground` to `text-foreground/75` for legibility on translucent surfaces.
- Add `will-change-transform` to the slide-in for smoother iOS Safari animation.

**4. `src/components/chat/ChatNotificationListener.tsx`** — better web-push dedup
- Switch `tag` from `chat-${senderId}` to `chat-${senderId}` (already correct) but set `renotify: false` when the same sender pings within 8s (track `lastNotifBySender` ref) to avoid re-buzzing for rapid follow-ups. After 8s, allow renotify so genuinely new conversations buzz.
- Add `data: { senderId, type: "chat" }` to the Notification options so service-worker click handlers (future) can route correctly.
- For the in-app `toast.custom` chat card: pass haptic tick via the existing `onAction` path (handled by step 2 — automatic).

**5. Ride deep-link wiring at call sites**
- Audit `src/hooks/useRideNotifications.ts` consumers (`useRealtimeRideUpdates`, `useDriverArrivalDetection`, etc.) to pass `jobId` so the deep link works. Where `jobId` is available in the calling scope, forward it; otherwise the toast falls back to `/rides`.

**6. Visual QA (in default mode)**
- Use the browser tool at viewport 390x844 (iPhone) and 360x800 (Android) in both themes to confirm rings, action buttons, and body text contrast meet WCAG AA on the glass background. Tweak opacity values if any variant fails.

### Out of scope
- Service-worker click routing (no SW currently handles notification clicks — would need a new `sw.js` handler; flagged for future).
- Native iOS/Android system notification appearance (controlled by OS once delivered via FCM/APNs).
- Server payload changes to `send-push-notification`.

### Files

**Edited**
- `src/hooks/useRideNotifications.ts`
- `src/lib/notify.ts`
- `src/components/notifications/NotificationToastCard.tsx`
- `src/components/chat/ChatNotificationListener.tsx`
- Ride hook consumers that should pass `jobId` (e.g. `src/hooks/useRealtimeRideUpdates.ts` — confirmed during implementation)

