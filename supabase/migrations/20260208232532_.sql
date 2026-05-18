-- Create admin_login_attempts table
CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  success boolean NOT NULL,
  ip_address inet,
  user_agent text,
  failure_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for querying
CREATE INDEX idx_admin_login_attempts_email ON admin_login_attempts(email, created_at DESC);
CREATE INDEX idx_admin_login_attempts_created ON admin_login_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert login attempts (for logging)
CREATE POLICY "Anyone can insert login attempts" ON admin_login_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts" ON admin_login_attempts
  FOR SELECT TO authenticated USING (public.is_admin());

-- Create admin_sessions table
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  last_activity_at timestamptz DEFAULT now() NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can manage sessions
CREATE POLICY "Admins manage sessions" ON admin_sessions
  FOR ALL TO authenticated USING (public.is_admin());

-- Add 2FA fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_2fa_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_2fa_secret text,
ADD COLUMN IF NOT EXISTS last_admin_login timestamptz;

-- Create function to detect suspicious login IPs
CREATE OR REPLACE FUNCTION public.get_failed_login_ips(hours integer, min_attempts integer)
RETURNS TABLE(ip_address inet, attempt_count bigint) 
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ip_address, COUNT(*) as attempt_count
  FROM admin_login_attempts
  WHERE success = false
    AND created_at > now() - make_interval(hours => hours)
    AND ip_address IS NOT NULL
  GROUP BY ip_address
  HAVING COUNT(*) >= min_attempts
$$;;
