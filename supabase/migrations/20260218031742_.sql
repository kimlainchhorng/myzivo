
-- Fix infinite recursion in chat_members RLS policy
-- The current SELECT policy references chat_members itself, causing infinite recursion

-- 1. Create a security definer function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_chat_member(p_chat_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_id = p_chat_id AND user_id = auth.uid()
  );
$$;

-- 2. Drop the broken policy
DROP POLICY IF EXISTS "Members can view chat participants" ON public.chat_members;

-- 3. Create a fixed policy using the security definer function
CREATE POLICY "Members can view chat participants"
  ON public.chat_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_chat_member(chat_id)
    OR is_admin(auth.uid())
  );

-- 4. Also fix chat_messages policy that uses chat_members and may also recurse
DROP POLICY IF EXISTS "Members can read chat messages via chat_id" ON public.chat_messages;

CREATE POLICY "Members can read chat messages via chat_id"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    is_chat_member(chat_id)
    OR is_admin(auth.uid())
  );

-- 5. Fix the insert policy for chat_messages via chat_id
DROP POLICY IF EXISTS "Members can send chat messages via chat_id" ON public.chat_messages;

CREATE POLICY "Members can send chat messages via chat_id"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_chat_member(chat_id)
    OR is_admin(auth.uid())
  );
;
