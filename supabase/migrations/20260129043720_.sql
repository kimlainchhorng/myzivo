-- Create function to detect and log suspicious patterns automatically
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_failed_count INTEGER;
  suspicious_reason TEXT;
BEGIN
  -- For security_events table - auto-detect patterns
  IF NEW.event_type = 'login_failed' THEN
    -- Count recent failed logins for this user
    SELECT COUNT(*) INTO recent_failed_count
    FROM security_events
    WHERE user_id = NEW.user_id
      AND event_type = 'login_failed'
      AND created_at > NOW() - INTERVAL '15 minutes';
    
    IF recent_failed_count >= 5 THEN
      -- Create admin alert for brute force attempt
      INSERT INTO admin_security_alerts (
        alert_type, severity, title, description, 
        related_user_id, event_id, metadata
      ) VALUES (
        'brute_force_attempt',
        'critical',
        'Brute Force Attack Detected',
        format('User %s has %s failed login attempts in 15 minutes', 
               NEW.user_id, recent_failed_count),
        NEW.user_id,
        NEW.id,
        jsonb_build_object(
          'failed_attempts', recent_failed_count,
          'ip_address', NEW.ip_address,
          'device_fingerprint', NEW.device_fingerprint
        )
      );
      
      -- Mark event as blocked
      NEW.is_blocked := true;
    END IF;
  END IF;

  -- Detect rapid withdrawal attempts
  IF NEW.event_type = 'withdrawal_initiated' THEN
    DECLARE
      rapid_withdrawal_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO rapid_withdrawal_count
      FROM security_events
      WHERE user_id = NEW.user_id
        AND event_type = 'withdrawal_initiated'
        AND created_at > NOW() - INTERVAL '1 hour';
      
      IF rapid_withdrawal_count >= 4 THEN
        INSERT INTO admin_security_alerts (
          alert_type, severity, title, description,
          related_user_id, event_id, metadata
        ) VALUES (
          'rapid_withdrawals',
          'warning',
          'Rapid Withdrawal Attempts',
          format('User %s attempted %s withdrawals in 1 hour', 
                 NEW.user_id, rapid_withdrawal_count),
          NEW.user_id,
          NEW.id,
          jsonb_build_object(
            'withdrawal_count', rapid_withdrawal_count,
            'event_data', NEW.event_data
          )
        );
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-detection
DROP TRIGGER IF EXISTS detect_suspicious_activity_trigger ON security_events;
CREATE TRIGGER detect_suspicious_activity_trigger
  BEFORE INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION detect_suspicious_activity();

-- Function to get security summary for a user
CREATE OR REPLACE FUNCTION public.get_user_security_summary(p_user_id UUID)
RETURNS TABLE (
  total_events BIGINT,
  failed_logins BIGINT,
  successful_logins BIGINT,
  blocked_events BIGINT,
  last_login TIMESTAMPTZ,
  trusted_devices_count BIGINT,
  active_sessions_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM security_events WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM security_events WHERE user_id = p_user_id AND event_type = 'login_failed'),
    (SELECT COUNT(*) FROM security_events WHERE user_id = p_user_id AND event_type = 'login_success'),
    (SELECT COUNT(*) FROM security_events WHERE user_id = p_user_id AND is_blocked = true),
    (SELECT MAX(created_at) FROM security_events WHERE user_id = p_user_id AND event_type = 'login_success'),
    (SELECT COUNT(*) FROM trusted_devices WHERE user_id = p_user_id AND is_active = true),
    (SELECT COUNT(*) FROM login_sessions WHERE user_id = p_user_id AND is_active = true);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.detect_suspicious_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_security_summary(UUID) TO authenticated;;
