
-- Add missing columns to currencies
ALTER TABLE public.currencies
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS flag TEXT NOT NULL DEFAULT '🏳️',
  ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint on code
ALTER TABLE public.currencies ADD CONSTRAINT currencies_code_key UNIQUE (code);

-- Seed currencies
INSERT INTO public.currencies (code, name, symbol, flag, exchange_rate, is_enabled) VALUES
  ('USD', 'US Dollar', '$', '🇺🇸', 1.0, true),
  ('CAD', 'Canadian Dollar', 'C$', '🇨🇦', 1.36, true),
  ('EUR', 'Euro', '€', '🇪🇺', 0.92, true),
  ('GBP', 'British Pound', '£', '🇬🇧', 0.79, true),
  ('AUD', 'Australian Dollar', 'A$', '🇦🇺', 1.53, false),
  ('JPY', 'Japanese Yen', '¥', '🇯🇵', 149.5, false),
  ('INR', 'Indian Rupee', '₹', '🇮🇳', 83.1, false),
  ('AED', 'UAE Dirham', 'د.إ', '🇦🇪', 3.67, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  flag = EXCLUDED.flag,
  exchange_rate = EXCLUDED.exchange_rate,
  is_enabled = EXCLUDED.is_enabled;

-- Seed tax_rules using existing schema
INSERT INTO public.tax_rules (scope, service_type, tax_name, tax_rate_percent, flat_fee, included_in_price, is_active, active) VALUES
  ('state', 'all', 'California Sales Tax', 8.25, 0, false, true, true),
  ('state', 'all', 'New York Sales Tax', 8.875, 0, false, true, true),
  ('state', 'all', 'Texas Sales Tax', 6.25, 0, false, true, true),
  ('state', 'all', 'Ontario HST', 13.0, 0, false, true, true),
  ('country', 'all', 'UK VAT', 20.0, 0, true, true, true),
  ('country', 'all', 'Germany VAT', 19.0, 0, true, true, true),
  ('country', 'rides', 'UAE VAT', 5.0, 0, false, true, true),
  ('state', 'all', 'Delaware Exempt', 0, 0, false, true, true);
;
