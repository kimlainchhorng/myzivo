-- Normalize all Cambodian driver phone numbers to +855 format without leading zeros

-- Step 1: Fix numbers already prefixed with +855 but have a 0 after (e.g. +855012345678 → +85512345678)
UPDATE drivers
SET phone = '+855' || ltrim(substring(phone from 5), '0')
WHERE country = 'KH'
  AND phone LIKE '+8550%';

-- Step 2: Fix numbers starting with 0 (no +855 prefix) → strip leading zeros, add +855
UPDATE drivers
SET phone = '+855' || ltrim(phone, '0')
WHERE country = 'KH'
  AND phone LIKE '0%'
  AND phone NOT LIKE '+%';

-- Step 3: Fix bare numbers (no + prefix, no leading 0) → just add +855
UPDATE drivers
SET phone = '+855' || phone
WHERE country = 'KH'
  AND phone NOT LIKE '+%'
  AND phone NOT LIKE '0%'
  AND phone IS NOT NULL
  AND phone != '';;
