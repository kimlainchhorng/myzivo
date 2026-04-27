# Phase 13 — Final Cleanup Bundle

Single batched update covering all remaining gaps: code-health refactor, design-token sweep, RLS hardening, audit log, and expiry notifications.

## What's in scope

### A. Refactor `LodgingPropertyProfileSection.tsx` (506 lines → 5 cards)
Split the monolith into focused sub-components under `src/components/admin/store/lodging/property-profile/`:
- `HouseRulesCard.tsx` — quiet hours, parties, smoking, min age, deposit
- `PoliciesCard.tsx` — check-in/out times, cancellation, pet/child policy
- `ContactCard.tsx` — phone/email/whatsapp/website + Twilio verify badge
- `PaymentsCard.tsx` — payment methods, currencies, deposit %
- `NearbyCard.tsx` — nearby distances list editor

Parent file becomes a thin orchestrator (~80 lines) that wires `useLodgePropertyProfile` to each card via `value` + `onChange` props. No behavior change, no DB change.

### B. Design-token sweep (100+ raw color replacements)
Replace hardcoded Tailwind palette colors across 7 store section files with semantic tokens:
- `bg-red-*` / `text-red-*` → `bg-destructive/10` / `text-destructive`
- `bg-green-*` / `text-green-*` → `bg-success/10` / `text-success` (add `success` token to `tailwind.config.ts` + `index.css` if missing)
- `bg-amber-*` / `bg-yellow-*` → `bg-warning/10` / `text-warning` (add `warning` token if missing)
- `bg-blue-*` → `bg-primary/10` / `text-primary`
- `bg-purple-*` / `bg-emerald-*` brand accents → keep but use `bg-accent/10` / `text-accent` where semantic

Files touched: `StoreTimeClockSection`, `StorePayrollSection`, `StoreAttendanceSection`, `StorePerformanceSection`, `StoreEmployeesSection`, `StoreScheduleSection`, `StoreEmployeeRulesSection`, plus the new Training/Documents files from Phase 12.

### C. Hook factory to dedup boilerplate
New `src/hooks/store/createStoreResourceHook.ts` — generic factory that returns `{ data, isLoading, upsert, remove }` for any `store_*` table scoped by `store_id`. Then refactor the 4 existing hooks (`useStoreEmployeeRules`, `useStoreTrainingPrograms`, `useStoreTrainingAssignments`, `useStoreDocuments`) to use it. Cuts ~40% of lines, single source of truth for invalidation.

### D. Storage RLS hardening
Migration to tighten `store-documents` bucket policies:
- Add regex guard ensuring path matches `^[0-9a-f-]{36}/[0-9a-f-]{36}/.+$` (UUID/UUID/filename) — blocks `../` traversal and malformed paths
- Replace existing `(storage.foldername(name))[1]::uuid` cast (which throws on bad input) with a safe `try-cast` via a `public.safe_uuid(text)` helper

### E. Audit log
New `store_audit_log` table:
```
id uuid pk, store_id uuid, actor_user_id uuid, action text,
resource_type text, resource_id uuid, diff jsonb, created_at timestamptz
```
RLS: managers can SELECT for their store, INSERT is service-role only. Triggers on `store_employee_rules`, `store_training_assignments`, `store_documents` write a row on INSERT/UPDATE/DELETE capturing the actor (`auth.uid()`) and a JSON diff of changed columns.

New `AuditLogSection.tsx` admin tab showing the last 200 events for the current store with actor name + relative time.

### F. Document expiry + training overdue notifications
New edge function `notify-store-expiries` (scheduled daily via pg_cron):
- Finds `store_documents.expires_at` within next 7 / 30 days → push to all managers of that store via existing `send-push-notification`
- Finds `store_training_assignments` past `due_date` and not completed → push to assignee
- Writes a row to `store_audit_log` for traceability

Add a `pg_cron` schedule (`0 9 * * *` UTC) to invoke it.

### G. UX polish
- Empty states on Training, Documents, EmployeeRules, AuditLog: shared `<EmptyState icon title description action />` component (new at `src/components/admin/store/_shared/EmptyState.tsx`)
- Highlight overdue training rows in red-tinted background using new `bg-destructive/5` token
- Doc rows expiring in <30d get an amber `Clock` badge

## Out of scope (deferred)
- Building Tasks / Announcements / Incidents / Inventory sections — these don't exist in the codebase yet, so there's nothing to migrate. If you want them as **new** features, that's a separate phase.

## Files created
- `src/components/admin/store/lodging/property-profile/{HouseRulesCard,PoliciesCard,ContactCard,PaymentsCard,NearbyCard}.tsx`
- `src/components/admin/store/_shared/EmptyState.tsx`
- `src/components/admin/store/AuditLogSection.tsx`
- `src/hooks/store/createStoreResourceHook.ts`
- `src/hooks/store/useStoreAuditLog.ts`
- `supabase/functions/notify-store-expiries/index.ts`
- `supabase/migrations/<ts>_audit_log_and_storage_hardening.sql`

## Files modified
- `src/components/admin/store/lodging/LodgingPropertyProfileSection.tsx` (slim orchestrator)
- `src/components/admin/store/Store*.tsx` (7 files — token sweep)
- `src/components/admin/store/Store{Training,Documents,EmployeeRules}Section.tsx` (empty states + overdue/expiry highlights)
- `src/hooks/store/useStore{EmployeeRules,TrainingPrograms,TrainingAssignments,Documents}.ts` (use factory)
- `tailwind.config.ts` + `src/index.css` (add `success`/`warning` tokens if absent)
- `.lovable/plan.md`

## Verification
- `tsc --noEmit` clean
- `supabase--linter` clean (no new warnings)
- Manual: open `/admin/stores/:id?tab=property-profile` — confirm 5 cards render, save round-trips
- Manual: open `?tab=audit-log` — confirm events appear after editing a rule
