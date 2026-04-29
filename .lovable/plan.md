## Fixes for the Supplier In-App Browser

Based on the AutoZonePro screenshot, the proxy now connects, but several UX and functional issues remain.

### 1. Auto-fill credentials into supplier login form
Update the script injected by `supabase/functions/supplier-proxy/index.ts` to:
- Detect login input fields (`input[type=email]`, `input[name*=user]`, `input[name*=email]`, `input[type=password]`).
- Listen for a `postMessage` from the parent (`zivo-autofill`) carrying `{ username, password }`.
- Fill the matching fields and dispatch `input` + `change` events so React/Angular forms register the value.
- Re-run on DOM mutations (handles two-step logins like AutoZonePro where the password field appears after clicking Continue).

In `SupplierBrowserModal.tsx`, after the proxied page loads (or on iframe `load`), post the saved credentials to the iframe. Add a manual "Auto-fill" button next to "Save & open" so the user can re-trigger it on page 2 of the login.

### 2. Mask password by default
In `SupplierBrowserModal.tsx`, the password input should default to `type="password"` (it currently shows plain text). The eye-toggle stays, but starts in masked state.

### 3. Fix modal layout (cramped supplier content)
- Collapse the credential bar into a compact single-line strip (~56px) once credentials are saved, with an "Edit credentials" expand toggle.
- Make the iframe area `flex-1` with `min-height: 0` so it fills remaining space.
- Remove the black footer bleed by setting `overflow: hidden` on the modal body wrapper.

### 4. Two-step login awareness
Add a small inline hint under the credential bar for known two-step suppliers (AutoZonePro, NAPA PROLink, etc.):
> "This supplier uses a 2-step login. Click Auto-fill again after entering your username."

Maintain a list in `src/config/partsSuppliers.ts` with a `loginFlow: "single" | "two-step"` field.

### 5. Visual feedback
- Toast on "Save & open": "Credentials saved locally."
- Loading skeleton inside iframe area while `loadProxyPage` is fetching.
- Toast on autofill success: "Credentials filled."

### Technical Details

**Files to modify:**
- `supabase/functions/supplier-proxy/index.ts` — extend injected script with autofill listener + MutationObserver.
- `src/components/admin/store/autorepair/SupplierBrowserModal.tsx` — collapsible credential bar, default password masking, autofill button, postMessage on iframe load, loading state, toasts.
- `src/config/partsSuppliers.ts` — add `loginFlow` field for known suppliers.

**Autofill message contract (parent → iframe):**
```ts
iframe.contentWindow?.postMessage(
  { type: "zivo-autofill", username, password },
  "*"
);
```

**Injected handler (iframe side):**
```js
window.addEventListener("message", (e) => {
  if (e.data?.type !== "zivo-autofill") return;
  const setVal = (el, val) => {
    const proto = Object.getPrototypeOf(el);
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  document.querySelectorAll("input").forEach((el) => {
    const n = (el.name + " " + el.id + " " + el.type).toLowerCase();
    if (/user|email|login/.test(n) && el.type !== "password") setVal(el, e.data.username);
    if (el.type === "password") setVal(el, e.data.password);
  });
});
```

A `MutationObserver` re-runs the same logic when new inputs appear (covers AutoZonePro's password step).

### Out of Scope
- True SSO / token-based supplier auth (would require partner API agreements).
- Storing credentials server-side (intentionally kept in `localStorage` per existing security note shown in the bar).
