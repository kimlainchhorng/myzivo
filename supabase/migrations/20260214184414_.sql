-- Allow drivers to read jobs they have pending offers for
CREATE POLICY "Driver can read jobs with offers"
ON public.jobs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_offers
    WHERE job_offers.job_id = jobs.id
      AND job_offers.driver_id = auth.uid()
  )
);;
