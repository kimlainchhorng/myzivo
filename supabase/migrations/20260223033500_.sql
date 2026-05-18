-- Fix: Allow authenticated users to also insert/select/delete relay tokens
-- The AuthCallback page's Supabase client auto-processes implicit flow tokens,
-- making it authenticated before the relay insert happens.

CREATE POLICY "authenticated_insert_relay"
ON public.auth_relay_tokens
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_select_relay"
ON public.auth_relay_tokens
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_delete_relay"
ON public.auth_relay_tokens
FOR DELETE
TO authenticated
USING (true);;
