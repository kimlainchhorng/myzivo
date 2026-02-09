

# Fix: Admin Role Check Fails Due to Duplicate `has_role` Functions

## Problem

The console shows this error on every page load for logged-in users:

> Could not choose the best candidate function between: public.has_role(\_user\_id => uuid, \_role => public.app\_role), public.has_role(\_user\_id => uuid, \_role => text)

PostgREST cannot decide which overload to call because `text` and `app_role` (an enum) are ambiguous when a string like `"admin"` is passed via the RPC. This means **admin detection silently fails** -- admins are treated as regular users.

## Fix

Drop the redundant `text` overload, keeping only the `app_role` version (which is the correct, type-safe one). PostgREST will then auto-cast the string `"admin"` to the `app_role` enum without ambiguity.

### Database Migration (single SQL statement)

```sql
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
```

### No Frontend Changes

`AuthContext.tsx` already calls `supabase.rpc("has_role", { _user_id: userId, _role: "admin" })` which will work correctly once the ambiguity is resolved.

## Result

- The console error disappears
- Admin users are correctly detected on login
- `isAdmin` flag in AuthContext works as intended

