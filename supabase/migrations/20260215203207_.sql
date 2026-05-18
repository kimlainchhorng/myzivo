-- Add SSN last four to drivers for payout verification
ALTER TABLE public.drivers ADD COLUMN ssn_last_four TEXT;

-- Only the driver can read/update their own SSN
CREATE POLICY "Drivers can read own ssn_last_four"
  ON public.drivers FOR SELECT
  USING (auth.uid() = user_id);

-- Note: existing update policy should cover this column already;
