-- Allow admins to SELECT all zivo_support_tickets
CREATE POLICY "Admins can view all zivo tickets"
  ON public.zivo_support_tickets FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to UPDATE zivo_support_tickets (assign, close, etc.)
CREATE POLICY "Admins can update zivo tickets"
  ON public.zivo_support_tickets FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Allow admins to SELECT all zivo_support_messages
CREATE POLICY "Admins can view all zivo messages"
  ON public.zivo_support_messages FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to INSERT messages into zivo_support_messages
CREATE POLICY "Admins can send zivo messages"
  ON public.zivo_support_messages FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));;
