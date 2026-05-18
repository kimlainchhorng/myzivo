-- Add cancellation fields to trips table
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS cancellation_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none' CHECK (refund_status IN ('none', 'pending', 'refunded', 'failed'));

-- Add cancellation fields to food_orders table  
ALTER TABLE public.food_orders
ADD COLUMN IF NOT EXISTS cancelled_by text CHECK (cancelled_by IN ('customer', 'driver', 'admin')),
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0;

-- Create cancellation_rules table for admin-editable rules
CREATE TABLE IF NOT EXISTS public.cancellation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('ride', 'eats', 'delivery')),
  free_cancel_seconds int NOT NULL DEFAULT 120,
  fee_after_free numeric NOT NULL DEFAULT 2.00,
  fee_if_driver_arrived numeric NOT NULL DEFAULT 5.00,
  driver_comp_if_arrived numeric NOT NULL DEFAULT 3.00,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on cancellation_rules
ALTER TABLE public.cancellation_rules ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (rules are public config)
CREATE POLICY "cancellation_rules_select_policy" ON public.cancellation_rules
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify rules
CREATE POLICY "cancellation_rules_admin_insert_policy" ON public.cancellation_rules
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cancellation_rules_admin_update_policy" ON public.cancellation_rules
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "cancellation_rules_admin_delete_policy" ON public.cancellation_rules
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed default cancellation rules
INSERT INTO public.cancellation_rules (service_type, free_cancel_seconds, fee_after_free, fee_if_driver_arrived, driver_comp_if_arrived, active)
VALUES
  ('ride', 120, 2.00, 5.00, 3.00, true),
  ('delivery', 120, 2.00, 5.00, 3.00, true),
  ('eats', 120, 2.00, 5.00, 3.00, true)
ON CONFLICT DO NOTHING;;
