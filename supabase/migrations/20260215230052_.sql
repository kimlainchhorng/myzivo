
-- Add more cities to states with < 5 entries

-- CITIES
INSERT INTO public.cities (name, state, timezone) VALUES
-- AK (3→5)
('Wasilla','AK','America/Anchorage'),('Sitka','AK','America/Anchorage'),
-- DC (3→5)
('Foggy Bottom DC','DC','America/New_York'),('Dupont Circle DC','DC','America/New_York'),
-- DE (3→5)
('Middletown DE','DE','America/New_York'),('Smyrna DE','DE','America/New_York'),
-- ME (3→5)
('Auburn ME','ME','America/New_York'),('Scarborough','ME','America/New_York'),
-- VT (3→5)
('Montpelier','VT','America/New_York'),('Essex Junction','VT','America/New_York'),
-- AL (4→5)
('Mobile','AL','America/Chicago'),
-- AR (4→5)
('Jonesboro','AR','America/Chicago'),
-- CO (4→5)
('Pueblo','CO','America/Denver'),
-- CT (4→5)
('Waterbury','CT','America/New_York'),
-- GA (4→5)
('Columbus GA','GA','America/New_York'),
-- HI (4→5)
('Pearl City','HI','Pacific/Honolulu'),
-- IA (4→5)
('Waterloo','IA','America/Chicago'),
-- ID (4→5)
('Pocatello','ID','America/Boise'),
-- KS (4→5)
('Topeka','KS','America/Chicago'),
-- KY (4→5)
('Owensboro','KY','America/New_York'),
-- LA (4→5)
('Lake Charles','LA','America/Chicago'),
-- MD (4→5)
('Gaithersburg','MD','America/New_York'),
-- ND (4→5)
('Williston','ND','America/Chicago'),
-- NM (4→5)
('Roswell','NM','America/Denver'),
-- NV (4→5)
('Sparks','NV','America/Los_Angeles'),
-- OK (4→5)
('Edmond','OK','America/Chicago'),
-- OR (4→5)
('Bend','OR','America/Los_Angeles'),
-- SC (4→5)
('Rock Hill','SC','America/New_York'),
-- SD (4→5)
('Watertown SD','SD','America/Chicago'),
-- UT (4→5)
('Orem','UT','America/Denver')
ON CONFLICT (name) DO NOTHING;

