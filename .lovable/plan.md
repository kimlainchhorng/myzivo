

# Account Setup Flow for New Users

## Overview

This plan adds a mandatory onboarding/setup flow for new users. When a user signs up (via email or Google OAuth), they must complete their profile setup before accessing the main app. Users who haven't completed setup will be redirected to the setup page.

---

## How It Works

```text
+------------------+     +-------------------+     +------------------+
|   Sign Up /      | --> |  Auth Callback    | --> | Setup Required?  |
|   Google OAuth   |     |  (session created)|     |                  |
+------------------+     +-------------------+     +--------+---------+
                                                           |
                              +----------------------------+----------------------------+
                              |                                                         |
                              v                                                         v
                     +--------+--------+                                    +-----------+----------+
                     |  setup_complete |                                    |   setup_complete     |
                     |     = false     |                                    |       = true         |
                     +--------+--------+                                    +-----------+----------+
                              |                                                         |
                              v                                                         v
                     +--------+--------+                                    +-----------+----------+
                     |  /setup Page    |                                    |    Main App / Home   |
                     |  (Name, Phone,  |                                    |                      |
                     |   Preferences)  |                                    +----------------------+
                     +--------+--------+
                              |
                              v
                     +--------+--------+
                     | Complete Setup  |
                     | setup_complete  |
                     |     = true      |
                     +-----------------+
                              |
                              v
                     +--------+--------+
                     |    Redirect to  |
                     |    Main App     |
                     +-----------------+
```

---

## Changes Required

### 1. Database: Add `setup_complete` Column

Add a boolean column to the `profiles` table to track whether a user has completed onboarding.

**SQL Migration:**
```sql
ALTER TABLE profiles 
ADD COLUMN setup_complete BOOLEAN DEFAULT false;
```

### 2. Create Setup Page (`/setup`)

A new page where new users complete their profile:
- Full name (required)
- Phone number (optional)
- Accept Terms checkbox
- "Complete Setup" button

Once submitted, `setup_complete` is set to `true` and the user is redirected to the home page.

### 3. Create Setup Guard Component

A wrapper component (`SetupRequiredRoute`) that:
- Checks if the logged-in user has `setup_complete = true`
- If not, redirects them to `/setup`
- Used to protect all main app routes

### 4. Update Auth Flow

- After OAuth callback success, check if `setup_complete` is `false`
- If so, redirect to `/setup` instead of home
- Update `AuthCallback.tsx` to handle this logic

### 5. Update Signup Flow

- After email signup + email verification, the user lands on `/setup`
- The setup page handles profile completion

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Setup.tsx` | Onboarding form for new users |
| `src/components/auth/SetupRequiredRoute.tsx` | Route guard that ensures setup is complete |
| `src/hooks/useSetupStatus.ts` | Hook to check if current user has completed setup |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/setup` route and wrap protected routes with `SetupRequiredRoute` |
| `src/pages/AuthCallback.tsx` | Redirect to `/setup` if setup not complete |
| `src/integrations/supabase/types.ts` | Add `setup_complete` to Profile type (if needed) |

---

## User Experience

1. **New User Signs Up with Google:**
   - Clicks "Continue with Google"
   - Google OAuth completes
   - Redirected to `/setup` page
   - Fills in name, optional phone
   - Clicks "Complete Setup"
   - Redirected to home page

2. **New User Signs Up with Email:**
   - Fills email/password form
   - Receives verification email
   - Clicks verification link
   - Lands on `/setup` page
   - Completes profile
   - Redirected to home

3. **Existing User (setup already complete):**
   - Signs in normally
   - Goes directly to home page

---

## Technical Details

### SetupRequiredRoute Component Logic
```text
1. Check if user is logged in
2. If not logged in -> redirect to /login
3. If logged in, fetch profile.setup_complete
4. If setup_complete = false -> redirect to /setup
5. If setup_complete = true -> render children
```

### Setup Page Fields
- Full Name (required, min 2 characters)
- Phone Number (optional)
- Terms of Service checkbox (required)
- Submit button disabled until form is valid

### Database Trigger Update
Update the existing profile creation trigger to set `setup_complete = false` by default for new users.

