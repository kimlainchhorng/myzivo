-- Create training_courses table for course content
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 25,
  lessons_count INTEGER NOT NULL DEFAULT 5,
  badge_id TEXT,
  category TEXT NOT NULL DEFAULT 'basics',
  sort_order INTEGER DEFAULT 0,
  is_locked_by_default BOOLEAN DEFAULT false,
  prerequisite_course_id UUID REFERENCES public.training_courses(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_training_progress table for tracking completion
CREATE TABLE public.driver_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, course_id)
);

-- Create driver_certifications table
CREATE TABLE public.driver_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  certification_icon TEXT NOT NULL DEFAULT '🏆',
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, certification_name)
);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_courses (public read for all authenticated users)
CREATE POLICY "Anyone can view training courses"
ON public.training_courses FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for driver_training_progress
CREATE POLICY "Drivers can view their own training progress"
ON public.driver_training_progress FOR SELECT
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own training progress"
ON public.driver_training_progress FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can update their own training progress"
ON public.driver_training_progress FOR UPDATE
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- RLS Policies for driver_certifications
CREATE POLICY "Drivers can view their own certifications"
ON public.driver_certifications FOR SELECT
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Drivers can insert their own certifications"
ON public.driver_certifications FOR INSERT
WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Insert default training courses
INSERT INTO public.training_courses (title, description, duration_minutes, lessons_count, badge_id, category, sort_order, is_locked_by_default) VALUES
('Driver Onboarding Essentials', 'Learn the basics of using the ZIVO driver app and completing deliveries', 25, 6, 'certified-driver', 'basics', 1, false),
('Maximizing Your Earnings', 'Pro tips for increasing your hourly earnings and finding the best orders', 35, 8, NULL, 'earnings', 2, false),
('Customer Service Excellence', 'How to provide 5-star service and boost your ratings', 20, 5, 'service-pro', 'service', 3, false),
('Safety & Emergency Procedures', 'Essential safety protocols and how to handle emergencies', 30, 7, 'safety-certified', 'safety', 4, false),
('Advanced Navigation Techniques', 'Master efficient routing and multi-stop delivery optimization', 40, 10, 'navigation-expert', 'advanced', 5, true),
('Tax & Financial Management', 'Understanding deductions, expenses, and quarterly taxes', 45, 9, NULL, 'finance', 6, false);

-- Create trigger for updated_at
CREATE TRIGGER update_driver_training_progress_updated_at
BEFORE UPDATE ON public.driver_training_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
