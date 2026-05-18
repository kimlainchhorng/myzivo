
-- Add more cities to underrepresented states (targeting 4-5 per state minimum)

-- CITIES
INSERT INTO public.cities (name, state, timezone) VALUES
-- DC (1→3)
('Georgetown DC','DC','America/New_York'),('Capitol Hill DC','DC','America/New_York'),
-- DE (2→4)
('Newark DE','DE','America/New_York'),('Wilmington DE','DE','America/New_York'),
-- HI (2→4)
('Kailua','HI','Pacific/Honolulu'),('Kapolei','HI','Pacific/Honolulu'),
-- ME (2→4)
('Lewiston','ME','America/New_York'),('Bangor','ME','America/New_York'),
-- MS (3→5)
('Biloxi','MS','America/Chicago'),('Southaven','MS','America/Chicago'),
-- MT (3→5)
('Helena','MT','America/Denver'),('Bozeman','MT','America/Denver'),
-- NE (3→5)
('Grand Island','NE','America/Chicago'),('Kearney','NE','America/Chicago'),
-- NH (3→5)
('Manchester NH','NH','America/New_York'),('Dover NH','NH','America/New_York'),
-- RI (3→5)
('Pawtucket','RI','America/New_York'),('East Providence','RI','America/New_York'),
-- SD (2→4)
('Aberdeen SD','SD','America/Chicago'),('Brookings','SD','America/Chicago'),
-- VT (1→4)
('Burlington','VT','America/New_York'),('South Burlington','VT','America/New_York'),('Rutland','VT','America/New_York'),
-- WV (3→5)
('Charleston WV','WV','America/New_York'),('Parkersburg','WV','America/New_York'),
-- WY (3→5)
('Gillette','WY','America/Denver'),('Rock Springs','WY','America/Denver')
ON CONFLICT (name) DO NOTHING;

-- REGIONS
INSERT INTO public.regions (name, city, state, country, currency, timezone, center_lat, center_lng, is_active, services_enabled) VALUES
('Georgetown DC','Georgetown','DC','US','USD','America/New_York',38.9076,-77.0723,true,'{ride,eats,delivery}'),
('Capitol Hill DC','Capitol Hill','DC','US','USD','America/New_York',38.8899,-76.9905,true,'{ride,eats,delivery}'),
('Newark DE','Newark','DE','US','USD','America/New_York',39.6837,-75.7497,true,'{ride,eats,delivery}'),
('Wilmington DE','Wilmington','DE','US','USD','America/New_York',39.7391,-75.5398,true,'{ride,eats,delivery}'),
('Kailua','Kailua','HI','US','USD','Pacific/Honolulu',21.4022,-76.4508,true,'{ride,eats,delivery}'),
('Kapolei','Kapolei','HI','US','USD','Pacific/Honolulu',21.3350,-158.0581,true,'{ride,eats,delivery}'),
('Lewiston','Lewiston','ME','US','USD','America/New_York',44.1004,-70.2148,true,'{ride,eats,delivery}'),
('Bangor','Bangor','ME','US','USD','America/New_York',44.8016,-68.7712,true,'{ride,eats,delivery}'),
('Biloxi','Biloxi','MS','US','USD','America/Chicago',30.3960,-88.8853,true,'{ride,eats,delivery}'),
('Southaven','Southaven','MS','US','USD','America/Chicago',34.9719,-89.9787,true,'{ride,eats,delivery}'),
('Helena','Helena','MT','US','USD','America/Denver',46.5958,-112.0270,true,'{ride,eats,delivery}'),
('Bozeman','Bozeman','MT','US','USD','America/Denver',45.6770,-111.0429,true,'{ride,eats,delivery}'),
('Grand Island','Grand Island','NE','US','USD','America/Chicago',40.9264,-98.3420,true,'{ride,eats,delivery}'),
('Kearney','Kearney','NE','US','USD','America/Chicago',40.6993,-99.0832,true,'{ride,eats,delivery}'),
('Manchester NH','Manchester','NH','US','USD','America/New_York',42.9956,-71.4548,true,'{ride,eats,delivery}'),
('Dover NH','Dover','NH','US','USD','America/New_York',43.1979,-70.8737,true,'{ride,eats,delivery}'),
('Pawtucket','Pawtucket','RI','US','USD','America/New_York',41.8787,-71.3826,true,'{ride,eats,delivery}'),
('East Providence','East Providence','RI','US','USD','America/New_York',41.8137,-71.3701,true,'{ride,eats,delivery}'),
('Aberdeen SD','Aberdeen','SD','US','USD','America/Chicago',45.4647,-98.4865,true,'{ride,eats,delivery}'),
('Brookings','Brookings','SD','US','USD','America/Chicago',44.3114,-96.7984,true,'{ride,eats,delivery}'),
('Burlington','Burlington','VT','US','USD','America/New_York',44.4759,-73.2121,true,'{ride,eats,delivery}'),
('South Burlington','South Burlington','VT','US','USD','America/New_York',44.4669,-73.1709,true,'{ride,eats,delivery}'),
('Rutland','Rutland','VT','US','USD','America/New_York',43.6106,-72.9726,true,'{ride,eats,delivery}'),
('Charleston WV','Charleston','WV','US','USD','America/New_York',38.3498,-81.6326,true,'{ride,eats,delivery}'),
('Parkersburg','Parkersburg','WV','US','USD','America/New_York',39.2667,-81.5615,true,'{ride,eats,delivery}'),
('Gillette','Gillette','WY','US','USD','America/Denver',44.2911,-105.5022,true,'{ride,eats,delivery}'),
('Rock Springs','Rock Springs','WY','US','USD','America/Denver',41.5875,-109.2029,true,'{ride,eats,delivery}')
ON CONFLICT (city, state) DO NOTHING;

-- EATS_ZONES
INSERT INTO public.eats_zones (zone_code, city_name, city_id, tax_rate, delivery_fee_base, service_fee_percent, small_order_threshold, is_active, services_enabled)
SELECT v.zone_code, v.city_name, c.id, v.tax_rate, 399, 15.0, 1000, true, '["ride","eats","delivery"]'::jsonb
FROM (VALUES
('GTC','Georgetown DC',0.0600),('CPH','Capitol Hill DC',0.0600),
('NWK','Newark DE',0.0000),('WLM','Wilmington DE',0.0000),
('KLU','Kailua',0.0450),('KPL','Kapolei',0.0450),
('LWS','Lewiston',0.0550),('BGR','Bangor',0.0550),
('BLX','Biloxi',0.0700),('SHV2','Southaven',0.0700),
('HLN','Helena',0.0000),('BZN','Bozeman',0.0000),
('GRI','Grand Island',0.0700),('KEA','Kearney',0.0700),
('MHT','Manchester NH',0.0000),('DVR','Dover NH',0.0000),
('PWT','Pawtucket',0.0700),('EPR','East Providence',0.0700),
('ABR','Aberdeen SD',0.0650),('BRK','Brookings',0.0650),
('BTV','Burlington',0.0600),('SBV','South Burlington',0.0600),('RUT','Rutland',0.0600),
('CRW','Charleston WV',0.0600),('PKB','Parkersburg',0.0600),
('GCC','Gillette',0.0600),('RKS','Rock Springs',0.0600)
) AS v(zone_code, city_name, tax_rate)
JOIN public.cities c ON c.name = v.city_name
ON CONFLICT (zone_code) DO NOTHING;
;
