-- Ensure authenticated users have the table privileges needed by PostgREST
-- (RLS policies still control which rows they can actually see/update)

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.restaurants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.square_connections TO authenticated;

-- Optional: allow reading active restaurants publicly if your app relies on it.
-- If you don't need public reads, you can remove this grant later.
GRANT SELECT ON TABLE public.restaurants TO anon;
;
