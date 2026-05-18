-- The 4-arg signature is the broken one (referenced last_used_at + ip_address
-- columns that don't exist). Drop it so PostgREST unambiguously routes to the
-- 5-arg signature with _device_type added.
DROP FUNCTION IF EXISTS public.register_trusted_device(UUID, TEXT, TEXT, TEXT);;
