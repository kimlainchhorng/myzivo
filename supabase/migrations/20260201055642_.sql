-- Add Stripe payment fields to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add payment fields to food_orders table  
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Create index on payment status for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_payment_status ON public.trips(payment_status);
CREATE INDEX IF NOT EXISTS idx_food_orders_payment_status ON public.food_orders(payment_status);

-- Create index on stripe checkout session ID for webhook lookup
CREATE INDEX IF NOT EXISTS idx_trips_checkout_session ON public.trips(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_food_orders_checkout_session ON public.food_orders(stripe_checkout_session_id);;
