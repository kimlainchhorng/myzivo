-- Fix drivers who are in Cambodia but have country=US
-- Detect by phone number pattern (+855, 855, or local Cambodian numbers starting with 0)
UPDATE public.drivers 
SET country = 'KH'
WHERE country = 'US' 
  AND (
    phone LIKE '+855%' 
    OR phone LIKE '855%'
    OR (phone LIKE '0%' AND LENGTH(phone) BETWEEN 9 AND 12)
  );;
