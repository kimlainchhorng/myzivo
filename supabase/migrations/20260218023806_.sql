-- Enable realtime for support messages and tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.zivo_support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zivo_support_tickets;;
