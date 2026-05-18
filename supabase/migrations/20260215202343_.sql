
-- Create driver_payout_methods table
CREATE TABLE public.driver_payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank')),
  label TEXT NOT NULL DEFAULT '',
  last_four TEXT NOT NULL CHECK (char_length(last_four) = 4),
  bank_name TEXT,
  routing_number TEXT,
  account_number_encrypted TEXT,
  card_brand TEXT,
  exp_month INTEGER CHECK (exp_month >= 1 AND exp_month <= 12),
  exp_year INTEGER CHECK (exp_year >= 2024 AND exp_year <= 2099),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_payout_methods ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own methods
CREATE POLICY "Drivers can view own payout methods"
  ON public.driver_payout_methods FOR SELECT
  USING (auth.uid() = driver_id);

-- Drivers can insert their own methods
CREATE POLICY "Drivers can insert own payout methods"
  ON public.driver_payout_methods FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Drivers can update their own methods
CREATE POLICY "Drivers can update own payout methods"
  ON public.driver_payout_methods FOR UPDATE
  USING (auth.uid() = driver_id);

-- Drivers can delete their own methods
CREATE POLICY "Drivers can delete own payout methods"
  ON public.driver_payout_methods FOR DELETE
  USING (auth.uid() = driver_id);

-- Index for fast lookups
CREATE INDEX idx_driver_payout_methods_driver_id ON public.driver_payout_methods(driver_id);
;
