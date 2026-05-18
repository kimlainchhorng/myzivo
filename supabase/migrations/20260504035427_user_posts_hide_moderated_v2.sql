-- is_admin() already exists with different signature; use it as-is.
DROP POLICY IF EXISTS "user_posts_visible_unless_hidden" ON public.user_posts;
CREATE POLICY "user_posts_visible_unless_hidden"
  ON public.user_posts AS RESTRICTIVE FOR SELECT
  TO authenticated, anon
  USING (
    hidden_at IS NULL
    OR user_id = auth.uid()
    OR public.is_admin(auth.uid())
  );;
