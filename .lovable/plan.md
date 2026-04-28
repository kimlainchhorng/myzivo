## Goal

Two connected upgrades to the Employees / Jobs ecosystem:

1. **Store Employees → Setup invites.** Today, adding an employee in `StoreEmployeesSection` (used by Koh Sdach Resort, all stores, and the Personal `/personal/employees` view) only saves a row to `store_employees`. There is no way for the owner to actually notify the new hire. Add **Send Email Invite** and **Send SMS Invite** buttons that trigger a real onboarding link so the employee can sign in / claim their role.

2. **Find Employees flow for shops.** The Find Company page (`/personal/find-employee`) currently only lists Open Jobs and Companies for job seekers. Partners that own a store also need to **find/recruit employees** and **post a job from their shop** in one tap. Add a third "Find Talent" tab + a clearer "Post a Job from your Shop" entry that connects shops directly to `EmployerDashboardPage`.

---

## Part 1 — Employee invite buttons (Email + SMS)

**Where:** `src/components/admin/store/StoreEmployeesSection.tsx` (employee card + detail dialog).

**UI**
- On each employee card (and in the detail dialog), add two compact buttons next to the existing Edit / Remove icons:
  - `Mail` → "Send Email Invite" (disabled if no email)
  - `Phone` → "Send SMS Invite" (disabled if no phone)
- Show a toast on success, with a "Resent" timestamp pill if invited within the last 24h.
- Inside the Add/Edit dialog, add a "Send invite after saving" checkbox (Email + SMS toggles) so a brand-new employee gets the invite immediately.

**Email path (already 90% built)**
- Reuse the existing `employee-invite` React Email template (already registered in `supabase/functions/_shared/transactional-email-templates/registry.ts`).
- Call the existing `send-transactional-email` edge function with:
  - `template: "employee-invite"`
  - `to: employee.email`
  - `props: { email, role, loginUrl: "https://hizivo.com/auth?invite=<token>&store=<storeId>" }`
- The template already shows role + login button, so no template changes are required (minor: pass store name into preview).

**SMS path (new tiny edge function: `send-employee-sms-invite`)**
- Reuse Twilio creds already used by `send-otp-sms`.
- Body: short branded message —
  `"You're invited to join <Store Name> on ZIVO as <role>. Tap to set up: https://hizivo.com/auth?invite=<token>"`
- Respects the existing 5 SMS/day rate limit per number (per OTP engine memory).

**Invite token storage**
- New table `store_employee_invites` (id, store_employee_id, store_id, email, phone, channel, token, status, sent_at, accepted_at, expires_at default 7 days). RLS: only store owner can insert/select; public can SELECT row by token (for /auth claim).
- On `/auth?invite=…`, after successful sign-in, call a new RPC `claim_employee_invite(token)` that links `auth.uid()` to `store_employees.user_id` and marks the invite accepted.

**Result:** Owner taps "Send Email" / "Send SMS" → employee gets a branded message → signs in → their `store_employees` row gets `user_id` populated and they can clock in via `/personal-dashboard`.

---

## Part 2 — Find Employees + "Post from Shop" in the Find Company hub

**Where:** `src/pages/app/personal/FindEmployeePage.tsx` and `EmployerDashboardPage.tsx`.

**Page rename + tabs**
- Rename header from "Find Company" → "Careers" (covers both directions).
- Tabs become 3:
  - `Open Jobs` (existing)
  - `Companies` (existing)
  - `Find Talent` (new, partner-only — visible if the user owns a `career_companies` row OR a `stores` row)

**Find Talent tab**
- Lists public talent profiles: query `profiles` joined with `user_skills` / `bio` (already on profile) for users who opted-in (`profiles.open_to_work = true`, new boolean column, default false).
- Each card: avatar, name, headline, location, "Invite to Apply" button → opens a sheet to pick one of the partner's Open Jobs and sends a notification + email via `send-transactional-email` (new tiny `talent-invite` template — copy of employee-invite styling).
- Add an "Open to Work" toggle in `PersonalSettingsPage` so seekers can opt in.

**"Post a Job from your Shop" shortcut**
- The existing top "Are you hiring?" card already points to `/personal/employer`. Improve it:
  - If the user owns a `stores` row but no `career_companies` row, **auto-prefill** the company create form in `EmployerDashboardPage` from their store (name, location, logo, description) and show a one-tap "Use my shop info" button.
  - Add a "Post from Shop" CTA inside `ShopEmployeesPage` itself ("Need more staff? Post a job") that deep-links into `/personal/employer` with `?from=store&storeId=…`.

---

## Technical details

**New / changed files**
- `src/components/admin/store/StoreEmployeesSection.tsx` — invite buttons + dialog checkbox + invite-status pill.
- `src/pages/app/personal/FindEmployeePage.tsx` — 3rd tab + partner gating.
- `src/pages/app/personal/EmployerDashboardPage.tsx` — store-prefill + `?from=store` handling.
- `src/pages/app/shop/ShopEmployeesPage.tsx` — "Post a Job from Shop" CTA.
- `src/pages/app/personal/PersonalSettingsPage.tsx` — Open-to-Work toggle.
- New page `src/pages/auth/AcceptInvitePage.tsx` (or hook into existing `/auth`) — handles `?invite=<token>` claim.
- New edge function `supabase/functions/send-employee-sms-invite/index.ts` — Twilio send.
- New edge function `supabase/functions/send-employee-email-invite/index.ts` (thin wrapper that creates token + calls `send-transactional-email`).
- New transactional template `talent-invite.tsx` (registered in registry).

**Database migration**
- `store_employee_invites` table with RLS (owner write, public read by token via security-definer RPC).
- `claim_employee_invite(token text)` RPC — security definer, links current user.
- Add `profiles.open_to_work boolean default false`.

**Reuses**
- `send-transactional-email` function & infrastructure (already deployed, domain verified).
- Twilio creds + 5/day rate limit pattern from `send-otp-sms`.
- Existing `employee-invite` React Email template (no changes).

**Out of scope**
- Push notifications for invites (covered by existing notification engine; will fire automatically once `auth.users` row exists).
- Bulk CSV invite (can be a later iteration).

---

## What you'll see when done

- On any employee card: two small icons (✉ / 📞). Tap → toast "Email sent to kim@…" or "SMS sent to +855…". Pill shows "Invited 2h ago".
- New employee added with "Send invite" checked → invite fires automatically.
- `/personal/find-employee` shows a third tab "Find Talent" if you're a partner; tapping a talent profile lets you invite them to one of your open jobs.
- From `ShopEmployeesPage`, a green "Need more staff? Post a Job" banner deep-links to the Employer Hub with the company form pre-filled from your store.
