
## Permanent fix for TS2786 / TS2607 JSX component errors

A durable fix combining dependency alignment, tsconfig hardening, a strengthened type shim, and a CI guardrail — so this class of error stops coming back.

### Changes

**1. `package.json` — align versions + lock types**
- Upgrade `react-helmet-async` → `^2.0.5` (React 18.3 compatible)
- Upgrade `recharts` → `^2.15.0` (ships compatible JSX types for React 18.3)
- Pin `@types/react` → exact `18.3.12`
- Pin `@types/react-dom` → exact `18.3.1`
- Add `overrides` block forcing every transitive dep to resolve to the pinned `@types/react*` (prevents Bun from reintroducing a duplicate copy)
- Add scripts:
  - `"postinstall": "node scripts/check-react-types.mjs"`
  - `"check:types": "node scripts/check-react-types.mjs && tsc -b"`

**2. `tsconfig.app.json` — harden against library type conflicts**
- Keep `skipLibCheck: true`
- Add `"skipDefaultLibCheck": true`
- Add `"forceConsistentCasingInFileNames": true`
- Confirm `"include": ["src"]` so `src/types/jsx-shim.d.ts` is picked up

**3. `src/types/jsx-shim.d.ts` — keep current strengthened shim**
The current shim (extends `JSX.ElementClass` with `React.Component<any,any,any> & Record<string, any>`, plus permissive `IntrinsicAttributes`) already neutralizes the type mismatch for `recharts`, `react-helmet-async`, and `@react-google-maps/api`. No changes needed — verifying it stays in `tsconfig.app.json`'s include path.

**4. Remove the temporary `Compat` aliases**
Now that the shim + aligned versions resolve the errors, revert the `as any` workarounds added earlier in:
- `src/App.tsx` — `HelmetProvider`
- `src/components/admin/AdminLayout.tsx` — `Helmet`
- `src/components/admin/StoreOwnerLayout.tsx` — `Helmet`
- `src/components/admin/AdsStudioDashboard.tsx` — recharts primitives
- `src/components/admin/ads/AdsCampaignDetailDrawer.tsx` — recharts primitives

Back to native `<Helmet>`, `<XAxis>`, `<Bar>`, etc. — cleaner code, no runtime change.

**5. New file `scripts/check-react-types.mjs` — CI guardrail**
Walks `node_modules` for every `@types/react/package.json` and `@types/react-dom/package.json`. If more than one distinct version is found, prints the offending paths and exits with code 1. Wired to `postinstall` so every `bun install` enforces it.

```js
// pseudo
const versions = new Set();
for (const pkg of findAll('@types/react/package.json')) {
  versions.add(read(pkg).version);
}
if (versions.size > 1) { console.error(...); process.exit(1); }
```

**6. Verification**
After install:
- `bun install` → `postinstall` guard runs
- `bun run check:types` → expect zero TS2786 / TS2607 errors
- Build (`vite build`) regenerates cleanly

### Files touched
- `package.json` (deps + overrides + scripts)
- `tsconfig.app.json` (skipDefaultLibCheck, casing flag)
- `scripts/check-react-types.mjs` (new)
- `src/App.tsx`, `src/components/admin/AdminLayout.tsx`, `src/components/admin/StoreOwnerLayout.tsx`, `src/components/admin/AdsStudioDashboard.tsx`, `src/components/admin/ads/AdsCampaignDetailDrawer.tsx` (remove `Compat` aliases)
- `src/types/jsx-shim.d.ts` (kept as-is, verified included)

### Out of scope
No UI, layout, runtime, or feature changes. Pure types + dependency hygiene.
