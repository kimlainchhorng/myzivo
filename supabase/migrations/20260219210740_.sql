
-- Extract year from vehicle_model into vehicle_year where vehicle_year is null
UPDATE public.drivers
SET vehicle_year = (regexp_match(vehicle_model, '(20[0-9]{2})'))[1]::integer
WHERE vehicle_year IS NULL
  AND vehicle_model IS NOT NULL
  AND vehicle_model ~ '20[0-9]{2}';
;
