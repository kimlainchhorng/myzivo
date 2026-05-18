-- Mark App Store review account as verified and approved
UPDATE public.drivers 
SET is_verified = true, 
    status = 'verified',
    phone_verified = true,
    full_name = 'App Review'
WHERE user_id = '3383fb14-e5e1-4de8-8bd3-3d143ed680f9';

-- Ensure user role exists
INSERT INTO public.user_roles (user_id, role)
VALUES ('3383fb14-e5e1-4de8-8bd3-3d143ed680f9', 'driver')
ON CONFLICT (user_id, role) DO NOTHING;;
