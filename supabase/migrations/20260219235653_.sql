-- Add signup_data column to otp_codes to persist signup info server-side
-- This fixes the issue where sessionStorage data is lost if user opens OTP email in a different tab/browser
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS signup_data jsonb DEFAULT NULL;;
