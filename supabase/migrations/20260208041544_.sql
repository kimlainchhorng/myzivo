-- ============================================
-- Dispute Evidence Builder Tables
-- ============================================

-- Table A: dispute_cases - Tracks evidence collection workflow per dispute
CREATE TABLE public.dispute_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id text UNIQUE NOT NULL,
  order_id uuid REFERENCES public.food_orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'collecting', 'submitted', 'won', 'lost', 'closed')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_by timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table B: dispute_evidence_files - Stores uploaded evidence files
CREATE TABLE public.dispute_evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('receipt', 'pod_photo', 'gps', 'chat', 'policy', 'other')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table C: dispute_evidence_fields - Stores structured evidence text fields for Stripe
CREATE TABLE public.dispute_evidence_fields (
  dispute_id text PRIMARY KEY,
  customer_email text,
  customer_name text,
  product_description text,
  service_date text,
  delivery_date text,
  shipping_address text,
  tracking_number text,
  uncategorized_text text,
  refund_policy text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table D: dispute_reminders - Stores due-date reminders
CREATE TABLE public.dispute_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id text NOT NULL,
  remind_at timestamptz NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dispute_cases_status ON public.dispute_cases(status);
CREATE INDEX idx_dispute_cases_due_by ON public.dispute_cases(due_by);
CREATE INDEX idx_dispute_evidence_files_dispute_id ON public.dispute_evidence_files(dispute_id);
CREATE INDEX idx_dispute_reminders_remind_at ON public.dispute_reminders(remind_at) WHERE sent = false;
CREATE INDEX idx_dispute_reminders_dispute_id ON public.dispute_reminders(dispute_id);

-- Enable RLS
ALTER TABLE public.dispute_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admin full access to dispute_cases" ON public.dispute_cases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access to dispute_evidence_files" ON public.dispute_evidence_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access to dispute_evidence_fields" ON public.dispute_evidence_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin full access to dispute_reminders" ON public.dispute_reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Updated_at trigger
CREATE TRIGGER update_dispute_cases_updated_at
  BEFORE UPDATE ON public.dispute_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispute_evidence_fields_updated_at
  BEFORE UPDATE ON public.dispute_evidence_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for evidence files (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dispute-evidence', 'dispute-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for dispute-evidence bucket
CREATE POLICY "Admin can upload dispute evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dispute-evidence' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can read dispute evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'dispute-evidence' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin can delete dispute evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dispute-evidence' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);;
