## Goal

Right now the Parts Supplier directory points to consumer sites (autozone.com, oreillyauto.com). For a repair shop, we should point to the **professional / wholesale portals** these brands run for shops — that's where shops have real accounts, see jobber pricing, and place trade orders.

## Updates to `src/config/partsSuppliers.ts`

Replace consumer entries with their pro-shop counterparts (keeping `id` stable so existing saved credentials still load), and update `domain` + `searchUrlTemplate` + `name` accordingly:

| id | New name | New domain | Notes |
|---|---|---|---|
| `autozone` | AutoZonePro (Commercial) | `autozonepro.com` | B2B shop portal; search via `/ecomm/b2b/search?q={q}` |
| `oreilly` | FirstCallOnline (O'Reilly Pro) | `firstcallonline.com` | O'Reilly's pro-shop portal |
| `napa` | NAPA PROLink | `proline.napaonline.com` | Pro-shop portal (login required) |
| `advance` | Advance Professional (MyAdvantageLink) | `advancecommercial.com` | Pro counterpart to advanceautoparts.com |
| `carquest` | Carquest Professional | `carquestpro.com` | Worldpac/Advance shop portal |
| `pepboys` | Pep Boys Fleet | `fleet.pepboys.com` | Trade/fleet portal |
| `worldpac` | WORLDPAC speedDIAL | `speeddial.worldpac.com` | Already pro — refine domain |
| `mopar` | Mopar Professional | `moparrepairconnect.com` | Shop-facing |
| `gm-parts` | GM ACDelco Connection | `acdelcoconnection.com` | Shop portal |
| `ford-parts` | Ford Motorcraft Service | `motorcraftservice.com` | Pro/shop site |
| `toyota-parts` | Toyota TIS (techinfo) | `techinfo.toyota.com` | Tech/shop portal |
| `honda-parts` | Honda ServiceExpress | `serviceexpress.honda.com` | Pro |

Keep RockAuto, FCP Euro, Amazon, eBay, Summit, JEGS, Snap-on, Matco, Harbor Freight, LKQ, Keystone, Parts Authority, FMP, 1A Auto, PartsGeek as-is (already correct for their audience or no clean pro variant).

Add a small `consumerDomain?: string` field on the entries we converted, so we can offer a "Switch to consumer site" button later if needed (non-breaking — optional field).

Also add a short `description?: string` for each pro portal (e.g. "Trade pricing · login required") so the cards can show it.

## Logo handling

`PartsSupplierLogo.tsx` already does favicon fallback chain (Google S2 → DuckDuckGo → icon.horse → monogram). Pro portals usually share branding with the parent — favicons resolve fine. No changes required to that component.

The Clearbit lookup in `getSupplierLogoUrl` may miss some pro subdomains, so update it to also try the **root brand domain** as a second source:

```ts
getSupplierLogoUrl(supplier) → 
  [`logo.clearbit.com/${supplier.domain}`, 
   `logo.clearbit.com/${rootDomain(supplier.domain)}`]
```

(`rootDomain` strips the leading subdomain.)

## SupplierBrowserModal

No structural change needed — but since pro portals **all** require login and most block iframe embedding even via our proxy, update the blocked-state copy to be honest:

> "{supplier.name} is a trade portal — open it in a new tab to log in with your shop account. We'll keep your saved credentials here for quick paste-in."

And surface a small "Consumer site" link in the header when `consumerDomain` is set, so the user can fall back to e.g. autozone.com when they just want to look up a part publicly.

## Files touched

- `src/config/partsSuppliers.ts` — update entries, add `consumerDomain` and `description` optional fields, refine `getSupplierLogoUrl`
- `src/components/admin/store/autorepair/SupplierBrowserModal.tsx` — update blocked-state copy, add optional "Consumer site" header link
- `src/components/admin/store/autorepair/AutoRepairPartShopSection.tsx` — show `description` under the supplier name on the cards (1 line, muted, text-[10px])

No DB / edge-function changes. Existing saved credentials in localStorage continue to work because supplier `id`s are unchanged.
