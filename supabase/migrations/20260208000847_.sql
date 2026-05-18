-- Set admin driver as verified (is_verified = true allows going online)
UPDATE public.drivers 
SET is_verified = true 
WHERE user_id = '2e0e7bfe-edda-4369-8c87-3ad82bb52b1d';;
