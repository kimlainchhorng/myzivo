-- Create sample available trips for testing the acceptance workflow
-- These trips have status 'requested' and no driver assigned

INSERT INTO public.trips (
  id, pickup_address, dropoff_address, 
  pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
  fare_amount, distance_km, status, driver_id, created_at
) VALUES
-- Trip 1: Downtown pickup
(gen_random_uuid(), 'Thai Orchid, 456 Main Street', '789 Oak Avenue, Apt 5A', 
 40.7580, -73.9855, 40.7128, -74.0060,
 14.50, 4.2, 'requested', NULL, NOW() - INTERVAL '2 minutes'),

-- Trip 2: Midtown pickup
(gen_random_uuid(), 'Sakura Sushi Bar, 321 Broadway', '654 Park Place South', 
 40.7549, -73.9840, 40.7282, -73.7949,
 11.25, 3.5, 'requested', NULL, NOW() - INTERVAL '5 minutes'),

-- Trip 3: Upper West Side
(gen_random_uuid(), 'La Bella Pizzeria, 888 Amsterdam Ave', '999 West End Avenue', 
 40.7936, -73.9692, 40.8075, -73.9626,
 8.75, 2.1, 'requested', NULL, NOW() - INTERVAL '3 minutes'),

-- Trip 4: Chelsea
(gen_random_uuid(), 'Green Garden Cafe, 222 7th Ave', '333 8th Avenue', 
 40.7614, -73.9776, 40.7527, -73.9897,
 9.50, 2.8, 'requested', NULL, NOW() - INTERVAL '7 minutes'),

-- Trip 5: SoHo
(gen_random_uuid(), 'Noodle House Express, 111 Spring St', '444 Houston Street', 
 40.7260, -74.0042, 40.7317, -74.0050,
 12.00, 3.0, 'requested', NULL, NOW() - INTERVAL '1 minute');

-- Create a function to generate fresh test orders on demand
CREATE OR REPLACE FUNCTION public.create_available_test_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_count INTEGER := 0;
BEGIN
  -- Clear old test orders that are still in requested status (older than 1 hour)
  DELETE FROM public.trips 
  WHERE status = 'requested' 
    AND driver_id IS NULL 
    AND created_at < NOW() - INTERVAL '1 hour';

  -- Insert new test orders
  INSERT INTO public.trips (
    pickup_address, dropoff_address, 
    pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
    fare_amount, distance_km, status, driver_id, created_at
  ) VALUES
  ('Thai Orchid, 456 Main Street', '789 Oak Avenue, Apt 5A', 
   40.7580 + (RANDOM() * 0.01), -73.9855 + (RANDOM() * 0.01), 
   40.7128, -74.0060, 14.50, 4.2, 'requested', NULL, NOW()),
  
  ('Sakura Sushi Bar, 321 Broadway', '654 Park Place', 
   40.7549 + (RANDOM() * 0.01), -73.9840 + (RANDOM() * 0.01), 
   40.7282, -73.7949, 11.25, 3.5, 'requested', NULL, NOW()),
  
  ('La Bella Pizzeria, 888 Amsterdam', '999 West End Avenue', 
   40.7936 + (RANDOM() * 0.01), -73.9692 + (RANDOM() * 0.01), 
   40.8075, -73.9626, 8.75, 2.1, 'requested', NULL, NOW()),
  
  ('Green Garden Cafe, 222 7th Ave', '333 8th Avenue', 
   40.7614 + (RANDOM() * 0.01), -73.9776 + (RANDOM() * 0.01), 
   40.7527, -73.9897, 9.50, 2.8, 'requested', NULL, NOW()),
  
  ('Noodle House Express, 111 Spring', '444 Houston Street', 
   40.7260 + (RANDOM() * 0.01), -74.0042 + (RANDOM() * 0.01), 
   40.7317, -74.0050, 12.00, 3.0, 'requested', NULL, NOW());

  GET DIAGNOSTICS order_count = ROW_COUNT;
  RETURN order_count;
END;
$$;;
