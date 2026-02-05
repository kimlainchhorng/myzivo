
# Fix: Enforce Mandatory Setup for All New Users

## Problem Identified

After investigating, I found these issues:

1. **No profile is created** when a user signs up with Google OAuth (or email). The `auth.users` table has records, but the `profiles` table is empty.

2. **Email/password login bypasses setup check** - The Login page redirects directly to home after successful sign-in without verifying if setup is complete.

3. **Profile needs to be created first** before we can check `setup_complete`.

---

## Solution

### 1. Database: Create Profile Trigger

Add a database trigger that automatically creates a profile row when a new user signs up (via any method). The profile will have `setup_complete = false` by default.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, setup_complete)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Create Missing Profiles for Existing Users

Run a one-time migration to create profile rows for users who already exist:

```sql
INSERT INTO public.profiles (user_id, email, setup_complete)
SELECT id, email, false
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);
```

### 3. Fix Login Page Redirect

Update `src/pages/Login.tsx` to check setup status after successful email/password login, and redirect to `/setup` if not complete (same logic as AuthCallback).

### 4. Strengthen Route Protection

The `SetupRequiredRoute` guard is already in place, but we need to ensure it covers all entry points consistently.

---

## Files to Change

| File | Change |
|------|--------|
| New SQL Migration | Create trigger for auto-profile creation + backfill existing users |
| `src/pages/Login.tsx` | Add setup status check after successful login |

---

## Expected Behavior After Fix

1. **New Google OAuth user**: Signs in → Profile auto-created with `setup_complete = false` → Redirected to `/setup` → Completes form → Can access app

2. **New Email/Password user**: Signs up → Profile auto-created → Logs in → Redirected to `/setup` → Completes form → Can access app

3. **Existing user without profile**: Profile backfilled → Next login redirects to `/setup`
