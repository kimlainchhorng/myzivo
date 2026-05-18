-- ========================================
-- COMPREHENSIVE SECURITY HARDENING SUITE
-- ========================================

-- 1. Security Events Table - Log all security-related activities
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- login_attempt, withdrawal_request, suspicious_activity, session_anomaly, etc.
    severity TEXT NOT NULL DEFAULT 'info', -- info, warning, critical
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    location_data JSONB,
    event_data JSONB,
    is_blocked BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Login Sessions Table - Track active sessions and detect anomalies
CREATE TABLE IF NOT EXISTS public.login_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    session_token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    device_type TEXT,
    location_country TEXT,
    location_city TEXT,
    is_trusted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    terminated_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Withdrawal Rate Limits Table - Prevent rapid withdrawal abuse
CREATE TABLE IF NOT EXISTS public.withdrawal_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE UNIQUE,
    daily_limit NUMERIC(10,2) DEFAULT 500.00,
    weekly_limit NUMERIC(10,2) DEFAULT 2000.00,
    monthly_limit NUMERIC(10,2) DEFAULT 8000.00,
    daily_used NUMERIC(10,2) DEFAULT 0,
    weekly_used NUMERIC(10,2) DEFAULT 0,
    monthly_used NUMERIC(10,2) DEFAULT 0,
    last_daily_reset TIMESTAMPTZ DEFAULT now(),
    last_weekly_reset TIMESTAMPTZ DEFAULT now(),
    last_monthly_reset TIMESTAMPTZ DEFAULT now(),
    is_locked BOOLEAN DEFAULT false,
    lock_reason TEXT,
    locked_at TIMESTAMPTZ,
    locked_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Trusted Devices Table - Known devices for 2FA bypass
CREATE TABLE IF NOT EXISTS public.trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT,
    device_type TEXT,
    last_used TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, device_fingerprint)
);

-- 5. Admin Security Alerts Table - For real-time admin notifications
CREATE TABLE IF NOT EXISTS public.admin_security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL, -- fraud_attempt, suspicious_withdrawal, multiple_login_failures, session_hijack, etc.
    severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
    title TEXT NOT NULL,
    description TEXT,
    related_user_id UUID,
    related_driver_id UUID,
    event_id UUID REFERENCES public.security_events(id) ON DELETE SET NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all security tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;

-- Security Events - Only admins can view, system can insert
CREATE POLICY "Admins can view security events"
ON public.security_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert security events"
ON public.security_events FOR INSERT TO authenticated
WITH CHECK (true);

-- Login Sessions - Users can view their own, admins can view all
CREATE POLICY "Users view own sessions"
ON public.login_sessions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage sessions"
ON public.login_sessions FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Withdrawal Rate Limits - Drivers view own, admins manage all
CREATE POLICY "Drivers view own limits"
ON public.withdrawal_rate_limits FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins manage limits"
ON public.withdrawal_rate_limits FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trusted Devices - Users manage their own
CREATE POLICY "Users manage own devices"
ON public.trusted_devices FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin Security Alerts - Only admins
CREATE POLICY "Admins manage alerts"
ON public.admin_security_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========================================
-- SECURITY FUNCTIONS
-- ========================================

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'info',
    p_user_id UUID DEFAULT NULL,
    p_driver_id UUID DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_fingerprint TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        event_type, severity, user_id, driver_id, 
        ip_address, user_agent, device_fingerprint, event_data
    ) VALUES (
        p_event_type, p_severity, p_user_id, p_driver_id,
        p_ip_address, p_user_agent, p_device_fingerprint, p_event_data
    ) RETURNING id INTO event_id;
    
    -- Auto-create admin alert for critical events
    IF p_severity = 'critical' THEN
        INSERT INTO public.admin_security_alerts (
            alert_type, severity, title, description,
            related_user_id, related_driver_id, event_id, metadata
        ) VALUES (
            p_event_type, 'critical',
            'Critical Security Event: ' || p_event_type,
            'A critical security event requires immediate attention.',
            p_user_id, p_driver_id, event_id, p_event_data
        );
    END IF;
    
    RETURN event_id;
END;
$$;

