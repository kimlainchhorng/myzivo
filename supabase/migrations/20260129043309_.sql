-- Driver withdrawals table for secure payout tracking
CREATE TABLE IF NOT EXISTS public.driver_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'mobile_money', 'instant')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_id TEXT UNIQUE,
    device_fingerprint TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ,
    failed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_withdrawals ENABLE ROW LEVEL SECURITY;

-- Drivers can only view their own withdrawals
CREATE POLICY "Drivers can view own withdrawals"
ON public.driver_withdrawals FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.drivers d
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
);

-- Only system can insert/update (via RPC or service role)
-- Drivers can initiate via RPC function
CREATE POLICY "Drivers can insert own withdrawals"
ON public.driver_withdrawals FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.drivers d
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
);

-- Index for fast lookups
CREATE INDEX idx_driver_withdrawals_driver ON public.driver_withdrawals(driver_id);
CREATE INDEX idx_driver_withdrawals_status ON public.driver_withdrawals(status);
CREATE INDEX idx_driver_withdrawals_created ON public.driver_withdrawals(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_driver_withdrawals_updated_at
BEFORE UPDATE ON public.driver_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to validate withdrawal before processing
CREATE OR REPLACE FUNCTION public.validate_withdrawal(
    p_driver_id UUID,
    p_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance NUMERIC;
    v_pending NUMERIC;
    v_today_count INT;
    v_suspicious BOOLEAN := FALSE;
BEGIN
    -- Get driver's available balance (from earnings minus completed withdrawals)
    SELECT COALESCE(SUM(net_amount), 0) INTO v_balance
    FROM driver_earnings
    WHERE driver_id = p_driver_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_pending
    FROM driver_withdrawals
    WHERE driver_id = p_driver_id 
    AND status IN ('pending', 'processing', 'completed');
    
    v_balance := v_balance - v_pending;
    
    -- Check if amount exceeds balance
    IF p_amount > v_balance THEN
        RETURN jsonb_build_object(
            'valid', FALSE,
            'reason', 'Insufficient balance',
            'code', 'INSUFFICIENT_BALANCE',
            'available', v_balance
        );
    END IF;
    
    -- Check withdrawal count today
    SELECT COUNT(*) INTO v_today_count
    FROM driver_withdrawals
    WHERE driver_id = p_driver_id
    AND created_at >= CURRENT_DATE
    AND status != 'cancelled';
    
    IF v_today_count >= 5 THEN
        -- Flag as suspicious and create alert
        INSERT INTO admin_security_alerts (
            alert_type, severity, title, description,
            related_driver_id, metadata
        ) VALUES (
            'excessive_withdrawals', 'warning',
            'Excessive withdrawal attempts',
            'Driver has attempted more than 5 withdrawals today',
            p_driver_id,
            jsonb_build_object('count', v_today_count, 'amount', p_amount)
        );
        
        RETURN jsonb_build_object(
            'valid', FALSE,
            'reason', 'Daily withdrawal limit reached',
            'code', 'DAILY_LIMIT'
        );
    END IF;
    
    -- Check for suspicious patterns (rapid small withdrawals)
    SELECT COUNT(*) > 3 INTO v_suspicious
    FROM driver_withdrawals
    WHERE driver_id = p_driver_id
    AND created_at >= NOW() - INTERVAL '1 hour'
    AND amount < 500;
    
    IF v_suspicious THEN
        INSERT INTO admin_security_alerts (
            alert_type, severity, title, description,
            related_driver_id, metadata
        ) VALUES (
            'suspicious_withdrawal_pattern', 'critical',
            'Suspicious withdrawal pattern detected',
            'Multiple small withdrawals in short time period',
            p_driver_id,
            jsonb_build_object('amount', p_amount)
        );
    END IF;
    
    RETURN jsonb_build_object(
        'valid', TRUE,
        'available', v_balance,
        'pending_total', v_pending
    );
END;
$$;;
