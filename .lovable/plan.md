
# Plan: Improve Signup Error for Existing Accounts

## Problem
When a user tries to sign up with an email that already has an account (e.g., a Gmail that was registered via Google OAuth), they see a generic "Authentication Failed" error. They should instead see a helpful message like **"Account already exists. Please sign in instead."**

## Current Behavior
1. User tries to sign up with email (e.g., `support@hizivo.com`)
2. Allowlist check passes (email is on allowlist, not yet marked as used)
3. Supabase signup fails because the email already exists in `auth.users`
4. User sees generic error message

## Solution Overview
Enhance the `check-signup-allowlist` Edge Function to also check if the email already exists in `auth.users`. This provides early detection and a clear message before the actual signup attempt.

---

## Implementation Steps

### 1. Update Edge Function: `check-signup-allowlist`
Add a check against `auth.users` to detect existing accounts:

**Logic flow:**
1. Check if email exists in `signup_allowlist`
2. If on allowlist, check if `used_at` is set (invitation already used)
3. NEW: Also check if email exists in `auth.users`
4. Return appropriate message for each case

**New response for existing account:**
```json
{
  "allowed": false,
  "message": "An account with this email already exists. Please sign in instead.",
  "existingUser": true
}
```

### 2. Update Frontend: `src/pages/Login.tsx`
Update the signup form handler to detect the `existingUser` flag and offer a helpful action:
- Show a toast message directing user to sign in
- Optionally auto-switch to login mode

### 3. Update AuthCallback Error Handling (Optional)
Improve the error detection in `AuthCallback.tsx` to handle "user already exists" errors from OAuth flows more gracefully.

---

## Technical Details

### Edge Function Changes
```typescript
// After allowlist check, add this:
const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
// Filter to check if email exists
const userExists = existingUser?.users?.some(
  u => u.email?.toLowerCase() === normalizedEmail
);

if (userExists) {
  return new Response(
    JSON.stringify({
      allowed: false,
      message: "An account with this email already exists. Please sign in instead.",
      existingUser: true,
    }),
    { status: 200, headers: {...} }
  );
}
```

### Frontend Changes
In `Login.tsx`, after the allowlist check:
```typescript
if (!allowlistResponse?.allowed) {
  setIsLoading(false);
  if (allowlistResponse?.existingUser) {
    toast.info("An account with this email already exists. Please sign in.");
    setIsLogin(true); // Switch to login mode
  } else {
    toast.error(allowlistResponse?.message || "...");
  }
  return;
}
```

---

## Files to Modify
| File | Change |
|------|--------|
| `supabase/functions/check-signup-allowlist/index.ts` | Add `auth.users` existence check |
| `src/pages/Login.tsx` | Handle `existingUser` response gracefully |

## User Experience
- **Before**: Generic error, user confused
- **After**: Clear message + automatic switch to login form
