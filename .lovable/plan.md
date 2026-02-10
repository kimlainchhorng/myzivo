

# Next Update: Database Security Hardening

## What This Fixes

### A. Fix 5 SECURITY DEFINER Functions Missing search_path
These functions can be exploited via search path hijacking. Each needs `SET search_path = public` added:

1. `get_referral_device_groups` -- referral fraud detection
2. `get_referral_ip_groups` -- referral IP grouping
3. `get_restaurant_avg_prep_time` -- prep time calculation
4. `handle_new_user` -- trigger for new user profile creation
5. `update_slot_driver_count` -- driver shift slot counter

### B. Stripe Live Key (Blocked -- Waiting for User)
Once you paste your `pk_live_...` key, a one-line change in `src/lib/stripe.ts` unblocks all payment flows.

---

## Technical Details

### Database Migration SQL

A single migration will:

1. Recreate all 5 functions with `SET search_path = public` added to their definitions
2. Each function retains its exact existing logic -- only the search_path setting is added
3. `handle_new_user` is a trigger function attached to `auth.users`, so it will be recreated with `CREATE OR REPLACE` to avoid breaking the trigger binding

### Files Changed

- **Database migration only** -- no frontend code changes in this step
- The 74 tables with no RLS policies and 12 permissive policies will be addressed in a follow-up step (they require per-table analysis of which roles need access)

### Remaining After This Step

- Stripe live key update (waiting for user input)
- 74 tables with no RLS policies (next batch)
- 12 overly permissive RLS policies (next batch)
- Legacy affiliate code cleanup (low priority)

