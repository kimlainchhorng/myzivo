

## Phase 9: Tier-2 CORS Lockdown + Remaining Dependency Standardization

Phase 8 locked down 17 payment/refund/payout functions. This phase completes coverage for the remaining sensitive functions (admin, auth, financial, booking) and standardizes dependency versions across all remaining edge functions still using outdated or unpinned imports.

---

### Part A: CORS Lockdown -- 13 Sensitive Functions (Tier 2)

These functions handle admin operations, membership billing, ticketing, gift cards, booking confirmations, and OTP verification. All currently use wildcard `Access-Control-Allow-Origin: "*"` and must switch to `getCorsHeaders(req)`.

| Function | Category | Why Sensitive |
|----------|----------|---------------|
| `admin-travel-dashboard` | Admin | Full admin panel with order flagging/updates |
| `cancel-membership` | Financial | Cancels Stripe subscriptions |
| `customer-portal-membership` | Financial | Stripe customer portal access |
| `create-stripe-connect-link` | Financial | Creates Stripe Connect onboarding links |
| `check-stripe-connect-status` | Financial | Reads Stripe Connect account status |
| `issue-flight-ticket` | Ticketing | Issues real flight tickets via Duffel |
| `confirm-hotelbeds-booking` | Booking | Confirms hotel bookings with provider |
| `redeem-gift-card` | Financial | Redeems gift card balances |
| `create-travel-order` | Order | Creates travel orders with payment references |
| `request-travel-cancellation` | Booking | Initiates cancellation requests |
| `resolve-flight-incident` | Admin | Resolves flight incidents with refunds |
| `resend-travel-confirmation` | Booking | Re-sends booking confirmations |
| `sync-offline-actions` | Data | Syncs offline data changes to server |

Same pattern as Phase 8: replace static `corsHeaders` with `import { getCorsHeaders } from "../_shared/cors.ts"` and `const corsHeaders = getCorsHeaders(req)` inside the handler.

Note: `create-auth-token` already has its own origin whitelist -- it will be updated to use the shared module for consistency, while preserving its additional `Access-Control-Allow-Credentials` header.

---

### Part B: Dependency Version Standardization -- 27 Functions

27 edge functions still use the outdated `std@0.168.0` Deno standard library, and 38 use the unpinned `@supabase/supabase-js@2` (no minor/patch version). All will be updated to import from `_shared/deps.ts` which pins:
- `serve` from `std@0.190.0`
- `createClient` from `@supabase/supabase-js@2.57.2`
- `Stripe` from `stripe@18.5.0` (where applicable)

Functions that only need `serve` (no Supabase client) will import just `{ serve }` from deps.

**Functions to standardize (grouped by current issues):**

Outdated std + unpinned Supabase (both issues):
`eats-auto-dispatch`, `sync-offline-actions`, `execute-campaign`, `process-automated-triggers`, `send-driver-notification`, `eats-dispatch-worker`, `auto-dispatch`, `sla-evaluator`, `manual-dispatch`, `register-push-token`, `update-eats-order`, `calculate-price`, `push-campaign-scheduler`, `send-segment-push`

Outdated std only (no Supabase client):
`send-onboarding-email`, `hotelbeds-transfers`, `ai-trip-suggestions`, `ratehawk-hotels`, `api-health`, `search-hotels`, `hotelbeds-hotels`, `hotelbeds-activities`, `campaign-scheduler`

Unpinned Supabase only (std already 0.190.0):
`eats-call-session`, `eats-call-start`, `process-abandoned-searches`, `send-otp-sms`, `eats-twilio-status`, `eats-twilio-voice`, `twilio-sms-status`, `check-signup-allowlist`, `track-ad-event`, `award-order-points`

Pinned to old minor (`@2.45.0`):
`redeem-gift-card`

Also updates `ai-support-chat` (std `0.168.0` but Supabase already `2.57.2`).

---

### Technical Details

**CORS pattern (same as Phase 8):**

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

**Dependency pattern:**

```text
Before:
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

After:
  import { serve, createClient } from "../_shared/deps.ts";
```

For functions needing Stripe too:
```text
  import { serve, createClient, Stripe } from "../_shared/deps.ts";
```

**Special case -- `create-auth-token`:** Already has its own CORS whitelist. Will be refactored to use `_shared/cors.ts` as the base, with the additional `Access-Control-Allow-Credentials: "true"` header appended. Its `allowedAppDomains` validation logic is unrelated to CORS and stays unchanged.

---

### What stays on wildcard CORS (intentionally)

These public/search functions remain with `publicCorsHeaders` from `_shared/cors.ts` (already exported):
- `maps-api-key`, `maps-autocomplete`, `maps-place-details`, `maps-route`
- `exchange-rates`, `search-flights`, `search-hotels`, `duffel-flights`
- `ratehawk-hotels`, `hotelbeds-hotels`, `hotelbeds-activities`, `hotelbeds-transfers`
- `calculate-price`, `api-health`

Server-to-server/cron functions (called via `supabase.functions.invoke()`) also stay wildcard since they don't receive browser requests:
- `campaign-scheduler`, `demand-optimizer`, `check-flight-health`, etc.

---

### Summary

| Part | Scope | Count |
|------|-------|-------|
| A | CORS lockdown (Tier 2 sensitive) | 13 functions |
| B | Dependency standardization | ~27 functions |
| Overlap | Functions getting both updates | ~8 functions |
| **Total unique files modified** | | **~32 edge functions** |

No new files created. No database migrations. After this phase, all sensitive edge functions will use origin-restricted CORS and all edge functions will use pinned, consistent dependency versions.

