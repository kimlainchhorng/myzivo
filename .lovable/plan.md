

## Phase 11: Final Dependency Cleanup + Security Scan Verification

### Security Scan Results

All scans passed clean:
- **Supabase DB Linter**: No issues found
- **Security Scanner**: No new vulnerabilities
- **Existing Findings**: All 5 agent_security findings are already triaged and ignored (properly assessed)
- **2 stale findings to dismiss**: `abandoned_searches_email_exposure` and `analytics_events_missing_rls` -- both tables have proper RLS policies with admin-only SELECT. These findings are outdated and will be updated.

### Remaining Dependency Issue

The audit reveals **18 edge functions** that still use direct `esm.sh`/`deno.land` imports instead of `_shared/deps.ts`. These were CORS-locked in Phases 8/9 but their import lines were not consolidated. Additionally, 5 functions have **outdated pinned versions** (`@2.39.3`, `@2.49.1`).

---

### Part A: Dependency Consolidation -- 18 Functions

Functions already using `_shared/cors.ts` but still importing serve/Stripe/createClient directly:

| Function | Current Imports | Needed from deps.ts |
|----------|----------------|---------------------|
| `create-ride-payment-intent` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `create-eats-payment-intent` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `create-flight-checkout` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `create-travel-checkout` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `create-p2p-checkout` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `process-refund` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `process-p2p-refund` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `process-p2p-payout` | std@0.190.0, supabase@2.57.2 | serve, createClient |
| `execute-p2p-payout` | std@0.190.0, stripe@18.5.0, supabase@2.57.2 | serve, Stripe, createClient |
| `assess-fraud` | std@0.190.0, supabase@2.57.2 | serve, createClient |

Functions with wildcard CORS (intentionally -- server-to-server or public):

| Function | Current Issue | Needed from deps.ts |
|----------|---------------|---------------------|
| `send-travel-confirmation` | supabase@2.57.2 | serve, createClient |
| `send-incident-notification` | supabase@2.57.2 + Resend@2.0.0 | serve, createClient (keep Resend separate) |
| `send-flight-email` | supabase@2.57.2 | serve, createClient |

**Outdated versions (critical):**

| Function | Current Version | Fix |
|----------|----------------|-----|
| `send-push-notification` | supabase@2.39.3 | serve, createClient from deps.ts |
| `send-otp-email` | supabase@2.49.1 | serve, createClient from deps.ts |
| `demand-optimizer` | supabase@2.49.1 | createClient from deps.ts |
| `check-driver-rate-limit` | supabase@2.49.1 | createClient from deps.ts |
| `check-fraud-signals` | jsr:supabase@2 (unpinned) | createClient from deps.ts |

---

### Part B: Dismiss Stale Security Findings

Two open security findings are no longer valid:

1. **`abandoned_searches_email_exposure`** (ERROR level): RLS verified -- SELECT restricted to admin-only via `has_role(auth.uid(), 'admin')`. Service role handles INSERT. No public exposure.

2. **`analytics_events_missing_rls`** (WARN level): RLS verified -- SELECT restricted to admin/super_admin roles. INSERT restricted to authenticated users. No cross-user data access.

Both will be updated with ignore flags and verification notes.

---

### Technical Details

**Import consolidation pattern (same as Phase 10):**

```text
Before:
  import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
  import Stripe from "https://esm.sh/stripe@18.5.0";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
  import { getCorsHeaders } from "../_shared/cors.ts";

After:
  import { serve, createClient, Stripe } from "../_shared/deps.ts";
  import { getCorsHeaders } from "../_shared/cors.ts";
```

For `check-fraud-signals` (uses jsr: prefix and Deno.serve):
```text
Before:
  import { createClient } from "jsr:@supabase/supabase-js@2";

After:
  import { createClient } from "../_shared/deps.ts";
```

For `send-incident-notification` (has Resend -- keep separate):
```text
Before:
  import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
  import { Resend } from "https://esm.sh/resend@2.0.0";

After:
  import { serve, createClient } from "../_shared/deps.ts";
  import { Resend } from "https://esm.sh/resend@2.0.0";
```

---

### Summary

| Part | Scope | Count |
|------|-------|-------|
| A | Dependency consolidation to deps.ts | 18 functions |
| B | Dismiss stale security findings | 2 findings |
| **Total unique files modified** | | **18 edge functions** |

No new files. No database migrations. After this phase, every edge function will import exclusively from `_shared/deps.ts` (except specialized libs like Resend and std/crypto), completing the dependency standardization initiative.

