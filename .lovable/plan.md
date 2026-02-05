
# Invite-Only Sign-In with Google Confirmation & Email Verification

## Overview

This plan implements three security features for ZIVO:
1. **Allowlist-Only Registration**: Only pre-approved emails can create accounts
2. **Force Google Account Chooser**: Prevent automatic silent sign-in
3. **Email Verification Required**: Block email/password users until verified

---

## How It Works

```text
+------------------+     +-------------------+     +------------------+
|  User attempts   | --> | Check allowlist   | --> | Email on list?   |
|  to sign up      |     | (before creating  |     |                  |
+------------------+     |  account)         |     +--------+---------+
                         +-------------------+              |
                              +-----------------------------+-----------------------------+
                              |                                                           |
                              v                                                           v
                     +--------+--------+                                      +-----------+----------+
                     |   NOT on list   |                                      |   ON allowlist       |
                     +--------+--------+                                      +-----------+----------+
                              |                                                           |
                              v                                                           v
                     +--------+--------+                                      +-----------+----------+
                     | "Access denied" |                                      | Continue to sign-up  |
                     | Show error msg  |                                      | or Google OAuth      |
                     +-----------------+                                      +----------+-----------+
                                                                                         |
                                                               +-------------------------+-------------------------+
                                                               |                                                   |
                                                               v                                                   v
                                                      +--------+--------+                              +-----------+----------+
                                                      | Email/Password  |                              |  Google OAuth        |
                                                      | (verify email)  |                              |  (force chooser)     |
                                                      +--------+--------+                              +-----------+----------+
                                                               |                                                   |
                                                               v                                                   v
                                                      +--------+--------+                              +-----------+----------+
                                                      | Email verified? |                              | Profile created      |
                                                      | No -> show msg  |                              | setup_complete=false |
                                                      +--------+--------+                              +-----------+----------+
                                                               |                                                   |
                                                               v                                                   v
                                                      +--------+--------+                              +-----------+----------+
                                                      | Complete /setup |                              | Redirect to /setup   |
                                                      | page            |                              |                      |
                                                      +-----------------+                              +----------------------+
```

---

## Changes Required

### 1. Database: Create Allowlist Table

A new table to store pre-approved emails that can register.

**SQL Migration:**
```sql
CREATE TABLE public.signup_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  invited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.signup_allowlist ENABLE ROW LEVEL SECURITY;

-- Only admins can manage allowlist (no public access)
CREATE POLICY "Admins can manage allowlist"
ON public.signup_allowlist
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 2. Edge Function: Validate Signup

Create an edge function that checks if an email is on the allowlist before allowing signup. This will be called from the frontend before initiating signup.

**Endpoint:** `POST /check-signup-allowlist`

```typescript
// Request: { email: "user@example.com" }
// Response: { allowed: true } or { allowed: false, message: "..." }
```

### 3. Update Database Trigger

Modify the `handle_new_user()` trigger to reject signups from non-allowlisted emails:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email is on allowlist
  IF NOT EXISTS (SELECT 1 FROM public.signup_allowlist WHERE email = LOWER(NEW.email)) THEN
    RAISE EXCEPTION 'Email not on allowlist';
  END IF;
  
  -- Mark allowlist entry as used
  UPDATE public.signup_allowlist SET used_at = now() WHERE email = LOWER(NEW.email);
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email, setup_complete)
  VALUES (NEW.id, NEW.email, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### 4. Force Google Account Chooser

Update the Google OAuth call to always show the account selection screen.

**File:** `src/contexts/AuthContext.tsx`

Add `prompt: "select_account"` to the OAuth options:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo,
    queryParams: {
      prompt: "select_account",  // Force account chooser
    },
  },
});
```

### 5. Require Email Verification

Update the login flow to check `email_confirmed_at` before allowing access.

**Files to update:**
- `src/pages/Login.tsx` - Check verification status after login
- `src/pages/AuthCallback.tsx` - Check verification for OAuth (Google already verified)
- New: `src/pages/VerifyEmail.tsx` - Page shown when email not verified

**Login flow check:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user && !user.email_confirmed_at) {
  navigate("/verify-email", { replace: true });
  return;
}
```

### 6. Update Signup Flow

Add pre-signup allowlist check before creating account.

**File:** `src/pages/Signup.tsx`

```typescript
// Before calling signUp()
const response = await supabase.functions.invoke('check-signup-allowlist', {
  body: { email: data.email }
});

if (!response.data?.allowed) {
  toast.error("This email is not authorized to sign up. Please contact support.");
  return;
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/check-signup-allowlist/index.ts` | Edge function to validate email against allowlist |
| `src/pages/VerifyEmail.tsx` | Page shown when email needs verification |

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Add `prompt: "select_account"` to Google OAuth |
| `src/pages/Login.tsx` | Add email verification check |
| `src/pages/Signup.tsx` | Add allowlist check before signup |
| `src/pages/AuthCallback.tsx` | Handle non-allowlisted Google signups |
| `src/App.tsx` | Add `/verify-email` route |
| Database migration | Create `signup_allowlist` table and update trigger |

---

## Admin Workflow

To invite new users:
1. Admin adds email to `signup_allowlist` table (via admin dashboard or SQL)
2. User receives invitation (manual or via email)
3. User signs up with that email
4. Allowlist entry marked as "used"

---

## User Experience

### Allowed Email (Happy Path)
1. User clicks "Continue with Google"
2. Google shows account chooser (always)
3. User selects/enters account
4. If email is on allowlist → profile created → redirect to `/setup`
5. Complete setup → access main app

### Non-Allowed Email
1. User attempts to sign up (email or Google)
2. System checks allowlist
3. Email not found → show error: "This email is not authorized. Please request an invitation."
4. User cannot proceed

### Email/Password (Verification Required)
1. User signs up with allowed email
2. Receives verification email
3. Must click link to verify
4. Until verified → shown "Check your email" page
5. After verification → redirect to `/setup`

---

## Technical Details

### Google Prompt Parameter
The `prompt: "select_account"` parameter forces Google to:
- Always show the account chooser
- Never auto-sign-in with a remembered account
- Require explicit user selection

### Email Verification
Supabase handles email verification natively. We just need to:
1. Enable "Confirm email" in Supabase Auth settings
2. Check `user.email_confirmed_at` in the frontend
3. Redirect unverified users to a waiting page
