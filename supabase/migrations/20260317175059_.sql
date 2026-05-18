ALTER TABLE drivers ALTER COLUMN country SET DEFAULT 'KH';

UPDATE drivers SET country = 'KH' WHERE country = 'US' OR country IS NULL;;
