CREATE OR REPLACE FUNCTION public.check_withdrawal_allowed(p_driver_id uuid, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    limits RECORD;
    pending_amount NUMERIC;
    recent_withdrawals INTEGER;
    result JSONB;
    caller_uid UUID;
BEGIN
    -- Defense in depth: validate caller is the driver or service role
    caller_uid := auth.uid();
    IF caller_uid IS NOT NULL THEN
        -- Called by an authenticated user (not service role)
        IF caller_uid != (SELECT user_id FROM public.drivers WHERE id = p_driver_id) THEN
            RAISE EXCEPTION 'Not authorized to check withdrawal limits for this driver';
        END IF;
    END IF;
    -- If caller_uid IS NULL, it's service role which is allowed

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
    
    -- Check for suspicious patterns
    SELECT COUNT(*) INTO recent_withdrawals
    FROM public.withdrawals
    WHERE driver_id = p_driver_id
    AND requested_at > NOW() - INTERVAL '1 hour';
    
    IF recent_withdrawals >= 3 THEN
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
$function$;;
