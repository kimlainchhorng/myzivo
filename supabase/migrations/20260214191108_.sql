-- Mark onboarding approved and verified for Chhorngkimlain1@gmail.com
UPDATE public.drivers
SET onboarding_status = 'approved',
    is_verified = true,
    updated_at = now()
WHERE id = '052d3b20-9284-4113-bc60-7253c69971d1';

-- Approve all driver documents
UPDATE public.driver_documents
SET status = 'approved'
WHERE driver_id = '052d3b20-9284-4113-bc60-7253c69971d1';
;
