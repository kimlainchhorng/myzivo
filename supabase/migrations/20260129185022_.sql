-- Clean up duplicate customer_feedback policies
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "Public feedback is visible" ON public.customer_feedback;
DROP POLICY IF EXISTS "Restaurant owners can manage feedback" ON public.customer_feedback;;
