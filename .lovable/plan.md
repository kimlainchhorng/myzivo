

## Security Hardening: Protect ZIVO from Hackers

The security scan found **90 issues** across your database and edge functions. Here is a prioritized plan to lock everything down.

---

### CRITICAL PRIORITY: Edge Functions Exposed Without Authentication

Several edge functions that perform sensitive operations have `verify_jwt = false`, meaning **anyone on the internet can call them without logging in**.

**Dangerous functions that must require JWT authentication:**

| Function | Risk | Current | Fix |
|----------|------|---------|-----|
| `run-database-backup` | Anyone can trigger DB backups | No auth | Require JWT + admin check |
| `run-storage-backup` | Anyone can trigger storage backups | No auth | Require JWT + admin check |
| `process-flight-refund` | Anyone can trigger flight refunds | No auth | Require JWT |
| `issue-flight-ticket` | Anyone can issue flight tickets | No auth | Require JWT |
| `resolve-flight-incident` | Anyone can resolve incidents | No auth | Require JWT + admin check |
| `update-eats-order` | Anyone can modify food orders | No auth | Require JWT |
| `create-eats-payment-intent` | Anyone can create payment charges | No auth | Require JWT |
| `redeem-gift-card` | Anyone can redeem gift cards | No auth | Require JWT |
| `assess-fraud` | Anyone can call fraud assessment | No auth | Require JWT |
| `maps-api-key` | Exposes your Google Maps API key | No auth | Require JWT |
| `ai-support-chat` | Open AI endpoint (cost abuse) | No auth | Require JWT |

**Changes:**
- Update `supabase/config.toml` to set `verify_jwt = true` for all 11 functions above
- Add auth token validation inside each edge function to verify the user is authenticated (and admin where needed)
- Functions that are called by webhooks or cron jobs (like Stripe webhook, Twilio callbacks) will keep `verify_jwt = false` since they use their own authentication

---

### HIGH PRIORITY: Fix Overly Permissive RLS Policies

**1. `admin_login_attempts` -- Anyone (including unauthenticated users) can insert rows**

Current policy allows `anon` and `authenticated` to INSERT with `WITH CHECK (true)`. An attacker could flood this table with millions of fake rows (denial of service).

Fix: Restrict INSERT to rate-limited, server-side only. Change the policy to allow only `service_role` inserts, or add a constraint like IP-based deduplication.

**2. `kyc_events` -- Any logged-in user can insert fake KYC verification events**

Current policy: `WITH CHECK (true)` for authenticated users. A malicious user could insert fake "verified" KYC events.

Fix: Change to `WITH CHECK (auth.uid() = user_id)` so users can only insert events for themselves, and add a trigger to prevent inserting "approved" status directly.

**3. `share_events` -- Public INSERT with no restrictions**

Current policy allows anyone (even unauthenticated) to insert share events. This is a spam/abuse vector.

Fix: Restrict to authenticated users with `WITH CHECK (auth.uid() = user_id)`.

---

### HIGH PRIORITY: Add RLS Policies to 74 Unprotected Tables

74 tables have RLS enabled but **no policies at all**. While this blocks all access (safe from leaks), it means the app cannot read or write to these tables from the client. Tables with sensitive user data need proper owner-based policies.

**User data tables (need owner-only access):**

```text
user_addresses      -- Contains physical addresses
user_preferences    -- User settings
user_loyalty        -- Loyalty points
user_memberships    -- Membership data
user_subscriptions  -- Subscription data
ai_conversations    -- Private AI chat history
support_sessions    -- Support ticket data
verifications       -- Identity verification
trust_scores        -- User trust scores
```

Policy pattern for these:
- SELECT: `auth.uid() = user_id` (users see own data only)
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`
- Admin override: `has_role(auth.uid(), 'admin')`

**Business/order tables (need owner + admin access):**

```text
orders              -- Customer orders
disputes            -- Payment disputes
settlements         -- Financial settlements
tax_records         -- Tax information
reviews             -- User reviews
```

**System/admin-only tables (need admin-only access):**

```text
admin_invitations   -- Contains invitation tokens and emails
demand_metrics      -- Internal analytics
system_alerts       -- System monitoring
service_health      -- Infrastructure status
financial_snapshots -- Financial data
growth_metrics      -- Business metrics
```

**Reference data tables (need public read, admin write):**

```text
cities, currencies, languages, loyalty_tiers,
subscription_plans, zones, zone_pricing_rates,
achievements, rewards
```

---

### MEDIUM PRIORITY: Clean Up Duplicate Policies

The `kyc_events` table has duplicate SELECT policies:
- "Admins can view all KYC events" (appears twice with slightly different syntax)
- "Users can view own KYC events" / "Users can view own kyc events" (duplicate)

Fix: Drop the duplicates to avoid confusion and potential policy conflicts.

---

### Summary of All Changes

| Area | Files/SQL | Count |
|------|-----------|-------|
| Edge function JWT enforcement | `supabase/config.toml` + 11 edge function files | 12 files |
| Fix permissive INSERT policies | SQL: 3 policy updates | 3 policies |
| Add RLS policies to unprotected tables | SQL: ~74 tables x 4-5 policies each | ~300 policies |
| Clean up duplicate policies | SQL: drop 2 duplicate policies | 2 policies |

Due to the size, I recommend implementing this in **3 sub-phases**:

1. **Sub-phase A**: Fix the 11 edge functions (config.toml + auth checks in function code) -- this is the most urgent because these are publicly callable right now
2. **Sub-phase B**: Fix the 3 permissive INSERT policies + add policies to the ~15 sensitive user/order tables
3. **Sub-phase C**: Add policies to the remaining ~59 system/reference tables + cleanup duplicates

