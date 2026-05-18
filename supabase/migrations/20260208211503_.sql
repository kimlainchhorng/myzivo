-- Add missing columns to fee_settings table for enhanced fee configuration

ALTER TABLE public.fee_settings 
ADD COLUMN IF NOT EXISTS driver_per_mile numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_fee_percent numeric DEFAULT 0;

-- Add comment to document purpose
COMMENT ON COLUMN public.fee_settings.driver_per_mile IS 'Per-mile rate paid to drivers (in dollars)';
COMMENT ON COLUMN public.fee_settings.service_fee_percent IS 'Service fee as percentage (e.g. 5 = 5%)';

-- Create merchant_balances table for tracking merchant payout balances
CREATE TABLE IF NOT EXISTS public.merchant_balances (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    pending numeric DEFAULT 0,
    paid_out numeric DEFAULT 0,
    last_payout_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT merchant_balances_restaurant_unique UNIQUE (restaurant_id)
);

-- Enable RLS on merchant_balances
ALTER TABLE public.merchant_balances ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage merchant_balances"
ON public.merchant_balances
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_merchant_balances_restaurant ON public.merchant_balances(restaurant_id);

-- Create trigger for updated_at
CREATE TRIGGER update_merchant_balances_updated_at
BEFORE UPDATE ON public.merchant_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
