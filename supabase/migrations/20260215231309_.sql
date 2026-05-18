
-- Add missing eats_zones
INSERT INTO public.eats_zones (zone_code, city_name, city_id, tax_rate, delivery_fee_base, delivery_fee_per_mile, small_order_threshold, is_active, services_enabled)
SELECT
  UPPER(LEFT(REPLACE(c.name, ' ', ''), 4)) || c.state,
  c.name, c.id,
  CASE c.state
    WHEN 'DE' THEN 0.0000 WHEN 'MT' THEN 0.0000 WHEN 'NH' THEN 0.0000 WHEN 'OR' THEN 0.0000
    WHEN 'AL' THEN 0.0400 WHEN 'AR' THEN 0.0650 WHEN 'CO' THEN 0.0290 WHEN 'IL' THEN 0.0625
    WHEN 'KY' THEN 0.0600 WHEN 'ND' THEN 0.0500 WHEN 'TX' THEN 0.0625 WHEN 'WV' THEN 0.0600
    ELSE 0.0500
  END,
  399, 15.0, 1000, true, '["ride","eats","delivery"]'::jsonb
FROM public.cities c
WHERE NOT EXISTS (SELECT 1 FROM public.eats_zones z WHERE z.city_id = c.id)
ON CONFLICT (zone_code) DO NOTHING;

-- Add missing regions using correct unique constraint (city, state)
INSERT INTO public.regions (name, city, state, country, currency, timezone, is_active, services_enabled)
SELECT c.name, c.name, c.state, 'US', 'USD',
  CASE c.state
    WHEN 'HI' THEN 'Pacific/Honolulu' WHEN 'AK' THEN 'America/Anchorage'
    WHEN 'CA' THEN 'America/Los_Angeles' WHEN 'OR' THEN 'America/Los_Angeles' WHEN 'WA' THEN 'America/Los_Angeles' WHEN 'NV' THEN 'America/Los_Angeles'
    WHEN 'AZ' THEN 'America/Phoenix'
    WHEN 'MT' THEN 'America/Denver' WHEN 'WY' THEN 'America/Denver' WHEN 'CO' THEN 'America/Denver' WHEN 'UT' THEN 'America/Denver' WHEN 'NM' THEN 'America/Denver' WHEN 'ID' THEN 'America/Boise'
    WHEN 'ND' THEN 'America/Chicago' WHEN 'SD' THEN 'America/Chicago' WHEN 'NE' THEN 'America/Chicago' WHEN 'KS' THEN 'America/Chicago' WHEN 'OK' THEN 'America/Chicago' WHEN 'TX' THEN 'America/Chicago' WHEN 'MN' THEN 'America/Chicago' WHEN 'IA' THEN 'America/Chicago' WHEN 'MO' THEN 'America/Chicago' WHEN 'AR' THEN 'America/Chicago' WHEN 'LA' THEN 'America/Chicago' WHEN 'WI' THEN 'America/Chicago' WHEN 'IL' THEN 'America/Chicago' WHEN 'MS' THEN 'America/Chicago' WHEN 'AL' THEN 'America/Chicago' WHEN 'TN' THEN 'America/Chicago'
    WHEN 'IN' THEN 'America/Indiana/Indianapolis'
    ELSE 'America/New_York'
  END,
  true, ARRAY['ride','eats','delivery']
FROM public.cities c
WHERE NOT EXISTS (SELECT 1 FROM public.regions r WHERE r.city = c.name AND r.state = c.state)
ON CONFLICT (city, state) DO NOTHING;
;
