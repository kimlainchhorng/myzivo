-- Fix stale is_online flags: sync with driver_state
UPDATE public.drivers_status
SET is_online = CASE
  WHEN driver_state IN ('online_available', 'online_ontrip') THEN true
  ELSE false
END
WHERE (is_online = true AND driver_state = 'offline')
   OR (is_online = false AND driver_state IN ('online_available', 'online_ontrip'));;
