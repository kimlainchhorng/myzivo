-- Add instant payout and tip settings to fee_settings
ALTER TABLE fee_settings 
ADD COLUMN IF NOT EXISTS instant_payout_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_instant_payout_amount numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS instant_payout_fee_flat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS instant_payout_fee_percent numeric DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS tips_to_driver_percent numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS tips_settle_instantly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_currency text DEFAULT 'USD';

-- Add currency column to food_orders
ALTER TABLE food_orders 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Add is_instant flag to payouts table
ALTER TABLE payouts
ADD COLUMN IF NOT EXISTS is_instant boolean DEFAULT false;

-- Add currency and tip_balance to wallet_balances
ALTER TABLE wallet_balances 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS tip_balance numeric DEFAULT 0;

-- Add currency to merchant_balances
ALTER TABLE merchant_balances
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Add tip_cents to food_orders (in cents for consistency with other fields)
ALTER TABLE food_orders
ADD COLUMN IF NOT EXISTS tip_cents integer DEFAULT 0;;
