-- Reorder rules for automatic purchase orders
CREATE TABLE IF NOT EXISTS public.reorder_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  reorder_point NUMERIC(10,2) NOT NULL,
  reorder_quantity NUMERIC(10,2) NOT NULL,
  preferred_supplier_id UUID REFERENCES public.suppliers(id),
  auto_order BOOLEAN DEFAULT false,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, inventory_item_id)
);

-- Staff performance metrics
CREATE TABLE IF NOT EXISTS public.staff_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  orders_served INTEGER DEFAULT 0,
  total_sales NUMERIC(10,2) DEFAULT 0,
  tips_earned NUMERIC(10,2) DEFAULT 0,
  hours_worked NUMERIC(10,2) DEFAULT 0,
  avg_order_time_minutes NUMERIC(10,2),
  customer_rating NUMERIC(3,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, staff_id, period_start, period_end)
);

-- Tip distribution records
CREATE TABLE IF NOT EXISTS public.tip_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  distribution_date DATE NOT NULL,
  total_tips NUMERIC(10,2) NOT NULL,
  distribution_method TEXT NOT NULL DEFAULT 'hours_worked',
  notes TEXT,
  distributed_by UUID REFERENCES public.staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tip distribution allocations
CREATE TABLE IF NOT EXISTS public.tip_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distribution_id UUID NOT NULL REFERENCES public.tip_distributions(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  hours_worked NUMERIC(10,2),
  percentage NUMERIC(5,2),
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kitchen prep timers / ticket priorities
ALTER TABLE public.customer_orders 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS prep_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_prep_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS assigned_chef UUID REFERENCES public.staff_members(id);

-- Enable RLS on new tables
ALTER TABLE public.reorder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_allocations ENABLE ROW LEVEL SECURITY;

-- RLS policies for reorder_rules
CREATE POLICY "Users can view their restaurant's reorder rules"
ON public.reorder_rules FOR SELECT
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage their restaurant's reorder rules"
ON public.reorder_rules FOR ALL
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS policies for staff_performance
CREATE POLICY "Users can view their restaurant's staff performance"
ON public.staff_performance FOR SELECT
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage their restaurant's staff performance"
ON public.staff_performance FOR ALL
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS policies for tip_distributions
CREATE POLICY "Users can view their restaurant's tip distributions"
ON public.tip_distributions FOR SELECT
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Users can manage their restaurant's tip distributions"
ON public.tip_distributions FOR ALL
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- RLS policies for tip_allocations
CREATE POLICY "Users can view their restaurant's tip allocations"
ON public.tip_allocations FOR SELECT
USING (distribution_id IN (
  SELECT id FROM public.tip_distributions WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
));

CREATE POLICY "Users can manage their restaurant's tip allocations"
ON public.tip_allocations FOR ALL
USING (distribution_id IN (
  SELECT id FROM public.tip_distributions WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
  )
));;
