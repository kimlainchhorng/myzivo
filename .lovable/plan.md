# Plan: make New Group creation reliable and debuggable

## What I found

The screenshot shows the real failure now:

```text
infinite recursion detected in policy for relation "chat_group_members" (42P17)
```

The database currently has older recursive RLS policies still active on `chat_group_members`, including policies that query `chat_group_members` from inside policies on the same table. That causes PostgreSQL to recurse when the app inserts/selects group members. The newer helper functions exist, but the old policies were not fully removed.

## Fix plan

1. **Fix the database RLS recursion first**
   - Add a migration that drops the old recursive `chat_group_members` policies:
     - `Group members or creator can add members`
     - `Members can view members`
     - `Members see group members`
     - old duplicate self/leave/update policies if still present
   - Keep the non-recursive SECURITY DEFINER helper-function approach:
     - `is_group_member(auth.uid(), group_id)`
     - `is_group_admin(auth.uid(), group_id)`
     - `is_group_owner(auth.uid(), group_id)`
   - Keep insert policies that allow:
     - the current user to insert themselves as owner/member
     - admins/owners to add other members
   - This directly fixes the error in your screenshot.

2. **Add a client-side preflight check before creating**
   - In `CreateGroupModal.tsx`, verify the expected schema before insert by reading the Supabase-generated app metadata already available in code:
     - `chat_groups` supports required `name` and `created_by`
     - `chat_group_members` supports `group_id`, `user_id`, and `role`
     - allowed roles include `owner`, `admin`, `member`
   - If something is missing or incompatible, block creation and show a clear error instead of attempting a broken insert.

3. **Validate the payload before submission**
   - Block if:
     - session/user is missing
     - group name is blank or too long
     - no friend is selected
     - selected IDs are malformed or not in the loaded friends list
     - creator role is not one of the allowed database roles
   - Show a short clear toast message for each validation failure.

4. **Add one automatic retry for auth/RLS-like failures**
   - Wrap the group creation operation in a single retry controller.
   - If the first attempt fails with an auth/RLS/session-shaped error, re-check `supabase.auth.getUser()` and retry once.
   - Do not retry validation errors or schema/preflight errors.
   - If retry succeeds, show normal success.
   - If retry fails, show the detailed error panel.

5. **Cancel if auth changes during creation**
   - While `creating` is true, subscribe to `supabase.auth.onAuthStateChange`.
   - If `SIGNED_OUT`, missing session, or token expiry is detected during creation:
     - mark the request as cancelled
     - stop updating the UI from the in-flight request
     - show: `Group creation cancelled — please sign in again.`

6. **Replace the plain error toast with expandable details**
   - Add a compact custom Sonner toast for group creation errors:
     - title: `Failed to create group`
     - short explanation visible immediately
     - collapsible `View error details`
     - details panel shows Supabase `message`, `details`, `hint`, and Postgres `code`
   - Keep the design compact and mobile-friendly for the 428px preview width.

## Technical notes

- Main file: `src/components/chat/CreateGroupModal.tsx`
- New helper/component likely added near chat code:
  - `src/components/chat/GroupCreationErrorToast.tsx`
- Database migration required to remove recursive policies and keep safe function-based RLS.
- Current real schema is compatible:
  - `chat_groups.created_by` exists and is NOT NULL
  - `chat_group_members.role` is enum `group_member_role`
  - allowed role values are `owner`, `admin`, `member`

## Expected result

After this, tapping **Create Group** should create the group smoothly. If the session expires or RLS rejects once because auth refresh is in progress, the app retries once automatically. If it still fails, the toast shows a clean expandable error panel instead of a long red message covering the top of the screen.