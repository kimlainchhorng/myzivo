
-- Fix: Recreate admin_active_jobs view with security_invoker = true
-- This ensures RLS policies of the querying user are enforced, not the view creator
CREATE OR REPLACE VIEW public.admin_active_jobs
WITH (security_invoker = true)
AS
SELECT id AS job_id,
    status,
    assigned_driver_id,
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
    created_at
   FROM public.jobs j
  WHERE ((status)::text <> ALL (ARRAY['completed'::text, 'canceled'::text, 'no_drivers'::text]));

-- Note: spatial_ref_sys is a PostGIS system table - RLS cannot be meaningfully applied to it
-- as it's managed by the PostGIS extension and contains reference coordinate system data.
;
