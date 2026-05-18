-- Create withdrawals table to track cash out requests
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'mobile_money', 'paypal')),
  notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own withdrawals
CREATE POLICY "Drivers can view their own withdrawals"
ON public.withdrawals FOR SELECT
USING (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
));

-- Drivers can request withdrawals
CREATE POLICY "Drivers can request withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (driver_id IN (
  SELECT id FROM drivers WHERE user_id = auth.uid()
));

-- Admins can manage all withdrawals
CREATE POLICY "Admins can manage all withdrawals"
ON public.withdrawals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX idx_withdrawals_driver_id ON public.withdrawals(driver_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);;
