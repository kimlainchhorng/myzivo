I found the current blocker: the proxy allowlist still contains mostly consumer domains, but the supplier registry now opens professional domains like `autozonepro.com` and `firstcallonline.com`. That is why the modal shows `Host not allowed: autozonepro.com`.

Plan to make the supplier connection flow work end-to-end:

1. Fix pro portal access
- Add the professional B2B hosts to the `supplier-proxy` allowlist:
  - `autozonepro.com`, `www.autozonepro.com`
  - `firstcallonline.com`, `www.firstcallonline.com`
  - `proline.napaonline.com`
  - `advancecommercial.com`, `www.advancecommercial.com`
  - plus other pro/OE hosts already listed in `partsSuppliers.ts`, such as `speeddial.worldpac.com`, `moparrepairconnect.com`, `acdelcoconnection.com`, `motorcraftservice.com`, `techinfo.toyota.com`, etc.
- Keep consumer domains too, so the Consumer site shortcut still works.

2. Improve the in-app browser failure handling
- Detect proxy responses like `403 Host not allowed` and show a helpful “portal not supported in embedded browser yet” panel instead of rendering raw text in the iframe.
- Keep the “Open in new tab” button as the reliable path for portals that block reverse proxy/webview access.
- Update the copy so users understand: “Use Account to save/copy login, then open portal to sign in.”

3. Make the account connection flow clearer
- Change “Save account” to a stronger workflow such as “Save account info” and add a primary “Open & sign in” action after saving.
- Add a small connected/saved state on supplier cards, e.g. “Account saved” or a key/check indicator, so the shop knows which supplier accounts are ready.
- Preserve the existing local-only storage behavior for now, since it avoids sending supplier passwords to Zivo servers.

4. Add portal-specific URLs where needed
- Point AutoZonePro to the correct commercial landing/login URL rather than only the root domain if needed.
- Make FirstCallOnline and NAPA PROLink open their login/search pages consistently.

Technical notes
- Files to update:
  - `supabase/functions/supplier-proxy/index.ts`
  - `src/components/admin/store/autorepair/SupplierBrowserModal.tsx`
  - `src/components/admin/store/autorepair/AutoRepairPartShopSection.tsx`
  - possibly `src/config/partsSuppliers.ts`
- No database change is needed for this fix.
- Important limitation: some supplier portals may still block embedded browsing with bot protection, SSO, or JavaScript restrictions. In that case, the best working flow is: save account info in Zivo, copy credentials, then open the pro portal in a new tab.