# Next Update — Phase 4 Track A + Safe-Zone Drag Fix

Two parallel deliverables in this update:

1. **Multi-Device QR Login** — link a second device by scanning a QR (Track A of Phase 4).
2. **Safe-Zone Drag Fix** — the floating mini-call window (the "move" button you can drag around) must stay inside the visible safe area on every device (notch, status bar, home indicator, keyboard).

---

## Part 1 — Safe-zone fix for the draggable Mini Call window

**What you'll see**
- The mini call bubble can still be moved with your finger anywhere on screen.
- It can no longer be dragged under the iPhone notch / Dynamic Island, behind the Android status bar, off the left/right edges, or under the home indicator / mobile bottom navigation.
- If you rotate the phone or open the keyboard, the bubble auto-snaps back into the safe zone.
- On release, it gently "magnets" to the nearest left/right edge (iMessage-style) while staying inside safe-area insets.

**Where**
- `src/components/chat/CallPiP.tsx` — the only draggable floating element in chat right now.

## Part 2 — Multi-Device QR Login (Phase 4 Track A)

**What you'll see**
- New page **Settings → Linked Devices** (`/account/linked-devices`) showing all signed-in devices with name, OS, last-seen, and a "Sign out" button per device.
- Tap **Link a Device** → a QR code appears (refreshes every 60s, expires in 2 min).
- On a second phone (already on zivollc.com), tap **Scan to Sign In** → camera opens → scan the QR → that device is signed in instantly as the same account.
- Optional one-tap "Sign out all other devices" button.

**Security**
- Tokens are single-use, expire in 120 s, bound to the QR-displaying device, and revoked the moment a session is created.
- The scanning device must already be authenticated (we never expose the password / refresh token through the QR — only a short-lived magic link).

---

## Technical Section

### Safe-zone drag (CallPiP.tsx)
- Add a `containerRef` measuring `window.innerWidth/Height`.
- Read CSS env safe-area insets via `getComputedStyle` (already exposed as `--safe-top/--safe-bottom/--safe-left/--safe-right` per `mobile-native-ux-standards`).
- Add framer-motion `dragConstraints={{ top: safeTop+8, bottom: innerH - safeBottom - bottomNavHeight - pipH - 8, left: safeLeft+8, right: innerW - safeRight - pipW - 8 }}` and `dragElastic={0.15}`.
- On `dragEnd`, snap to nearest horizontal edge with `animate` controls.
- Add `resize` + `visualViewport.resize` listeners to re-clamp position when keyboard opens or orientation changes.
- Replace the hard-coded `top:100, right:16` with state that respects the same insets on initial mount.

### Multi-device QR login

**DB migration**
```sql
create table public.device_link_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,           -- short random (32 char base64url)
  issuer_user_id uuid not null references auth.users(id) on delete cascade,
  issuer_device_label text,
  claimed_at timestamptz,
  claimed_by_session text,
  expires_at timestamptz not null default (now() + interval '2 minutes'),
  created_at timestamptz default now()
);
alter table public.device_link_tokens enable row level security;
create policy "owner can read own tokens"
  on public.device_link_tokens for select
  using (auth.uid() = issuer_user_id);

create table public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_label text,
  user_agent text,
  platform text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.user_devices enable row level security;
create policy "user reads own devices" on public.user_devices for select using (auth.uid() = user_id);
create policy "user deletes own devices" on public.user_devices for delete using (auth.uid() = user_id);
```

**Edge functions** (all under `supabase/functions/`)
- `device-link-issue` (verify_jwt: true) → creates a token row, returns `{ token, expiresAt }`.
- `device-link-claim` (verify_jwt: true — caller is the *scanning* device, already logged in) → marks token claimed; if scanner is a different account, rejects.
- `device-link-poll` (verify_jwt: true) → issuer device polls every 2 s; returns `{ claimed: true, by: deviceLabel }` once scanned, then closes the QR sheet.
- `device-register` (verify_jwt: true) → upserts a `user_devices` row on app boot.

> Note: because Supabase auth sessions cannot be transferred cross-device without exposing refresh tokens, "QR login" here = "approve this new device", which is the safe model used by WhatsApp Web. The scanning device must already be signed in to the same account on at least one device — exactly the WhatsApp/Telegram model. If the user wants true "scan to sign in from logged-out device" we will need to add a magic-link exchange (`device-link-exchange` returning a one-time `signInWithOtp` link) — flagged but not built in this pass.

**New files**
- `supabase/migrations/<ts>_device_linking.sql`
- `supabase/functions/device-link-issue/index.ts`
- `supabase/functions/device-link-claim/index.ts`
- `supabase/functions/device-link-poll/index.ts`
- `supabase/functions/device-register/index.ts`
- `src/hooks/useLinkedDevices.ts`
- `src/pages/account/LinkedDevicesPage.tsx`
- `src/pages/account/LinkDevicePage.tsx` (shows QR via `qrcode.react`)
- `src/pages/account/ScanDevicePage.tsx` (uses `@zxing/browser` for camera scan)

**Edited**
- `src/App.tsx` — add 3 routes (`/account/linked-devices`, `/account/link-device`, `/account/scan-device`).
- `src/pages/account/AccountSettingsPage.tsx` (or equivalent settings list) — add **Linked Devices** entry.
- `src/components/chat/CallPiP.tsx` — safe-zone drag constraints + edge snap.

**Dependencies**
- `qrcode.react` (QR rendering)
- `@zxing/browser` (camera QR scanning) — only loaded on the scan page (lazy import) to keep main bundle small.

### Build order
1. CallPiP safe-zone fix (small, ships immediately).
2. DB migration + 4 edge functions.
3. Linked Devices page + Link Device (QR display + poll).
4. Scan Device page (camera + claim).
5. Settings entry + route wiring.

After this, Track B (E2E Secret Chats) is the only Phase 4 item remaining.