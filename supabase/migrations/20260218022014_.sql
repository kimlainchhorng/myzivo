
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Support agents can view all support attachments" ON storage.objects;
;
