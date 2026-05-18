-- Replace the always-true INSERT policy on bug_reports with one that requires
-- the inserter to be authenticated and own the row (or be unauthenticated and
-- leave user_id NULL — keeps anonymous bug reports working without giving the
-- ability to spoof other users' user_ids).
DROP POLICY IF EXISTS "Users insert bug reports" ON public.bug_reports;

CREATE POLICY "bug_reports_insert_self_or_anon"
  ON public.bug_reports
  FOR INSERT
  TO public
  WITH CHECK (
    -- Authenticated users must insert under their own user_id.
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    -- Anonymous bug reports allowed only if user_id is NULL.
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );;
