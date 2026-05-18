-- Driver tiers configuration
CREATE TABLE public.driver_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'award',
  color text NOT NULL DEFAULT '#888',
  min_deliveries integer NOT NULL DEFAULT 0,
  min_rating numeric(3,2) NOT NULL DEFAULT 0,
  min_acceptance_rate numeric(5,2) NOT NULL DEFAULT 0,
  min_on_time_rate numeric(5,2) NOT NULL DEFAULT 0,
  benefits_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.driver_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read driver tiers" ON public.driver_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage driver tiers" ON public.driver_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Restaurant tiers configuration
CREATE TABLE public.restaurant_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'store',
  color text NOT NULL DEFAULT '#888',
  min_orders integer NOT NULL DEFAULT 0,
  min_rating numeric(3,2) NOT NULL DEFAULT 0,
  benefits_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurant_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read restaurant tiers" ON public.restaurant_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage restaurant tiers" ON public.restaurant_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Add tier column to drivers if not exists
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS tier text DEFAULT 'bronze';

-- Add tier column to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS partner_tier text DEFAULT 'standard';

-- Tier history for tracking changes
CREATE TABLE public.tier_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'driver' or 'restaurant'
  entity_id uuid NOT NULL,
  old_tier text,
  new_tier text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tier_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tier history" ON public.tier_history FOR SELECT USING (true);
CREATE POLICY "System inserts tier history" ON public.tier_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Seed default driver tiers
INSERT INTO public.driver_tiers (id, name, icon, color, min_deliveries, min_rating, min_acceptance_rate, min_on_time_rate, benefits_json, sort_order) VALUES
  ('bronze', 'Bronze', 'award', '#CD7F32', 0, 0, 0, 0, '["Standard dispatch priority","Base pay rates"]', 1),
  ('silver', 'Silver', 'award', '#C0C0C0', 100, 4.0, 70, 80, '["Priority dispatch","5% bonus on peak hours","Early access to shifts"]', 2),
  ('gold', 'Gold', 'award', '#FFD700', 500, 4.5, 80, 85, '["Top dispatch priority","10% bonus on all orders","Exclusive promotions","Lower service fees"]', 3),
  ('platinum', 'Platinum', 'award', '#E5E4E2', 2000, 4.7, 90, 90, '["Highest dispatch priority","15% bonus on all orders","VIP support","Lowest service fees","Exclusive events"]', 4);

-- Seed default restaurant tiers
INSERT INTO public.restaurant_tiers (id, name, icon, color, min_orders, min_rating, benefits_json, sort_order) VALUES
  ('standard', 'Standard', 'store', '#888888', 0, 0, '["Basic listing","Standard support"]', 1),
  ('preferred', 'Preferred', 'star', '#3B82F6', 100, 4.0, '["Better search placement","Priority support","Basic analytics"]', 2),
  ('gold', 'Gold', 'crown', '#FFD700', 500, 4.3, '["Featured placement","Lower commission","Premium analytics","Marketing tools"]', 3),
  ('premium', 'Premium', 'gem', '#8B5CF6', 2000, 4.5, '["Top featured placement","Lowest commission","Full analytics suite","Premium marketing","Dedicated account manager"]', 4);;
