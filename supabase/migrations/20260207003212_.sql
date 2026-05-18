-- ===========================================
-- Fix otp_codes: Restrict to service_role only
-- ===========================================

-- Drop vulnerable public policy
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- Create proper service_role policy
CREATE POLICY "Service role manages OTP codes"
ON public.otp_codes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ===========================================
-- Fix experiment_assignments: Restrict writes to service_role
-- ===========================================

-- Drop vulnerable public policy
DROP POLICY IF EXISTS "System can manage assignments" ON public.experiment_assignments;

-- Create proper service_role policy for all operations
CREATE POLICY "Service role manages experiment assignments"
ON public.experiment_assignments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: "Users can see own assignments" policy remains intact
-- allowing users to SELECT their own experiment assignments;
