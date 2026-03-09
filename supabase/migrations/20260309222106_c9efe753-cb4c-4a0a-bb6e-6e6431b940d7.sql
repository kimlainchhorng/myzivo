-- Allow ride owners to update their own ride requests (e.g. cancel)
CREATE POLICY "Users can update own ride requests"
ON public.ride_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for ride_requests so customers get live status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;