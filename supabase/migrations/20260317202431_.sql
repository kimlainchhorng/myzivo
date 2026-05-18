insert into public.service_pricing (
  service_type,
  vehicle_type,
  base_fare,
  per_mile,
  per_minute,
  minimum_fare,
  platform_fee_flat,
  platform_fee_percent,
  is_active,
  country
)
values
  ('ride', 'economy', 5000, 1200, 150, 7000, 500, 0.08, true, 'KH'),
  ('ride', 'moto', 4000, 900, 120, 5000, 400, 0.08, true, 'KH'),
  ('ride', 'tuk_tuk', 6000, 1400, 180, 8500, 600, 0.08, true, 'KH'),
  ('ride', 'tuk_tuk_ev', 6500, 1500, 180, 9000, 600, 0.08, true, 'KH'),
  ('ride', 'comfort', 8000, 1800, 220, 11000, 700, 0.1, true, 'KH'),
  ('ride', 'ev', 8500, 1850, 220, 11500, 700, 0.1, true, 'KH'),
  ('ride', 'share_xl', 10000, 2200, 260, 14000, 900, 0.1, true, 'KH'),
  ('ride', 'xl', 11000, 2400, 280, 15000, 900, 0.1, true, 'KH'),
  ('eats', null, 4500, 1000, 120, 6000, 500, 0.1, true, 'KH'),
  ('delivery', null, 5000, 1100, 130, 6500, 500, 0.1, true, 'KH')
on conflict do nothing;;
