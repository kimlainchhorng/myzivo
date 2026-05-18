
ALTER TABLE public.business_account_users
  ADD COLUMN IF NOT EXISTS spending_limit_monthly numeric,
  ADD COLUMN IF NOT EXISTS approved_services text[],
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
;
