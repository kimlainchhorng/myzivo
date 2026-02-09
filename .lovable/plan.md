

# Grant Full Access to chhorngkimlain1@gmail.com

## Current State

The account already has **admin**, **customer**, and **driver** roles. The available roles in the system are:
`admin`, `moderator`, `user`, `super_admin`, `operations`, `finance`, `support`, `driver`, `merchant`, `customer`, `owner`, `manager`

## Changes

### 1. Database -- Add Missing Roles

Insert the remaining 9 roles for this user:
- `moderator`, `user`, `super_admin`, `operations`, `finance`, `support`, `merchant`, `owner`, `manager`

### 2. Code -- Add Email to Admin Allowlist

**File:** `src/config/adminConfig.ts`

Add `"chhorngkimlain1@gmail.com"` to the `ADMIN_EMAILS` array so the client-side admin gate also recognizes this account.

## Result

The account will hold every role in the system and pass both server-side (`check_user_role` RPC) and client-side (`ADMIN_EMAILS`) checks, allowing full access to all features for testing.

