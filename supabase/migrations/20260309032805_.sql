ALTER TABLE public.driver_stripe_accounts
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_financial_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_issuing_card_id text,
  ADD COLUMN IF NOT EXISTS stripe_cardholder_id text;;
