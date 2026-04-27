# Add "Software & Apps" Sidebar Section (Hotel & Shop)

Add a new sidebar entry that lets store owners (both hotels and regular shops) **download companion software / mobile apps** to operate their business — e.g., POS app, Front-Desk app, Housekeeping app, Driver app, Printer drivers.

## What the user gets

A new **Software & Apps** item in the sidebar (visible to both lodging and non-lodging stores). Clicking it opens a dedicated tab with a clean grid of downloadable apps:

- **For Hotels:** Front Desk app, Housekeeping app, Property Manager (desktop), Receipt Printer driver
- **For Shops/Eats/Auto-Repair:** POS app, Kitchen Display, Inventory Scanner, Receipt Printer driver
- **For everyone:** ZIVO Driver app, ZIVO Manager mobile app

Each card shows: app icon, name, short description, supported platforms (iOS / Android / Windows / macOS), version badge, and **Download** buttons (App Store, Google Play, .exe, .dmg). Coming-soon apps show a "Notify me" button instead.

## Files to change

**1. `src/components/admin/StoreOwnerLayout.tsx`**
- Add `Download` icon import.
- Insert a new sidebar item near the bottom of `navItems`:
  ```ts
  { id: "software", label: "Software & Apps", icon: Download }
  ```
- Place it after `livestream` so it appears for both lodging and non-lodging stores.

**2. `src/lib/admin/storeTabRouting.ts`**
- Add `"software"` to `BASE_TAB_IDS` so the tab is recognized by the router and survives reload via `?tab=software`.

**3. `src/components/admin/store/SoftwareDownloadsSection.tsx` (NEW)**
- Self-contained section component, accepts `storeCategory` prop.
- Defines a `SOFTWARE_CATALOG` array with entries:
  ```ts
  { id, name, description, audience: "hotel" | "shop" | "all",
    platforms: ["ios"|"android"|"windows"|"macos"],
    downloads: { ios?, android?, windows?, macos? },
    icon, status: "available" | "coming-soon", version }
  ```
- Filters catalog by `storeCategory` (hotel-only apps hidden for shops, and vice-versa).
- Renders responsive grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`), v2026 high-density compact cards using `.zivo-card-organic`, Lucide icons, emerald accents.
- Platform badges + Download buttons that open external links via `window.open(url, "_blank", "noopener,noreferrer")` (use `urlSafety` allowlist for store URLs).

**4. `src/pages/admin/AdminStoreEditPage.tsx`**
- Add title entry: `activeTab === "software" ? "Software & Apps"` to `storeOwnerTitle`.
- Add a new `<TabsContent value="software">` rendering `<SoftwareDownloadsSection storeCategory={form.category} />` near the other tab contents.

## Initial catalog (placeholder links — owner can swap real URLs later)

| App | Audience | Platforms |
|---|---|---|
| ZIVO Manager | all | iOS, Android |
| ZIVO POS | shop | iOS, Android, Windows |
| ZIVO Front Desk | hotel | iOS, iPad, Windows |
| ZIVO Housekeeping | hotel | iOS, Android |
| ZIVO Kitchen Display | shop (eats) | iPad, Android tablet |
| ZIVO Driver | all | iOS, Android |
| Receipt Printer Driver | all | Windows, macOS |
| Inventory Scanner | shop | Android |

Coming-soon entries get a disabled button + "Notify me" toast.

## Notes

- No backend changes needed — this is a static catalog page.
- Follows existing sidebar conventions (Lucide icon, label string, id wired through `storeTabRouting`).
- Honors the project's "no emojis, Lucide-only" icon standard and v2026 compact UI density.
