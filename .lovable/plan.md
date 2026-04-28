# Continue: Employee Invites + Find Talent + Shop Job Posting

Pick up where the last loop ended. Infrastructure (DB, RPC, edge functions, accept-invite page, list-row buttons) is done. Remaining work:

## 1. Employee Dialog Invite Controls
In `StoreEmployeesSection.tsx` add to the create/edit employee dialog:
- "Send email invite" checkbox (enabled when email present)
- "Send SMS invite" checkbox (enabled when phone present)
- On save, after upsert, fire `send-employee-email-invite` / `send-employee-sms-invite` for the new employee record
- Toast feedback per channel; show invite status badge (pending / accepted / expired) next to each employee row using `store_employee_invites` latest record

## 2. Shop → Post a Job Shortcut
- In `ShopEmployeesPage.tsx` (and store admin Employees section) add a "Post a job" button that routes to `/employer` with prefilled `?storeId=...`
- In `EmployerDashboardPage.tsx` read `storeId` query param, prefill company name, logo, location, category from `stores` row
- Add an "Invite to apply" button on each open job that opens a small picker pulling from Find Talent results

## 3. Find Talent Tab (Careers Hub)
- Rename "Find Company" page header to "Careers"; add tab switcher: Find Jobs | Find Talent (Find Talent only visible to users who own at least one store)
- New `FindTalentPage` component: query `profiles` where `open_to_work = true`, filter by skills/location/keyword, show cards with avatar, headline, bio, "Invite to apply" CTA
- Add toggle in account settings (`SettingsPage` / profile edit): "Open to work" → updates `profiles.open_to_work`

## 4. Connect Both Flows
- Accepted invite (via `/auth/accept-invite`) lands user on `/account` with toast "You're now an employee at {store}"
- Employer invite-to-apply creates a `job_applications` row (or sends in-app notification + email via existing `send-transactional-email`) so talent sees it in their notifications

## Technical Notes
- Reuse existing `store_employee_invites` table + `claim_employee_invite` RPC
- Add `profiles.open_to_work` index for filter performance
- All new edge function calls go through `supabase.functions.invoke`
- Respect existing v2026 high-density compact UI standard, Lucide icons, emerald tokens

## Files To Touch
- `src/components/admin/store/StoreEmployeesSection.tsx`
- `src/pages/app/shop/ShopEmployeesPage.tsx`
- `src/pages/app/personal/EmployerDashboardPage.tsx`
- `src/pages/app/personal/FindEmployeePage.tsx` (rename/refactor to Careers)
- New: `src/pages/app/personal/FindTalentPage.tsx`
- `src/pages/account/SettingsPage.tsx` (open-to-work toggle)
- `src/App.tsx` (route updates)
- New migration: index on `profiles(open_to_work)`

After implementation: hard-refresh test, send sample invite to verify email + SMS delivery, accept flow, and shop→post job prefill.