-- Add 'ready_for_pickup' to the booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'ready_for_pickup' AFTER 'in_progress';;
