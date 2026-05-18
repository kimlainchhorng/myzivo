
-- Admin-Driver live chat messages
CREATE TABLE public.admin_driver_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('admin', 'driver')),
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_driver_messages ENABLE ROW LEVEL SECURITY;

-- Admin can read/write all messages
CREATE POLICY "Admins can manage all messages"
  ON public.admin_driver_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Drivers can read their own messages
CREATE POLICY "Drivers can read own messages"
  ON public.admin_driver_messages
  FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Drivers can insert their own messages
CREATE POLICY "Drivers can send messages"
  ON public.admin_driver_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'driver' AND
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_driver_messages;
;
