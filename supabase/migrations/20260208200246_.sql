-- Add lifetime_earnings computed column to wallet_balances
-- This will always reflect pending + available + paid_out

ALTER TABLE wallet_balances 
ADD COLUMN IF NOT EXISTS lifetime_earnings NUMERIC 
GENERATED ALWAYS AS (COALESCE(pending, 0) + COALESCE(available, 0) + COALESCE(paid_out, 0)) STORED;;
