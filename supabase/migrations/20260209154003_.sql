
-- =============================================
-- Affiliate Management: Extended Schema
-- =============================================

-- A. Extend existing affiliates table with new columns
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS commission_value_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_percentage numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signup_bonus_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Make name and email NOT NULL (may already be)
ALTER TABLE public.affiliates ALTER COLUMN name SET NOT NULL;
ALTER TABLE public.affiliates ALTER COLUMN email SET NOT NULL;

-- Add unique constraints if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliates_email_key') THEN
    ALTER TABLE public.affiliates ADD CONSTRAINT affiliates_email_key UNIQUE (email);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliates_referral_code_key') THEN
    ALTER TABLE public.affiliates ADD CONSTRAINT affiliates_referral_code_key UNIQUE (referral_code);
  END IF;
END $$;

-- B. Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  referrer_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- C. Create affiliate_conversions table
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  conversion_type text NOT NULL,
  user_id uuid,
  order_id uuid,
  order_total_cents int,
  commission_cents int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- D. Create affiliate_payouts table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents int NOT NULL,
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  paid_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- E. RLS Policies
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Ensure RLS on affiliates too
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Helper: check admin role (reuse existing pattern)
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'admin', 'manager', 'support')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_manager_plus(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'admin', 'manager')
  );
$$;

-- affiliates policies
DROP POLICY IF EXISTS "Admin can view affiliates" ON public.affiliates;
CREATE POLICY "Admin can view affiliates" ON public.affiliates FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Manager+ can manage affiliates" ON public.affiliates;
CREATE POLICY "Manager+ can manage affiliates" ON public.affiliates FOR ALL TO authenticated
  USING (public.is_admin_manager_plus(auth.uid()))
  WITH CHECK (public.is_admin_manager_plus(auth.uid()));

-- affiliate_clicks policies
CREATE POLICY "Admin can view affiliate_clicks" ON public.affiliate_clicks FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Manager+ can manage affiliate_clicks" ON public.affiliate_clicks FOR ALL TO authenticated
  USING (public.is_admin_manager_plus(auth.uid()))
  WITH CHECK (public.is_admin_manager_plus(auth.uid()));

-- affiliate_conversions policies
CREATE POLICY "Admin can view affiliate_conversions" ON public.affiliate_conversions FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Manager+ can manage affiliate_conversions" ON public.affiliate_conversions FOR ALL TO authenticated
  USING (public.is_admin_manager_plus(auth.uid()))
  WITH CHECK (public.is_admin_manager_plus(auth.uid()));

-- affiliate_payouts policies
CREATE POLICY "Admin can view affiliate_payouts" ON public.affiliate_payouts FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));
CREATE POLICY "Manager+ can manage affiliate_payouts" ON public.affiliate_payouts FOR ALL TO authenticated
  USING (public.is_admin_manager_plus(auth.uid()))
  WITH CHECK (public.is_admin_manager_plus(auth.uid()));

-- F. Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON public.affiliate_clicks(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate ON public.affiliate_conversions(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON public.affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON public.affiliates(referral_code);

-- G. Updated-at trigger on affiliates
CREATE OR REPLACE FUNCTION public.update_affiliates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON public.affiliates;
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_affiliates_updated_at();
;
