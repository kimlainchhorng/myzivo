
# Fix RLS Policy for Zone Pricing Rates

## Problem Identified

The `zone_pricing_rates` table has **Row Level Security (RLS) enabled but no policies exist**. This causes the API to return an empty array `[]` instead of the pricing data.

**Network request shows:**
```
GET /zone_pricing_rates?zone_id=eq.00000000-0000-0000-0000-000000000001
Response: []  ← Empty!
```

**Database has 15 records** for the default zone with correct competitive pricing, but clients can't read them.

## Root Cause

When RLS is enabled without policies, Supabase blocks all access by default. The pricing rates need to be publicly readable so users can see prices before booking.

## Implementation Plan

### Step 1: Add RLS Policy for Public Read Access

Create a migration to add a SELECT policy allowing anyone to read pricing rates:

```sql
-- Allow public read access to zone_pricing_rates
CREATE POLICY "Allow public read access to zone_pricing_rates"
  ON public.zone_pricing_rates
  FOR SELECT
  USING (true);
```

This is safe because:
- Pricing rates are not sensitive data
- All users (logged in or not) need to see prices
- Only SELECT is allowed (no INSERT/UPDATE/DELETE)

### Step 2: Verify Fix

After applying the policy:
- API should return 15 pricing records for the default zone
- UI should display correct competitive prices:

| Ride Type | Price (71 mi, no surge) |
|-----------|-------------------------|
| Wait & Save | ~$48 |
| Standard | ~$69 |
| Green | ~$66 |
| Priority | ~$73 |
| Black | ~$200 |

## Files to Create

| File | Description |
|------|-------------|
| Migration SQL | Add RLS policy for `zone_pricing_rates` SELECT |

## Expected Result

After the fix, users will see the new competitive pricing (~55% cheaper than Uber/Lyft) instead of empty prices or fallback defaults.
