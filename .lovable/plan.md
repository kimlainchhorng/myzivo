# Fix "Failed to create group"

## What's happening

When you tap **Create Group** in the New Group sheet, the toast shows just "Failed to create group" with no reason. The current code swallows the actual Supabase error: it does `err.message` on a Supabase `PostgrestError`, which often has the real cause in `details`/`hint`/`code` instead of `message`, so the toast ends up blank-suffixed and we can't see what's wrong.

I verified the database side is healthy:
- Tables `chat_groups` and `chat_group_members` exist with the expected columns.
- RLS policies allow the creator to insert into `chat_groups` (`auth.uid() = created_by`) and to insert themselves + friends into `chat_group_members` ("Self can join group" + "Group members or creator can add members").
- The `role` column on `chat_group_members` exists and accepts `"owner"`.

So the failure is happening at runtime and we need the real error message to know whether it's:
1. A session/auth issue (`auth.uid()` is null → RLS rejects),
2. A duplicate group name constraint we don't know about, or
3. A specific RLS policy mismatch on one of the two member inserts.

## The fix

Update `src/components/chat/CreateGroupModal.tsx` `handleCreate` to:

1. **Surface the real Supabase error** — read `message`, `details`, `hint`, and `code` from the `PostgrestError` object (Supabase puts the useful info in `details`/`hint`, not always in `message`). Concatenate them into the toast and `console.error`.
2. **Log every step** — separate `console.error` for (a) `chat_groups` insert failure, (b) creator self-insert failure, (c) other-members insert failure, each including the payload that was sent.
3. **Verify auth before insert** — call `supabase.auth.getUser()` once at the top; if no user, show "Please sign in again" instead of attempting the inserts and getting a confusing RLS rejection.
4. **Pass `as { onConflict: "group_id,user_id" }` ignore** for the creator insert when a unique constraint exists, so a stale row from a previous attempt doesn't block creation.

After this, when you tap Create Group again, the toast will tell us exactly why it's failing (e.g. `new row violates row-level security policy "..."` or `null value in column "..."`), and the same line will be in the browser console. Then I can target the root cause directly.

## Files

- `src/components/chat/CreateGroupModal.tsx` — replace `handleCreate` with a verbose, auth-checked version. No DB or schema changes in this pass.

## Out of scope

- No schema/RLS migrations until we see the actual error.
- No UI changes to the modal layout.
