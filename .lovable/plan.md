

## Phase 8: Edge Function CORS Lockdown + Dependency Standardization

The Phase 7 plan created the shared CORS module (`_shared/cors.ts`) and centralized dependency file (`_shared/deps.ts`), but none of the 15+ sensitive edge functions were actually updated to use them. This update completes that critical work.

---

### Part A: CORS Lockdown -- 17 Sensitive Edge Functions

Replace wildcard `Access-Control-Allow-Origin: "*"` with the shared `getCorsHeaders(req)` from `_shared/cors.ts` in all payment, refund, payout, backup, and fraud-related edge functions.

For each function below:
1. Replace the static `corsHeaders` object with an import of `getCorsHeaders` from `../_shared/cors.ts`
2. Change `corsHeaders` usage to `const corsHeaders = getCorsHeaders(req)` at the top of the request handler
3. Update the OPTIONS preflight to use the dynamic headers

**Functions to update:**

| Function | Category |
|----------|----------|
| `create-ride-payment-intent` | Payment |
| `create-ride-checkout` | Payment |
| `create-eats-payment-intent` | Payment |
| `create-eats-checkout` | Payment |
| `create-flight-checkout` | Payment |
| `create-travel-checkout` | Payment |
| `create-p2p-checkout` | Payment |
| `create-membership-checkout` | Payment |
| `process-refund` | Refund |
| `process-p2p-refund` | Refund |
| `process-flight-refund` | Refund |
| `process-dispute-refund` | Refund |
| `process-travel-cancellation` | Refund |
| `process-p2p-payout` | Payout |
| `execute-p2p-payout` | Payout |
| `assess-fraud` | Fraud |
| `stripe-webhook` | Webhook |

---

### Part B: Dependency Version Standardization -- 4 Critical Functions

Four edge functions use outdated Stripe (`14.21.0`) or unpinned Supabase (`@2`) versions. Update their imports to use `_shared/deps.ts`:

| Function | Current Issue |
|----------|---------------|
| `process-travel-cancellation` | Stripe `14.21.0` |
| `process-dispute-refund` | Stripe `14.21.0` + Supabase `@2` + std `0.168.0` |
| `verify-gift-card-purchase` | Stripe `14.21.0` + Supabase `@2.45.0` + std `0.168.0` |
| `purchase-gift-card` | Stripe `14.21.0` + Supabase `@2.45.0` + std `0.168.0` |

Each will have its top-level imports replaced with:
```typescript
import { serve, createClient, Stripe } from "../_shared/deps.ts";
```

---

### Technical Details

**Pattern for each edge function update (CORS):**

Before:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "...",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // ... use corsHeaders in responses
});
```

After:
```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  // ... corsHeaders now dynamic per-request
});
```

For the 4 functions getting both CORS + deps updates, imports collapse to:
```typescript
import { serve, createClient, Stripe } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
```

**Total: 17 edge function files modified. No new files. No database migrations.**

