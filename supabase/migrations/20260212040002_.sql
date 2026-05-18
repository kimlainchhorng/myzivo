
-- Add columns to existing training_courses table
ALTER TABLE public.training_courses
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS certification_validity_days integer,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Training lessons table
CREATE TABLE public.training_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content_url text,
  content_text text,
  sort_order integer DEFAULT 0,
  duration_minutes integer DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;

-- Training quizzes table (one per course)
CREATE TABLE public.training_quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL UNIQUE REFERENCES public.training_courses(id) ON DELETE CASCADE,
  passing_score integer NOT NULL DEFAULT 80,
  max_attempts integer NOT NULL DEFAULT 3,
  time_limit_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_quizzes ENABLE ROW LEVEL SECURITY;

-- Training quiz questions
CREATE TABLE public.training_quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.training_quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Training quiz attempts
CREATE TABLE public.training_quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.training_quizzes(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Training certifications table
CREATE TABLE public.training_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  quiz_attempt_id uuid REFERENCES public.training_quiz_attempts(id),
  status text NOT NULL DEFAULT 'not_started',
  certified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(driver_id, course_id)
);
ALTER TABLE public.training_certifications ENABLE ROW LEVEL SECURITY;

-- RLS policies: Admin full access
CREATE POLICY "Admin full access on training_lessons" ON public.training_lessons FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on training_quizzes" ON public.training_quizzes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on training_quiz_questions" ON public.training_quiz_questions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on training_quiz_attempts" ON public.training_quiz_attempts FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access on training_certifications" ON public.training_certifications FOR ALL USING (public.is_admin());

-- Drivers can read courses/lessons/quizzes/questions
CREATE POLICY "Drivers can read training_lessons" ON public.training_lessons FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Drivers can read training_quizzes" ON public.training_quizzes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Drivers can read training_quiz_questions" ON public.training_quiz_questions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Drivers can read/insert their own attempts and certifications
CREATE POLICY "Drivers can read own quiz_attempts" ON public.training_quiz_attempts FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "Drivers can insert own quiz_attempts" ON public.training_quiz_attempts FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "Drivers can read own certifications" ON public.training_certifications FOR SELECT USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "Drivers can insert own certifications" ON public.training_certifications FOR INSERT WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_training_lessons_course ON public.training_lessons(course_id);
CREATE INDEX idx_training_quiz_questions_quiz ON public.training_quiz_questions(quiz_id);
CREATE INDEX idx_training_quiz_attempts_driver ON public.training_quiz_attempts(driver_id);
CREATE INDEX idx_training_quiz_attempts_quiz ON public.training_quiz_attempts(quiz_id);
CREATE INDEX idx_training_certifications_driver ON public.training_certifications(driver_id);
CREATE INDEX idx_training_certifications_course ON public.training_certifications(course_id);
CREATE INDEX idx_training_certifications_status ON public.training_certifications(status);
;
