-- Add missing Stripe fields to restaurants (if not exist)
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean DEFAULT false;

-- Add locking columns to payouts (if not exist)
ALTER TABLE public.payouts
ADD COLUMN IF NOT EXISTS locked_at timestamptz,
ADD COLUMN IF NOT EXISTS locked_by uuid,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS status_detail text;

-- Create merchant payout run tracking table
CREATE TABLE IF NOT EXISTS public.merchant_payout_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  merchants_processed int DEFAULT 0,
  merchants_paid int DEFAULT 0,
  merchants_failed int DEFAULT 0,
  total_amount numeric DEFAULT 0,
  triggered_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create merchant payout run items table
CREATE TABLE IF NOT EXISTS public.merchant_payout_run_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.merchant_payout_runs(id) ON DELETE CASCADE,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  stripe_transfer_id text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.merchant_payout_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_payout_run_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access only
CREATE POLICY "Admins can manage merchant payout runs"
ON public.merchant_payout_runs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage merchant payout run items"
ON public.merchant_payout_run_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchant_payout_run_items_run_id ON public.merchant_payout_run_items(run_id);
CREATE INDEX IF NOT EXISTS idx_merchant_payout_run_items_restaurant_id ON public.merchant_payout_run_items(restaurant_id);;
