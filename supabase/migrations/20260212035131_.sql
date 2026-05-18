
-- Insurance Claims table
CREATE TABLE public.insurance_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number text NOT NULL UNIQUE,
  claim_type text NOT NULL CHECK (claim_type IN ('ride_accident','vehicle_damage','delivery_damage','lost_order','incorrect_order','injury','safety_incident')),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected','paid')),
  title text NOT NULL,
  description text,
  reporter_role text NOT NULL CHECK (reporter_role IN ('customer','driver','restaurant','admin')),
  reporter_user_id uuid,
  reporter_name text,
  reporter_contact text,
  related_order_id uuid REFERENCES public.food_orders(id),
  related_driver_id uuid REFERENCES public.drivers(id),
  related_restaurant_id uuid REFERENCES public.restaurants(id),
  city text,
  claim_amount_cents integer,
  approved_amount_cents integer,
  payment_status text CHECK (payment_status IN ('pending','processing','paid','failed')),
  payment_date timestamptz,
  payment_reference text,
  assigned_to uuid,
  assigned_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  rejection_reason text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on insurance_claims"
  ON public.insurance_claims FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations','finance'))
  );

CREATE POLICY "Authenticated users can insert claims"
  ON public.insurance_claims FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own claims"
  ON public.insurance_claims FOR SELECT
  USING (reporter_user_id = auth.uid());

-- Insurance Claim Notes table
CREATE TABLE public.insurance_claim_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
  note_type text NOT NULL DEFAULT 'note' CHECK (note_type IN ('note','status_change','assignment','document_request','payment_update')),
  message text NOT NULL,
  old_value text,
  new_value text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claim_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access on claim notes"
  ON public.insurance_claim_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations','finance'))
  );

-- Insurance Claim Documents table
CREATE TABLE public.insurance_claim_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL REFERENCES public.insurance_claims(id) ON DELETE CASCADE,
  uploaded_by uuid,
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size integer NOT NULL,
  document_type text NOT NULL DEFAULT 'other' CHECK (document_type IN ('photo','receipt','report','other')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claim_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access on claim documents"
  ON public.insurance_claim_documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations','finance'))
  );

CREATE POLICY "Reporter can insert claim documents"
  ON public.insurance_claim_documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can manage claim documents storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'claim-documents' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin','manager','support','operations','finance')));

CREATE POLICY "Authenticated users can upload claim documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'claim-documents' AND auth.uid() IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX idx_insurance_claims_type ON public.insurance_claims(claim_type);
CREATE INDEX idx_insurance_claims_reporter ON public.insurance_claims(reporter_user_id);
CREATE INDEX idx_insurance_claims_created ON public.insurance_claims(created_at DESC);
CREATE INDEX idx_insurance_claim_notes_claim ON public.insurance_claim_notes(claim_id);
CREATE INDEX idx_insurance_claim_docs_claim ON public.insurance_claim_documents(claim_id);
;
