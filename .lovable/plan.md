

# Fix Add Product dialog: inputs remounting on every keystroke

## Root cause (from session replay)

The replay shows each typed character lands in a **different DOM element id** on the next keystroke (155476 → 156165 → 156854 → 157543). That means the input fields are being **unmounted and remounted on every keystroke** — not just re-rendered. The previous `dvh` + `onOpenAutoFocus` fix only addressed mobile keyboard viewport jumps; it did not address remounts, which is why the user still sees the dialog "jump up" while typing.

The remount is triggered by parent re-renders of `AdminStoreEditPage` (5,000+ line component) that change subtree identity around the dialog. Likely contributors:

1. The auto-draft `useEffect` (lines 564–571) writes to `localStorage` on every `productForm` change, which combined with React Query refetches and the surrounding `<Tabs>`/list re-renders causes the entire dialog JSX subtree to be re-evaluated in a way that loses input identity.
2. The dialog (`lines 3504–4490`, ~1,000 lines of JSX) is inlined inside the page render. Any sibling state change (product list refetch, image upload progress, tag dropdown updates) re-runs this huge JSX block.
3. A few inputs use `defaultValue` + `key={\`...-${productDialog}\`}` (line 4032), but the `productDialog` boolean only flips on open/close — that key is fine. The remount affects controlled `value={productForm.X}` inputs too, so the cause is parent-level, not key-level.

## Fix

### 1. Extract the dialog into a memoized child component

Create `src/pages/admin/components/ProductFormDialog.tsx`:

- Accepts props: `open`, `onOpenChange`, `productForm`, `setProductForm`, `editingProduct`, `form` (store form, for category/khr_rate/name), `savedCategories/Brands` + setters, `customBydModels`, image upload handlers, `onSave`, `onSaveAndAddAnother`, `t` (translation).
- Wrapped in `React.memo` so it only re-renders when its own props change.
- Internally holds the entire JSX currently at lines 3503–4490.

Result: refetches and unrelated state changes in the parent no longer rebuild the dialog's input tree, so React preserves input identity and focus across keystrokes.

### 2. Stop the draft effect from firing on every keystroke

In `AdminStoreEditPage.tsx` lines 564–571, debounce the `localStorage.setItem` to ~400 ms (using a `setTimeout` cleared on next change). The draft is a "don't lose work" safety net; saving on every character is unnecessary work and one of the things triggering parent re-renders mid-typing.

### 3. Stabilize callback identities passed to the dialog

In the parent, wrap `updateProductField`, `uploadProductImage`, `removeProductImage`, `saveProduct`, and `setProductDialog` consumers in `useCallback` so the memoized child doesn't re-render needlessly.

### 4. Remove the now-unnecessary remount key

Line 4032: `key={\`price-${editingProduct?.id || "new"}-${productDialog}\`}` — once the parent stops remounting, this key (which was a band-aid) can be removed; the input should switch to controlled `value` to stay in sync with KHR auto-conversion.

## Verification

- Manual: open Add Product dialog on mobile (390×844), type a long name like "Premium Cambodia Mango Juice 500ml" — no scroll jump, focus never lost, no character drop.
- Replay check: after fix, every keystroke for a single field should land on the **same** element id, not a new one each time.
- Desktop: same behavior, no regression to image upload or KHR/USD price sync.

## Files

- **Create**: `src/pages/admin/components/ProductFormDialog.tsx` (extracted dialog, `React.memo`)
- **Edit**: `src/pages/admin/AdminStoreEditPage.tsx` — replace inline dialog JSX with `<ProductFormDialog ... />`, debounce draft effect, wrap handlers in `useCallback`, drop the price input's `key`

## Out of scope

- Refactoring the rest of the 5,000-line page
- Changing the product schema or KHR/USD conversion logic
- The unrelated "Missing Description for DialogContent" a11y warning in the console (separate issue)

