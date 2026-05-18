
-- Add matching regions for all new cities
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

-- Add matching eats_zones for all new cities
INSERT INTO public.eats_zones (zone_code, city_name, city_id, tax_rate, delivery_fee_base, delivery_fee_per_mile, small_order_threshold, is_active, services_enabled)
SELECT
  UPPER(LEFT(REPLACE(REPLACE(REPLACE(c.name, ' ', ''), '''', ''), '-', ''), 5)) || c.state || c.id::text,
  c.name, c.id,
  CASE c.state
    WHEN 'DE' THEN 0.0000 WHEN 'MT' THEN 0.0000 WHEN 'NH' THEN 0.0000 WHEN 'OR' THEN 0.0000 WHEN 'AK' THEN 0.0000
    WHEN 'AL' THEN 0.0400 WHEN 'GA' THEN 0.0400 WHEN 'HI' THEN 0.0400 WHEN 'WY' THEN 0.0400 WHEN 'NY' THEN 0.0400
    WHEN 'CO' THEN 0.0290 WHEN 'NC' THEN 0.0475 WHEN 'NM' THEN 0.0513 WHEN 'VA' THEN 0.0530 WHEN 'AZ' THEN 0.0560
    WHEN 'OH' THEN 0.0575 WHEN 'ME' THEN 0.0550 WHEN 'NE' THEN 0.0550 WHEN 'VT' THEN 0.0600
    WHEN 'FL' THEN 0.0600 WHEN 'MD' THEN 0.0600 WHEN 'SC' THEN 0.0600 WHEN 'PA' THEN 0.0600 WHEN 'MI' THEN 0.0600
    WHEN 'KY' THEN 0.0600 WHEN 'WV' THEN 0.0600 WHEN 'IA' THEN 0.0600 WHEN 'ID' THEN 0.0600 WHEN 'DC' THEN 0.0600 WHEN 'UT' THEN 0.0610
    WHEN 'TX' THEN 0.0625 WHEN 'IL' THEN 0.0625 WHEN 'MA' THEN 0.0625 WHEN 'CT' THEN 0.0635
    WHEN 'WA' THEN 0.0650 WHEN 'KS' THEN 0.0650 WHEN 'AR' THEN 0.0650
    WHEN 'NJ' THEN 0.0663 WHEN 'NV' THEN 0.0685 WHEN 'MN' THEN 0.0688
    WHEN 'IN' THEN 0.0700 WHEN 'RI' THEN 0.0700 WHEN 'MS' THEN 0.0700 WHEN 'TN' THEN 0.0700
    WHEN 'LA' THEN 0.0445 WHEN 'WI' THEN 0.0500 WHEN 'ND' THEN 0.0500 WHEN 'SD' THEN 0.0450 WHEN 'OK' THEN 0.0450
    WHEN 'CA' THEN 0.0725 WHEN 'MO' THEN 0.0423
    ELSE 0.0500
  END,
  399, 15.0, 1000, true, '["ride","eats","delivery"]'::jsonb
FROM public.cities c
WHERE NOT EXISTS (SELECT 1 FROM public.eats_zones z WHERE z.city_id = c.id)
ON CONFLICT (zone_code) DO NOTHING;
;
