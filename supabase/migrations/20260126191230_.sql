-- Allow authenticated users to view verified drivers' public info for leaderboard
CREATE POLICY "Authenticated users can view verified drivers for leaderboard"
ON public.drivers
FOR SELECT
TO authenticated
USING (status = 'verified');;
