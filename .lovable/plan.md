# Phase 11 — Audit follow-ups + Real Employee Rules backend

Phase 10 fixed a silently-broken Policies tab and shipped the bucket lockdown. The audit afterward surfaced **3 fully fake admin sections** (no DB, no persistence) and confirmed the rest of the `(supabase as any).from(...)` calls are stylistic, not buggy.

## Audit results (a)

| File | Status |
|------|--------|
| `LodgingPoliciesSection.tsx` | ✅ Fixed in Phase 10 (wrong table + 3 wrong columns) |
| `LodgingHousekeepingSection`, `Inbox`, `Reviews`, `Gallery`, `Staff`, `Overview` | ✅ Table & column names correct — `as any` is just stylistic |
| `StoreEmployeeRulesSection.tsx` | ❌ Fully in-memory `useState` — refresh wipes everything |
| `StoreTrainingSection.tsx` | ❌ Fully in-memory `DEMO_PROGRAMS` constant |
| `StoreDocumentsSection.tsx` | ❌ Fully in-memory `DEMO_DOCS` constant |

The 3 fake sections all live under `src/components/admin/store/`, are wired into `AdminStoreEditPage`, and currently let store owners "configure" things that vanish on refresh.

## Phase 11 scope (b) — Build real persistence for Employee Rules

We'll do **Employee Rules** end-to-end now (the tab the user is on). Training and Documents follow the exact same pattern, so I'll defer them to Phase 12 unless you say otherwise — doing all 3 in one pass would be a huge migration + 3 hooks + 3 rewrites + storage policies.

### Schema

```sql
create table public.store_employee_rules (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null,
  title text not null,
  category text not null,
  description text not null default '',
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  applies_to text not null default 'All Staff',
  is_active boolean not null default true,
  position int not null default 0,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index store_employee_rules_store_idx on public.store_employee_rules(store_id, position);
```

### RLS — store owners + admins can manage; everyone else is locked out

We already have a `is_lodge_store_manager(uuid, uuid)` style helper pattern — we'll reuse the existing `store_employees` ownership check. Effective rules:
- **SELECT**: store owner, store admin (via `store_employees.role`), or platform admin (`has_role(auth.uid(),'admin')`).
- **INSERT/UPDATE/DELETE**: same set.
- No anonymous access at all.

### Hook: `src/hooks/store/useStoreEmployeeRules.ts`

```text
useStoreEmployeeRules(storeId)
  ├─ list:       useQuery → ordered by position then created_at
  ├─ upsert:     create or update one rule (sets created_by = auth.uid())
  ├─ remove:     delete by id
  └─ toggleActive: flip is_active
```

### Component rewrite: `StoreEmployeeRulesSection.tsx`

- Replace `useState<Rule[]>(DEMO_RULES)` with the hook.
- Keep the existing 3-tab UI (Rules / Access / Policies) and the search + category filter.
- Replace direct color classes (`bg-blue-100`, `text-emerald-500`, `bg-red-100`) with semantic tokens (`bg-primary/10 text-primary`, `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` via existing `severity` config rebuilt with tokens).
- Add empty state, loading skeleton, error toast, optimistic updates on toggle.
- Add "Seed default rules" button that bulk-inserts the 8 existing demo rules (only shown when list is empty) so existing screens don't suddenly look bare.

### Files

Migration (1):
- `supabase/migrations/<ts>_store_employee_rules.sql`

New code:
- `src/hooks/store/useStoreEmployeeRules.ts`

Edited code:
- `src/components/admin/store/StoreEmployeeRulesSection.tsx`

Docs:
- `SECURITY.md` — note the 54 intentional Phase 9 re-grants + this new table's RLS shape
- `.lovable/plan.md` — Phase 11 entry, plus a Phase 12 note for Training/Documents

### Verification

1. `tsc --noEmit -p tsconfig.app.json` → clean
2. `supabase--linter` → still 54 (no new warnings)
3. Manual smoke on `?tab=employee-rules`:
   - Empty state shows "Seed defaults" button
   - Create rule → refresh → still there
   - Toggle is_active → refresh → still there
   - Delete → refresh → still gone
   - Non-owner user (different store) sees nothing / 403
4. Confirm hardcoded colors are gone: `rg "bg-(blue|emerald|red|amber|purple|gray)-(100|500)" src/components/admin/store/StoreEmployeeRulesSection.tsx | wc -l` → 0

## Outcome

After Phase 11: the Employee Rules tab is a real feature backed by a properly RLS'd table, with fixed design tokens. Training and Documents stay fake (clearly flagged in the plan for Phase 12).

## Heads-up about Training & Documents

Both have similar size and complexity. Documents additionally needs a storage bucket + policies (file uploads). I'd estimate Phase 12 = ~1.5x Phase 11.

---

**Approve to proceed**, or tell me if you want all 3 sections (Rules + Training + Documents) in one phase.
