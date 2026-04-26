# Phase 2 — Privacy, Sessions & Two-Step Verification

Goal: Telegram-style **Privacy & Security** controls. Users can see all devices they're logged in on, revoke any of them, set who can see Last Seen / Photo / Bio / Phone / Calls / Forwards / Group Invites, set a 2-step password, and set an app passcode with auto-lock + biometrics.

---

## 1. Database

### Reuses (already exist)
- `user_sessions` — columns: `id, user_id, device_info, device_type, os, browser, ip_address, location, is_active, last_active_at, created_at`. Will add a heartbeat from each device.
- `user_privacy_settings` — created in Phase 1. Already has the full matrix.
- `device_tokens` — push tokens stay as-is.

### New tables
- `two_step_auth` — `user_id` PK, `password_hash`, `password_salt`, `hint`, `recovery_email`, `enabled`, timestamps. Salted SHA-256 hash, computed client-side then stored. Required to: change username, revoke other sessions, disable two-step, delete account.
- `user_passcode` — `user_id` PK, `passcode_hash`, `passcode_salt`, `biometric_enabled`, `auto_lock_minutes` (1/5/15/60/240/never), `enabled`. Locks the chat UI, never the auth session.
- `login_alerts` — `id, user_id, event` (login | logout | session_revoked | two_step_changed | password_changed | suspicious), `device_name, platform, ip, country, city, user_agent, metadata, created_at`. Indexed by `(user_id, created_at desc)`.

All new tables: RLS enabled, **owner-only** read/write (admins via `has_role` for moderation reads).

---

## 2. Hooks

```
src/hooks/
  useSessions.ts     // list, heartbeat (60s), revoke, revokeAllOthers
  usePrivacy.ts      // read/upsert PrivacySettings (full matrix)
  useTwoStep.ts      // status, enable, change, disable (server-verifies hash)
  usePasscode.ts     // status, set, change, disable; lock/unlock UI gate
  useLoginAlerts.ts  // list, mark seen
```

`useSessions` heartbeat: on first mount creates a row with detected `device_info` (Chrome on iOS, etc.), stores `current_session_id` in `localStorage`, then bumps `last_active_at` every 60s.

Hashing helper: `src/lib/auth/passwordHash.ts` — `argon2id` via `argon2-browser` if available, else `PBKDF2-SHA256` 200k iterations using WebCrypto. Salt = 16 random bytes, base64.

---

## 3. Pages & components

```
src/pages/chat/settings/
  PrivacySecurityPage.tsx       // hub with sections
  ActiveSessionsPage.tsx        // device list + revoke
  TwoStepSetupPage.tsx          // create / change / disable extra password
  PasscodeSetupPage.tsx         // app passcode + auto-lock + biometrics
  LoginAlertsPage.tsx           // recent security events
src/components/chat/settings/
  PrivacyMatrixRow.tsx          // label + Everyone/Contacts/Nobody segmented
  SessionRow.tsx                // device card with revoke
  PasscodeKeypad.tsx            // 4–6 digit numeric pad
  AppLockGate.tsx               // overlays the app when locked, mounts in App.tsx
  ConfirmTwoStepDialog.tsx      // re-auth with 2-step password
```

App-lock behavior: `AppLockGate` reads `user_passcode`; if enabled and `last_active > auto_lock_minutes` ago, it covers the screen, requires PIN/biometric. Background → foreground triggers re-check. Biometric uses Capacitor `@capacitor-community/biometric-auth` (already in stack).

---

## 4. Routes

```
/chat/settings/privacy           PrivacySecurityPage
/chat/settings/sessions          ActiveSessionsPage
/chat/settings/two-step          TwoStepSetupPage
/chat/settings/passcode          PasscodeSetupPage
/chat/settings/login-alerts      LoginAlertsPage
```

Entry point: a **Settings → Privacy & Security** tile in `ContactsPage` header overflow menu, plus a top-right cog on `ChatHubPage` that opens `PrivacySecurityPage`.

---

## 5. Workflow

```text
Login (any device)
  ├─▶ AuthContext onAuthStateChange
  ├─▶ useSessions.heartbeat() inserts row → stores current_session_id
  ├─▶ login_alerts.insert({event:'login', device, ip, ...})
  └─▶ if user_passcode.enabled → AppLockGate shows lock until PIN/biometric

Privacy change
  └─▶ usePrivacy.update() upserts user_privacy_settings (optimistic, rollback on error)

Revoke other device
  ├─▶ Confirm 2-step password (if enabled)
  ├─▶ user_sessions.update is_active=false where id=X
  ├─▶ login_alerts.insert({event:'session_revoked'})
  └─▶ Push to revoked device → forces sign-out on next AuthContext tick

Two-step setup
  ├─▶ User enters new password + hint + recovery email
  ├─▶ hash = pbkdf2(password, randomSalt)
  ├─▶ two_step_auth.insert({user_id, hash, salt, hint, recovery_email, enabled:true})
  └─▶ login_alerts.insert({event:'two_step_changed'})

Passcode setup
  ├─▶ User picks 4–6 digit PIN twice
  ├─▶ hash = pbkdf2(pin, salt)
  ├─▶ user_passcode.upsert(...)
  └─▶ AppLockGate becomes armed
```

---

## 6. Security guardrails
- All hashing **client-side**, but verification also client-side against the stored hash (server never sees plaintext). Re-auth gates are a UX layer — sensitive server actions still require Supabase JWT.
- Rate-limit two-step + passcode attempts: 5 wrong → 30s lockout, 10 wrong → 5min, 20 wrong → forced sign-out (tracked in `localStorage`, mirrored in `login_alerts`).
- Revoked sessions: `AuthContext` polls `user_sessions` for the current row every 60s; if `is_active=false`, calls `supabase.auth.signOut()`.
- `login_alerts` writes pushed via existing `send-push-notification` to all *other* devices on `login` and `session_revoked`.
- All RLS is owner-scoped; admin overrides only via `has_role(uid,'admin')`.
- No secrets, no role flags on profiles. New tables follow the "user_roles separate" rule.

---

## 7. Phases within Phase 2 (shippable mid-way)

**2A — Sessions + Privacy Matrix** (no schema changes beyond what's already here)
- `useSessions`, `usePrivacy`, `ActiveSessionsPage`, `PrivacySecurityPage` with the full 7-row matrix + Read Receipts toggle.
- Heartbeat + revoke + revoke-all-others.

**2B — Two-Step Verification**
- New table `two_step_auth`. `useTwoStep`, `TwoStepSetupPage`, `ConfirmTwoStepDialog` gating sensitive actions (change username, revoke other sessions, delete account).

**2C — App Passcode + Login Alerts**
- New tables `user_passcode`, `login_alerts`. `usePasscode`, `useLoginAlerts`, `PasscodeSetupPage`, `LoginAlertsPage`, `AppLockGate` mounted in `App.tsx`.

---

## 8. Acceptance
- I can open **Chat → Settings → Active Sessions** and see "iPhone Safari · Phnom Penh · 2 min ago" with a "Terminate" button.
- I can set **Last Seen → Nobody** and the change persists across reload.
- I can set a 2-step password with hint + recovery email; revoking another session prompts for it.
- I can set a 4-digit passcode + auto-lock 5 min; backgrounding the app for 6 min triggers the lock screen; Face ID unlocks it.
- I can see a "Login Alerts" feed with my last 50 security events.

Approve and I'll build 2A first, then 2B + 2C in the same loop if time allows.
