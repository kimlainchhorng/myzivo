ALTER POLICY loyalty_award_events_read_own ON public.loyalty_award_events
  USING (user_id = (SELECT auth.uid()));;
