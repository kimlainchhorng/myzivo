-- Drop RLS policies that are EXACT duplicates of another policy on the same
-- table (same roles, cmd, qual, with_check). Pure noise — the linter flags
-- them as multiple_permissive_policies but they OR to the same boolean as
-- the survivor. Keep the alphabetically-first, drop the rest.
DO $$
DECLARE
  grp record;
  pol_name text;
  dropped int := 0;
  failed int := 0;
BEGIN
  FOR grp IN
    SELECT schemaname, tablename,
           array_agg(policyname ORDER BY policyname) AS pols
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename, cmd, roles, qual, with_check
    HAVING count(*) > 1
  LOOP
    -- Skip the first (alphabetical) policy; drop the rest
    FOR pol_name IN SELECT unnest(grp.pols[2:array_length(grp.pols, 1)])
    LOOP
      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol_name, grp.schemaname, grp.tablename);
        dropped := dropped + 1;
      EXCEPTION WHEN OTHERS THEN
        failed := failed + 1;
        RAISE WARNING 'Skipped %.% (%): %', grp.tablename, pol_name, SQLSTATE, SQLERRM;
      END;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Dropped % duplicate policies (% failed)', dropped, failed;
END $$;;
