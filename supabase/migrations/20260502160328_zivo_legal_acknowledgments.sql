CREATE TABLE IF NOT EXISTS public.legal_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  document_key TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  meta JSONB,
  UNIQUE (user_id, role, document_key, document_version)
);
CREATE INDEX IF NOT EXISTS idx_legal_acks_user ON public.legal_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acks_doc ON public.legal_acknowledgments(document_key, document_version);
ALTER TABLE public.legal_acknowledgments ENABLE ROW LEVEL SECURITY;
CREATE POLICY legal_acks_self_read ON public.legal_acknowledgments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY legal_acks_self_insert ON public.legal_acknowledgments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY legal_acks_no_update ON public.legal_acknowledgments FOR UPDATE USING (false);
CREATE POLICY legal_acks_no_delete ON public.legal_acknowledgments FOR DELETE USING (false);

CREATE OR REPLACE FUNCTION public.record_legal_acknowledgment(
  p_role TEXT, p_document_key TEXT, p_document_version TEXT, p_meta JSONB DEFAULT NULL
) RETURNS public.legal_acknowledgments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.legal_acknowledgments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
  IF p_role NOT IN ('customer','driver','shop') THEN RAISE EXCEPTION 'invalid_role'; END IF;
  INSERT INTO public.legal_acknowledgments (user_id, role, document_key, document_version, meta)
  VALUES (auth.uid(), p_role, p_document_key, p_document_version, p_meta)
  ON CONFLICT (user_id, role, document_key, document_version) DO UPDATE
    SET meta = COALESCE(EXCLUDED.meta, public.legal_acknowledgments.meta)
  RETURNING * INTO v_row;
  RETURN v_row;
END $$;
GRANT EXECUTE ON FUNCTION public.record_legal_acknowledgment(TEXT, TEXT, TEXT, JSONB) TO authenticated;;
