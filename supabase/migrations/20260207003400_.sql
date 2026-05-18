-- ===========================================
-- Fix search_sessions RLS policies
-- ===========================================

-- 1. Drop the vulnerable SELECT policy that exposes NULL sessions
DROP POLICY IF EXISTS "Users can view their own search sessions" ON public.search_sessions;

-- 2. Create proper user-scoped SELECT policy (authenticated users only see their own)
CREATE POLICY "Users can view own search sessions"
ON public.search_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Keep admin policy (already correct)
-- "Admins can view all search sessions" - no change needed

-- 4. Add service_role access for backend operations on anonymous sessions
CREATE POLICY "Service role manages all sessions"
ON public.search_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Fix INSERT policy name and ensure it validates ownership
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.search_sessions;

CREATE POLICY "Authenticated users can create own sessions"
ON public.search_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Allow anonymous users to create sessions (with NULL user_id only)
CREATE POLICY "Anonymous can create sessions without user_id"
ON public.search_sessions FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- 7. Add UPDATE policy for authenticated users
CREATE POLICY "Users can update own search sessions"
ON public.search_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);;
