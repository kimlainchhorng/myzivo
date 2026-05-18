INSERT INTO public.drivers_status (driver_id, is_online, lat, lng, city, last_seen, updated_at, is_busy, driver_state, heading, speed_mps, accuracy_m, decline_streak)
VALUES (
  '80049196-9c96-479f-954e-4e2a6f26b07b',
  true,
  11.5564,
  104.9282,
  'Phnom Penh',
  now(),
  now(),
  false,
  'online_available',
  0,
  0,
  10,
  0
)
ON CONFLICT (driver_id) DO UPDATE SET
  is_online = true,
  lat = 11.5564,
  lng = 104.9282,
  city = 'Phnom Penh',
  last_seen = now(),
  updated_at = now(),
  is_busy = false,
  driver_state = 'online_available';;
