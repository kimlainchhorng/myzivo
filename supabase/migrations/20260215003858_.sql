-- Move postgis extension from public to extensions schema
-- This also resolves the spatial_ref_sys RLS warning since it moves with the extension
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;;
