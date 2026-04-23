

## Polished Push & In-App Notification Look

Upgrade the visual quality of all push-style notifications (chat toasts, ride alerts, generic Sonner toasts) so they look premium, branded, and consistent — matching the v2026 chat toast style.

### What you'll see

- **Branded notification card** for every push/toast: rounded-[26px] glass surface, subtle ZIVO emerald accent, soft layered shadow, avatar/icon ring, type label ("New Message", "Driver Found", "Trip Update", etc.).
- **Per-event icon + color accent** — chat (blue dot), ride driver (emerald), arrival (amber), trip complete (green check), promo (purple), surge (red).
- **Slide-in animation** from the top with subtle spring + soft blur entrance.
- **Tap targets**: primary action button on the right (Reply / View / Track), tap card body to open deep link, swipe/X to dismiss.
- **Auto-stack** when multiple arrive, with collapsed counter ("+2 more").
- **Dark/light aware** with `bg-background/95 backdrop-blur-2xl` and emerald ring.
- **Native parity**: same look on web push toast, in-app sonner toast, and the Capacitor local-notification body text gets emoji + cleaner title.

### Technical Plan

**1. New shared component: `src/components/notifications/NotificationToastCard.tsx`**
- Props: `title`, `body`, `icon?: LucideIcon`, `variant?: "info" | "success" | "warning" | "ride" | "chat" | "promo" | "trip"`, `avatarUrl?`, `avatarFallback?`, `actionLabel?`, `onAction?`, `onDismiss?`, `meta?` (small uppercase chip text).
- Visual: rounded-[26px], `bg-background/95 backdrop-blur-2xl`, ring-1 + variant-tinted ring, layered shadow `shadow-[0_18px_50px_rgba(0,0,0,0.14)]`.
- Variant accents map → icon bg + ring color (emerald / amber / blue / purple / red / green).
- Avatar with status dot OR icon pill (h-12 w-12) on the left.
- Right side: optional pill action button (active:scale-95) + dismiss X button.
- Body: 2-line clamp, 13px muted-foreground.

**2. Update `src/components/chat/ChatNotificationToast.tsx`**
- Refactor to render through `NotificationToastCard` with `variant="chat"`, icon dot, "New Message" meta.

**3. New helper: `src/lib/notify.ts`**
- Wrappers `notify.chat()`, `notify.ride()`, `notify.success()`, `notify.error()`, `notify.info()`, `notify.promo()` — all call `toast.custom(t => <NotificationToastCard ... />, { duration })`.
- Centralizes look so any caller gets the polished card without changing 380+ existing `toast.success/error` sites (those keep working via Sonner classNames upgrade in step 5).

**4. Upgrade `src/hooks/useRideNotifications.ts`**
- Replace `toast.info(msg.title, { description: body })` with `notify.ride(event, { title, body, onAction })` so ride lifecycle alerts use the branded card with the right variant + icon (Car, MapPin, CheckCircle2, AlertTriangle, Tag).

**5. Upgrade `src/components/ui/sonner.tsx`**
- Tighten Sonner default `classNames`: rounded-[22px], `border-border/40`, `bg-background/95 backdrop-blur-2xl`, `shadow-[0_18px_50px_rgba(0,0,0,0.14)]`, success/error/warning/info icon colors mapped to emerald/red/amber/sky. Adds offset for safe-area-top on mobile.
- Set `expand` + `visibleToasts={3}` and `gap={8}` for clean stacking.

**6. Web Notification API polish (`ChatNotificationListener.tsx`)**
- Add `badge: "/icons/icon-72x72.png"`, `vibrate: [80, 40, 80]`, ensure `tag` deduplicates per sender so iOS/Android collapse multiple messages from the same person instead of stacking spam.

### Out of scope
- No changes to server-side `send-push-notification` edge function payload — purely visual/client.
- Native iOS/Android system notification appearance is controlled by the OS; only the in-app toast and web push visuals change.

### Files

**Created**
- `src/components/notifications/NotificationToastCard.tsx`
- `src/lib/notify.ts`

**Edited**
- `src/components/chat/ChatNotificationToast.tsx`
- `src/components/chat/ChatNotificationListener.tsx`
- `src/hooks/useRideNotifications.ts`
- `src/components/ui/sonner.tsx`