-- REGIONS
INSERT INTO public.regions (name, city, state, country, currency, timezone, center_lat, center_lng, is_active, services_enabled) VALUES
('Wasilla','Wasilla','AK','US','USD','America/Anchorage',61.5814,-149.4394,true,'{ride,eats,delivery}'),
('Sitka','Sitka','AK','US','USD','America/Anchorage',57.0531,-135.3300,true,'{ride,eats,delivery}'),
('Foggy Bottom DC','Foggy Bottom','DC','US','USD','America/New_York',38.8964,-77.0447,true,'{ride,eats,delivery}'),
('Dupont Circle DC','Dupont Circle','DC','US','USD','America/New_York',38.9096,-77.0434,true,'{ride,eats,delivery}'),
('Middletown DE','Middletown','DE','US','USD','America/New_York',39.4496,-75.7163,true,'{ride,eats,delivery}'),
('Smyrna DE','Smyrna','DE','US','USD','America/New_York',39.2998,-75.6046,true,'{ride,eats,delivery}'),
('Auburn ME','Auburn','ME','US','USD','America/New_York',44.0979,-70.2312,true,'{ride,eats,delivery}'),
('Scarborough','Scarborough','ME','US','USD','America/New_York',43.5781,-70.3472,true,'{ride,eats,delivery}'),
('Montpelier','Montpelier','VT','US','USD','America/New_York',44.2601,-72.5754,true,'{ride,eats,delivery}'),
('Essex Junction','Essex Junction','VT','US','USD','America/New_York',44.4900,-73.1109,true,'{ride,eats,delivery}'),
('Mobile','Mobile','AL','US','USD','America/Chicago',30.6954,-88.0399,true,'{ride,eats,delivery}'),
('Jonesboro','Jonesboro','AR','US','USD','America/Chicago',35.8423,-90.7043,true,'{ride,eats,delivery}'),
('Pueblo','Pueblo','CO','US','USD','America/Denver',38.2544,-104.6091,true,'{ride,eats,delivery}'),
('Waterbury','Waterbury','CT','US','USD','America/New_York',41.5582,-73.0515,true,'{ride,eats,delivery}'),
('Columbus GA','Columbus','GA','US','USD','America/New_York',32.4610,-84.9877,true,'{ride,eats,delivery}'),
('Pearl City','Pearl City','HI','US','USD','Pacific/Honolulu',21.3972,-157.9750,true,'{ride,eats,delivery}'),
('Waterloo','Waterloo','IA','US','USD','America/Chicago',42.4928,-92.3426,true,'{ride,eats,delivery}'),
('Pocatello','Pocatello','ID','US','USD','America/Boise',42.8713,-112.4455,true,'{ride,eats,delivery}'),
('Topeka','Topeka','KS','US','USD','America/Chicago',39.0473,-95.6752,true,'{ride,eats,delivery}'),
('Owensboro','Owensboro','KY','US','USD','America/New_York',37.7719,-87.1112,true,'{ride,eats,delivery}'),
('Lake Charles','Lake Charles','LA','US','USD','America/Chicago',30.2266,-93.2174,true,'{ride,eats,delivery}'),
('Gaithersburg','Gaithersburg','MD','US','USD','America/New_York',39.1434,-77.2014,true,'{ride,eats,delivery}'),
('Williston','Williston','ND','US','USD','America/Chicago',48.1470,-103.6180,true,'{ride,eats,delivery}'),
('Roswell','Roswell','NM','US','USD','America/Denver',33.3943,-104.5230,true,'{ride,eats,delivery}'),
('Sparks','Sparks','NV','US','USD','America/Los_Angeles',39.5349,-119.7527,true,'{ride,eats,delivery}'),
('Edmond','Edmond','OK','US','USD','America/Chicago',35.6528,-97.4781,true,'{ride,eats,delivery}'),
('Bend','Bend','OR','US','USD','America/Los_Angeles',44.0582,-121.3153,true,'{ride,eats,delivery}'),
('Rock Hill','Rock Hill','SC','US','USD','America/New_York',34.9249,-81.0251,true,'{ride,eats,delivery}'),
('Watertown SD','Watertown','SD','US','USD','America/Chicago',44.8994,-97.1150,true,'{ride,eats,delivery}'),
('Orem','Orem','UT','US','USD','America/Denver',40.2969,-111.6946,true,'{ride,eats,delivery}')
ON CONFLICT (city, state) DO NOTHING;

-- EATS_ZONES
INSERT INTO public.eats_zones (zone_code, city_name, city_id, tax_rate, delivery_fee_base, service_fee_percent, small_order_threshold, is_active, services_enabled)
SELECT v.zone_code, v.city_name, c.id, v.tax_rate, 399, 15.0, 1000, true, '["ride","eats","delivery"]'::jsonb
FROM (VALUES
('WAS','Wasilla',0.0000),('STK2','Sitka',0.0600),
('FGB','Foggy Bottom DC',0.0600),('DPC','Dupont Circle DC',0.0600),
('MDT','Middletown DE',0.0000),('SMR','Smyrna DE',0.0000),
('ABN','Auburn ME',0.0550),('SCB','Scarborough',0.0550),
('MPL','Montpelier',0.0600),('ESJ','Essex Junction',0.0600),
('MOB','Mobile',0.1000),('JBR','Jonesboro',0.0950),
('PBL','Pueblo',0.0740),('WTB','Waterbury',0.0635),
('CGA','Columbus GA',0.0800),('PRC','Pearl City',0.0450),
('WTL','Waterloo',0.0700),('POC','Pocatello',0.0600),
('TOP','Topeka',0.0965),('OWB','Owensboro',0.0600),
('LKC','Lake Charles',0.0945),('GTB','Gaithersburg',0.0600),
('WIL','Williston',0.0750),('RSW','Roswell',0.0769),
('SPK','Sparks',0.0838),('EDM','Edmond',0.0863),
('BND','Bend',0.0000),('RKH','Rock Hill',0.0800),
('WTN','Watertown SD',0.0650),('ORM','Orem',0.0725)
) AS v(zone_code, city_name, tax_rate)
JOIN public.cities c ON c.name = v.city_name
ON CONFLICT (zone_code) DO NOTHING;
;
