

## Edge Function Bundling Hardening

Make Supabase edge function deployments deterministic and avoid the `esm.sh` 10s fetch timeout that broke `create-lodging-deposit`.

### What changes

1. **Pin a single Supabase SDK version via `npm:` in `_shared/deps.ts`** — the canonical import for every function. No `esm.sh`, no floating versions. Pin `@supabase/supabase-js@2.49.1` (already in use; keep the exact pin).

2. **Audit and rewrite stray non-`npm:` Supabase imports** — sweep `supabase/functions/**/index.ts` for any `https://esm.sh/@supabase/...` or bare `npm:@supabase/supabase-js@2` (unpinned) imports and route them through `_shared/deps.ts` so there's one source of truth. Known offender: `check-device-integrity/index.ts` uses `npm:@supabase/supabase-js@2` (unpinned). Will replace with `import { createClient } from "../_shared/deps.ts"`.

3. **Add `_ping` smoke-test edge function** — a tiny function that imports only `createClient` from `_shared/deps.ts` and returns `{ ok: true, sdk: "2.49.1" }`. Deploying this confirms the shared deps module bundles cleanly before we touch larger functions. Acts as a permanent canary.

4. **Document the bundling rules in `_shared/deps.ts` header** — short comment block stating: always import Supabase from this file, always use `npm:` specifiers, never `esm.sh` for npm packages, pin exact versions. Future edits will see it immediately.

5. **Bundling timeout** — Supabase's 10s deploy-time fetch timeout is platform-fixed and not configurable from the project. The real fix is removing slow CDN fetches (steps 1–2), which we're doing. No code change needed; will note this in the deps header.

6. **Local build verification** — add `supabase/functions/_shared/README.md` with a one-command Deno check users can run locally (`deno check supabase/functions/**/*.ts`) to catch import resolution issues before deploy. No CI wiring (project has none); just a documented manual gate.

### Files

- `supabase/functions/_shared/deps.ts` — keep `npm:@supabase/supabase-js@2.49.1`, add header comment with rules.
- `supabase/functions/check-device-integrity/index.ts` — switch import to `_shared/deps.ts`.
- `supabase/functions/_ping/index.ts` — **new**, minimal canary function.
- `supabase/functions/_shared/README.md` — **new**, bundling + local check guidance.

### Out of scope

- Auditing every single function's third-party imports (Stripe, etc.) — only Supabase SDK imports are in scope for this fix. Stripe already lives behind `_shared/stripe.ts`.
- Changing Supabase's platform bundler timeout — not user-configurable.

### Verification after deploy

Deploy `_ping` and `check-device-integrity` first (small graphs). If both succeed, redeploy `create-lodging-deposit` to confirm the original failure is gone.

