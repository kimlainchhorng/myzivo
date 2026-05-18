
-- Rewrite all RLS policies to use (select auth.uid()) and disambiguate is_admin()
DO $$
DECLARE
  r record;
  qual_new text;
  wc_new text;
  sql_cmd text;
BEGIN
  FOR r IN
    SELECT p.schemaname, p.tablename, p.policyname, p.permissive, p.roles, p.cmd AS policy_cmd, p.qual, p.with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public'
      AND (
        (p.qual IS NOT NULL AND p.qual ~ 'auth\.uid\(\)' AND p.qual !~ '\(\s*select\s+auth\.uid\(\)\s*\)')
        OR
        (p.with_check IS NOT NULL AND p.with_check ~ 'auth\.uid\(\)' AND p.with_check !~ '\(\s*select\s+auth\.uid\(\)\s*\)')
      )
  LOOP
    qual_new := r.qual;
    wc_new := r.with_check;

    -- Replace auth.uid() with (select auth.uid())
    IF qual_new IS NOT NULL THEN
      qual_new := regexp_replace(qual_new, '(?<!\(\s{0,10}select\s{1,10})auth\.uid\(\)', '(select auth.uid())', 'g');
      -- Disambiguate is_admin() calls
      qual_new := regexp_replace(qual_new, 'is_admin\(\)', 'is_admin(NULL::uuid)', 'g');
    END IF;
    IF wc_new IS NOT NULL THEN
      wc_new := regexp_replace(wc_new, '(?<!\(\s{0,10}select\s{1,10})auth\.uid\(\)', '(select auth.uid())', 'g');
      wc_new := regexp_replace(wc_new, 'is_admin\(\)', 'is_admin(NULL::uuid)', 'g');
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);

    sql_cmd := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
      r.policyname, r.schemaname, r.tablename,
      r.permissive,
      r.policy_cmd,
      array_to_string(r.roles, ', ')
    );

    IF qual_new IS NOT NULL THEN
      sql_cmd := sql_cmd || ' USING (' || qual_new || ')';
    END IF;
    IF wc_new IS NOT NULL THEN
      sql_cmd := sql_cmd || ' WITH CHECK (' || wc_new || ')';
    END IF;

    EXECUTE sql_cmd;
  END LOOP;
END;
$$;
;
