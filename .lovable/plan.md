
# Fix Database Trigger - Profile Creation Failing

## Problem Identified

The auth logs show this error when signing in:
```
null value in column "user_id" of relation "profiles" violates not-null constraint
```

**Root Cause**: The `handle_new_user()` database trigger has a column mismatch with the `profiles` table schema.

---

## Schema Mismatch Details

| What the trigger does | What the table expects |
|----------------------|------------------------|
| Inserts `new.id` into `id` column | `id` is auto-generated (gen_random_uuid) |
| Leaves `user_id` as NULL | `user_id` is NOT NULL - required! |

**Current trigger code:**
```sql
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES (new.id, new.email, ...)
```

**Correct trigger code should be:**
```sql
INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
VALUES (new.id, new.email, ...)
```

---

## Fix Required (SQL Migration)

You need to run this SQL in **Supabase Dashboard > SQL Editor** for the environment you're testing (Test or Live):

```sql
-- Fix the handle_new_user trigger to use correct column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$function$;
```

---

## After the Fix

Once you run the SQL above:

1. **Sign in will work** - Google OAuth will successfully create a profile
2. **User lands on `/setup`** - to complete onboarding (Name, Phone, Terms)
3. **Then redirects to app** - full access granted

---

## About the Profile Design You Shared

I also see you shared a premium `ZivoProfilePremium` component design. Once sign-in is working, I can implement that design as either:
- A replacement for the current `/profile` page
- A new mobile-focused profile view

Let me know which you prefer after the auth fix is applied!

---

## Summary

| Action | Where |
|--------|-------|
| Run SQL fix | Supabase Dashboard > SQL Editor |
| Test Google sign-in | `/login` page |
| Implement profile design | After auth is working |

The fix is a single SQL statement that corrects the column name from `id` to `user_id` in the profile creation trigger.
