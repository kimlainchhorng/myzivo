Plan to finish the blue verified badge work end-to-end:

1. Update the profile badge UI
   - Replace the current generic primary-colored check badge with a clear blue verified badge.
   - Show it next to the user name on the Profile page and also on the avatar area if appropriate.
   - Match the reference screenshot style: small, clean, blue check badge that is easy to see on mobile.

2. Add a visible verification entry point
   - Add a compact “Get verified” / “Blue verified” action on the Profile page for users who are not verified yet.
   - Link it to the existing `/account/verification` request page.
   - If the user is already verified, show a confirmed verified state instead of asking them to apply.

3. Improve the verification request page
   - Make the page clearly branded as “Blue Verified”.
   - Keep the existing request form, but improve the status states: pending, approved, rejected.
   - Prevent duplicate pending requests and make the result easy to understand.

4. Complete admin approval workflow
   - Update the admin users page so admins can clearly verify/unverify accounts with the blue badge.
   - Add review actions for verification requests if the current admin page does not fully support request approval.
   - When approved, set `profiles.is_verified = true` so the badge appears everywhere.

5. Database/RLS safety
   - Add or adjust Supabase policies so users can create/view their own verification requests.
   - Allow only admins to approve/reject requests and update account verification.
   - Do not let normal users set their own `is_verified` value.

6. Final validation
   - Run the project build after implementation.
   - Check TypeScript issues caused by new fields or query changes.
   - Verify the completed flow: request verification, admin approve, badge appears on profile/public profile.

Technical notes:
- Main files expected to change:
  - `src/pages/Profile.tsx`
  - `src/pages/account/VerificationRequestPage.tsx`
  - `src/pages/admin/AdminUsersPage.tsx`
  - Supabase migration for any missing RLS/admin request-review policies
- Existing database fields already include `profiles.is_verified` and `verification_requests`, so the work should build on those instead of creating a separate role or insecure client-side flag.