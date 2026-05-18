-- Create order_actions table for admin audit logging
CREATE TABLE public.order_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.food_orders(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text NOT NULL,
  action text NOT NULL,
  reason text,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_actions_order ON public.order_actions(order_id, created_at DESC);
CREATE INDEX idx_order_actions_actor ON public.order_actions(actor_user_id, created_at DESC);
CREATE INDEX idx_order_actions_action ON public.order_actions(action, created_at DESC);

ALTER TABLE public.order_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all order_actions" ON public.order_actions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Merchants can read own restaurant actions" ON public.order_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.food_orders fo
      JOIN public.restaurants r ON fo.restaurant_id = r.id
      WHERE fo.id = order_actions.order_id
      AND r.owner_id = auth.uid()
    )
  );

-- Create refunds table for Stripe refund tracking
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.food_orders(id) ON DELETE CASCADE NOT NULL,
  stripe_refund_id text,
  stripe_payment_intent_id text,
  amount_cents int NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  reason text,
  initiated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_refunds_order ON public.refunds(order_id);
CREATE INDEX idx_refunds_status ON public.refunds(status, created_at DESC);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all refunds" ON public.refunds
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create driver_penalties table
CREATE TABLE public.driver_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.drivers(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount_cents int DEFAULT 0,
  note text,
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_penalties_driver ON public.driver_penalties(driver_id, created_at DESC);
CREATE INDEX idx_penalties_type ON public.driver_penalties(type);

ALTER TABLE public.driver_penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all penalties" ON public.driver_penalties
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Drivers can read own penalties" ON public.driver_penalties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers d 
      WHERE d.id = driver_penalties.driver_id 
      AND d.user_id = auth.uid()
    )
  );;
