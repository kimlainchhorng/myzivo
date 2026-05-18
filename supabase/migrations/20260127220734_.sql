-- Create training_progress table for driver training courses
CREATE TABLE public.training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, course_id)
);

-- Create community_tips table for driver tips shared by the community
CREATE TABLE public.community_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  likes INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tip_likes table for tracking who liked which tips
CREATE TABLE public.community_tip_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id UUID NOT NULL REFERENCES public.community_tips(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tip_id, driver_id)
);

-- Create indexes
CREATE INDEX idx_training_progress_driver ON public.training_progress(driver_id);
CREATE INDEX idx_community_tips_category ON public.community_tips(category);
CREATE INDEX idx_community_tips_featured ON public.community_tips(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tip_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_progress
CREATE POLICY "Drivers can view their own training progress"
  ON public.training_progress FOR SELECT
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own training progress"
  ON public.training_progress FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own training progress"
  ON public.training_progress FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for community_tips (anyone can read, only author can modify)
CREATE POLICY "Anyone can view community tips"
  ON public.community_tips FOR SELECT
  USING (true);

CREATE POLICY "Drivers can create tips"
  ON public.community_tips FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own tips"
  ON public.community_tips FOR UPDATE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS policies for community_tip_likes
CREATE POLICY "Anyone can view tip likes"
  ON public.community_tip_likes FOR SELECT
  USING (true);

CREATE POLICY "Drivers can like tips"
  ON public.community_tip_likes FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can unlike tips they liked"
  ON public.community_tip_likes FOR DELETE
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Insert default community tips
INSERT INTO public.community_tips (driver_id, title, content, category, likes, is_featured)
SELECT 
  (SELECT id FROM public.drivers LIMIT 1),
  title,
  content,
  category,
  likes,
  true
FROM (VALUES
  ('Always check order details before leaving', 'Double-check the order against the receipt to avoid missing items and bad ratings.', 'Customer Service', 234),
  ('Position yourself near restaurant clusters', 'Park near areas with multiple restaurants to get orders faster during peak times.', 'Strategy', 189),
  ('Use insulated bags for all deliveries', 'Keeping food warm/cold shows professionalism and leads to better tips.', 'Equipment', 156),
  ('Take photos of delivered orders', 'Always take a photo when leaving orders at the door for your protection.', 'Safety', 298),
  ('Track your mileage from day one', 'Every mile counts for tax deductions. Use the built-in tracker!', 'Finance', 312)
) AS t(title, content, category, likes)
WHERE EXISTS (SELECT 1 FROM public.drivers LIMIT 1);

-- Add triggers for updated_at
CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON public.training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_tips_updated_at
  BEFORE UPDATE ON public.community_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();;
