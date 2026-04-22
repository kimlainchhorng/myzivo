
Fix the hotel profile image uploads too. This error is a different bucket than the post uploader.

## Root cause

The failing **Gallery Images / logo / cover / product-room image** uploads in the store owner editor use the **`store-assets`** bucket, not `store-posts`.

Current owner-side upload code in `src/pages/admin/AdminStoreEditPage.tsx` writes to:

- Gallery: `${storeId}/gallery-${Date.now()}.${ext}`
- Logo/Cover: `${storeId}/${type}-${Date.now()}.${ext}`
- Product/Room image: `products/${storeId}/${Date.now()}.${ext}`

But the only write policies on `store-assets` are admin-only:

`supabase/migrations/20260325165235_72a3131e-c731-4e39-bdae-e02510823b51.sql`
- INSERT/UPDATE/DELETE require `public.has_role(auth.uid(), 'admin')`

So a signed-in **Store Owner** can update `store_profiles`, but cannot upload files into `store-assets`, which is why the UI still shows:

`new row violates row-level security policy`

The previous fix only solved `store-posts` for the Post Picture dialog.

## Implementation

### 1) Add store-owner write access to `store-assets`
Create a new SQL migration that keeps admin access, but also allows a store owner to upload/delete assets for stores they own.

Recommended rule:
- Owner uploads are allowed when the storage path resolves to a store they own in `public.store_profiles.owner_id`.

Use path-aware policies for these shapes:
- `<storeId>/...` for logo, cover, gallery
- `<storeId>/products/...` for product/room images

This is cleaner than the current mixed pattern.

### 2) Standardize owner uploads to storeId-first paths
Update `src/pages/admin/AdminStoreEditPage.tsx` so all owner-side `store-assets` uploads use the same structure:

- Gallery: `${storeId}/gallery-${Date.now()}.${ext}`
- Logo/Cover: `${storeId}/${type}-${Date.now()}.${ext}`
- Product/Room image: change from `products/${storeId}/...` to `${storeId}/products/${Date.now()}.${ext}`

This makes one storage policy cover all owner asset uploads.

### 3) Keep admin-only admin dashboard behavior unchanged
`src/pages/admin/AdminStoresPage.tsx` uses `store-assets` with a temp path and is part of the admin dashboard. That flow can stay admin-only.

No change needed there unless you also want non-admin store owners to use that page.

### 4) Improve upload error clarity
In `AdminStoreEditPage.tsx`, keep the existing toast, but add slightly clearer per-surface messaging so failures say which upload failed:

- “Gallery upload failed”
- “Profile image upload failed”
- “Cover image upload failed”
- “Room image upload failed”

That makes future bucket-policy issues easier to spot.

## Technical details

Recommended policy logic in the migration:

- Keep existing admin policies or replace them with broader policies:
  - Admins can manage any object in `store-assets`
  - Store owners can manage objects in `store-assets` when the first path segment is a `store_profiles.id` they own

Example ownership check shape:
```sql
exists (
  select 1
  from public.store_profiles sp
  where sp.id::text = (storage.foldername(name))[1]
    and sp.owner_id = auth.uid()
)
```

Because product uploads will be moved to:
```text
<storeId>/products/<filename>
```
the first folder remains the store ID, so one rule works for gallery, logo, cover, and product/room images.

## Files

- New migration in `supabase/migrations/*` — extend `store-assets` storage RLS for store owners
- `src/pages/admin/AdminStoreEditPage.tsx` — standardize `store-assets` paths and improve upload toasts

## Verification

After the fix, test as a **Store Owner** on `/admin/stores/:id`:

1. Upload a **Gallery Image**
2. Upload **Profile image**
3. Upload **Cover image**
4. Upload a **Room/Product image**

Expected:
- No RLS toast
- Public URLs save into `store_profiles`
- Existing old images still render
- New uploads appear immediately

## Out of scope

- Backfilling old `products/<storeId>/...` asset paths
- Changing public read access on `store-assets`
- Reworking the separate `store-posts` bucket again
