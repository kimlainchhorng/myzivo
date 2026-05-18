-- Create trip_shares table for sharing ride tracking links
CREATE TABLE public.trip_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read trip shares (public tracking page)
CREATE POLICY "Anyone can read trip shares" 
ON public.trip_shares 
FOR SELECT 
USING (true);

-- Only authenticated users can create shares
CREATE POLICY "Authenticated users can create trip shares" 
ON public.trip_shares 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster token lookups
CREATE INDEX idx_trip_shares_token ON public.trip_shares(share_token);;
