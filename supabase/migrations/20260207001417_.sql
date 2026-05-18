-- RLS Security Hardening: Fix zivo_credits (remaining fix)
-- The previous migration partially succeeded but failed on this policy

-- Drop existing policy first to avoid duplicate
DROP POLICY IF EXISTS "Users view own credits" ON zivo_credits;

-- Recreate: Users can view their own credits
CREATE POLICY "Users view own credits"
ON zivo_credits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);;
