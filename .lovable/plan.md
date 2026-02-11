

## Phase 10: Final Dependency Sweep + Tier-3 CORS Hardening

Phases 8 and 9 locked down sensitive functions and standardized many imports, but a full audit reveals **24 more edge functions** still using direct `esm.sh` imports instead of `_shared/deps.ts`, including several with outdated or unpinned versions. This phase finishes the job.

---

### Part A: Dependency Standardization -- 24 Remaining Functions

Every function below still imports `serve`, `createClient`, or `Stripe` directly from `esm.sh` or `deno.land/std` instead of from `_shared/deps.ts`. All will be updated to use the centralized pinned imports.

**Outdated versions (critical):**
| Function | Current Issue |
|----------|---------------|
| `duffel-flights` | std@0.177.0 + supabase@2 (unpinned) |
| `search-flights` | std@0.177.0 (also uses std crypto -- will keep crypto import separate) |
| `send-renter-invite` | std@0.168.0 + supabase@2 (unpinned) |
| `maps-api-key` | std@0.168.0 |
| `unregister-web-push` | supabase@2.39.3 (outdated) |
| `register-web-push` | supabase@2.39.3 (outdated) |
| `verify-otp-code` | supabase@2.49.1 (outdated) |
| `update-driver-location` | supabase@2.49.1 (outdated) |

**Unpinned supabase@2 (no minor version):**
| Function | Notes |
|----------|-------|
| `verify-otp-sms` | Also needs CORS lockdown |
| `send-notification` | Server-to-server, wildcard CORS ok |
| `twilio-sms-inbound` | Twilio webhook, wildcard ok |
| `run-database-backup` | Already has CORS via Phase 7 logic |
| `run-storage-backup` | Already has CORS via Phase 7 logic |
| `exchange-rates` | Public endpoint, wildcard ok |
| `process-order-notifications` | Server-to-server |
| `notifications-api` | User-facing, needs CORS lockdown |
| `exchange-auth-token` | Already has its own CORS whitelist |
| `send-travel-email` | Server-to-server |

**Correct versions but not using deps.ts (consistency):**
| Function | Notes |
|----------|-------|
| `check-flight-health` | std@0.190.0, supabase@2.57.2 |
| `create-membership-checkout` | Has cors.ts but direct esm.sh imports |
| `create-ride-checkout` | Has cors.ts but direct esm.sh imports |
| `create-eats-checkout` | Has cors.ts but direct esm.sh imports |
| `process-flight-refund` | Has cors.ts but direct esm.sh imports |
| `stripe-webhook` | Has cors.ts but direct esm.sh imports |

For `search-flights`, only `serve` will come from deps.ts. Its `crypto` and `encodeHex` imports from `std@0.177.0` will be updated to `std@0.190.0` directly (these are not in deps.ts).

---

### Part B: Tier-3 CORS Lockdown -- 5 Additional Functions

These user-facing functions handle sensitive operations but still use wildcard CORS:

| Function | Why Sensitive |
|----------|---------------|
| `verify-otp-sms` | Verifies OTP codes for phone authentication |
| `verify-otp-code` | Verifies OTP codes for email authentication |
| `notifications-api` | Reads/writes user notification data |
| `send-renter-invite` | Admin function sending invitation emails |
| `update-driver-location` | Updates real-time driver GPS coordinates |

Same pattern: replace static `corsHeaders` with `getCorsHeaders(req)` from `_shared/cors.ts`.

Functions that intentionally stay on wildcard CORS:
- Public search/data endpoints: `exchange-rates`, `duffel-flights`, `search-flights`, `maps-api-key`, `check-flight-health`
- Server-to-server/cron: `send-notification`, `process-order-notifications`, `send-travel-email`, `twilio-sms-inbound`
- Web push: `register-web-push`, `unregister-web-push` (need broad access for PWA)
- `exchange-auth-token`: already has its own origin whitelist
- `run-database-backup`, `run-storage-backup`: already updated in Phase 7

---

### Technical Details

**Dependency update pattern:**
```text
Before:
  import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
  import Stripe from "https://esm.sh/stripe@18.5.0";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

After:
  import { serve, createClient, Stripe } from "../_shared/deps.ts";
```

**CORS lockdown pattern (same as Phase 8/9):**
```text
Before:
  const corsHeaders = { "Access-Control-Allow-Origin": "*", ... };
  serve(async (req) => { ... })

After:
  import { getCorsHeaders } from "../_shared/cors.ts";
  serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);
    ...
  })
```

**Special case -- `search-flights`:**
```text
Before:
  import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
  import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
  import { encode as encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

After:
  import { serve } from "../_shared/deps.ts";
  import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
  import { encode as encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";
```

**Special case -- `exchange-auth-token`:**
Only the `createClient` import is updated to use deps.ts. Its custom CORS whitelist (which includes restaurant and driver app origins) is preserved as-is.

---

### Summary

| Part | Scope | Count |
|------|-------|-------|
| A | Dependency standardization to deps.ts | 24 functions |
| B | CORS lockdown (Tier 3) | 5 functions |
| Overlap | Functions getting both | 4 functions |
| **Total unique files modified** | | **~24 edge functions** |

No new files created. No database migrations. After this phase, every edge function in the project will use pinned dependencies from `_shared/deps.ts` and all user-facing sensitive endpoints will have origin-restricted CORS.

