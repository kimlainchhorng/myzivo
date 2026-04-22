

# Verify and finalize store-assets hardening + add owner self-check page

Most of this work was completed in the prior turns. This plan **verifies what already shipped**, fills the **two genuinely missing pieces**, and avoids re-doing what's done.

## What's already done (verified in repo)

| Requirement | Status | Where |
|---|---|---|
| Backfill old `products/<storeId>/...` → `<storeId>/products/...` (storage rows + URLs in `store_products`) | ✅ Done | `supabase/migrations/20260422035609_*.sql` |
| Owner-only write/update/delete on `store-assets`, admins full access | ✅ Done | `supabase/migrations/20260422040327_*.sql` (latest, uses qualified `storage.objects.name`) |
| Editor reverts preview + per-surface error toast (gallery/logo/cover/room) | ✅ Done | `src/pages/admin/AdminStoreEditPage.tsx` via `uploadStoreAsset.ts` helper |
| Upload helper verifies object exists + HEAD-checks public URL | ✅ Done | `src/pages/admin/utils/uploadStoreAsset.ts` |
| RLS test suite (owner A allowed paths, owner B blocked, admin full) | ✅ Done | `src/test/rls/storeAssetsRls.test.ts` + `npm run test:rls` |

## What's missing — the two new pieces

### 1. Self-check page: `/admin/stores/:id/upload-check`

A small in-app diagnostic that the signed-in store owner can hit to confirm all four upload surfaces work end-to-end, with clear pass/fail per surface.

**New file**: `src/pages/admin/StoreAssetsUploadCheck.tsx`

- Header: "Store assets upload check" + store name
- Four rows, one per surface: **Gallery**, **Profile / Logo**, **Cover**, **Room / Product**
- Each row has a "Run check" button (or a single "Run all" at top) that:
  1. Generates a tiny PNG `Blob` in-memory (1×1 transparent pixel — same one used in the RLS tests)
  2. Calls `uploadStoreAsset({ storeId, file, surface })` from the existing helper
  3. On success: green badge `Passed`, shows the resolved public URL (clickable), and immediately deletes the test object via `supabase.storage.from('store-assets').remove([path])` so we don't leave litter
  4. On failure: red badge `Failed` + the exact error string returned (already labeled by surface, e.g. `Gallery upload failed: new row violates row-level security policy`)
- "Run all" button runs the four sequentially and shows a final summary line: `4/4 passed` or `2/4 passed — see failures above`
- Footer link back to the store editor

**Route**: register in `src/App.tsx` (or wherever store admin routes live — same pattern as `AdminStoreEditPage`):
```
<Route path="/admin/stores/:id/upload-check" element={<StoreAssetsUploadCheck />} />
```

**Editor entry point**: in `src/pages/admin/AdminStoreEditPage.tsx`, add a small "Run upload check" link in the page header next to the existing actions, pointing to the new route. One-line change.

### 2. RLS test coverage gap — admin can read/write across stores

The existing admin test only verifies admin **upload**. Add two more cases inside the existing `describeAdmin` block in `src/test/rls/storeAssetsRls.test.ts`:

- **Admin can update** an object in any store folder (overwrite without `upsert`)
- **Admin can delete** an arbitrary object they uploaded under another store's folder

This closes the "admins keep full access" half of the test matrix.

No new file, no new env vars — uses the same `VITE_TEST_ADMIN_*` already documented in `src/test/rls/README.md`.

## Files

- **New**: `src/pages/admin/StoreAssetsUploadCheck.tsx`
- **Edit**: `src/App.tsx` — register the new route
- **Edit**: `src/pages/admin/AdminStoreEditPage.tsx` — add "Run upload check" link in header
- **Edit**: `src/test/rls/storeAssetsRls.test.ts` — add 2 admin update/delete cases

## Out of scope

- Changing existing migrations (already applied)
- Re-implementing the upload helper or revert/verify behavior (already shipped)
- Any new SQL — every requirement in the request is already enforceable with current policies; the self-check page is a UI-only diagnostic

## Verification (manual, after implementation)

1. Open `/admin/stores/<your-store-id>/upload-check` as a store owner → click **Run all** → expect 4/4 green.
2. Open the same URL while signed in as a different non-owner non-admin user → expect 4/4 red with the RLS error labeled per surface.
3. `npm run test:rls` (with the documented env vars) passes all owner + admin cases including the two new admin update/delete checks.

