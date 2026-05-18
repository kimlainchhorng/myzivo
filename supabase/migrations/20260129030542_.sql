-- Add customer details columns to trips table
ALTER TABLE public.trips 
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS customer_lat numeric,
  ADD COLUMN IF NOT EXISTS customer_lng numeric;

-- Update existing test orders with sample customer data
UPDATE public.trips 
SET 
  customer_name = CASE 
    WHEN pickup_address LIKE '%Thai Orchid%' THEN 'Sarah Johnson'
    WHEN pickup_address LIKE '%Sakura Sushi%' THEN 'Mike Chen'
    WHEN pickup_address LIKE '%La Bella%' THEN 'Emma Davis'
    WHEN pickup_address LIKE '%Green Garden%' THEN 'David Wilson'
    WHEN pickup_address LIKE '%Noodle House%' THEN 'Lisa Brown'
    ELSE 'Customer'
  END,
  customer_phone = CASE 
    WHEN pickup_address LIKE '%Thai Orchid%' THEN '+1 (555) 123-4567'
    WHEN pickup_address LIKE '%Sakura Sushi%' THEN '+1 (555) 234-5678'
    WHEN pickup_address LIKE '%La Bella%' THEN '+1 (555) 345-6789'
    WHEN pickup_address LIKE '%Green Garden%' THEN '+1 (555) 456-7890'
    WHEN pickup_address LIKE '%Noodle House%' THEN '+1 (555) 567-8901'
    ELSE '+1 (555) 000-0000'
  END,
  customer_lat = dropoff_lat,
  customer_lng = dropoff_lng
WHERE status = 'requested' AND driver_id IS NULL;

-- Update the function to include customer data for new test orders
CREATE OR REPLACE FUNCTION public.create_available_test_orders()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  order_count INTEGER := 0;
BEGIN
  -- Clear old test orders that are still in requested status (older than 1 hour)
  DELETE FROM public.trips 
  WHERE status = 'requested' 
    AND driver_id IS NULL 
    AND created_at < NOW() - INTERVAL '1 hour';

  -- Insert new test orders with customer data
  INSERT INTO public.trips (
    pickup_address, dropoff_address, 
    pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
    fare_amount, distance_km, status, driver_id, created_at,
    customer_name, customer_phone, customer_lat, customer_lng
  ) VALUES
  ('Thai Orchid, 456 Main Street', '789 Oak Avenue, Apt 5A', 
   40.7580 + (RANDOM() * 0.01), -73.9855 + (RANDOM() * 0.01), 
   40.7128, -74.0060, 14.50, 4.2, 'requested', NULL, NOW(),
   'Sarah Johnson', '+1 (555) 123-4567', 40.7128, -74.0060),
  
  ('Sakura Sushi Bar, 321 Broadway', '654 Park Place', 
   40.7549 + (RANDOM() * 0.01), -73.9840 + (RANDOM() * 0.01), 
   40.7282, -73.7949, 11.25, 3.5, 'requested', NULL, NOW(),
   'Mike Chen', '+1 (555) 234-5678', 40.7282, -73.7949),
  
  ('La Bella Pizzeria, 888 Amsterdam', '999 West End Avenue', 
   40.7936 + (RANDOM() * 0.01), -73.9692 + (RANDOM() * 0.01), 
   40.8075, -73.9626, 8.75, 2.1, 'requested', NULL, NOW(),
   'Emma Davis', '+1 (555) 345-6789', 40.8075, -73.9626),
  
  ('Green Garden Cafe, 222 7th Ave', '333 8th Avenue', 
   40.7614 + (RANDOM() * 0.01), -73.9776 + (RANDOM() * 0.01), 
   40.7527, -73.9897, 9.50, 2.8, 'requested', NULL, NOW(),
   'David Wilson', '+1 (555) 456-7890', 40.7527, -73.9897),
  
  ('Noodle House Express, 111 Spring', '444 Houston Street', 
   40.7260 + (RANDOM() * 0.01), -74.0042 + (RANDOM() * 0.01), 
   40.7317, -74.0050, 12.00, 3.0, 'requested', NULL, NOW(),
   'Lisa Brown', '+1 (555) 567-8901', 40.7317, -74.0050);

  GET DIAGNOSTICS order_count = ROW_COUNT;
  RETURN order_count;
END;
$function$;;
