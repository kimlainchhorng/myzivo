-- Enable realtime for jobs table so clients can subscribe to status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
;
