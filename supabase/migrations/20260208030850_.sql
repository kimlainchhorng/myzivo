-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies if not exist
DO $$
BEGIN
  -- Check and create upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload ticket attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admins can upload ticket attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'ticket-attachments' AND public.is_admin());
  END IF;

  -- Check and create view policy  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view ticket attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admins can view ticket attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'ticket-attachments' AND public.is_admin());
  END IF;

  -- Check and create delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete ticket attachments' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admins can delete ticket attachments"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'ticket-attachments' AND public.is_admin());
  END IF;
END $$;;
