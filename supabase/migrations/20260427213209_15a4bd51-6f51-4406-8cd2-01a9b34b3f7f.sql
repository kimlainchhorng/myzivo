-- =========================================================================
-- 1. safe_uuid helper — used by storage RLS to avoid throwing on bad paths
-- =========================================================================
CREATE OR REPLACE FUNCTION public.safe_uuid(_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN _text::uuid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- =========================================================================
-- 2. Harden store-documents storage policies
-- =========================================================================
-- Drop existing policies (idempotent)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'Managers can read store documents',
        'Managers can upload store documents',
        'Managers can update store documents',
        'Managers can delete store documents'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Recreate with hardened path validation:
--   path must be {uuid}/{uuid}/<filename>
--   first uuid is the store_id (used for permission check)
CREATE POLICY "Managers can read store documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'store-documents'
    AND name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/.+$'
    AND public.safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.is_lodge_store_manager(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
  );

CREATE POLICY "Managers can upload store documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-documents'
    AND name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/.+$'
    AND public.safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.is_lodge_store_manager(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
  );

CREATE POLICY "Managers can update store documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-documents'
    AND name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/.+$'
    AND public.safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.is_lodge_store_manager(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
  );

CREATE POLICY "Managers can delete store documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-documents'
    AND name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}/.+$'
    AND public.safe_uuid((storage.foldername(name))[1]) IS NOT NULL
    AND public.is_lodge_store_manager(public.safe_uuid((storage.foldername(name))[1]), auth.uid())
  );

-- =========================================================================
-- 3. store_audit_log table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.store_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL,
  actor_user_id uuid,
  action text NOT NULL,                -- insert | update | delete | notify_expiry | notify_overdue
  resource_type text NOT NULL,         -- employee_rule | training_assignment | document | system
  resource_id uuid,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_audit_log_store_created
  ON public.store_audit_log(store_id, created_at DESC);

ALTER TABLE public.store_audit_log ENABLE ROW LEVEL SECURITY;

-- Managers can read their store's audit log
DROP POLICY IF EXISTS "Managers can read store audit log" ON public.store_audit_log;
CREATE POLICY "Managers can read store audit log"
  ON public.store_audit_log FOR SELECT TO authenticated
  USING (public.is_lodge_store_manager(store_id, auth.uid()));

-- No client-side INSERT / UPDATE / DELETE — only triggers + service role
DROP POLICY IF EXISTS "No client writes to audit log" ON public.store_audit_log;
CREATE POLICY "No client writes to audit log"
  ON public.store_audit_log FOR INSERT TO authenticated
  WITH CHECK (false);

-- =========================================================================
-- 4. Generic audit trigger function
-- =========================================================================
CREATE OR REPLACE FUNCTION public.log_store_resource_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
  v_resource_id uuid;
  v_resource_type text := TG_ARGV[0];
  v_diff jsonb := '{}'::jsonb;
BEGIN
  -- Determine store_id and resource_id from row
  IF TG_OP = 'DELETE' THEN
    v_store_id := (to_jsonb(OLD)->>'store_id')::uuid;
    v_resource_id := (to_jsonb(OLD)->>'id')::uuid;
    v_diff := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_store_id := (to_jsonb(NEW)->>'store_id')::uuid;
    v_resource_id := (to_jsonb(NEW)->>'id')::uuid;
    v_diff := jsonb_build_object('new', to_jsonb(NEW));
  ELSE -- UPDATE
    v_store_id := (to_jsonb(NEW)->>'store_id')::uuid;
    v_resource_id := (to_jsonb(NEW)->>'id')::uuid;
    -- Only include changed fields
    SELECT jsonb_object_agg(key, jsonb_build_object('old', o.value, 'new', n.value))
      INTO v_diff
      FROM jsonb_each(to_jsonb(OLD)) o
      JOIN jsonb_each(to_jsonb(NEW)) n USING (key)
     WHERE o.value IS DISTINCT FROM n.value
       AND key NOT IN ('updated_at');
    IF v_diff IS NULL OR v_diff = '{}'::jsonb THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
  END IF;

  IF v_store_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.store_audit_log (store_id, actor_user_id, action, resource_type, resource_id, diff)
  VALUES (v_store_id, auth.uid(), lower(TG_OP), v_resource_type, v_resource_id, COALESCE(v_diff, '{}'::jsonb));

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =========================================================================
-- 5. Attach triggers (idempotent)
-- =========================================================================
DROP TRIGGER IF EXISTS trg_audit_store_employee_rules ON public.store_employee_rules;
CREATE TRIGGER trg_audit_store_employee_rules
  AFTER INSERT OR UPDATE OR DELETE ON public.store_employee_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_store_resource_change('employee_rule');

DROP TRIGGER IF EXISTS trg_audit_store_training_assignments ON public.store_training_assignments;
CREATE TRIGGER trg_audit_store_training_assignments
  AFTER INSERT OR UPDATE OR DELETE ON public.store_training_assignments
  FOR EACH ROW EXECUTE FUNCTION public.log_store_resource_change('training_assignment');

DROP TRIGGER IF EXISTS trg_audit_store_documents ON public.store_documents;
CREATE TRIGGER trg_audit_store_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.store_documents
  FOR EACH ROW EXECUTE FUNCTION public.log_store_resource_change('document');