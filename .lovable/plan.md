

# Hardening store-assets uploads: tests, safeguards, verification, and backfill

Five linked improvements to the `store-assets` upload flow.

## 1. Shared upload helper with verification + revert

New `src/pages/admin/utils/uploadStoreAsset.ts`:

```ts
type Surface = "gallery" | "logo" | "cover" | "room";
export async function uploadStoreAsset({ storeId, file, surface, subfolder }) {
  // 1. Build path: `${storeId}/...` (room -> `${storeId}/products/...`)
  // 2. supabase.storage.from('store-assets').upload(path, file, { upsert: true })
  // 3. VERIFY: list parent folder, confirm uploaded filename present
  // 4. getPublicUrl -> HEAD fetch, expect 200 (verification)
  // 5. Return { path, publicUrl }
  // Throws labeled error: `${surface} upload failed: ${reason}`
}
```

Used by all four call sites in `AdminStoreEditPage.tsx`.

## 2. Editor: revert preview on failure + surface label

Track previous value before each upload; on `catch` restore it and toast with surface name.

`src/pages/admin/AdminStoreEditPage.tsx`:
- `uploadImage(logo|cover)` — capture `prevUrl = form.logo_url|banner_url`; on error `updateField(field, prevUrl)` + toast `Profile/Cover image upload failed`.
- `uploadGalleryImage` — capture `prev = galleryImages`; on error `setGalleryImages(prev)`.
- `uploadProductImage` — capture `prevUrls = productForm.image_urls`; on error `updateProductField('image_urls', prevUrls)`.

## 3. Auto-verify URL persisted to correct profile field

After each `store_profiles` update (logo/cover/gallery), re-`select` the row and assert the URL was stored. If mismatch, toast `Saved URL did not persist — try again` and revert local state. For `room` images, re-select the `store_products` row after save.

## 4. Backfill old `products/<storeId>/...` paths

New migration `supabase/migrations/<ts>_backfill_store_assets_products_path.sql`:

```sql
-- Move existing storage rows
UPDATE storage.objects
SET name = regexp_replace(name, '^products/([^/]+)/(.*)$', '\1/products/\2')
WHERE bucket_id = 'store-assets'
  AND name LIKE 'products/%';

-- Update any URLs stored in store_products.image_url / image_urls
UPDATE public.store_products
SET image_url = replace(
  image_url,
  '/store-assets/products/' || store_id || '/',
  '/store-assets/' || store_id || '/products/'
)
WHERE image_url LIKE '%/store-assets/products/' || store_id || '/%';

UPDATE public.store_products
SET image_urls = (
  SELECT jsonb_agg(
    replace(
      url::text,
      '/store-assets/products/' || store_id || '/',
      '/store-assets/' || store_id || '/products/'
    )::jsonb
  )
  FROM jsonb_array_elements(image_urls) url
)
WHERE image_urls::text LIKE '%/store-assets/products/' || store_id || '/%';
```

## 5. Vitest RLS test suite

New `src/test/rls/storeAssetsRls.test.ts` (uses anon key + signs in two test users via env-provided credentials; skipped if env not set):

Tests:
- Owner A can `upload` to `${storeIdA}/gallery-x.jpg` ✓
- Owner A can `upload` to `${storeIdA}/logo-x.jpg` ✓
- Owner A can `upload` to `${storeIdA}/cover-x.jpg` ✓
- Owner A can `upload` to `${storeIdA}/products/x.jpg` ✓
- Owner A `upload` to `${storeIdB}/...` → fails with RLS ✗
- Owner A `update` and `delete` of B's objects → fail ✗
- Admin can read/write any path ✓

Add npm script `"test:rls": "vitest run src/test/rls"` and a README in `src/test/rls/README.md` listing the four required env vars (`VITE_TEST_OWNER_A_EMAIL/PASSWORD/STORE_ID`, same for B).

## Files

- New: `src/pages/admin/utils/uploadStoreAsset.ts`
- Edit: `src/pages/admin/AdminStoreEditPage.tsx` (4 upload functions → use helper, add revert + verify-persist)
- New migration: backfill + URL rewrite
- New: `src/test/rls/storeAssetsRls.test.ts` + `README.md`
- Edit: `package.json` (add `test:rls` script)

## Out of scope

- Changing `StoreSetup.tsx` `setup/<userId>/...` paths (different RLS shape — separate fix).
- Admin dashboard `temp/...` uploads in `AdminStoresPage.tsx` (admin-only flow already works).
- Backfilling deleted/orphaned objects.

