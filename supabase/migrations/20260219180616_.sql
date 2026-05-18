-- Add phone and channel columns to otp_codes for SMS OTP support
ALTER TABLE public.otp_codes 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS channel text DEFAULT 'email';

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON public.otp_codes(phone) WHERE phone IS NOT NULL;

-- Add phone_verified column to drivers table if not exists
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;;
