Plan to complete the Blue Verified workflow

1. Upgrade the admin verification review area
- Expand the existing Blue Verified requests card in `src/pages/admin/AdminUsersPage.tsx` into a proper review panel.
- Add search across applicant name, category, request text, and user ID.
- Add status filters: Pending, Approved, Rejected, and All.
- Add clearer decision buttons using stronger visual states:
  - Approve with a blue/positive verified style
  - Reject with a destructive/outline style
  - Disabled/loading states during review
- Show request status badges, submitted date, reviewer info where available, and rejection reason for rejected requests.

2. Add bulk actions for admins
- Add checkboxes for verification requests in the admin panel.
- Allow selecting pending requests individually or all visible pending requests.
- Add bulk Approve and bulk Reject actions.
- Run the existing secure review RPC for each selected request, then refresh the admin list and show a summary toast.
- Prevent bulk actions on already approved/rejected requests.

3. Improve the user verification request page
- Add a guided checklist before submission, such as:
  - Full legal name entered
  - Category selected
  - Supporting document uploaded
  - Additional verification details provided
- Add document upload UI using Supabase Storage and the existing `uploadWithProgress` utility.
- Show upload progress with a progress bar and percentage while the document uploads.
- Save the uploaded document URL into the existing `verification_requests.document_url` field.
- Disable submission until required checklist items are complete.
- Keep the current pending/approved/rejected status card, but make it clearer what the user should do next.

4. Enforce one active Blue Verified request per user
- Add a database-level safeguard so a user can only have one pending verification request at a time.
- Update the verification request page to check for existing pending requests before insert and block duplicate submissions with a clear message.
- Keep reapply available only after rejection, not while a request is pending.

5. Add admin audit log for Blue Verified decisions
- Add a new `blue_verified_audit_log` table with fields for:
  - request ID
  - target user ID
  - admin reviewer ID
  - action: approved, rejected, removed, or manually_verified if needed
  - reason/rejection text
  - created timestamp
- Enable RLS so only admins can view audit logs.
- Update the secure review RPC to write an audit row every time an admin approves or rejects a request.
- If direct manual badge toggling remains in the user detail dialog, route it through a secure RPC too so it also creates an audit log instead of updating `profiles.is_verified` directly from the client.

6. Add real-time Blue Verified status updates on profile
- Add Supabase realtime listeners in `src/pages/Profile.tsx` for the current user’s latest `verification_requests` row and profile row.
- When a request is approved/rejected, automatically invalidate/refetch:
  - the latest verification request query
  - the user profile query
- This will update the profile button from pending to approved/rejected without requiring refresh.

Technical details
- Database changes will be implemented with a Supabase migration, not by editing generated Supabase types manually.
- Existing `verification_requests` already has `document_url`, `reviewed_at`, `reviewed_by`, and status fields; the plan reuses them.
- Existing `set_profile_blue_verified_from_request` RPC will be extended to enforce admin-only decisions and write audit log entries.
- The duplicate-request rule will use a partial unique index on `verification_requests(user_id)` where `status = 'pending'`.
- UI changes will stay consistent with the current mobile-first ZIVO style and use existing components (`Button`, `Input`, `Progress`, cards, badges).

Validation
- Run a production build after implementation.
- Verify these flows:
  - user cannot submit without required checklist/document
  - upload progress appears and stores document URL
  - duplicate pending requests are blocked
  - admin can filter/search requests
  - admin can approve/reject single and bulk requests
  - audit rows are created for decisions
  - profile updates automatically when request status changes