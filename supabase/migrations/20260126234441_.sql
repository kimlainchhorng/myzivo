-- Restaurant Branches table for multi-location support
CREATE TABLE IF NOT EXISTS public.restaurant_branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurant_branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for branches
DROP POLICY IF EXISTS "Restaurant owners can manage branches" ON public.restaurant_branches;
CREATE POLICY "Restaurant owners can manage branches"
  ON public.restaurant_branches
  FOR ALL
  USING (parent_restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

-- Customer Feedback table
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  comment TEXT,
  sentiment TEXT DEFAULT 'neutral',
  is_public BOOLEAN DEFAULT false,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
DROP POLICY IF EXISTS "Restaurant owners can manage feedback" ON public.customer_feedback;
CREATE POLICY "Restaurant owners can manage feedback"
  ON public.customer_feedback
  FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.customer_feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.customer_feedback
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public feedback is visible" ON public.customer_feedback;
CREATE POLICY "Public feedback is visible"
  ON public.customer_feedback
  FOR SELECT
  USING (is_public = true);

-- Scheduled Reports table
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'pdf',
  recipients TEXT[],
  include_revenue BOOLEAN DEFAULT true,
  include_orders BOOLEAN DEFAULT true,
  include_inventory BOOLEAN DEFAULT false,
  include_staff BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled reports
DROP POLICY IF EXISTS "Restaurant owners can manage scheduled reports" ON public.scheduled_reports;
CREATE POLICY "Restaurant owners can manage scheduled reports"
  ON public.scheduled_reports
  FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

-- Floor Plans table for visual table management
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Floor',
  width INTEGER NOT NULL DEFAULT 800,
  height INTEGER NOT NULL DEFAULT 600,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for floor plans
DROP POLICY IF EXISTS "Restaurant owners can manage floor plans" ON public.floor_plans;
CREATE POLICY "Restaurant owners can manage floor plans"
  ON public.floor_plans
  FOR ALL
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  ));

-- Add position columns to restaurant_tables for floor plan placement
ALTER TABLE public.restaurant_tables 
  ADD COLUMN IF NOT EXISTS floor_plan_id UUID,
  ADD COLUMN IF NOT EXISTS position_x INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS position_y INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS width INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS height INTEGER DEFAULT 80,
  ADD COLUMN IF NOT EXISTS shape TEXT DEFAULT 'square';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_restaurant_branches_updated_at ON public.restaurant_branches;
CREATE TRIGGER update_restaurant_branches_updated_at
  BEFORE UPDATE ON public.restaurant_branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_feedback_updated_at ON public.customer_feedback;
CREATE TRIGGER update_customer_feedback_updated_at
  BEFORE UPDATE ON public.customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_reports_updated_at ON public.scheduled_reports;
CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_floor_plans_updated_at ON public.floor_plans;
CREATE TRIGGER update_floor_plans_updated_at
  BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
