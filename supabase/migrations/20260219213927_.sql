ALTER TABLE public.drivers DROP CONSTRAINT drivers_onboarding_status_check;
ALTER TABLE public.drivers ADD CONSTRAINT drivers_onboarding_status_check CHECK (onboarding_status = ANY (ARRAY['not_started'::text, 'incomplete'::text, 'submitted'::text, 'pending_review'::text, 'approved'::text, 'rejected'::text]));;
