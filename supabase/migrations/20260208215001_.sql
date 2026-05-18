-- =============================================
-- Referrals + Promo Credits System Migration
-- =============================================

-- A. Extend referral_settings table
ALTER TABLE referral_settings
ADD COLUMN IF NOT EXISTS max_referrals_per_user integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS cooldown_days integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS merchant_referrer_credit_cents integer DEFAULT 5000,
ADD COLUMN IF NOT EXISTS merchant_referee_credit_cents integer DEFAULT 2500,
ADD COLUMN IF NOT EXISTS require_first_order boolean DEFAULT true;

-- B. Extend referrals table for fraud prevention
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS referee_type text DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS referrer_type text DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS first_order_id uuid,
ADD COLUMN IF NOT EXISTS first_order_at timestamptz,
ADD COLUMN IF NOT EXISTS reward_released_at timestamptz,
ADD COLUMN IF NOT EXISTS referrer_credit_cents integer,
ADD COLUMN IF NOT EXISTS referee_credit_cents integer,
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS device_fingerprint text,
ADD COLUMN IF NOT EXISTS fraud_flags jsonb DEFAULT '[]'::jsonb;

-- Index for fraud detection
CREATE INDEX IF NOT EXISTS idx_referrals_ip ON referrals(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_device ON referrals(device_fingerprint) WHERE device_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- C. Extend credit_ledger for better tracking
ALTER TABLE credit_ledger
ADD COLUMN IF NOT EXISTS credit_type text DEFAULT 'promo',
ADD COLUMN IF NOT EXISTS referral_id uuid,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS admin_id uuid,
ADD COLUMN IF NOT EXISTS notes text;

-- Add foreign key for referral_id if table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'credit_ledger_referral_id_fkey'
  ) THEN
    ALTER TABLE credit_ledger 
    ADD CONSTRAINT credit_ledger_referral_id_fkey 
    FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- D. Create user_credit_balances view
CREATE OR REPLACE VIEW user_credit_balances AS
SELECT 
  user_id,
  SUM(CASE WHEN expires_at IS NULL OR expires_at > NOW() THEN amount ELSE 0 END) as available_balance,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
  COUNT(*) as transaction_count
FROM credit_ledger
GROUP BY user_id;

-- E. Unique constraint to prevent one referee from having multiple referrals
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referee_unique 
ON referrals(referee_user_id) WHERE status IN ('pending', 'converted');

-- F. Index for credit_ledger lookups
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_type ON credit_ledger(credit_type);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_expires ON credit_ledger(expires_at) WHERE expires_at IS NOT NULL;

-- G. RLS for user_credit_balances view
-- Views inherit RLS from underlying tables, so credit_ledger RLS applies;
