# Restore the Auto Repair shop dashboard

## What's wrong

Your store `AB Complete Car C…` is categorized as **auto repair**. The full auto‑repair admin you remember (Profile, Orders, Services, Bookings, Estimates, Invoices, Customer Vehicles, Auto Check VIN, Work Orders, Inspections, Technicians & Bays, Reminders & Recalls, Part Shop, Tire Inventory, Warranty, Fleet, Settings — image 1) is rendered by `StoreOwnerLayout` at:

```
/admin/stores/:storeId
```

But the **"Switch to Shop"** button on your Profile is hard‑coded in `src/pages/Profile.tsx` to send every store owner to `/shop-dashboard`, which is the generic e‑commerce skeleton in image 2. That's why your auto‑repair UI looks "missing."

A category‑aware router (`resolveBusinessDashboardRoute` in `src/lib/business/dashboardRoute.ts`) already exists and returns `/admin/stores/:id` for non‑restaurant / non‑lodging stores — Profile just isn't calling it.

On top of that, the Part Shop tab inside the real auto‑repair dashboard is throwing the red "A runtime issue occurred" banner (visible at the top of image 1).

## Fix

### 1. Profile → use the category-aware resolver
`src/pages/Profile.tsx`, `getShopDashboardPath()`:
- Read the owner's store via the `useOwnerStoreProfile` hook already on the page.
- Return `resolveBusinessDashboardRoute(store.category, store.id)` when a store exists.
- Fall back to `/shop-dashboard` only when the user has no store yet.

Result: tapping "Switch to Shop" opens `/admin/stores/<your-store-id>` and your full Auto Repair sidebar is back.

### 2. `/shop-dashboard` itself → redirect, don't replace
`src/pages/app/ShopDashboard.tsx`:
- If the signed‑in user owns a store whose category is not "generic shop", `<Navigate>` to the resolved route.
- Only render the generic shop UI when the owner has a generic shop (or no store).

This protects every other entry point still linking to `/shop-dashboard` (MorePage, CreatorDashboardPage, MonetizationPage, DigitalProductsPage…) so they all land on the right dashboard automatically.

### 3. Fix the Part Shop runtime crash
Open `/admin/stores/<id>` with the Part Shop tab active in the preview, capture the actual stack from the runtime‑errors snapshot, and patch the offending line in `AutoRepairPartShopSection.tsx` / `AutoRepairPartSuppliersSection.tsx` (most likely an undefined‑access in the supplier render loop or a missing column on `parts`). Verify the tab renders without the red banner.

## Files touched

- `src/pages/Profile.tsx` — replace hard‑coded `/shop-dashboard` with the category resolver
- `src/pages/app/ShopDashboard.tsx` — add owner‑store redirect at the top
- `src/components/admin/store/autorepair/AutoRepairPartShopSection.tsx` (and/or its Suppliers sibling) — fix runtime crash, exact line confirmed once I read the live error

## Out of scope

- Renaming the `/shop-dashboard` URL itself (kept for backward compatibility).
- Moving the Lazada/Taobao Import Shop into the auto‑repair sidebar — it stays at `/admin/shop`.
- Any visual redesign of the auto‑repair dashboard — purely a routing + crash fix.