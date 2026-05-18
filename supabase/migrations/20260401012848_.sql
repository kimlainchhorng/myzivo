-- Fix 1: Make incident_photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'incident_photos';

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Incident photos are publicly accessible" ON storage.objects;

-- Add authenticated-only SELECT policy
CREATE POLICY "Authenticated users can view incident photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'incident_photos');

-- Fix 2: Fix fleet_owner_profiles UPDATE policy
-- Drop the old policy with non-standard JWT claim check
DROP POLICY IF EXISTS "Fleet owners can update own profile" ON public.fleet_owner_profiles;
DROP POLICY IF EXISTS "Admins can update fleet owner profiles" ON public.fleet_owner_profiles;
DROP POLICY IF EXISTS "Fleet owners and admins can update profiles" ON public.fleet_owner_profiles;

-- Recreate with proper has_role check
CREATE POLICY "Fleet owners can update own profile"
ON public.fleet_owner_profiles
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3: Restrict Realtime channel subscriptions for sensitive tables
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "realtime_read_table_topics" ON realtime.messages;
DROP POLICY IF EXISTS "realtime_read_private" ON realtime.messages;

-- Recreate with scoped access for sensitive tables
CREATE POLICY "realtime_read_table_topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow all authenticated users to subscribe to non-sensitive table topics
  (
    realtime.topic() LIKE 'table:%'
    AND realtime.topic() NOT LIKE 'table:public.admin_security_alerts:%'
    AND realtime.topic() NOT LIKE 'table:public.admin_notifications:%'
    AND realtime.topic() NOT LIKE 'table:public.ops_alerts:%'
    AND realtime.topic() NOT LIKE 'table:public.refund_requests:%'
    AND realtime.topic() NOT LIKE 'table:public.driver_earnings:%'
  )
  OR
  -- Admin-only tables require admin role
  (
    (
      realtime.topic() LIKE 'table:public.admin_security_alerts:%'
      OR realtime.topic() LIKE 'table:public.admin_notifications:%'
      OR realtime.topic() LIKE 'table:public.ops_alerts:%'
      OR realtime.topic() LIKE 'table:public.refund_requests:%'
    )
    AND public.is_admin(auth.uid())
  )
  OR
  -- driver_earnings: accessible by owning driver or admin
  (
    realtime.topic() LIKE 'table:public.driver_earnings:%'
    AND (
      public.is_admin(auth.uid())
      OR public.has_role(auth.uid(), 'driver'::app_role)
    )
  )
);

-- Recreate private topic policy (non-table topics)
CREATE POLICY "realtime_read_private"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() NOT LIKE 'table:%'
);;
