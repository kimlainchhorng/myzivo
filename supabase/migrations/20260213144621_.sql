-- Add target_role to training_courses so courses can target drivers or restaurants
ALTER TABLE public.training_courses
ADD COLUMN IF NOT EXISTS target_role text NOT NULL DEFAULT 'driver';

-- Add a restaurant_id column to training_progress for restaurant user tracking
ALTER TABLE public.training_progress
ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Add restaurant_id to training_quiz_attempts  
ALTER TABLE public.training_quiz_attempts
ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Add restaurant_id to training_certifications
ALTER TABLE public.training_certifications
ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Make driver_id nullable in training_progress (restaurants won't have driver_id)
ALTER TABLE public.training_progress ALTER COLUMN driver_id DROP NOT NULL;
ALTER TABLE public.training_quiz_attempts ALTER COLUMN driver_id DROP NOT NULL;
ALTER TABLE public.training_certifications ALTER COLUMN driver_id DROP NOT NULL;

-- Add correct_answer to quiz questions
ALTER TABLE public.training_quiz_questions
ADD COLUMN IF NOT EXISTS correct_answer integer NOT NULL DEFAULT 0;;
