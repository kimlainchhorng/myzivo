
-- Resolution cases (main dispute/issue tracking)
CREATE TABLE public.resolution_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE DEFAULT ('RC-' || substr(gen_random_uuid()::text, 1, 8)),
  reporter_id UUID NOT NULL,
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('customer', 'driver', 'restaurant')),
  order_id UUID,
  order_type TEXT CHECK (order_type IN ('food_order', 'trip')),
  issue_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'awaiting_response', 'resolved', 'rejected', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID,
  resolution_type TEXT CHECK (resolution_type IN ('full_refund', 'partial_refund', 'wallet_credit', 'no_action', 'payout_adjustment', 'other')),
  resolution_amount_cents INTEGER DEFAULT 0,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resolution_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cases"
  ON public.resolution_cases FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create cases"
  ON public.resolution_cases FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all resolution cases"
  ON public.resolution_cases FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update resolution cases"
  ON public.resolution_cases FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Resolution messages (timeline/chat)
CREATE TABLE public.resolution_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.resolution_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'driver', 'restaurant', 'admin', 'system')),
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resolution_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case participants can view messages"
  ON public.resolution_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resolution_cases rc
      WHERE rc.id = case_id AND (
        rc.reporter_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON public.resolution_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Resolution evidence (photos, screenshots)
CREATE TABLE public.resolution_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.resolution_cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resolution_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case participants can view evidence"
  ON public.resolution_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resolution_cases rc
      WHERE rc.id = case_id AND (
        rc.reporter_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can upload evidence"
  ON public.resolution_evidence FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Indexes
CREATE INDEX idx_resolution_cases_reporter ON public.resolution_cases(reporter_id);
CREATE INDEX idx_resolution_cases_status ON public.resolution_cases(status);
CREATE INDEX idx_resolution_cases_order ON public.resolution_cases(order_id);
CREATE INDEX idx_resolution_messages_case ON public.resolution_messages(case_id);

-- Trigger for updated_at
CREATE TRIGGER update_resolution_cases_updated_at
  BEFORE UPDATE ON public.resolution_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
;