-- Function to check withdrawal limits and detect fraud
CREATE OR REPLACE FUNCTION public.check_withdrawal_allowed(
    p_driver_id UUID,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    limits RECORD;
    pending_amount NUMERIC;
    recent_withdrawals INTEGER;
    result JSONB;
BEGIN
    -- Get or create rate limits
    INSERT INTO public.withdrawal_rate_limits (driver_id)
    VALUES (p_driver_id)
    ON CONFLICT (driver_id) DO NOTHING;
    
    SELECT * INTO limits FROM public.withdrawal_rate_limits WHERE driver_id = p_driver_id;
    
    -- Check if account is locked
    IF limits.is_locked THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Account withdrawals are locked: ' || COALESCE(limits.lock_reason, 'Security review'),
            'code', 'ACCOUNT_LOCKED'
        );
    END IF;
    
    -- Reset daily/weekly/monthly counters if needed
    IF limits.last_daily_reset < CURRENT_DATE THEN
        UPDATE public.withdrawal_rate_limits 
        SET daily_used = 0, last_daily_reset = now()
        WHERE driver_id = p_driver_id;
        limits.daily_used := 0;
    END IF;
    
    IF limits.last_weekly_reset < CURRENT_DATE - INTERVAL '7 days' THEN
        UPDATE public.withdrawal_rate_limits 
        SET weekly_used = 0, last_weekly_reset = now()
        WHERE driver_id = p_driver_id;
        limits.weekly_used := 0;
    END IF;
    
    IF limits.last_monthly_reset < CURRENT_DATE - INTERVAL '30 days' THEN
        UPDATE public.withdrawal_rate_limits 
        SET monthly_used = 0, last_monthly_reset = now()
        WHERE driver_id = p_driver_id;
        limits.monthly_used := 0;
    END IF;
    
    -- Check limits
    IF limits.daily_used + p_amount > limits.daily_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Daily withdrawal limit exceeded. Remaining: $' || (limits.daily_limit - limits.daily_used)::TEXT,
            'code', 'DAILY_LIMIT'
        );
    END IF;
    
    IF limits.weekly_used + p_amount > limits.weekly_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Weekly withdrawal limit exceeded. Remaining: $' || (limits.weekly_limit - limits.weekly_used)::TEXT,
            'code', 'WEEKLY_LIMIT'
        );
    END IF;
    
    IF limits.monthly_used + p_amount > limits.monthly_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Monthly withdrawal limit exceeded. Remaining: $' || (limits.monthly_limit - limits.monthly_used)::TEXT,
            'code', 'MONTHLY_LIMIT'
        );
    END IF;
    
    -- Check for suspicious patterns: too many withdrawals in short time
    SELECT COUNT(*) INTO recent_withdrawals
    FROM public.withdrawals
    WHERE driver_id = p_driver_id
    AND requested_at > NOW() - INTERVAL '1 hour';
    
    IF recent_withdrawals >= 3 THEN
        -- Log suspicious activity
        PERFORM log_security_event(
            'suspicious_withdrawal_frequency',
            'warning',
            NULL, p_driver_id, NULL, NULL, NULL,
            jsonb_build_object('recent_count', recent_withdrawals, 'amount', p_amount)
        );
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Too many withdrawal requests in short time. Please wait before trying again.',
            'code', 'RATE_LIMITED'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'daily_remaining', limits.daily_limit - limits.daily_used - p_amount,
        'weekly_remaining', limits.weekly_limit - limits.weekly_used - p_amount
    );
END;
$$;

-- Function to record successful withdrawal and update limits
CREATE OR REPLACE FUNCTION public.record_withdrawal_usage(
    p_driver_id UUID,
    p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.withdrawal_rate_limits
    SET 
        daily_used = daily_used + p_amount,
        weekly_used = weekly_used + p_amount,
        monthly_used = monthly_used + p_amount,
        updated_at = now()
    WHERE driver_id = p_driver_id;
END;
$$;

-- Function to detect login anomalies
CREATE OR REPLACE FUNCTION public.check_login_anomaly(
    p_user_id UUID,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_device_fingerprint TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    known_device BOOLEAN;
    recent_failures INTEGER;
    different_locations INTEGER;
    result JSONB;
BEGIN
    -- Check if device is trusted
    SELECT EXISTS (
        SELECT 1 FROM public.trusted_devices
        WHERE user_id = p_user_id 
        AND device_fingerprint = p_device_fingerprint
        AND is_active = true
    ) INTO known_device;
    
    -- Count recent failed login attempts
    SELECT COUNT(*) INTO recent_failures
    FROM public.security_events
    WHERE user_id = p_user_id
    AND event_type = 'login_failed'
    AND created_at > NOW() - INTERVAL '15 minutes';
    
    -- If too many failures, block
    IF recent_failures >= 5 THEN
        PERFORM log_security_event(
            'account_lockout',
            'critical',
            p_user_id, NULL, p_ip_address, p_user_agent, p_device_fingerprint,
            jsonb_build_object('failure_count', recent_failures)
        );
        
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Account temporarily locked due to multiple failed attempts',
            'lockout_minutes', 15,
            'code', 'ACCOUNT_LOCKED'
        );
    END IF;
    
    -- Check for logins from many different locations
    SELECT COUNT(DISTINCT ip_address) INTO different_locations
    FROM public.login_sessions
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours'
    AND ip_address != p_ip_address;
    
    IF different_locations >= 5 AND NOT known_device THEN
        PERFORM log_security_event(
            'multiple_location_login',
            'warning',
            p_user_id, NULL, p_ip_address, p_user_agent, p_device_fingerprint,
            jsonb_build_object('location_count', different_locations)
        );
    END IF;
    
    RETURN jsonb_build_object(
        'allowed', true,
        'is_new_device', NOT known_device,
        'requires_verification', NOT known_device AND different_locations >= 3
    );
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON public.login_sessions(user_id, is_active, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_unread ON public.admin_security_alerts(is_read, is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON public.trusted_devices(user_id, is_active);

-- Enable Realtime for admin alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_security_alerts;;
