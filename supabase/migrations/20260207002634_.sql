-- Create public_profiles view for non-sensitive profile data
-- This allows authenticated users to see basic profile info 
-- (name, avatar) without exposing PII (email, phone)

-- 1. Create the view with only public fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url
FROM public.profiles;

-- 2. Add documentation
COMMENT ON VIEW public.public_profiles IS 
  'Public-facing profile view exposing only non-sensitive fields (name, avatar). Use for displaying user info in public contexts like reviews, chat, leaderboards.';

-- 3. Set security_invoker for proper RLS behavior
ALTER VIEW public.public_profiles SET (security_invoker = on);

-- 4. Grant SELECT to authenticated users only
GRANT SELECT ON public.public_profiles TO authenticated;

-- 5. Explicitly revoke from anon (defense in depth)
REVOKE ALL ON public.public_profiles FROM anon;;
