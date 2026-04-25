## Goal

Tapping **Employees** on the Profile should open the **Personal Account** page (the screen with "Not Clocked In", QR clock-in card, and the list: Employees, Apply Job, Schedule, Timesheet, Pay Stubs, Notifications, Help, Settings) — not jump directly into the Employees sub-page.

## Change

In `src/pages/Profile.tsx`, update the Employees quick-action tile (line 1197) so it navigates to `/personal` instead of `/personal/employees`.

- Logged-in users → `/personal` (Personal Account hub)
- Guests → toast "Sign in to open Personal Account" → `/login?redirect=/personal`

Back arrow on `/personal` already uses `navigate(-1)`, so tapping back returns the user to Profile.

## Files

- `src/pages/Profile.tsx` — single-line change to the Employees tile handler.
