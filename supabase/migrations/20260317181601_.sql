
CREATE TABLE public.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id uuid NOT NULL,
  caller_type text NOT NULL CHECK (caller_type IN ('driver', 'customer', 'admin')),
  receiver_id uuid NOT NULL,
  receiver_type text NOT NULL CHECK (receiver_type IN ('driver', 'customer', 'admin')),
  status text NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'answered', 'ended', 'missed', 'rejected')),
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  related_order_id uuid,
  related_trip_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own calls"
  ON public.calls FOR SELECT TO authenticated
  USING (caller_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create calls"
  ON public.calls FOR INSERT TO authenticated
  WITH CHECK (caller_id = auth.uid());

CREATE POLICY "Users can update their own calls"
  ON public.calls FOR UPDATE TO authenticated
  USING (caller_id = auth.uid() OR receiver_id = auth.uid());

CREATE INDEX idx_calls_caller ON public.calls(caller_id);
CREATE INDEX idx_calls_receiver ON public.calls(receiver_id);
CREATE INDEX idx_calls_status ON public.calls(status) WHERE status = 'ringing';
;
