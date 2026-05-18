-- Allow admins to INSERT into zivo_support_tickets (for sending reminders)
CREATE POLICY "Admins can create zivo tickets"
  ON public.zivo_support_tickets FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Allow admins to INSERT into zivo_support_messages (for sending reminder messages)
CREATE POLICY "Admins can insert zivo messages"
  ON public.zivo_support_messages FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));;
