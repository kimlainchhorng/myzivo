-- Add cancellation tracking columns to rides table
ALTER TABLE rides ADD COLUMN IF NOT EXISTS cancelled_by TEXT CHECK (cancelled_by IN ('customer', 'driver', 'admin'));
ALTER TABLE rides ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC DEFAULT 0;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'pending', 'refunded', 'failed'));
ALTER TABLE rides ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE rides ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;;
