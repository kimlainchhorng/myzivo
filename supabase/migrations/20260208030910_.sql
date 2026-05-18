-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id),
  is_internal boolean DEFAULT true,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);

ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage ticket_comments" ON public.ticket_comments;
CREATE POLICY "Admins can manage ticket_comments" ON public.ticket_comments
  FOR ALL USING (public.is_admin());

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage ticket_attachments" ON public.ticket_attachments;
CREATE POLICY "Admins can manage ticket_attachments" ON public.ticket_attachments
  FOR ALL USING (public.is_admin());

-- Create ticket_events table (Timeline/Audit)
CREATE TABLE IF NOT EXISTS public.ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket_id ON public.ticket_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_events_created_at ON public.ticket_events(created_at);

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage ticket_events" ON public.ticket_events;
CREATE POLICY "Admins can manage ticket_events" ON public.ticket_events
  FOR ALL USING (public.is_admin());;
