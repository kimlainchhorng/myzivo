-- Drop the old check constraint and replace with an expanded one
ALTER TABLE public.driver_notifications DROP CONSTRAINT driver_notifications_type_check;

ALTER TABLE public.driver_notifications ADD CONSTRAINT driver_notifications_type_check
CHECK (type = ANY (ARRAY[
  'earnings', 'order', 'rating', 'achievement', 'system', 'promo',
  'approval', 'rejection', 'chat_message',
  'trip_assigned', 'trip_cancelled', 'trip_completed',
  'payout_update', 'tip_received', 'payment_received',
  'account_update', 'bonus', 'surge_active'
]));;
