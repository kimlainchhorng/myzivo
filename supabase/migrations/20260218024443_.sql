-- Drop the existing ALL policy and create specific ones
DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.zivo_support_tickets;

-- SELECT: users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.zivo_support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: users can create tickets for themselves
CREATE POLICY "Users can create their own tickets"
ON public.zivo_support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can update their own tickets
CREATE POLICY "Users can update their own tickets"
ON public.zivo_support_tickets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: users can delete their own tickets
CREATE POLICY "Users can delete their own tickets"
ON public.zivo_support_tickets
FOR DELETE
USING (auth.uid() = user_id);;
