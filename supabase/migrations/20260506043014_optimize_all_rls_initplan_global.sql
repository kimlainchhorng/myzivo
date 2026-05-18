-- Replace all bare auth.uid() with (SELECT auth.uid()) in public-schema RLS
-- policies. Postgres 14+ caches the InitPlan once per query instead of
-- re-evaluating per row — significant speedup on large feeds, posts,
-- notifications, etc. Same security semantics.
DO $$
DECLARE
  pol record;
  new_qual text;
  new_check text;
  alter_sql text;
  rewritten_count int := 0;
  failed_count int := 0;
BEGIN
  FOR pol IN
    SELECT polname AS name, n.nspname AS schema, c.relname AS tablename,
           pg_get_expr(p.polqual, p.polrelid) AS qual_text,
           pg_get_expr(p.polwithcheck, p.polrelid) AS check_text
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND (
        pg_get_expr(p.polqual, p.polrelid) ~ '(?<!SELECT\s)auth\.uid\(\)'
        OR pg_get_expr(p.polwithcheck, p.polrelid) ~ '(?<!SELECT\s)auth\.uid\(\)'
      )
  LOOP
    new_qual := pol.qual_text;
    new_check := pol.check_text;

    -- Replace bare auth.uid() (not already inside SELECT) with (SELECT auth.uid())
    IF new_qual IS NOT NULL THEN
      new_qual := regexp_replace(new_qual, '(?<!SELECT\s)auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    END IF;
    IF new_check IS NOT NULL THEN
      new_check := regexp_replace(new_check, '(?<!SELECT\s)auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    END IF;

    -- Skip if nothing changed
    IF (new_qual IS NOT DISTINCT FROM pol.qual_text) AND (new_check IS NOT DISTINCT FROM pol.check_text) THEN
      CONTINUE;
    END IF;

    alter_sql := format('ALTER POLICY %I ON public.%I', pol.name, pol.tablename);
    IF new_qual IS NOT NULL THEN
      alter_sql := alter_sql || ' USING (' || new_qual || ')';
    END IF;
    IF new_check IS NOT NULL THEN
      alter_sql := alter_sql || ' WITH CHECK (' || new_check || ')';
    END IF;

    BEGIN
      EXECUTE alter_sql;
      rewritten_count := rewritten_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed_count := failed_count + 1;
      RAISE WARNING 'Skipped %.% (%): %', pol.tablename, pol.name, SQLSTATE, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Optimized % policies, % failed', rewritten_count, failed_count;
END $$;;
