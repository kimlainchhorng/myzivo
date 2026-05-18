-- Travelers Table (booking info submitted before partner handoff)
CREATE TABLE public.travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  passport_number TEXT,
  nationality TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own travelers"
  ON public.travelers FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can create traveler"
  ON public.travelers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage travelers"
  ON public.travelers FOR ALL
  USING (public.is_admin(auth.uid()));

-- Booking Returns Table (callback from partner checkout)
CREATE TABLE public.booking_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redirect_log_id UUID REFERENCES public.partner_redirect_logs(id),
  session_id TEXT NOT NULL,
  booking_ref TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'pending', 'failed', 'cancelled')),
  partner_name TEXT,
  callback_params JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own booking returns"
  ON public.booking_returns FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can create booking return"
  ON public.booking_returns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage booking returns"
  ON public.booking_returns FOR ALL
  USING (public.is_admin(auth.uid()));;
