## Phase 9 — Security lockdown: SECURITY DEFINER functions, public buckets, citext extension

The lodging UI sweep is closed (Phases 1–8). The biggest remaining risk is on the database side. The Supabase linter reports **732 warnings, all WARN-level, no ERRORs**, dominated by one pattern.

### What's actually flagged

- **730 / 732** warnings are the same finding repeated for **368 SECURITY DEFINER functions** in the `public` schema, every one granted `EXECUTE` to `anon` and `authenticated`.
- **1** finding: the `citext` extension lives in `public` (should be in `extensions`).
- **1** finding: a public storage bucket allows broad listing.

### What the codebase actually uses

- Only **56 RPC names** appear in `src/` + `supabase/functions/` (e.g. `accept_job_offer`, `auth_precheck_login`, `get_friend_count`, `mark_messages_read`, …).
- **83** of the 368 SECDEF functions are attached to triggers (auto-fired — should never be EXECUTE-granted to anyone).
- That leaves **~229 SECDEF functions in `public`** that are callable by anon/authenticated but never invoked by our own code. Pure attack surface.

### Plan

```text
┌─ 1. Trigger functions (83) ──── REVOKE EXECUTE from public, anon, authenticated
├─ 2. Unused SECDEF functions (~229) ─ REVOKE EXECUTE from public, anon, authenticated
├─ 3. Used RPCs (56) ──────────── keep EXECUTE only for the role(s) that need it
│                                  - service_role keeps EXECUTE always
│                                  - authenticated keeps EXECUTE for user-scoped RPCs
│                                  - anon keeps EXECUTE only for unauthenticated RPCs
│                                    (auth_precheck_login, auth_record_login_attempt, cleanup_expired_device_link_tokens)
├─ 4. citext extension ────────── CREATE SCHEMA IF NOT EXISTS extensions; ALTER EXTENSION citext SET SCHEMA extensions
└─ 5. Public bucket listing ───── identify the offending bucket, scope storage.objects SELECT policy to user folders
```

#### Step 1 + 2 — bulk revoke (single migration)

Loop in `pg_proc` and revoke `EXECUTE` from `public`, `anon`, `authenticated` for every `SECURITY DEFINER` function in `public` whose name **is not** in the allowlist of 56 used RPCs. `service_role` retains EXECUTE because it always bypasses ACLs.

#### Step 3 — re-grant to the roles each used RPC needs

After bulk revoke, generate explicit `GRANT EXECUTE ... TO authenticated;` (or `anon` where appropriate) for each of the 56 used RPCs. The 3 anon-callable RPCs are: `auth_precheck_login`, `auth_record_login_attempt`, `cleanup_expired_device_link_tokens`.

#### Step 4 — move citext

```sql
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION citext SET SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
```

#### Step 5 — public bucket

Identify which of the 16 public buckets has an over-broad listing policy on `storage.objects` (linter only flags one). Tighten its `SELECT` policy to either folder-owner-only or specific path prefixes, while keeping individual object reads via signed/public URL working.

### Verification (mandatory)

1. `supabase--linter` — total warnings should drop from **732 → ≤2** (the 2 known non-issues if the bucket policy needs design discussion)
2. Sanity-check the 56 used RPCs by querying `has_function_privilege('authenticated', 'public.<name>(...)', 'EXECUTE')` for a sample of 10 — must return `true`
3. Confirm `pg_proc` shows 0 trigger functions still callable by `anon`
4. `tsc --noEmit -p tsconfig.app.json` — must remain clean (no app-side change)
5. Smoke check from preview: open `/admin/stores/7322b460…?tab=lodge-frontdesk`, do one reservation status change — confirm RPC still works

### Files (planned)

Migrations (1):
- `supabase/migrations/<ts>_secdef_lockdown.sql` — revoke + targeted re-grants + citext move + bucket policy fix

App code: **none**. This is purely a DB-side hardening migration.

### Outcome

After Phase 9, the Supabase linter goes from **732 warnings to ~0**, the database surface area shrinks dramatically (~229 callable RPCs the app never used become uncallable by clients), and the public-listing bucket stops leaking object names.

### Risk & rollback

- **Risk**: a function we missed in the allowlist gets revoked and breaks at runtime.
- **Mitigation**: the migration only changes ACLs, not function bodies, so rollback is `GRANT EXECUTE ... TO authenticated` per function — fast to fix if anything surfaces.
- **Detection**: Supabase Postgres logs will surface `permission denied for function <name>` immediately if hit; we'll check edge function logs and runtime errors right after the migration runs.

### Ask for approval before running

The migration is destructive in the sense that it changes 368 function ACLs at once. I'll show the final SQL for review before executing it.
