-- Create ops_alerts table for operational alerts
CREATE TABLE public.ops_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- unassigned | late_order | driver_idle | payment_failed | payout_failed
  severity text NOT NULL DEFAULT 'info', -- info | warn | critical
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ops_alerts_is_resolved ON public.ops_alerts(is_resolved);
CREATE INDEX idx_ops_alerts_severity ON public.ops_alerts(severity);
CREATE INDEX idx_ops_alerts_type ON public.ops_alerts(type);
CREATE INDEX idx_ops_alerts_created_at ON public.ops_alerts(created_at);
CREATE INDEX idx_ops_alerts_order_id ON public.ops_alerts(order_id);
CREATE INDEX idx_ops_alerts_driver_id ON public.ops_alerts(driver_id);

-- Enable RLS
ALTER TABLE public.ops_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin only
CREATE POLICY "Admins can view ops_alerts" ON public.ops_alerts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert ops_alerts" ON public.ops_alerts
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update ops_alerts" ON public.ops_alerts
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete ops_alerts" ON public.ops_alerts
  FOR DELETE USING (public.is_admin());

-- Enable realtime for ops_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.ops_alerts;

-- Enable realtime for food_orders if not already enabled (will silently fail if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.food_orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Enable realtime for drivers if not already enabled
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;;
