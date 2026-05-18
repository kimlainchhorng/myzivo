-- Add out_for_delivery status to booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'out_for_delivery' AFTER 'ready_for_pickup';;
