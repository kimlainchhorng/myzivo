## Fix lodging pages — wrong table + broken thumbnails

DB confirmed: Koh Sdach Resort exists in `store_profiles` (category `resort`, has `address`, `banner_url`, `logo_url`). The pages currently query a non-existent `stores` table, so the list is empty and the detail page would 404.

### 1. `src/pages/lodging/HotelsLandingPage.tsx`
- `.from("stores")` → `.from("store_profiles")`
- Replace `city, country` columns with `address, banner_url`
- Update `DirectoryStore` interface and search haystack to use `address`
- `PropertyCard`: prefer `banner_url` over `logo_url` for cover, show `address` as location
- Featured carousel: prefer `banner_url`
- Replace broken Unsplash photo URLs in `POPULAR_DESTINATIONS` with `https://source.unsplash.com/240x160/?<keywords>` and add `onError` → hide `<img>` so the gradient fallback shows

### 2. `src/pages/lodging/HotelsResortsDirectoryPage.tsx`
- Same table + column rename (`stores` → `store_profiles`, `city/country` → `address`)
- Update `DirectoryStore`, query, search haystack, `PropertyCard` location

### 3. `src/pages/lodging/HotelResortDetailPage.tsx`
- `StoreRow`: drop `city, country, website`; add `address, banner_url, phone`
- Query: `.from("store_profiles")` selecting `id, name, category, address, logo_url, banner_url, description, phone, setup_complete`
- `cover` uses `banner_url || logo_url`
- `location` = `store?.address || ""`
- Contact section: replace `store?.website` references with `store?.phone` (render as `tel:` link if not already shown by `profile.contact.phone`)

### 4. Verify
After edits, all three pages should compile clean and Koh Sdach Resort should appear in the directory and open from `/hotel/<id>`.
