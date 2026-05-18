
-- Fix 1: p2p-documents INSERT policy - enforce path ownership
DROP POLICY IF EXISTS "Owners can upload their documents" ON storage.objects;

CREATE POLICY "Owners can upload their documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'p2p-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Create pos_integrations_safe view (mirrors square_connections_safe pattern)
CREATE OR REPLACE VIEW public.pos_integrations_safe AS
SELECT
  id,
  restaurant_id,
  provider,
  status,
  external_merchant_id,
  token_expires_at,
  last_sync_at,
  sync_error,
  created_at,
  updated_at
FROM public.pos_integrations;

-- Revoke direct SELECT on base tables from anon/authenticated for token columns
-- Use RLS to block direct reads of token-bearing tables
DROP POLICY IF EXISTS "pos_integrations_select_restricted" ON public.pos_integrations;

CREATE POLICY "pos_integrations_select_restricted"
ON public.pos_integrations
FOR SELECT
TO authenticated
USING (
  -- Only admins or restaurant owners can read the base table (with tokens)
  public.has_role(auth.uid(), 'admin'::app_role)
  OR restaurant_id IN (
    SELECT r.id FROM public.restaurants r WHERE r.owner_id = auth.uid()
  )
);

-- Grant SELECT on safe view to authenticated
GRANT SELECT ON public.pos_integrations_safe TO authenticated;
GRANT SELECT ON public.pos_integrations_safe TO anon;
;
