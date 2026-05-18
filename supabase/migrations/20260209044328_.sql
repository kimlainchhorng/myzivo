-- First migration: Add new admin role types to the enum
-- Note: These need to be committed before the functions can use them
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';;
