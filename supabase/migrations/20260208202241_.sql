-- Add data column to driver_notifications for storing trip_id, amounts, etc.
ALTER TABLE driver_notifications 
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';;
