# Phase 12 — Training + Documents Persistence

Replace the in-memory demo data in `StoreTrainingSection` and `StoreDocumentsSection` with a real Supabase backend. Add file uploads for documents via a new private storage bucket. Same playbook as Phase 11 (Employee Rules).

## What you'll get

- Training programs, modules, and per-employee assignments survive refresh
- Documents are real file uploads (PDF/image), stored privately in Supabase Storage with signed-URL downloads
- Expiry tracking, "expiring soon" alerts, and per-store isolation via RLS
- "Seed defaults" buttons in both sections to bootstrap the demo content as real rows
- Loading skeletons, empty states, hardcoded colors swapped for semantic tokens

---

## Database schema (new tables)

### `store_training_programs`
- `id uuid pk`, `store_id uuid` (FK stores), `name`, `type` (`onboarding|training|certification`), `description`, `created_by`, timestamps

### `store_training_modules`
- `id uuid pk`, `program_id uuid` (FK, cascade delete), `title`, `duration_minutes int`, `sort_order int`, timestamps

### `store_training_assignments`
- `id uuid pk`, `program_id`, `employee_id` (FK store_employees), `status` (`assigned|in_progress|completed`), `progress_pct`, `completed_at`, `assigned_at`
- Unique constraint on `(program_id, employee_id)`

### `store_documents`
- `id uuid pk`, `store_id`, `employee_id` (nullable — null = company-wide), `name`, `category`, `file_path` (storage key), `file_type`, `size_bytes bigint`, `expires_at`, `status` (`active|expired|pending`), `uploaded_by`, timestamps
- Trigger to auto-flip `status` to `expired` when queried past `expires_at` (or compute client-side)

**RLS on all 4 tables**: `is_lodge_store_manager(store_id, auth.uid())` for SELECT/INSERT/UPDATE/DELETE. Assignments derive store_id via `program_id` join in the policy.

---

## Storage bucket

- **Bucket**: `store-documents` (private)
- **Path convention**: `{store_id}/{document_id}/{filename}`
- **RLS on `storage.objects`**: only managers of the matching `store_id` (parsed from path prefix) can SELECT/INSERT/DELETE
- Downloads via short-lived signed URLs (60s)

---

## New hooks

- `useStoreTrainingPrograms(storeId)` — list/create/update/delete programs + modules, `seedDefaults()`
- `useStoreTrainingAssignments(programId)` — assign/unassign employees, update progress
- `useStoreDocuments(storeId)` — list (with category/search filter), upload (file → storage → row), delete, getSignedUrl, `seedDefaults()`

All hooks: React Query with optimistic updates and toast feedback.

---

## Component rewrites

### `StoreTrainingSection.tsx`
- Remove `DEMO_PROGRAMS` constant and `useState<Program[]>`
- Wire to `useStoreTrainingPrograms` + `useStoreTrainingAssignments`
- Add loading skeleton + empty state with "Seed defaults" CTA
- Replace `text-indigo-500/bg-indigo-500/10` etc. with semantic tokens (`text-primary`, `bg-primary/10`, `text-success`, `bg-success/10`, etc.)

### `StoreDocumentsSection.tsx`
- Remove `DEMO_DOCS` and `useState<Doc[]>`
- Replace fake "Upload" with real `<input type="file" accept=".pdf,image/*">` → uploads to `store-documents` bucket
- Eye/Download buttons call `getSignedUrl` and open in new tab
- Trash deletes both row and storage object
- Add expiry date picker in upload dialog
- Same color-token cleanup

---

## Verification

1. `tsc --noEmit` clean
2. Smoke test: create program → refresh → still there
3. Upload PDF → refresh → download via signed URL works
4. Try uploading to a store you don't manage → blocked by RLS
5. Run `supabase--linter` after migration

---

## Files

**New:**
- `supabase/migrations/{ts}_training_documents_backend.sql`
- `src/hooks/store/useStoreTrainingPrograms.ts`
- `src/hooks/store/useStoreTrainingAssignments.ts`
- `src/hooks/store/useStoreDocuments.ts`

**Edited:**
- `src/components/admin/store/StoreTrainingSection.tsx` (full rewrite)
- `src/components/admin/store/StoreDocumentsSection.tsx` (full rewrite)
- `.lovable/plan.md`

---

## Out of scope (future phases)

- Module-level completion tracking UI (table supports it; UI is just program-level for now)
- Document e-signature flow
- Document version history
- Bulk assign / CSV import
- Splitting `LodgingPropertyProfileSection` (Phase 13)
- Token sweep across remaining admin files (Phase 13)

Approve and I'll build it.

---

## Phase 12 — DONE (2026-04-27)

Training & Documents now persist to Supabase.

**Migration:** `store_training_programs`, `store_training_modules`, `store_training_assignments`, `store_documents` tables + private `store-documents` storage bucket. All RLS-gated by `is_lodge_store_manager(store_id, auth.uid())`.

**New hooks:**
- `useStoreTrainingPrograms` (list + upsert + remove + seedDefaults)
- `useStoreTrainingAssignments` (list + assign + unassign + updateProgress)
- `useStoreDocuments` (list + upload to bucket + remove + getSignedUrl)

**Rewritten:**
- `StoreTrainingSection.tsx` — real CRUD, Programs/Assignments/Certifications tabs, "Seed default programs" empty state, semantic color tokens
- `StoreDocumentsSection.tsx` — real file uploads (PDF/image/DOC, 50MB max), signed-URL viewing, expiry tracking, semantic tokens

**Verified:** `tsc --noEmit` clean, RLS scoped per store, files isolated by path prefix.

**Next candidates:** split `LodgingPropertyProfileSection`, sweep remaining hardcoded colors across `src/components/admin/store/**`, optional realtime subscriptions for multi-manager edits.
