-- Create a separate table for 2FA secrets with deny-all RLS
CREATE TABLE IF NOT EXISTS public.admin_2fa_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  totp_secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS with deny-all policy (only accessible via service role)
ALTER TABLE public.admin_2fa_credentials ENABLE ROW LEVEL SECURITY;

-- No RLS policies = deny all access for anon/authenticated roles
-- Only service_role (used in edge functions) can read/write

-- Migrate existing 2FA secrets from profiles to the new table
INSERT INTO public.admin_2fa_credentials (user_id, totp_secret)
SELECT id, admin_2fa_secret
FROM public.profiles
WHERE admin_2fa_secret IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET totp_secret = EXCLUDED.totp_secret;

-- Remove the 2FA secret column from profiles (keep admin_2fa_enabled as a flag)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS admin_2fa_secret;;
