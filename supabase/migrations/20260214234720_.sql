CREATE OR REPLACE FUNCTION public.compute_est_payout(p_job_id uuid)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path = public
AS $function$
  select
    round(
      (
        coalesce(j.base_fare,0)
        + coalesce(j.per_mile,0) * coalesce(j.estimated_miles,0)
        + coalesce(j.per_minute,0) * coalesce(j.estimated_minutes,0)
      ) * coalesce(j.surge_multiplier,1)
    , 2)
  from public.jobs j
  where j.id = p_job_id;
$function$;;
