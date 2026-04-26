## What I'll fix

Three issues found in the chat experience:

### 1. "Failed to create group" error
The current `CreateGroupModal` inserts the creator and other members in a single batch into `chat_group_members`. RLS rejects this because the policy only allows inserting rows where the actor is already a member of the group.

**Fix:** Split into two inserts:
- Insert creator row first (allowed because creator just made the group / has owner privilege).
- Then insert remaining members in a second insert.

If RLS still blocks step 2, add a `SECURITY DEFINER` function `add_group_members(group_id, user_ids[])` that verifies the caller is the group owner and inserts the rows.

### 2. Call buttons in chats use legacy 1:1 WebRTC
`PersonalChat.tsx` Phone/Video icons trigger the old call flow, so none of the new features (pre-join lobby, REC pill, "Record this call", screen-share, reactions strip) appear.

**Fix:** Replace the handlers with `GroupCallLauncher` using a deterministic room id:
- DM: `dm-<sortedUserIdA>-<sortedUserIdB>`
- Group: `group-<groupId>`

Both participants land in the same LiveKit room. Keep the legacy path as fallback only if LiveKit secrets are missing.

### 3. Contacts page is empty
Currently reads from a `contacts` table that has no rows.

**Fix:** Fall back to "people you've chatted with" — query distinct counterpart `user_id`s from recent `messages`/`conversations`, join `profiles`, and render them as the contact list. Keep the explicit contacts table as the primary source when populated.

## Technical change list

- `src/components/chat/CreateGroupModal.tsx` — split member insert into two steps; surface the real error message.
- (If needed) new migration: `add_group_members` security-definer RPC + grant.
- `src/pages/PersonalChat.tsx` (and group chat header if separate) — swap call handlers to mount `GroupCallLauncher` with deterministic room id; pass display name + avatar.
- `src/pages/Contacts.tsx` (or equivalent) — add chat-history fallback query; dedupe + sort by most recent message.
- Type-check after changes.

## Out of scope

- No changes to LiveKit token edge function (already deployed).
- No redesign of the call UI itself — only routing the buttons to the new launcher.