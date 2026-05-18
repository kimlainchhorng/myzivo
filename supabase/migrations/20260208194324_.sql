-- Add foreign key from driver_weekly_earnings to drivers
ALTER TABLE driver_weekly_earnings
ADD CONSTRAINT driver_weekly_earnings_driver_id_fkey
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;

-- Add foreign key from driver_payouts to drivers  
ALTER TABLE driver_payouts
ADD CONSTRAINT driver_payouts_driver_id_fkey
FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE;;
