
-- Add satisfaction rating columns to zivo_support_tickets
ALTER TABLE public.zivo_support_tickets 
ADD COLUMN IF NOT EXISTS satisfaction_rating smallint CHECK (satisfaction_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS satisfaction_feedback text;

-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for support attachments
CREATE POLICY "Users can upload support attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their support attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Support agents can view all support attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'support-attachments');
;
