-- Allow authenticated users to view their own rate limit status (read-only)
CREATE POLICY "Users view own rate limits"
ON public.user_limits FOR SELECT
TO authenticated
USING (user_id = auth.uid());;
