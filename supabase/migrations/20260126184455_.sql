-- Add policy for admins to update driver_documents
CREATE POLICY "Admins can update documents"
ON public.driver_documents FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));;
