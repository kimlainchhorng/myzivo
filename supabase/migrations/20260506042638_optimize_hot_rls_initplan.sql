-- Rewrite `auth.uid()` -> `(select auth.uid())` in the USING/WITH CHECK
-- expressions of RLS policies on the hottest tables. This is the standard
-- Supabase performance optimization (initplan caching): Postgres evaluates
-- `auth.uid()` ONCE per query instead of once per row. Same semantics, can
-- be 10–100x faster on large tables.
DO $$
DECLARE
  hot_tables CONSTANT text[] := ARRAY[
    'service_orders','chat_polls','channel_post_comments','zivo_support_tickets',
    'shopping_orders','post_comments','lodging_messages','career_applications',
    'user_devices','story_reactions','store_profiles','store_orders',
    'store_chat_messages','profiles','user_posts','user_followers','user_blocks',
    'user_notifications','notifications','user_sessions','trusted_devices',
    'login_sessions','close_friends','chat_group_members','channel_posts'
  ];
  pol record;
  new_qual text;
  new_check text;
  alter_sql text;
  rewritten_count int := 0;
BEGIN
  FOR pol IN
    SELECT polname AS name, n.nspname AS schema, c.relname AS tablename,
           pg_get_expr(p.polqual, p.polrelid) AS qual_text,
           pg_get_expr(p.polwithcheck, p.polrelid) AS check_text,
           p.polcmd::text AS cmd
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY(hot_tables)
  LOOP
    new_qual := pol.qual_text;
    new_check := pol.check_text;

    -- Replace bare auth.uid() with (select auth.uid())
    -- Use a careful replace to avoid double-wrapping policies that already use the optimized form.
    IF new_qual IS NOT NULL AND new_qual ~ 'auth\.uid\(\)' AND new_qual !~ '\(\s*SELECT\s+auth\.uid\(\)\s*\)' THEN
      new_qual := regexp_replace(new_qual, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    ELSE
      new_qual := pol.qual_text;
    END IF;

    IF new_check IS NOT NULL AND new_check ~ 'auth\.uid\(\)' AND new_check !~ '\(\s*SELECT\s+auth\.uid\(\)\s*\)' THEN
      new_check := regexp_replace(new_check, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    ELSE
      new_check := pol.check_text;
    END IF;

    -- Skip if nothing actually changed
    IF (new_qual IS NOT DISTINCT FROM pol.qual_text) AND (new_check IS NOT DISTINCT FROM pol.check_text) THEN
      CONTINUE;
    END IF;

    -- Build ALTER POLICY statement
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
      RAISE WARNING 'Skipped policy %.%: %', pol.tablename, pol.name, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Rewrote % policies', rewritten_count;
END $$;;
