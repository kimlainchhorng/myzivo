

# Fix store-posts upload RLS failure (Post Picture / Post Video dialog)

All uploads in the **Post Picture** dialog fail with *"new row violates row-level security policy"* because the storage path doesn't match the bucket's RLS policy.

## Root cause

`store-posts` bucket policy (migration `20260402153243`) requires the first folder of the object path to equal the uploader's `auth.uid()`:

```sql
WITH CHECK (
  bucket_id = 'store-posts'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
```

But `uploadPostMedia` in `src/pages/admin/AdminStoreEditPage.tsx` (line 1263) builds:

```ts
const path = `posts/${storeId}/${Date.now()}-${mediaItemId}.${ext}`;
```

First folder = `"posts"` → fails the policy → every upload tile shows "Upload failed".

## Fix — single edit

`src/pages/admin/AdminStoreEditPage.tsx` (`uploadPostMedia`, ~line 1263):

Change the upload path to put the user's UID first, keeping `storeId` and the original posts/ namespace inside it for organization:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("Not signed in");
const path = `${user.id}/${storeId}/${Date.now()}-${mediaItemId}.${ext}`;
```

This satisfies `(storage.foldername(name))[1] === auth.uid()` so the INSERT policy passes. Public read policy is unaffected (it only checks `bucket_id`). The DELETE policy uses the same `auth.uid()` first-folder rule, so deletes by the same owner continue to work.

`getPublicUrl(path)` immediately after still returns a valid URL — no DB schema change, no migration, no other code paths affected.

## Verification

After the change, dragging photos into the **Post Picture** dialog uploads cleanly, the green "Ready" badge appears, and **New Post** becomes enabled. Existing posts (which use the old `posts/<storeId>/...` paths) keep rendering because the public SELECT policy doesn't care about folder structure.

## Files

- **Edited**: `src/pages/admin/AdminStoreEditPage.tsx` — 2 lines inside `uploadPostMedia` (fetch user, change path).

## Out of scope

- Backfilling old uploaded files (none failed historically — old policy was looser).
- Touching `store-logos` / gallery upload paths (different bucket, different working policy).

