-- Fix 1: promo_redemptions INSERT policy - restrict to own user_id
DROP POLICY IF EXISTS "promo_redemptions_insert_auth" ON public.promo_redemptions;
CREATE POLICY "promo_redemptions_insert_auth"
  ON public.promo_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix 2: auth_relay_tokens DELETE policy - restrict to own relay_id
DROP POLICY IF EXISTS "authenticated_delete_relay" ON public.auth_relay_tokens;
CREATE POLICY "authenticated_delete_relay"
  ON public.auth_relay_tokens
  FOR DELETE
  TO authenticated
  USING (relay_id = (auth.uid())::text);

-- Fix 3: auth_relay_tokens INSERT policy - restrict to own relay_id
DROP POLICY IF EXISTS "authenticated_insert_relay" ON public.auth_relay_tokens;
CREATE POLICY "authenticated_insert_relay"
  ON public.auth_relay_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (relay_id = (auth.uid())::text);;
