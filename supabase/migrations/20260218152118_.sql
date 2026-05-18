
-- Allow license_number and vehicle_plate to be NULL during initial signup
ALTER TABLE public.drivers ALTER COLUMN license_number DROP NOT NULL;
ALTER TABLE public.drivers ALTER COLUMN vehicle_plate DROP NOT NULL;
;
