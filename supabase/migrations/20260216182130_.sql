
-- Fix URL-encoded timestamps: create a helper function that decodes %3A back to :
CREATE OR REPLACE FUNCTION public.safe_parse_timestamptz(input TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN replace(replace(input, '%3A', ':'), '%2B', '+')::TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
;
